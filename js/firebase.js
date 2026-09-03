/* =========================================================
   FIREBASE SDK
========================================================= */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";


import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    getDoc,
    query,
    where,
    orderBy,
    doc,
    updateDoc,
    setDoc,
    deleteDoc,
    serverTimestamp,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    getIdToken
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


import {
    getMessaging,
    getToken,
    isSupported as isMessagingSupported
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-messaging.js";


import {
    FIREBASE_VAPID_KEY,
    ADMIN_PUSH_WORKER_URL
} from "./push-config.js";



/* =========================================================
   FIREBASE CONFIG
========================================================= */

const firebaseConfig = {

    apiKey: "AIzaSyBIvAp40mYiAi9mB2P7CQG8Lw5xQ8m85hE",

    authDomain:
        "teckelweb.firebaseapp.com",

    projectId:
        "teckelweb",

    storageBucket:
        "teckelweb.firebasestorage.app",

    messagingSenderId:
        "710164290013",

    appId:
        "1:710164290013:web:b0a4e6613dc4b3605e3e34"
};



/* =========================================================
   FIREBASE INITIALISEREN
========================================================= */

const app =
    initializeApp(
        firebaseConfig
    );


const db =
    getFirestore(
        app
    );


const auth =
    getAuth(
        app
    );


const messagingPromise =
    isMessagingSupported()
        .then(
            supported =>
                supported
                    ? getMessaging(
                        app
                    )
                    : null
        )
        .catch(
            () =>
                null
        );



/* =========================================================
   GOOGLE AUTH PROVIDER
========================================================= */

const googleProvider =
    new GoogleAuthProvider();


/*
    Altijd toelaten om een Google-account
    te kiezen.

    Handig indien iemand meerdere accounts
    heeft.
*/

googleProvider.setCustomParameters(
    {
        prompt:
            "select_account"
    }
);



/* =========================================================
   CLOUDFLARE MAIL WORKER
========================================================= */

const MAIL_WORKER_URL =
    "https://teckelweb-mailer.arthurwillekens.workers.dev";



/* =========================================================
   AUTH HELPERS
========================================================= */


/*
    Huidige ingelogde gebruiker.
*/

export function getCurrentUser() {

    return auth.currentUser;
}



/*
    Is iemand momenteel ingelogd?
*/

export function isLoggedIn() {

    return Boolean(
        auth.currentUser
    );
}



/* =========================================================
   GOOGLE LOGIN
========================================================= */

export async function loginWithGoogle() {

    const result =
        await signInWithPopup(
            auth,
            googleProvider
        );


    return result.user;
}



/* =========================================================
   LOGOUT
========================================================= */

export async function logout() {

    await signOut(
        auth
    );
}



/* =========================================================
   LOGINSTATUS VOLGEN
========================================================= */

export function watchAuthState(
    callback
) {

    return onAuthStateChanged(
        auth,
        callback
    );
}



/* =========================================================
   AUTH TOKEN
========================================================= */

export async function getCurrentUserToken() {

    const user =
        auth.currentUser;


    if (
        !user
    ) {

        throw new Error(
            "Geen ingelogde gebruiker."
        );
    }


    return getIdToken(
        user
    );
}



/* =========================================================
   RESERVATIE OPSLAAN
========================================================= */

export async function saveReservation(
    reservation
) {

    /*
        Online reservaties moeten altijd
        gekoppeld zijn aan de echte
        Firebase-gebruiker.

        We vertrouwen dus niet blind op
        uid/email uit JavaScript.
    */

    const user =
        auth.currentUser;


    if (
        !user ||
        !user.uid ||
        !user.email
    ) {

        throw new Error(
            "Log eerst in voordat u een reservatie maakt."
        );
    }



    const rawPhone =
        String(
            reservation?.customer
                ?.phone
            ||
            ""
        )
            .trim()
            .replace(
                /[\s().-]/g,
                ""
            )
            .replace(
                /^00/,
                "+"
            );


    if (
        !/^\+?[0-9]{8,15}$/.test(
            rawPhone
        )
    ) {

        throw new Error(
            "Ongeldig telefoonnummer."
        );
    }



    const normalizedEmail =
        user.email
            .trim()
            .toLowerCase();



    /*
        Reservatie-object opbouwen.

        customer.uid en customer.email worden
        bewust overschreven met de Firebase-
        identiteit.

        Dit sluit aan op de huidige
        Firestore Security Rules.
    */

    const reservationData = {

        ...reservation,


        customer: {

            ...reservation.customer,

            uid:
                user.uid,

            email:
                normalizedEmail,

            phone:
                rawPhone
        },


        status:
            "pending",


        createdAt:
            serverTimestamp()
    };



    const reservationRef =
        await addDoc(
            collection(
                db,
                "reservations"
            ),

            reservationData
        );


    return reservationRef.id;
}



/* =========================================================
   ÉÉN RESERVATIE OPHALEN
========================================================= */

export async function getReservation(
    reservationId
) {

    if (
        !reservationId
    ) {

        throw new Error(
            "Geen reservationId opgegeven."
        );
    }


    const reservationRef =
        doc(
            db,
            "reservations",
            reservationId
        );


    const snapshot =
        await getDoc(
            reservationRef
        );


    if (
        !snapshot.exists()
    ) {

        return null;
    }


    return {

        id:
            snapshot.id,

        ...snapshot.data()
    };
}



/* =========================================================
   ADMIN — ALLE RESERVATIES
========================================================= */

export async function getReservations() {

    const reservationsQuery =
        query(

            collection(
                db,
                "reservations"
            ),

            orderBy(
                "createdAt",
                "desc"
            )
        );


    const snapshot =
        await getDocs(
            reservationsQuery
        );


    return snapshot.docs.map(
        document => {

            return {

                id:
                    document.id,

                ...document.data()
            };
        }
    );
}


/* =========================================================
   ADMIN — RESERVATIES REALTIME VOLGEN
========================================================= */

export function watchReservations(
    callback,
    errorCallback = null
) {

    const reservationsQuery =
        query(

            collection(
                db,
                "reservations"
            ),

            orderBy(
                "createdAt",
                "desc"
            )
        );


    return onSnapshot(
        reservationsQuery,

        snapshot => {

            const items =
                snapshot.docs.map(
                    document => ({

                        id:
                            document.id,

                        ...document.data()
                    })
                );


            const changes =
                snapshot.docChanges().map(
                    change => ({

                        type:
                            change.type,

                        reservation: {

                            id:
                                change.doc.id,

                            ...change.doc.data()
                        }
                    })
                );


            callback(
                {
                    reservations:
                        items,

                    changes
                }
            );
        },

        error => {

            console.error(
                "Realtime reservaties volgen mislukt:",
                error
            );


            if (
                typeof errorCallback ===
                "function"
            ) {

                errorCallback(
                    error
                );
            }
        }
    );
}



/* =========================================================
   KLANT — RESERVATIES
========================================================= */

export async function getCustomerReservations(
    email = ""
) {

    const user =
        auth.currentUser;


    if (
        !user
    ) {

        throw new Error(
            "Log eerst in om reservaties te bekijken."
        );
    }



    /*
        Nieuwe reservaties hebben customer.uid.

        Dat is betrouwbaarder dan e-mail
        en wordt daarom eerst gebruikt.
    */

    const uidQuery =
        query(

            collection(
                db,
                "reservations"
            ),

            where(
                "customer.uid",
                "==",
                user.uid
            )
        );


    const uidSnapshot =
        await getDocs(
            uidQuery
        );



    const reservationsMap =
        new Map();



    uidSnapshot.docs.forEach(
        document => {

            reservationsMap.set(
                document.id,

                {
                    id:
                        document.id,

                    ...document.data()
                }
            );
        }
    );



    /*
        Legacy fallback.

        Oude reservaties kunnen nog bestaan
        zonder customer.uid.

        Daarom zoeken we ook op het
        ingelogde e-mailadres.
    */

    const normalizedEmail =
        (
            user.email
            ||
            email
            ||
            ""
        )
            .trim()
            .toLowerCase();



    if (
        normalizedEmail
    ) {

        const emailQuery =
            query(

                collection(
                    db,
                    "reservations"
                ),

                where(
                    "customer.email",
                    "==",
                    normalizedEmail
                )
            );


        const emailSnapshot =
            await getDocs(
                emailQuery
            );


        emailSnapshot.docs.forEach(
            document => {

                reservationsMap.set(
                    document.id,

                    {
                        id:
                            document.id,

                        ...document.data()
                    }
                );
            }
        );
    }



    const reservations =
        Array.from(
            reservationsMap.values()
        );



    /*
        Nieuwste aanvraag eerst.
    */

    reservations.sort(
        (
            a,
            b
        ) => {

            const createdA =
                a.createdAt
                    ?.toMillis?.()
                ||
                0;


            const createdB =
                b.createdAt
                    ?.toMillis?.()
                ||
                0;


            return (
                createdB -
                createdA
            );
        }
    );


    return reservations.filter(
        reservation =>
            reservation.isDeleted !==
            true
    );
}



/* =========================================================
   KLANT — RESERVATIE ANNULEREN
========================================================= */

export async function cancelCustomerReservation(
    reservationId
) {

    if (
        !reservationId
    ) {

        throw new Error(
            "Geen reservatie opgegeven."
        );
    }



    const reservationRef =
        doc(
            db,
            "reservations",
            reservationId
        );



    /*
        Huidige Security Rules laten de klant
        alleen het veld status veranderen.

        Daarom voegen we hier bewust nog
        GEEN statusUpdatedAt toe.
    */

    await updateDoc(
        reservationRef,
        {
            status:
                "cancelled"
        }
    );
}



/* =========================================================
   ADMIN — STATUS WIJZIGEN
========================================================= */

export async function updateReservationStatus(
    reservationId,
    newStatus
) {

    const allowedStatuses = [

        "pending",
        "accepted",
        "rejected",
        "cancelled"
    ];



    if (
        !reservationId
    ) {

        throw new Error(
            "Geen reservatie opgegeven."
        );
    }



    if (
        !allowedStatuses.includes(
            newStatus
        )
    ) {

        throw new Error(
            "Ongeldige reservatiestatus."
        );
    }



    const reservationRef =
        doc(
            db,
            "reservations",
            reservationId
        );



    await updateDoc(
        reservationRef,
        {

            status:
                newStatus,

            statusUpdatedAt:
                serverTimestamp()
        }
    );
}



/* =========================================================
   ADMIN — VERBLIJF AFRONDEN
========================================================= */

export async function confirmReservationCompleted(
    reservationId,
    serviceDate = ""
) {

    if (
        !reservationId
    ) {

        throw new Error(
            "Geen reservatie opgegeven."
        );
    }


    const reservationRef =
        doc(
            db,
            "reservations",
            reservationId
        );


    await updateDoc(
        reservationRef,
        {

            completionStatus:
                "completed",

            completedDate:
                serviceDate
                ||
                "",

            completedAt:
                serverTimestamp(),

            isDeleted:
                false
        }
    );
}



/* =========================================================
   ADMIN — AFRONDING TERUGDRAAIEN
========================================================= */

export async function reopenCompletedReservation(
    reservationId
) {

    if (
        !reservationId
    ) {

        throw new Error(
            "Geen reservatie opgegeven."
        );
    }


    const reservationRef =
        doc(
            db,
            "reservations",
            reservationId
        );


    await updateDoc(
        reservationRef,
        {

            completionStatus:
                "pending",

            completedDate:
                "",

            completedAt:
                null
        }
    );
}



/* =========================================================
   ADMIN — SOFT DELETE / PRULLENBAK
========================================================= */

export async function softDeleteReservation(
    reservationId
) {

    if (
        !reservationId
    ) {

        throw new Error(
            "Geen reservatie opgegeven."
        );
    }


    const reservationRef =
        doc(
            db,
            "reservations",
            reservationId
        );


    await updateDoc(
        reservationRef,
        {

            isDeleted:
                true,

            deletedAt:
                serverTimestamp(),

            deletedDate:
                new Date()
                    .toISOString()
                    .slice(
                        0,
                        10
                    )
        }
    );
}



/* =========================================================
   ADMIN — HERSTEL UIT PRULLENBAK
========================================================= */

export async function restoreReservation(
    reservationId
) {

    if (
        !reservationId
    ) {

        throw new Error(
            "Geen reservatie opgegeven."
        );
    }


    const reservationRef =
        doc(
            db,
            "reservations",
            reservationId
        );


    await updateDoc(
        reservationRef,
        {

            isDeleted:
                false,

            restoredAt:
                serverTimestamp()
        }
    );
}



/* =========================================================
   ADMIN — ZORGTAKEN AFVINKEN
========================================================= */

export async function setReservationTaskCompleted(
    reservationId,
    dateString,
    taskKey,
    completed
) {

    if (
        !reservationId
        ||
        !dateString
        ||
        !taskKey
    ) {

        throw new Error(
            "Onvolledige taakgegevens."
        );
    }


    const safeTaskKey =
        String(
            taskKey
        )
            .replace(
                /[^a-zA-Z0-9_-]/g,
                "_"
            );


    const reservationRef =
        doc(
            db,
            "reservations",
            reservationId
        );


    const completionPath =
        `taskCompletions.${dateString}.${safeTaskKey}`;


    const completionTimePath =
        `taskCompletedAt.${dateString}.${safeTaskKey}`;


    await updateDoc(
        reservationRef,
        {

            [completionPath]:
                Boolean(
                    completed
                ),

            [completionTimePath]:
                completed
                    ? serverTimestamp()
                    : null
        }
    );
}



/* =========================================================
   AVAILABILITY MODEL
========================================================= */


/*
    Firestore bevat alleen uitzonderingen.

    GEEN DOCUMENT
        = available

    status = limited
        = beperkt beschikbaar

    status = full
        = volzet

    Hierdoor hoeven we niet elke dag
    van elk jaar op te slaan.
*/



/* =========================================================
   AVAILABILITY — MAAND
========================================================= */

export async function getAvailabilityForMonth(
    year,
    month
) {

    /*
        JavaScript:
            januari = 0
            februari = 1
            ...
    */

    const monthNumber =
        String(
            month + 1
        ).padStart(
            2,
            "0"
        );


    const startDate =
        `${year}-${monthNumber}-01`;



    const lastDay =
        new Date(
            year,
            month + 1,
            0
        ).getDate();



    const endDate =
        `${year}-${monthNumber}-${String(
            lastDay
        ).padStart(
            2,
            "0"
        )}`;



    return getAvailabilityBetween(
        startDate,
        endDate
    );
}



/* =========================================================
   AVAILABILITY — RANGE
========================================================= */

export async function getAvailabilityBetween(
    startDate,
    endDate
) {

    if (
        !startDate ||
        !endDate
    ) {

        return {};
    }



    /*
        Vermijd een query zoals:

        start >= 2026-10-10
        end   <= 2026-10-01
    */

    let firstDate =
        startDate;


    let lastDate =
        endDate;



    if (
        firstDate >
        lastDate
    ) {

        [
            firstDate,
            lastDate
        ] =
            [
                lastDate,
                firstDate
            ];
    }



    const availabilityQuery =
        query(

            collection(
                db,
                "availability"
            ),

            where(
                "date",
                ">=",
                firstDate
            ),

            where(
                "date",
                "<=",
                lastDate
            ),

            orderBy(
                "date",
                "asc"
            )
        );



    const snapshot =
        await getDocs(
            availabilityQuery
        );



    const availability =
        {};



    snapshot.docs.forEach(
        document => {

            const data =
                document.data();



            availability[
                document.id
            ] = {

                date:
                    data.date,

                status:
                    data.status
            };
        }
    );



    return availability;
}



/* =========================================================
   ADMIN — AVAILABILITY OPSLAAN
========================================================= */

export async function saveAvailability(
    date,
    status
) {

    const allowedStatuses = [

        "available",
        "limited",
        "full"
    ];



    if (
        !date
    ) {

        throw new Error(
            "Geen datum opgegeven."
        );
    }



    if (
        !allowedStatuses.includes(
            status
        )
    ) {

        throw new Error(
            "Ongeldige beschikbaarheidsstatus."
        );
    }



    const availabilityRef =
        doc(
            db,
            "availability",
            date
        );



    /*
        Available is standaard.

        Indien admin een dag opnieuw
        beschikbaar maakt, verwijderen we
        het exception-document.
    */

    if (
        status ===
        "available"
    ) {

        await deleteDoc(
            availabilityRef
        );


        return;
    }



    await setDoc(
        availabilityRef,
        {

            date:
                date,

            status:
                status,

            updatedAt:
                serverTimestamp(),

            updatedBy:
                auth.currentUser
                    ?.uid
                ||
                null
        }
    );
}



/* =========================================================
   ADMIN PUSH — CONFIG
========================================================= */

export function isAdminPushConfigured() {

    return Boolean(
        FIREBASE_VAPID_KEY
        &&
        ADMIN_PUSH_WORKER_URL
    );
}



/* =========================================================
   ADMIN PUSH — TOESTEL REGISTREREN
========================================================= */

export async function registerAdminPushDevice() {

    const user =
        auth.currentUser;


    if (
        !user
    ) {

        throw new Error(
            "Log eerst in als beheerder."
        );
    }


    if (
        !FIREBASE_VAPID_KEY
    ) {

        throw new Error(
            "Firebase Web Push certificate is nog niet ingesteld."
        );
    }


    if (
        !(
            "Notification" in window
        )
        ||
        !(
            "serviceWorker" in navigator
        )
    ) {

        throw new Error(
            "Pushmeldingen worden niet ondersteund op dit toestel."
        );
    }


    const permission =
        await Notification.requestPermission();


    if (
        permission !==
        "granted"
    ) {

        throw new Error(
            "Meldingstoestemming werd niet gegeven."
        );
    }


    const messaging =
        await messagingPromise;


    if (
        !messaging
    ) {

        throw new Error(
            "Firebase Messaging wordt niet ondersteund in deze browser."
        );
    }


    const serviceWorkerUrl =
        new URL(
            "../firebase-messaging-sw.js",
            import.meta.url
        );


    const serviceWorkerRegistration =
        await navigator.serviceWorker.register(
            serviceWorkerUrl.pathname
        );


    await navigator.serviceWorker.ready;


    const token =
        await getToken(
            messaging,
            {
                vapidKey:
                    FIREBASE_VAPID_KEY,

                serviceWorkerRegistration
            }
        );


    if (
        !token
    ) {

        throw new Error(
            "Er kon geen push-token worden aangemaakt."
        );
    }


    let deviceId =
        localStorage.getItem(
            "teckelweb-push-device-id"
        );


    if (
        !deviceId
    ) {

        deviceId =
            crypto.randomUUID
                ? crypto.randomUUID()
                : String(
                    Date.now()
                );


        localStorage.setItem(
            "teckelweb-push-device-id",
            deviceId
        );
    }


    const deviceRef =
        doc(
            db,
            "adminPushDevices",
            `${user.uid}_${deviceId}`
        );


    await setDoc(
        deviceRef,
        {
            uid:
                user.uid,

            token,

            deviceId,

            userAgent:
                navigator.userAgent,

            updatedAt:
                serverTimestamp()
        },
        {
            merge:
                true
        }
    );


    localStorage.setItem(
        "teckelweb-admin-push-enabled",
        "1"
    );


    return token;
}



/* =========================================================
   ADMIN PUSH — NIEUWE BOOKING MELDEN
========================================================= */

export async function sendAdminNewBookingNotification(
    reservationId
) {

    if (
        !reservationId
    ) {

        throw new Error(
            "Geen reservatie opgegeven."
        );
    }


    if (
        !ADMIN_PUSH_WORKER_URL
    ) {

        return {
            skipped:
                true
        };
    }


    const user =
        auth.currentUser;


    if (
        !user
    ) {

        throw new Error(
            "Geen ingelogde gebruiker gevonden."
        );
    }


    const token =
        await getIdToken(
            user
        );


    const response =
        await fetch(
            `${ADMIN_PUSH_WORKER_URL}/notify-booking`,
            {
                method:
                    "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${token}`
                },

                body:
                    JSON.stringify(
                        {
                            reservationId
                        }
                    )
            }
        );


    let result =
        {};


    try {

        result =
            await response.json();

    } catch {
        result =
            {};
    }


    if (
        !response.ok
    ) {

        throw new Error(
            result.error
            ||
            `Adminmelding fout HTTP ${response.status}`
        );
    }


    return result;
}



/* =========================================================
   RESERVATIEMAIL
========================================================= */

export async function sendReservationEmail(
    reservationId
) {

    if (
        !reservationId
    ) {

        throw new Error(
            "Geen reservatie opgegeven."
        );
    }



    const user =
        auth.currentUser;



    if (
        !user
    ) {

        throw new Error(
            "Geen ingelogde gebruiker gevonden."
        );
    }



    /*
        Firebase ID token.

        De Cloudflare Worker gebruikt dit
        zodat de Firebase Security Rules
        van kracht blijven.
    */

    const token =
        await getIdToken(
            user
        );



    const response =
        await fetch(
            MAIL_WORKER_URL,
            {

                method:
                    "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${token}`
                },

                body:
                    JSON.stringify(
                        {
                            reservationId:
                                reservationId
                        }
                    )
            }
        );



    /*
        Worker response lezen.
    */

    let result =
        {};



    try {

        result =
            await response.json();

    } catch {

        result =
            {};
    }



    if (
        !response.ok
    ) {

        const errorMessage =
            result
                ?.resend
                ?.message

            ||

            result
                ?.error

            ||

            `Mailer fout HTTP ${response.status}`;



        throw new Error(
            errorMessage
        );
    }



    return result;
}



/* =========================================================
   ADMIN DIRECTORY — KLANTEN
========================================================= */


/*
    Nog geen aparte clients-collection.

    Voorlopig bouwen we het klantenoverzicht
    uit de reservaties.

    Hierdoor hoeven we nu nog geen nieuwe
    Firestore Rules te publiceren.
*/

export async function getClientDirectory() {

    const reservations =
        await getReservations();



    const clients =
        new Map();



    reservations.forEach(
        reservation => {

            const customer =
                reservation.customer
                ||
                {};


            const email =
                customer.email
                    ?.trim()
                    .toLowerCase()
                ||
                "";


            const uid =
                customer.uid
                ||
                "";


            /*
                UID geniet voorkeur.

                Voor oudere reservaties
                gebruiken we email als key.
            */

            const key =
                uid
                ||
                email;



            if (
                !key
            ) {

                return;
            }



            if (
                !clients.has(
                    key
                )
            ) {

                clients.set(
                    key,
                    {

                        id:
                            key,

                        uid:
                            uid,

                        name:
                            customer.name
                            ||
                            "",

                        email:
                            email,

                        phone:
                            customer.phone
                            ||
                            "",

                        reservations:
                            [],

                        pets:
                            []
                    }
                );
            }



            const client =
                clients.get(
                    key
                );



            /*
                Recentere reservaties kunnen
                completere contactinfo bevatten.
            */

            if (
                customer.name
            ) {

                client.name =
                    customer.name;
            }


            if (
                customer.phone
            ) {

                client.phone =
                    customer.phone;
            }



            client.reservations.push(
                reservation
            );



            const dogName =
                reservation.dog
                    ?.name
                    ?.trim();


            if (
                dogName
                &&
                !client.pets.some(
                    pet =>
                        pet
                            .toLowerCase()
                        ===
                        dogName
                            .toLowerCase()
                )
            ) {

                client.pets.push(
                    dogName
                );
            }
        }
    );



    const result =
        Array.from(
            clients.values()
        );



    /*
        Klanten met meest recente
        reservatie eerst.
    */

    result.sort(
        (
            a,
            b
        ) => {

            const aNewest =
                getNewestReservationMillis(
                    a.reservations
                );


            const bNewest =
                getNewestReservationMillis(
                    b.reservations
                );


            return (
                bNewest -
                aNewest
            );
        }
    );



    return result;
}



/* =========================================================
   ADMIN DIRECTORY — HONDEN
========================================================= */

export async function getPetDirectory() {

    const reservations =
        await getReservations();



    const pets =
        new Map();



    reservations.forEach(
        reservation => {

            const dog =
                reservation.dog;


            if (
                !dog?.name
            ) {

                return;
            }



            const ownerUid =
                reservation.customer
                    ?.uid
                ||
                "";


            const ownerEmail =
                reservation.customer
                    ?.email
                    ?.trim()
                    .toLowerCase()
                ||
                "";



            /*
                Zelfde hondnaam bij twee klanten
                mag uiteraard twee aparte honden
                opleveren.
            */

            const ownerKey =
                ownerUid
                ||
                ownerEmail
                ||
                "unknown";


            const key =
                `${ownerKey}|${dog.name.trim().toLowerCase()}`;



            if (
                !pets.has(
                    key
                )
            ) {

                pets.set(
                    key,
                    {

                        id:
                            key,

                        name:
                            dog.name
                            ||
                            "",

                        breed:
                            dog.breed
                            ||
                            "",

                        age:
                            dog.age
                            ??
                            null,

                        weight:
                            dog.weight
                            ??
                            null,

                        notes:
                            dog.notes
                            ||
                            "",

                        owner: {

                            uid:
                                ownerUid,

                            name:
                                reservation.customer
                                    ?.name
                                ||
                                "",

                            email:
                                ownerEmail,

                            phone:
                                reservation.customer
                                    ?.phone
                                ||
                                ""
                        },

                        reservations:
                            []
                    }
                );
            }



            const pet =
                pets.get(
                    key
                );



            /*
                Nieuwste beschikbare gegevens
                mogen oudere informatie
                overschrijven.
            */

            if (
                dog.breed
            ) {

                pet.breed =
                    dog.breed;
            }


            if (
                dog.age !==
                undefined
                &&
                dog.age !==
                null
            ) {

                pet.age =
                    dog.age;
            }


            if (
                dog.weight !==
                undefined
                &&
                dog.weight !==
                null
            ) {

                pet.weight =
                    dog.weight;
            }


            if (
                dog.notes
            ) {

                pet.notes =
                    dog.notes;
            }



            pet.reservations.push(
                reservation
            );
        }
    );



    const result =
        Array.from(
            pets.values()
        );



    result.sort(
        (
            a,
            b
        ) => {

            return (
                a.name
                    .localeCompare(
                        b.name,
                        "nl"
                    )
            );
        }
    );



    return result;
}



/* =========================================================
   HELPER — NIEUWSTE RESERVATIE
========================================================= */

function getNewestReservationMillis(
    reservations
) {

    let newest =
        0;



    reservations.forEach(
        reservation => {

            const created =
                reservation
                    .createdAt
                    ?.toMillis?.()
                ||
                0;


            if (
                created >
                newest
            ) {

                newest =
                    created;
            }
        }
    );



    return newest;
}