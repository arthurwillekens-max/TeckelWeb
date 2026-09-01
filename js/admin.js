import {
    loginWithGoogle,
    logout,
    watchAuthState,
    getReservations
} from "./firebase.js";


const ADMIN_UIDS = [
    "3v8qJh6ZXrPYqfzxJ3f6if4BH3r2"
];


const loginButton =
    document.getElementById("google-login");

const logoutButton =
    document.getElementById("logout-button");

const adminMessage =
    document.getElementById("admin-message");

const adminLogin =
    document.querySelector(".admin-login");

const adminDashboard =
    document.getElementById("admin-dashboard");

const adminUser =
    document.getElementById("admin-user");

const reservationsList =
    document.getElementById("reservations-list");


/* -----------------------------------------
   GOOGLE LOGIN
----------------------------------------- */

loginButton.addEventListener(
    "click",
    async () => {

        adminMessage.textContent = "";

        try {

            await loginWithGoogle();

        } catch (error) {

            console.error(
                "Login fout:",
                error
            );

            adminMessage.textContent =
                "Inloggen is mislukt.";
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
   RESERVATIES LADEN
----------------------------------------- */

async function loadReservations() {

    reservationsList.innerHTML = `
        <p class="reservations-loading">
            Reservaties laden...
        </p>
    `;


    try {

        const reservations =
            await getReservations();


        if (reservations.length === 0) {

            reservationsList.innerHTML = `
                <p class="reservations-empty">
                    Er zijn nog geen reservatieaanvragen.
                </p>
            `;

            return;
        }


        reservationsList.innerHTML = "";


        reservations.forEach(
            reservation => {

                createReservationCard(
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
            <p class="reservations-error">
                Reservaties konden niet geladen worden.
            </p>
        `;
    }
}


/* -----------------------------------------
   RESERVATIEKAART MAKEN
----------------------------------------- */

function createReservationCard(reservation) {

    const card =
        document.createElement("article");

    card.className =
        "reservation-card";


    const header =
        document.createElement("div");

    header.className =
        "reservation-card-header";


    const title =
        document.createElement("h3");

    title.textContent =
        reservation.dog?.name
            ? `Reservatie voor ${reservation.dog.name}`
            : "Reservatie";


    const status =
        document.createElement("span");

    status.className =
        `reservation-status ${reservation.status || "pending"}`;

    status.textContent =
        getStatusText(
            reservation.status
        );


    header.appendChild(title);
    header.appendChild(status);


    const details =
        document.createElement("div");

    details.className =
        "reservation-details";


    details.appendChild(
        makeDetail(
            "Klant",
            reservation.customer?.name
        )
    );

    details.appendChild(
        makeDetail(
            "E-mail",
            reservation.customer?.email
        )
    );

    details.appendChild(
        makeDetail(
            "Telefoon",
            reservation.customer?.phone
        )
    );

    details.appendChild(
        makeDetail(
            "Periode",
            `${reservation.booking?.startDate || "-"} → ${reservation.booking?.endDate || "-"}`
        )
    );

    details.appendChild(
        makeDetail(
            "Uren",
            `${reservation.booking?.arrivalTime || "-"} → ${reservation.booking?.departureTime || "-"}`
        )
    );

    details.appendChild(
        makeDetail(
            "Type",
            formatBookingType(
                reservation.booking?.type
            )
        )
    );

    details.appendChild(
        makeDetail(
            "Prijs",
            reservation.price
        )
    );


    card.appendChild(header);
    card.appendChild(details);


    if (reservation.notes) {

        const notes =
            document.createElement("div");

        notes.className =
            "reservation-notes";


        const notesTitle =
            document.createElement("strong");

        notesTitle.textContent =
            "Opmerkingen";


        const notesText =
            document.createElement("p");

        notesText.textContent =
            reservation.notes;


        notes.appendChild(notesTitle);
        notes.appendChild(notesText);

        card.appendChild(notes);
    }


    reservationsList.appendChild(card);
}


/* -----------------------------------------
   DETAILREGEL MAKEN
----------------------------------------- */

function makeDetail(label, value) {

    const item =
        document.createElement("div");

    item.className =
        "reservation-detail";


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
   STATUS
----------------------------------------- */

function getStatusText(status) {

    if (status === "accepted") {
        return "Goedgekeurd";
    }

    if (status === "rejected") {
        return "Geweigerd";
    }

    return "In afwachting";
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
   LOGINSTATUS + ADMINCONTROLE
----------------------------------------- */

watchAuthState(
    async user => {

        /* Niemand ingelogd */

        if (!user) {

            adminLogin.hidden = false;

            adminDashboard.hidden = true;

            adminUser.textContent = "";

            return;
        }


        /* Geen toegelaten admin */

        if (
            !ADMIN_UIDS.includes(
                user.uid
            )
        ) {

            adminLogin.hidden = false;

            adminDashboard.hidden = true;

            adminMessage.textContent =
                "Dit Google-account heeft geen toegang tot het beheer.";

            await logout();

            return;
        }


        /* Geldige admin */

        adminLogin.hidden = true;

        adminDashboard.hidden = false;

        adminUser.textContent =
            user.email;


        /* Reservaties ophalen */

        await loadReservations();

    }
);