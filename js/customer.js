import {
    sendCustomerLoginLink,
    isCustomerLoginLink,
    completeCustomerLogin,
    getCustomerReservations,
    cancelCustomerReservation,
    logout,
    watchAuthState
} from "./firebase.js";


/* -----------------------------------------
   HTML-ELEMENTEN
----------------------------------------- */

const loginSection =
    document.getElementById("customer-login");

const dashboard =
    document.getElementById("customer-dashboard");

const emailInput =
    document.getElementById("customer-login-email");

const sendLinkButton =
    document.getElementById("send-login-link");

const loginMessage =
    document.getElementById("customer-login-message");

const customerUser =
    document.getElementById("customer-user");

const logoutButton =
    document.getElementById("customer-logout");

const reservationsList =
    document.getElementById(
        "customer-reservations-list"
    );



/* -----------------------------------------
   EMAIL INLOGLINK VERSTUREN
----------------------------------------- */

sendLinkButton.addEventListener(
    "click",
    async () => {

        loginMessage.textContent = "";

        const email =
            emailInput.value
                .trim()
                .toLowerCase();


        if (!email) {

            loginMessage.textContent =
                "Vul eerst uw e-mailadres in.";

            return;
        }


        if (
            !email.includes("@") ||
            !email.includes(".")
        ) {

            loginMessage.textContent =
                "Vul een geldig e-mailadres in.";

            return;
        }


        /*
            Als klant al via de Firebase-link
            op deze pagina terechtgekomen is,
            voltooien we de login.
        */

        if (isCustomerLoginLink()) {

            await finishEmailLogin(email);

            return;
        }


        sendLinkButton.disabled = true;

        sendLinkButton.textContent =
            "Link versturen...";


        try {

            await sendCustomerLoginLink(email);


            loginMessage.textContent =
                "De inloglink werd verstuurd. Controleer uw e-mail.";


            sendLinkButton.textContent =
                "Inloglink verstuurd";

        } catch (error) {

            console.error(
                "Fout bij versturen loginlink:",
                error
            );


            loginMessage.textContent =
                "De inloglink kon niet verstuurd worden. Probeer opnieuw.";


            sendLinkButton.disabled = false;

            sendLinkButton.textContent =
                "Stuur mij een inloglink";
        }

    }
);



/* -----------------------------------------
   EMAIL LOGIN AFWERKEN
----------------------------------------- */

async function finishEmailLogin(email) {

    loginMessage.textContent =
        "Bezig met inloggen...";

    sendLinkButton.disabled = true;


    try {

        await completeCustomerLogin(email);


        /*
            Firebase parameters uit URL verwijderen.
        */

        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        );


    } catch (error) {

        console.error(
            "Fout bij email login:",
            error
        );


        loginMessage.textContent =
            "De inloglink is ongeldig of verlopen.";


        sendLinkButton.disabled = false;

        sendLinkButton.textContent =
            "Verdergaan";
    }
}



/* -----------------------------------------
   CONTROLEREN OF PAGINA VIA EMAIL LINK
   GEOPEND WERD
----------------------------------------- */

async function checkEmailLoginLink() {

    if (!isCustomerLoginLink()) {
        return;
    }


    const savedEmail =
        localStorage.getItem(
            "emailForSignIn"
        );


    /*
        Zelfde browser:
        Firebase kent e-mailadres nog.
    */

    if (savedEmail) {

        await finishEmailLogin(
            savedEmail
        );

        return;
    }


    /*
        Andere browser / toestel:
        klant moet hetzelfde e-mailadres
        opnieuw invullen.
    */

    loginMessage.textContent =
        "Vul hetzelfde e-mailadres in waarmee u de inloglink hebt aangevraagd.";

    sendLinkButton.textContent =
        "Verdergaan";
}



/* -----------------------------------------
   RESERVATIES VAN KLANT LADEN
----------------------------------------- */

async function loadCustomerReservations(email) {

    reservationsList.innerHTML = `
        <p class="customer-reservations-loading">
            Reservaties laden...
        </p>
    `;


    try {

        const reservations =
            await getCustomerReservations(
                email.toLowerCase()
            );


        if (reservations.length === 0) {

            reservationsList.innerHTML = `
                <div class="customer-empty-state">

                    <h2>
                        Nog geen reservaties
                    </h2>

                    <p>
                        Er zijn nog geen reservaties gekoppeld aan dit e-mailadres.
                    </p>

                    <a
                        href="index.html#afspraak"
                        class="button-primary"
                    >
                        Maak een reservatie
                    </a>

                </div>
            `;

            return;
        }


        reservationsList.innerHTML = "";


        reservations.forEach(
            reservation => {

                createCustomerReservationCard(
                    reservation
                );

            }
        );


    } catch (error) {

        console.error(
            "Fout bij ophalen reservaties:",
            error
        );


        reservationsList.innerHTML = `
            <p class="customer-reservations-error">
                Uw reservaties konden niet geladen worden.
            </p>
        `;
    }
}



/* -----------------------------------------
   RESERVATIEKAART MAKEN
----------------------------------------- */

function createCustomerReservationCard(
    reservation
) {

    const card =
        document.createElement("article");

    card.className =
        "customer-reservation-card";


    /* Bovenkant */

    const header =
        document.createElement("div");

    header.className =
        "customer-reservation-header";


    const titleContainer =
        document.createElement("div");


    const dogName =
        document.createElement("h2");

    dogName.textContent =
        reservation.dog?.name
            ? reservation.dog.name
            : "Reservatie";


    const period =
        document.createElement("p");

    period.textContent =
        formatReservationPeriod(
            reservation.booking?.startDate,
            reservation.booking?.endDate
        );


    titleContainer.appendChild(
        dogName
    );

    titleContainer.appendChild(
        period
    );


    /* Status */

    const status =
        document.createElement("span");

    const reservationStatus =
        reservation.status || "pending";


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


    /* Details */

    const details =
        document.createElement("div");

    details.className =
        "customer-reservation-details";


    details.appendChild(
        makeDetail(
            "Type opvang",
            formatBookingType(
                reservation.booking?.type
            )
        )
    );


    details.appendChild(
        makeDetail(
            "Aankomst",
            reservation.booking?.arrivalTime
        )
    );


    details.appendChild(
        makeDetail(
            "Vertrek",
            reservation.booking?.departureTime
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


    /* Opmerkingen */

    if (reservation.notes) {

        const notes =
            document.createElement("div");

        notes.className =
            "customer-reservation-notes";


        const notesTitle =
            document.createElement("strong");

        notesTitle.textContent =
            "Opmerkingen";


        const notesText =
            document.createElement("p");

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


    /* -----------------------------------------
       ANNULEREN
    ----------------------------------------- */

    if (
        reservationStatus === "pending" ||
        reservationStatus === "accepted"
    ) {

        const actions =
            document.createElement("div");

        actions.className =
            "customer-reservation-actions";


        const cancelButton =
            document.createElement("button");

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


                cancelButton.disabled = true;

                cancelButton.textContent =
                    "Annuleren...";


                try {

                    await cancelCustomerReservation(
                        reservation.id
                    );


                    /*
                        Lijst opnieuw laden zodat
                        de nieuwe status zichtbaar wordt.
                    */

                    const currentUserEmail =
                        customerUser.textContent.trim();


                    await loadCustomerReservations(
                        currentUserEmail
                    );


                } catch (error) {

                    console.error(
                        "Annuleren mislukt:",
                        error
                    );


                    alert(
                        "De reservatie kon niet geannuleerd worden."
                    );


                    cancelButton.disabled = false;

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



/* -----------------------------------------
   DETAILVELD
----------------------------------------- */

function makeDetail(label, value) {

    const item =
        document.createElement("div");

    item.className =
        "customer-reservation-detail";


    const labelElement =
        document.createElement("span");

    labelElement.textContent =
        label;


    const valueElement =
        document.createElement("strong");

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



/* -----------------------------------------
   STATUS TEKST
----------------------------------------- */

function getStatusText(status) {

    if (status === "accepted") {
        return "Bevestigd";
    }

    if (status === "rejected") {
        return "Geweigerd";
    }

    if (status === "cancelled") {
        return "Geannuleerd";
    }

    return "In aanvraag";
}



/* -----------------------------------------
   TYPE OPVANG
----------------------------------------- */

function formatBookingType(type) {

    if (type === "daycare") {
        return "Dagopvang";
    }

    if (type === "overnight") {
        return "Overnachting";
    }

    return "-";
}



/* -----------------------------------------
   PERIODE MOOI TONEN
----------------------------------------- */

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



function formatCustomerDate(dateString) {

    const [year, month, day] =
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
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    ).format(date);
}



/* -----------------------------------------
   LOGINSTATUS
----------------------------------------- */

watchAuthState(
    async user => {

        if (user) {

            loginSection.hidden = true;

            dashboard.hidden = false;


            customerUser.textContent =
                user.email || "";


            if (user.email) {

                await loadCustomerReservations(
                    user.email
                );
            }


        } else {

            loginSection.hidden = false;

            dashboard.hidden = true;

            customerUser.textContent = "";
        }

    }
);



/* -----------------------------------------
   UITLOGGEN
----------------------------------------- */

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



/* -----------------------------------------
   PAGINA STARTEN
----------------------------------------- */

checkEmailLoginLink();