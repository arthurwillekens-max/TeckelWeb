/*
    =========================================================
    TECKELWEB PUSH WORKER
    Cloudflare Worker

    Functie:
    - verifieert de klant via Firebase ID token
    - leest de zojuist gemaakte reservatie
    - stuurt een push naar alle geregistreerde admin-toestellen
    - stuurt tegelijk een e-mail naar de beheerder

    Vereiste Cloudflare secrets / variables:
    - FIREBASE_PROJECT_ID       = teckelweb
    - FIREBASE_WEB_API_KEY      = jouw Firebase web API key
    - FIREBASE_CLIENT_EMAIL     = service-account client_email
    - FIREBASE_PRIVATE_KEY      = service-account private_key
    - ADMIN_EMAIL               = e-mailadres van de beheerder
    - RESEND_API_KEY            = jouw bestaande Resend key

    Optioneel:
    - ADMIN_URL = volledige https URL naar admin.html
    =========================================================
*/


const JSON_HEADERS = {
    "Content-Type":
        "application/json"
};


function corsHeaders(
    origin
) {

    const allowedOrigins = [
        "http://localhost",
        "http://127.0.0.1",
        "https://arthurwillekens-max.github.io"
    ];


    const isAllowed =
        allowedOrigins.some(
            allowed =>
                origin?.startsWith(
                    allowed
                )
        );


    return {
        "Access-Control-Allow-Origin":
            isAllowed
                ? origin
                : "https://arthurwillekens-max.github.io",

        "Access-Control-Allow-Headers":
            "Authorization, Content-Type",

        "Access-Control-Allow-Methods":
            "POST, OPTIONS",

        "Vary":
            "Origin"
    };
}


function jsonResponse(
    body,
    status,
    origin
) {

    return new Response(
        JSON.stringify(
            body
        ),

        {
            status,

            headers: {
                ...JSON_HEADERS,
                ...corsHeaders(
                    origin
                )
            }
        }
    );
}


function base64UrlEncode(
    input
) {

    const bytes =
        input instanceof Uint8Array
            ? input
            : new TextEncoder()
                .encode(
                    input
                );


    let binary =
        "";


    bytes.forEach(
        byte => {

            binary +=
                String.fromCharCode(
                    byte
                );
        }
    );


    return btoa(
        binary
    )
        .replaceAll(
            "+",
            "-"
        )
        .replaceAll(
            "/",
            "_"
        )
        .replaceAll(
            "=",
            ""
        );
}


function pemToArrayBuffer(
    pem
) {

    const clean =
        pem
            .replace(
                /-----BEGIN PRIVATE KEY-----/g,
                ""
            )
            .replace(
                /-----END PRIVATE KEY-----/g,
                ""
            )
            .replace(
                /\s/g,
                ""
            );


    const binary =
        atob(
            clean
        );


    const bytes =
        new Uint8Array(
            binary.length
        );


    for (
        let i = 0;
        i < binary.length;
        i += 1
    ) {

        bytes[i] =
            binary.charCodeAt(
                i
            );
    }


    return bytes.buffer;
}


async function createServiceAccountAccessToken(
    env
) {

    const now =
        Math.floor(
            Date.now()
            /
            1000
        );


    const header =
        base64UrlEncode(
            JSON.stringify(
                {
                    alg:
                        "RS256",

                    typ:
                        "JWT"
                }
            )
        );


    const claims =
        base64UrlEncode(
            JSON.stringify(
                {
                    iss:
                        env.FIREBASE_CLIENT_EMAIL,

                    scope:
                        [
                            "https://www.googleapis.com/auth/firebase.messaging",
                            "https://www.googleapis.com/auth/datastore"
                        ].join(
                            " "
                        ),

                    aud:
                        "https://oauth2.googleapis.com/token",

                    iat:
                        now,

                    exp:
                        now + 3600
                }
            )
        );


    const unsignedToken =
        `${header}.${claims}`;


    const privateKey =
        await crypto.subtle.importKey(
            "pkcs8",

            pemToArrayBuffer(
                env.FIREBASE_PRIVATE_KEY
            ),

            {
                name:
                    "RSASSA-PKCS1-v1_5",

                hash:
                    "SHA-256"
            },

            false,

            [
                "sign"
            ]
        );


    const signature =
        await crypto.subtle.sign(
            "RSASSA-PKCS1-v1_5",

            privateKey,

            new TextEncoder()
                .encode(
                    unsignedToken
                )
        );


    const assertion =
        `${unsignedToken}.${base64UrlEncode(
            new Uint8Array(
                signature
            )
        )}`;


    const response =
        await fetch(
            "https://oauth2.googleapis.com/token",

            {
                method:
                    "POST",

                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded"
                },

                body:
                    new URLSearchParams(
                        {
                            grant_type:
                                "urn:ietf:params:oauth:grant-type:jwt-bearer",

                            assertion
                        }
                    )
            }
        );


    const result =
        await response.json();


    if (
        !response.ok
        ||
        !result.access_token
    ) {

        throw new Error(
            result.error_description
            ||
            result.error
            ||
            "Google access token ophalen mislukt."
        );
    }


    return result.access_token;
}


async function verifyFirebaseUser(
    idToken,
    env
) {

    const response =
        await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(
                env.FIREBASE_WEB_API_KEY
            )}`,

            {
                method:
                    "POST",

                headers:
                    JSON_HEADERS,

                body:
                    JSON.stringify(
                        {
                            idToken
                        }
                    )
            }
        );


    const result =
        await response.json();


    const user =
        result.users?.[0];


    if (
        !response.ok
        ||
        !user
    ) {

        throw new Error(
            "Ongeldige Firebase sessie."
        );
    }


    return user;
}


async function readReservationAsCustomer(
    reservationId,
    idToken,
    env
) {

    const url =
        `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/reservations/${encodeURIComponent(
            reservationId
        )}`;


    const response =
        await fetch(
            url,

            {
                headers: {
                    "Authorization":
                        `Bearer ${idToken}`
                }
            }
        );


    const document =
        await response.json();


    if (
        !response.ok
    ) {

        throw new Error(
            document.error
                ?.message
            ||
            "Reservatie lezen mislukt."
        );
    }


    return firestoreFieldsToObject(
        document.fields
        ||
        {}
    );
}


function firestoreValueToJs(
    value
) {

    if (
        "stringValue" in value
    ) {

        return value.stringValue;
    }


    if (
        "booleanValue" in value
    ) {

        return value.booleanValue;
    }


    if (
        "integerValue" in value
    ) {

        return Number(
            value.integerValue
        );
    }


    if (
        "doubleValue" in value
    ) {

        return Number(
            value.doubleValue
        );
    }


    if (
        "timestampValue" in value
    ) {

        return value.timestampValue;
    }


    if (
        "mapValue" in value
    ) {

        return firestoreFieldsToObject(
            value.mapValue
                ?.fields
            ||
            {}
        );
    }


    if (
        "arrayValue" in value
    ) {

        return (
            value.arrayValue
                ?.values
            ||
            []
        ).map(
            firestoreValueToJs
        );
    }


    return null;
}


function firestoreFieldsToObject(
    fields
) {

    const result =
        {};


    Object.entries(
        fields
    ).forEach(
        (
            [
                key,
                value
            ]
        ) => {

            result[key] =
                firestoreValueToJs(
                    value
                );
        }
    );


    return result;
}


async function getAdminPushTokens(
    accessToken,
    env
) {

    const url =
        `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/adminPushDevices?pageSize=100`;


    const response =
        await fetch(
            url,

            {
                headers: {
                    "Authorization":
                        `Bearer ${accessToken}`
                }
            }
        );


    const result =
        await response.json();


    if (
        !response.ok
    ) {

        throw new Error(
            result.error
                ?.message
            ||
            "Pushdevices lezen mislukt."
        );
    }


    return (
        result.documents
        ||
        []
    )
        .map(
            document =>
                firestoreFieldsToObject(
                    document.fields
                    ||
                    {}
                )
                    .token
        )
        .filter(
            Boolean
        );
}


async function sendFcmMessage(
    token,
    reservation,
    accessToken,
    env
) {

    const dogName =
        reservation.dog
            ?.name
        ||
        "Hond";


    const customerName =
        reservation.customer
            ?.name
        ||
        "Nieuwe klant";


    const startDate =
        reservation.booking
            ?.startDate
        ||
        "";


    const endDate =
        reservation.booking
            ?.endDate
        ||
        startDate;


    const period =
        startDate === endDate
            ? startDate
            : `${startDate} – ${endDate}`;


    const adminUrl =
        env.ADMIN_URL
        ||
        "https://arthurwillekens-max.github.io/TeckelWeb/admin.html";


    const response =
        await fetch(
            `https://fcm.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/messages:send`,

            {
                method:
                    "POST",

                headers: {
                    "Authorization":
                        `Bearer ${accessToken}`,

                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(
                        {
                            message: {

                                token,

                                notification: {
                                    title:
                                        "Nieuwe reservatie · TeckelWeb",

                                    body:
                                        `${dogName} · ${customerName} · ${period}`
                                },

                                webpush: {

                                    fcm_options: {
                                        link:
                                            adminUrl
                                    }
                                },

                                data: {
                                    reservationId:
                                        reservation.id
                                        ||
                                        "",

                                    url:
                                        adminUrl
                                }
                            }
                        }
                    )
            }
        );


    const result =
        await response.json();


    return {
        ok:
            response.ok,

        status:
            response.status,

        result
    };
}


async function sendAdminEmail(
    reservation,
    env
) {

    if (
        !env.RESEND_API_KEY
        ||
        !env.ADMIN_EMAIL
    ) {

        return {
            skipped:
                true
        };
    }


    const dogName =
        reservation.dog
            ?.name
        ||
        "Hond";


    const customerName =
        reservation.customer
            ?.name
        ||
        "Nieuwe klant";


    const customerEmail =
        reservation.customer
            ?.email
        ||
        "";


    const customerPhone =
        reservation.customer
            ?.phone
        ||
        "";


    const careType =
        reservation.booking
            ?.careType ===
            "boarding"
            ? "Overnachting"
            : "Dagopvang";


    const startDate =
        reservation.booking
            ?.startDate
        ||
        "";


    const endDate =
        reservation.booking
            ?.endDate
        ||
        startDate;


    const period =
        startDate === endDate
            ? startDate
            : `${startDate} – ${endDate}`;


    const adminUrl =
        env.ADMIN_URL
        ||
        "https://arthurwillekens-max.github.io/TeckelWeb/admin.html";


    const response =
        await fetch(
            "https://api.resend.com/emails",

            {
                method:
                    "POST",

                headers: {
                    "Authorization":
                        `Bearer ${env.RESEND_API_KEY}`,

                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(
                        {
                            from:
                                "TeckelWeb <onboarding@resend.dev>",

                            to:
                                [
                                    env.ADMIN_EMAIL
                                ],

                            subject:
                                `Nieuwe reservatieaanvraag · ${dogName}`,

                            html:
                                `
                                    <div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#262626">
                                        <h2 style="margin-bottom:8px">Nieuwe reservatieaanvraag</h2>
                                        <p style="margin-top:0;color:#666">Er is een nieuwe booking binnengekomen via TeckelWeb.</p>

                                        <table style="width:100%;border-collapse:collapse;margin:24px 0">
                                            <tr><td style="padding:8px 0;color:#777">Hond</td><td style="padding:8px 0"><strong>${escapeHtml(
                                                dogName
                                            )}</strong></td></tr>
                                            <tr><td style="padding:8px 0;color:#777">Klant</td><td style="padding:8px 0">${escapeHtml(
                                                customerName
                                            )}</td></tr>
                                            <tr><td style="padding:8px 0;color:#777">E-mail</td><td style="padding:8px 0">${escapeHtml(
                                                customerEmail
                                            )}</td></tr>
                                            <tr><td style="padding:8px 0;color:#777">Telefoon</td><td style="padding:8px 0">${escapeHtml(
                                                customerPhone
                                            )}</td></tr>
                                            <tr><td style="padding:8px 0;color:#777">Type</td><td style="padding:8px 0">${escapeHtml(
                                                careType
                                            )}</td></tr>
                                            <tr><td style="padding:8px 0;color:#777">Periode</td><td style="padding:8px 0">${escapeHtml(
                                                period
                                            )}</td></tr>
                                        </table>

                                        <a href="${adminUrl}" style="display:inline-block;background:#ff6b2c;color:white;text-decoration:none;padding:12px 18px;border-radius:7px;font-weight:bold">
                                            Bekijk in admin
                                        </a>
                                    </div>
                                `
                        }
                    )
            }
        );


    const result =
        await response.json();


    return {
        ok:
            response.ok,

        status:
            response.status,

        result
    };
}


function escapeHtml(
    value
) {

    return String(
        value
        ??
        ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}


async function handleNotifyBooking(
    request,
    env
) {

    const origin =
        request.headers.get(
            "Origin"
        )
        ||
        "";


    const authorization =
        request.headers.get(
            "Authorization"
        )
        ||
        "";


    if (
        !authorization.startsWith(
            "Bearer "
        )
    ) {

        return jsonResponse(
            {
                error:
                    "Geen geldige sessie."
            },
            401,
            origin
        );
    }


    const idToken =
        authorization.slice(
            7
        );


    let payload =
        {};


    try {

        payload =
            await request.json();

    } catch {
        // onderaan afgehandeld
    }


    const reservationId =
        payload.reservationId;


    if (
        !reservationId
    ) {

        return jsonResponse(
            {
                error:
                    "reservationId ontbreekt."
            },
            400,
            origin
        );
    }


    try {

        const user =
            await verifyFirebaseUser(
                idToken,
                env
            );


        const reservation =
            await readReservationAsCustomer(
                reservationId,
                idToken,
                env
            );


        reservation.id =
            reservationId;


        if (
            reservation.customer
                ?.uid !==
                user.localId
            ||
            reservation.status !==
                "pending"
            ||
            reservation.source !==
                "online-booking"
        ) {

            return jsonResponse(
                {
                    error:
                        "Reservatie hoort niet bij deze gebruiker of is geen nieuwe online booking."
                },
                403,
                origin
            );
        }


        const accessToken =
            await createServiceAccountAccessToken(
                env
            );


        const pushTokens =
            await getAdminPushTokens(
                accessToken,
                env
            );


        const pushResults =
            await Promise.all(
                pushTokens.map(
                    token =>
                        sendFcmMessage(
                            token,
                            reservation,
                            accessToken,
                            env
                        )
                )
            );


        const emailResult =
            await sendAdminEmail(
                reservation,
                env
            );


        return jsonResponse(
            {
                ok:
                    true,

                pushDevices:
                    pushTokens.length,

                pushResults,

                adminEmail:
                    emailResult
            },
            200,
            origin
        );

    } catch (error) {

        console.error(
            error
        );


        return jsonResponse(
            {
                error:
                    error.message
                    ||
                    "Adminmelding mislukt."
            },
            500,
            origin
        );
    }
}


export default {

    async fetch(
        request,
        env
    ) {

        const origin =
            request.headers.get(
                "Origin"
            )
            ||
            "";


        if (
            request.method ===
            "OPTIONS"
        ) {

            return new Response(
                null,
                {
                    status:
                        204,

                    headers:
                        corsHeaders(
                            origin
                        )
                }
            );
        }


        const url =
            new URL(
                request.url
            );


        if (
            request.method ===
                "POST"
            &&
            url.pathname ===
                "/notify-booking"
        ) {

            return handleNotifyBooking(
                request,
                env
            );
        }


        return jsonResponse(
            {
                ok:
                    true,

                service:
                    "teckelweb-push"
            },
            200,
            origin
        );
    }
};
