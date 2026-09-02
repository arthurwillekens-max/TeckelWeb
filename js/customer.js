import {
    loginWithGoogle,
    getCustomerReservations,
    cancelCustomerReservation,
    logout,
    watchAuthState
} from "./firebase.js";


/* =========================================
   HTML-ELEMENTEN
========================================= */

const loginSection =
    document.getElementById(
        "customer-login"
    );

const dashboard =
    document.getElementById(
        "customer-dashboard"
    );

const googleLoginButton =
    document.getElementById(
        "customer-google-login"
    );

const loginMessage =
    document.getElementById(
        "customer-login-message"
    );

const customerUser =
    document.getElementById(
        "customer-user"
    );

const logoutButton =
    document.getElementById(
        "customer-logout"
    );

const switchAccountButton =
    document.getElementById(
        "customer-switch-account"
    );

const reservationsList =
    document.getElementById(
        "customer-reservations-list"
    );



/* =========================================
   GOOGLE LOGIN
========================================= */

googleLoginButton.addEventListener(
    "click",
    async () => {

        loginMessage.textContent =
            "";


        googleLoginButton.disabled =
            true;


        googleLoginButton.textContent =
            "Google openen...";


        try {

            await loginWithGoogle();


        } catch (error) {

            console.error(
                "Google login mislukt:",
                error
            );


            /*
                auth/popup-closed-by-user betekent
                simpelweg dat gebruiker popup sloot.
            */

            if (
                error.code ===
                "auth/popup-closed-by-user"
            ) {

                loginMessage.textContent =
                    "Het inloggen werd geannuleerd.";

            } else {

                loginMessage.textContent =
                    "Inloggen met Google is mislukt.";
            }


            googleLoginButton.disabled =
                false;


            googleLoginButton.textContent =
                "Doorgaan met Google";
        }

    }
);



/* =========================================
   RESERVATIES LADEN
========================================= */

async function loadCustomerReservations(
    email
) {

    reservationsList.innerHTML = `
        <p class="customer-reservations-loading">
            Reservaties laden...
        </p>
    `;


    try {

        const reservations =
            await getCustomerReservations(
                email
            );


        if (
            reservations.length === 0
        ) {

            reservationsList.innerHTML = `
                <div class="customer-empty-state">

                    <h2>
                        Geen reservaties gevonden
                    </h2>

                    <p>
                        Er zijn geen reservaties gekoppeld aan
                        <strong>${escapeHtml(email)}</strong>.
                    </p>

                    <p>
                        Heeft u uw reservatie met een ander
                        e-mailadres gemaakt? Kies dan bovenaan
                        een ander Google-account.
                    </p>

                    <a
                        href="index.html#afspraak"
                        class="button-primary"
                    >
                        Nieuwe reservatie maken
                    </a>

                </div>
            `;


            return;
        }


        reservationsList.innerHTML =
            "";


        reservations.forEach(
            reservation => {

                createCustomerReservationCard(
                    reservation,
                    email
                );

            }
        );


    } catch (error) {

        console.error(
            "Reservaties ophalen mislukt:",
            error
        );


        reservationsList.innerHTML = `
            <p class="customer-reservations-error">
                Uw reservaties konden niet geladen worden.
            </p>
        `;
    }
}



/* =========================================
   RESERVATIEKAART
========================================= */

function createCustomerReservationCard(
    reservation,
    currentEmail
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "customer-reservation-card";



    /* -------------------------------------
       HEADER
    ------------------------------------- */

    const header =
        document.createElement(
            "div"
        );


    header.className =
        "customer-reservation-header";


    const titleContainer =
        document.createElement(
            "div"
        );


    const dogName =
        document.createElement(
            "h2"
        );


    dogName.textContent =
        reservation.dog?.name
        || "Reservatie";


    const period =
        document.createElement(
            "p"
        );


    period.textContent =
        formatReservationPeriod(
            reservation.booking
                ?.startDate,

            reservation.booking
                ?.endDate
        );


    titleContainer.appendChild(
        dogName
    );


    titleContainer.appendChild(
        period
    );



    /* STATUS */

    const reservationStatus =
        reservation.status
        || "pending";


    const status =
        document.createElement(
            "span"
        );


    status.className =
        `customer-reservation-status ${reservationStatus}`;


    status.textContent =
        getStatusText(
            reservationStatus
        );


    header.appendChild(
        titleContainer
    );


    header.appendChild(
        status
    );



    /* -------------------------------------
       DETAILS
    ------------------------------------- */

    const details =
        document.createElement(
            "div"
        );


    details.className =
        "customer-reservation-details";


    details.appendChild(
        makeDetail(
            "Type opvang",
            formatBookingType(
                reservation.booking
                    ?.type
            )
        )
    );


    details.appendChild(
        makeDetail(
            "Aankomst",
            reservation.booking
                ?.arrivalTime
        )
    );


    details.appendChild(
        makeDetail(
            "Vertrek",
            reservation.booking
                ?.departureTime
        )
    );


    details.appendChild(
        makeDetail(
            "Prijs",
            reservation.price
        )
    );


    card.appendChild(
        header
    );


    card.appendChild(
        details
    );



    /* -------------------------------------
       OPMERKINGEN
    ------------------------------------- */

    if (
        reservation.notes
    ) {

        const notes =
            document.createElement(
                "div"
            );


        notes.className =
            "customer-reservation-notes";


        const notesTitle =
            document.createElement(
                "strong"
            );


        notesTitle.textContent =
            "Opmerkingen";


        const notesText =
            document.createElement(
                "p"
            );


        notesText.textContent =
            reservation.notes;


        notes.appendChild(
            notesTitle
        );


        notes.appendChild(
            notesText
        );


        card.appendChild(
            notes
        );
    }



    /* -------------------------------------
       ANNULEREN

       Alleen pending / accepted.
    ------------------------------------- */

    if (
        reservationStatus === "pending" ||
        reservationStatus === "accepted"
    ) {

        const actions =
            document.createElement(
                "div"
            );


        actions.className =
            "customer-reservation-actions";


        const cancelButton =
            document.createElement(
                "button"
            );


        cancelButton.type =
            "button";


        cancelButton.className =
            "customer-cancel-button";


        cancelButton.textContent =
            "Reservatie annuleren";


        cancelButton.addEventListener(
            "click",
            async () => {

                const confirmed =
                    window.confirm(
                        "Bent u zeker dat u deze reservatie wilt annuleren?"
                    );


                if (!confirmed) {
                    return;
                }


                cancelButton.disabled =
                    true;


                cancelButton.textContent =
                    "Annuleren...";


                try {

                    await cancelCustomerReservation(
                        reservation.id
                    );


                    /*
                        Reservaties opnieuw laden.
                    */

                    await loadCustomerReservations(
                        currentEmail
                    );


                } catch (error) {

                    console.error(
                        "Annuleren mislukt:",
                        error
                    );


                    alert(
                        "De reservatie kon niet geannuleerd worden."
                    );


                    cancelButton.disabled =
                        false;


                    cancelButton.textContent =
                        "Reservatie annuleren";
                }
            }
        );


        actions.appendChild(
            cancelButton
        );


        card.appendChild(
            actions
        );
    }


    reservationsList.appendChild(
        card
    );
}



/* =========================================
   DETAILVELD
========================================= */

function makeDetail(
    label,
    value
) {

    const item =
        document.createElement(
            "div"
        );


    item.className =
        "customer-reservation-detail";


    const labelElement =
        document.createElement(
            "span"
        );


    labelElement.textContent =
        label;


    const valueElement =
        document.createElement(
            "strong"
        );


    valueElement.textContent =
        value || "-";


    item.appendChild(
        labelElement
    );


    item.appendChild(
        valueElement
    );


    return item;
}



/* =========================================
   STATUS
========================================= */

function getStatusText(
    status
) {

    if (
        status === "accepted"
    ) {

        return "Bevestigd";
    }


    if (
        status === "rejected"
    ) {

        return "Geweigerd";
    }


    if (
        status === "cancelled"
    ) {

        return "Geannuleerd";
    }


    return "In aanvraag";
}



/* =========================================
   TYPE OPVANG
========================================= */

function formatBookingType(
    type
) {

    if (
        type === "daycare"
    ) {

        return "Dagopvang";
    }


    if (
        type === "overnight"
    ) {

        return "Overnachting";
    }


    return "-";
}



/* =========================================
   DATUM
========================================= */

function formatReservationPeriod(
    startDate,
    endDate
) {

    if (!startDate) {
        return "-";
    }


    const start =
        formatCustomerDate(
            startDate
        );


    if (
        !endDate ||
        endDate === startDate
    ) {

        return start;
    }


    const end =
        formatCustomerDate(
            endDate
        );


    return `${start} → ${end}`;
}



function formatCustomerDate(
    dateString
) {

    const [
        year,
        month,
        day
    ] =
        dateString
            .split("-")
            .map(Number);


    const date =
        new Date(
            year,
            month - 1,
            day
        );


    return new Intl.DateTimeFormat(
        "nl-BE",
        {
            day:
                "numeric",

            month:
                "long",

            year:
                "numeric"
        }
    ).format(date);
}



/* =========================================
   KLEINE HTML ESCAPE
========================================= */

function escapeHtml(
    value
) {

    const element =
        document.createElement(
            "div"
        );


    element.textContent =
        value;


    return element.innerHTML;
}



/* =========================================
   LOGINSTATUS
========================================= */

watchAuthState(
    async user => {

        /*
            NIET INGELOGD
        */

        if (!user) {

            loginSection.hidden =
                false;


            dashboard.hidden =
                true;


            customerUser.textContent =
                "";


            googleLoginButton.disabled =
                false;


            googleLoginButton.innerHTML = `
                <span class="google-mark">
                    G
                </span>

                Doorgaan met Google
            `;


            return;
        }


        /*
            WEL INGELOGD
        */

        loginSection.hidden =
            true;


        dashboard.hidden =
            false;


        const email =
            (
                user.email || ""
            )
                .trim()
                .toLowerCase();


        customerUser.textContent =
            email;


        if (!email) {

            reservationsList.innerHTML = `
                <p class="customer-reservations-error">
                    Dit Google-account heeft geen bruikbaar e-mailadres.
                </p>
            `;


            return;
        }


        await loadCustomerReservations(
            email
        );
    }
);



/* =========================================
   UITLOGGEN
========================================= */

logoutButton.addEventListener(
    "click",
    async () => {

        try {

            await logout();

        } catch (error) {

            console.error(
                "Uitloggen mislukt:",
                error
            );
        }
    }
);



/* =========================================
   ANDER GOOGLE-ACCOUNT
========================================= */

switchAccountButton.addEventListener(
    "click",
    async () => {

        try {

            /*
                Eerst uitloggen.

                Daarna verschijnt automatisch
                opnieuw de loginpagina.

                De gebruiker klikt daar opnieuw
                op "Doorgaan met Google".
            */

            await logout();


        } catch (error) {

            console.error(
                "Account wisselen mislukt:",
                error
            );
        }
    }
);