import {
    loginWithGoogle,
    logout,
    watchAuthState,
    getReservations,
    updateReservationStatus,
    sendReservationEmail
} from "./firebase.js";


/* =========================================
   TOEGELATEN ADMINS
========================================= */

const ADMIN_UIDS = [
    "3v8qJh6ZXrPYqfzxJ3f6if4BH3r2"
];



/* =========================================
   HTML-ELEMENTEN
========================================= */

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



/* =========================================
   DASHBOARD ELEMENTEN
========================================= */

const statPending =
    document.getElementById(
        "stat-pending"
    );

const statAccepted =
    document.getElementById(
        "stat-accepted"
    );

const statUpcoming =
    document.getElementById(
        "stat-upcoming"
    );

const reservationSearch =
    document.getElementById(
        "reservation-search"
    );

const filterButtons =
    document.querySelectorAll(
        ".admin-filter-button"
    );



/*
    Alle reservaties blijven lokaal bewaard.

    Daardoor hoeven we niet telkens opnieuw
    Firestore te contacteren wanneer de admin
    alleen een filter aanklikt.
*/

let allReservations =
    [];


let activeReservationFilter =
    "all";

/* =========================================
   GOOGLE LOGIN
========================================= */

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
   RESERVATIES LADEN
========================================= */

async function loadReservations() {

    reservationsList.innerHTML = `
        <p class="reservations-loading">
            Reservaties laden...
        </p>
    `;


    try {

        allReservations =
            await getReservations();



        /*
            Sorteervolgorde:

            1. pending
            2. accepted
            3. rejected
            4. cancelled

            Binnen dezelfde status:
            nieuwste aanvraag eerst.
        */

        const statusPriority = {
            pending: 1,
            accepted: 2,
            rejected: 3,
            cancelled: 4
        };


        allReservations.sort(
            (a, b) => {

                const priorityA =
                    statusPriority[
                    a.status
                    ] || 99;

                const priorityB =
                    statusPriority[
                    b.status
                    ] || 99;


                if (
                    priorityA !==
                    priorityB
                ) {

                    return (
                        priorityA -
                        priorityB
                    );
                }


                const dateA =
                    a.createdAt
                        ?.toMillis?.()
                    || 0;

                const dateB =
                    b.createdAt
                        ?.toMillis?.()
                    || 0;


                return (
                    dateB -
                    dateA
                );
            }
        );


        updateDashboardStats();

        renderReservations();


        /*
            Andere adminmodules laten weten
            dat de reservaties veranderd zijn.
        
            De dagkalender kan daardoor meteen
            opnieuw berekenen wie aanwezig is.
        */

        window.dispatchEvent(
            new CustomEvent(
                "teckelweb:reservations-updated",
                {
                    detail: {
                        reservations:
                            allReservations
                    }
                }
            )
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
/* =========================================
   DASHBOARD STATISTIEKEN
========================================= */

function updateDashboardStats() {

    const pendingCount =
        allReservations.filter(
            reservation =>
                reservation.status ===
                "pending"
        ).length;


    const acceptedCount =
        allReservations.filter(
            reservation =>
                reservation.status ===
                "accepted"
        ).length;



    /*
        YYYY-MM-DD sorteert ook correct
        als tekst.

        Daardoor kunnen we eenvoudig
        vergelijken met vandaag.
    */

    const now =
        new Date();


    const todayString =
        [
            now.getFullYear(),

            String(
                now.getMonth() + 1
            ).padStart(
                2,
                "0"
            ),

            String(
                now.getDate()
            ).padStart(
                2,
                "0"
            )
        ].join("-");


    const upcomingCount =
        allReservations.filter(
            reservation => {

                if (
                    reservation.status !==
                    "accepted"
                ) {

                    return false;
                }


                const endDate =
                    reservation.booking
                        ?.endDate
                    ||
                    reservation.booking
                        ?.startDate;


                if (!endDate) {

                    return false;
                }


                return (
                    endDate >=
                    todayString
                );
            }
        ).length;


    statPending.textContent =
        pendingCount;

    statAccepted.textContent =
        acceptedCount;

    statUpcoming.textContent =
        upcomingCount;
}

/* =========================================
   RESERVATIES FILTEREN
========================================= */

function getFilteredReservations() {

    let reservations =
        [...allReservations];



    /*
        STATUSFILTER
    */

    if (
        activeReservationFilter !==
        "all"
    ) {

        reservations =
            reservations.filter(
                reservation =>
                    reservation.status ===
                    activeReservationFilter
            );
    }



    /*
        ZOEKEN
    */

    const searchTerm =
        reservationSearch.value
            .trim()
            .toLowerCase();


    if (searchTerm) {

        reservations =
            reservations.filter(
                reservation => {

                    const customerName =
                        reservation.customer
                            ?.name
                            ?.toLowerCase()
                        || "";


                    const customerEmail =
                        reservation.customer
                            ?.email
                            ?.toLowerCase()
                        || "";


                    const customerPhone =
                        reservation.customer
                            ?.phone
                            ?.toLowerCase()
                        || "";


                    const dogName =
                        reservation.dog
                            ?.name
                            ?.toLowerCase()
                        || "";


                    return (
                        customerName.includes(
                            searchTerm
                        )
                        ||
                        customerEmail.includes(
                            searchTerm
                        )
                        ||
                        customerPhone.includes(
                            searchTerm
                        )
                        ||
                        dogName.includes(
                            searchTerm
                        )
                    );
                }
            );
    }


    return reservations;
}
/* =========================================
   RESERVATIES TONEN
========================================= */

function renderReservations() {

    const reservations =
        getFilteredReservations();


    reservationsList.innerHTML =
        "";


    if (
        reservations.length ===
        0
    ) {

        reservationsList.innerHTML = `
            <div class="admin-no-results">

                <strong>
                    Geen reservaties gevonden
                </strong>

                <span>
                    Pas uw filter of zoekopdracht aan.
                </span>

            </div>
        `;


        return;
    }


    reservations.forEach(
        reservation => {

            createReservationCard(
                reservation
            );
        }
    );
}
/* =========================================
   RESERVATIEKAART MAKEN
========================================= */

function createReservationCard(
    reservation
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        `reservation-card reservation-${reservation.status || "pending"}`;


    card.id =
        `reservation-${reservation.id}`;



    /* -------------------------------------
       HEADER
    ------------------------------------- */

    const header =
        document.createElement(
            "div"
        );


    header.className =
        "reservation-card-header";


    const title =
        document.createElement(
            "h3"
        );


    title.textContent =
        reservation.dog?.name
            ? `Reservatie voor ${reservation.dog.name}`
            : "Reservatie";


    const status =
        document.createElement(
            "span"
        );


    const reservationStatus =
        reservation.status
        || "pending";


    status.className =
        `reservation-status ${reservationStatus}`;


    status.textContent =
        getStatusText(
            reservationStatus
        );


    header.appendChild(
        title
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
            formatPeriod(
                reservation.booking
                    ?.startDate,

                reservation.booking
                    ?.endDate
            )
        )
    );


    details.appendChild(
        makeDetail(
            "Uren",
            `${reservation.booking
                ?.arrivalTime || "-"
            } → ${reservation.booking
                ?.departureTime || "-"
            }`
        )
    );


    details.appendChild(
        makeDetail(
            "Type",
            formatBookingType(
                reservation.booking
                    ?.type
            )
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
            "reservation-notes";


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
       ACTIEKNOPPEN

       Alleen bij PENDING.
    ------------------------------------- */

    if (
        reservationStatus
        === "pending"
    ) {

        const actions =
            document.createElement(
                "div"
            );


        actions.className =
            "reservation-actions";


        /* GOEDKEUREN */

        const acceptButton =
            document.createElement(
                "button"
            );


        acceptButton.type =
            "button";


        acceptButton.className =
            "reservation-accept-button";


        acceptButton.textContent =
            "Goedkeuren";


        acceptButton.addEventListener(
            "click",
            async () => {

                await changeReservationStatus(
                    reservation,
                    "accepted",
                    acceptButton,
                    rejectButton
                );
            }
        );



        /* WEIGEREN */

        const rejectButton =
            document.createElement(
                "button"
            );


        rejectButton.type =
            "button";


        rejectButton.className =
            "reservation-reject-button";


        rejectButton.textContent =
            "Weigeren";


        rejectButton.addEventListener(
            "click",
            async () => {

                const confirmed =
                    window.confirm(
                        "Bent u zeker dat u deze reservatie wilt weigeren?"
                    );


                if (!confirmed) {
                    return;
                }


                await changeReservationStatus(
                    reservation,
                    "rejected",
                    acceptButton,
                    rejectButton
                );
            }
        );


        actions.appendChild(
            acceptButton
        );


        actions.appendChild(
            rejectButton
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
   STATUS WIJZIGEN
========================================= */

async function changeReservationStatus(
    reservation,
    newStatus,
    acceptButton,
    rejectButton
) {

    acceptButton.disabled =
        true;

    rejectButton.disabled =
        true;


    if (
        newStatus ===
        "accepted"
    ) {

        acceptButton.textContent =
            "Goedkeuren...";

    } else {

        rejectButton.textContent =
            "Weigeren...";
    }



    /* =====================================
       1. STATUS IN FIRESTORE AANPASSEN
    ===================================== */

    try {

        await updateReservationStatus(
            reservation.id,
            newStatus
        );


    } catch (error) {

        console.error(
            "Status aanpassen mislukt:",
            error
        );


        alert(
            "De reservatiestatus kon niet aangepast worden."
        );


        acceptButton.disabled =
            false;

        rejectButton.disabled =
            false;


        acceptButton.textContent =
            "Goedkeuren";

        rejectButton.textContent =
            "Weigeren";


        return;
    }



    /* =====================================
       2. KLANT MAILEN
    ===================================== */

    let emailSent =
        true;


    try {

        const emailResult =
            await sendReservationEmail(
                reservation.id
            );


        console.log(
            "Statusmail verstuurd:",
            emailResult
        );


    } catch (emailError) {

        emailSent =
            false;


        console.error(
            "Status aangepast maar mail mislukt:",
            emailError
        );
    }



    /* =====================================
       3. DASHBOARD HERLADEN
    ===================================== */

    await loadReservations();



    /* =====================================
       4. ADMIN WAARSCHUWEN BIJ MAILFOUT
    ===================================== */

    if (!emailSent) {

        alert(
            "De reservatiestatus is correct aangepast, maar de e-mail naar de klant kon niet verstuurd worden."
        );
    }
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
        "reservation-detail";


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
   STATUS TEKST
========================================= */

function getStatusText(status) {

    if (
        status === "accepted"
    ) {

        return "Goedgekeurd";
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


    return "In afwachting";
}



/* =========================================
   TYPE OPVANG
========================================= */

function formatBookingType(type) {

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
   DATUM MOOIER TONEN
========================================= */

function formatPeriod(
    startDate,
    endDate
) {

    if (!startDate) {
        return "-";
    }


    const start =
        formatDate(
            startDate
        );


    if (
        !endDate ||
        endDate === startDate
    ) {

        return start;
    }


    return (
        `${start} → ${formatDate(endDate)}`
    );
}



function formatDate(dateString) {

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
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    ).format(date);
}

/* =========================================
   FILTER EVENTS
========================================= */

filterButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                activeReservationFilter =
                    button.dataset.filter;


                filterButtons.forEach(
                    filterButton => {

                        filterButton.classList.remove(
                            "active"
                        );
                    }
                );


                button.classList.add(
                    "active"
                );


                renderReservations();
            }
        );
    }
);



/* =========================================
   ZOEKEN
========================================= */

reservationSearch.addEventListener(
    "input",
    () => {

        renderReservations();
    }
);

/* =========================================
   LOGINSTATUS + ADMINCONTROLE
========================================= */

watchAuthState(
    async user => {

        /*
            Niemand ingelogd
        */

        if (!user) {

            adminLogin.hidden =
                false;


            adminDashboard.hidden =
                true;


            adminUser.textContent =
                "";


            return;
        }


        /*
            Wel Google-login,
            maar geen admin.
        */

        if (
            !ADMIN_UIDS.includes(
                user.uid
            )
        ) {

            adminLogin.hidden =
                false;


            adminDashboard.hidden =
                true;


            adminMessage.textContent =
                "Dit Google-account heeft geen toegang tot het beheer.";


            await logout();


            return;
        }


        /*
            Geldige admin
        */

        adminLogin.hidden =
            true;


        adminDashboard.hidden =
            false;


        adminUser.textContent =
            user.email;


        await loadReservations();
    }
);