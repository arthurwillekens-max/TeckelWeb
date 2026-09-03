import {
    loginWithGoogle,
    logout,
    watchAuthState,
    getReservations,
    updateReservationStatus,
    sendReservationEmail,
    getClientDirectory,
    getPetDirectory
} from "./firebase.js";


/* =========================================================
   TECKELWEB ADMIN
========================================================= */


/* =========================================================
   ADMIN ACCOUNTS
========================================================= */

const ADMIN_UIDS = [
    "3v8qJh6ZXrPYqfzxJ3f6if4BH3r2"
];



/* =========================================================
   LOGIN ELEMENTEN
========================================================= */

const loginSection =
    document.querySelector(
        ".admin-login"
    );

const loginButton =
    document.getElementById(
        "google-login"
    );

const adminMessage =
    document.getElementById(
        "admin-message"
    );

const adminDashboard =
    document.getElementById(
        "admin-dashboard"
    );

const adminUser =
    document.getElementById(
        "admin-user"
    );

const logoutButton =
    document.getElementById(
        "logout-button"
    );



/* =========================================================
   ALGEMENE ADMIN NAVIGATIE
========================================================= */

const adminNavButtons =
    Array.from(
        document.querySelectorAll(
            "[data-admin-view]"
        )
    );

const adminViews =
    Array.from(
        document.querySelectorAll(
            ".admin-view"
        )
    );

const goViewButtons =
    Array.from(
        document.querySelectorAll(
            "[data-go-view]"
        )
    );

const adminPageTitle =
    document.getElementById(
        "admin-page-title"
    );

const adminPageEyebrow =
    document.getElementById(
        "admin-page-eyebrow"
    );

const refreshButton =
    document.getElementById(
        "admin-refresh"
    );

const newBookingButton =
    document.getElementById(
        "admin-new-booking"
    );



/* =========================================================
   KPI ELEMENTEN
========================================================= */

const statPending =
    document.getElementById(
        "stat-pending"
    );

const statToday =
    document.getElementById(
        "stat-today"
    );

const statArrivals =
    document.getElementById(
        "stat-arrivals"
    );

const statDepartures =
    document.getElementById(
        "stat-departures"
    );


/*
    Legacy hidden counters.
*/

const statAccepted =
    document.getElementById(
        "stat-accepted"
    );

const statUpcoming =
    document.getElementById(
        "stat-upcoming"
    );


const sidebarPendingCount =
    document.getElementById(
        "sidebar-pending-count"
    );

const requestTabPending =
    document.getElementById(
        "request-tab-pending"
    );



/* =========================================================
   OVERZICHT VANDAAG
========================================================= */

const overviewTodayTitle =
    document.getElementById(
        "overview-today-title"
    );

const todayArrivalsCount =
    document.getElementById(
        "today-arrivals-count"
    );

const todayStayingCount =
    document.getElementById(
        "today-staying-count"
    );

const todayDeparturesCount =
    document.getElementById(
        "today-departures-count"
    );

const todayArrivalsList =
    document.getElementById(
        "today-arrivals-list"
    );

const todayStayingList =
    document.getElementById(
        "today-staying-list"
    );

const todayDeparturesList =
    document.getElementById(
        "today-departures-list"
    );

const overviewPendingList =
    document.getElementById(
        "overview-pending-list"
    );



/* =========================================================
   REQUESTS
========================================================= */

const reservationsList =
    document.getElementById(
        "reservations-list"
    );

const reservationSearch =
    document.getElementById(
        "reservation-search"
    );

const requestFilterButtons =
    Array.from(
        document.querySelectorAll(
            "[data-request-filter]"
        )
    );



/* =========================================================
   REQUEST DETAIL
========================================================= */

const requestDetailEmpty =
    document.getElementById(
        "request-detail-empty"
    );

const requestDetailContent =
    document.getElementById(
        "request-detail-content"
    );

const requestDetailDog =
    document.getElementById(
        "request-detail-dog"
    );

const requestDetailCustomer =
    document.getElementById(
        "request-detail-customer"
    );

const requestDetailStatus =
    document.getElementById(
        "request-detail-status"
    );

const requestDetailType =
    document.getElementById(
        "request-detail-type"
    );

const requestDetailPeriod =
    document.getElementById(
        "request-detail-period"
    );

const requestDetailArrival =
    document.getElementById(
        "request-detail-arrival"
    );

const requestDetailDeparture =
    document.getElementById(
        "request-detail-departure"
    );

const requestDetailClientName =
    document.getElementById(
        "request-detail-client-name"
    );

const requestDetailEmail =
    document.getElementById(
        "request-detail-email"
    );

const requestDetailPhone =
    document.getElementById(
        "request-detail-phone"
    );

const requestPetName =
    document.getElementById(
        "request-pet-name"
    );

const requestPetInfo =
    document.getElementById(
        "request-pet-info"
    );

const requestDetailNotes =
    document.getElementById(
        "request-detail-notes"
    );

const requestDetailPrice =
    document.getElementById(
        "request-detail-price"
    );

const requestDetailActions =
    document.getElementById(
        "request-detail-actions"
    );

const requestAcceptButton =
    document.getElementById(
        "request-accept"
    );

const requestRejectButton =
    document.getElementById(
        "request-reject"
    );



/* =========================================================
   DIRECTORY
========================================================= */

const clientsList =
    document.getElementById(
        "clients-list"
    );

const petsList =
    document.getElementById(
        "pets-list"
    );

const clientSearch =
    document.getElementById(
        "client-search"
    );

const petSearch =
    document.getElementById(
        "pet-search"
    );



/* =========================================================
   SETTINGS
========================================================= */

const settingMaxCapacity =
    document.getElementById(
        "setting-max-capacity"
    );

const settingLimitedCapacity =
    document.getElementById(
        "setting-limited-capacity"
    );

const settingOpeningTime =
    document.getElementById(
        "setting-opening-time"
    );

const settingClosingTime =
    document.getElementById(
        "setting-closing-time"
    );

const saveSettingsButton =
    document.getElementById(
        "save-admin-settings"
    );



/* =========================================================
   STATE
========================================================= */

let allReservations =
    [];


let clients =
    [];


let pets =
    [];


let activeAdminView =
    "overview";


let activeRequestFilter =
    "pending";


let selectedReservationId =
    null;


let directoriesLoaded =
    false;


/* =========================================================
   VIEW TITELS
========================================================= */

const VIEW_TITLES = {

    overview: {
        eyebrow:
            "TeckelWeb",

        title:
            "Overzicht"
    },

    calendar: {
        eyebrow:
            "Planning",

        title:
            "Kalender"
    },

    requests: {
        eyebrow:
            "Online booking",

        title:
            "Reservatieaanvragen"
    },

    clients: {
        eyebrow:
            "Relaties",

        title:
            "Klanten"
    },

    pets: {
        eyebrow:
            "Huisdieren",

        title:
            "Honden"
    },

    settings: {
        eyebrow:
            "Configuratie",

        title:
            "Instellingen"
    }
};



/* =========================================================
   DATUM HELPERS
========================================================= */

function makeDateString(
    date
) {

    return [
        date.getFullYear(),

        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        ),

        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        )
    ].join("-");
}



function getTodayString() {

    return makeDateString(
        new Date()
    );
}



function parseDate(
    dateString
) {

    if (!dateString) {

        return null;
    }


    const [
        year,
        month,
        day
    ] =
        dateString
            .split("-")
            .map(Number);


    return new Date(
        year,
        month - 1,
        day
    );
}



function formatDate(
    dateString
) {

    const date =
        parseDate(
            dateString
        );


    if (!date) {

        return "—";
    }


    return new Intl.DateTimeFormat(
        "nl-BE",
        {
            day:
                "numeric",

            month:
                "short",

            year:
                "numeric"
        }
    ).format(
        date
    );
}



function formatLongDate(
    dateString
) {

    const date =
        parseDate(
            dateString
        );


    if (!date) {

        return "—";
    }


    const formatted =
        new Intl.DateTimeFormat(
            "nl-BE",
            {
                weekday:
                    "long",

                day:
                    "numeric",

                month:
                    "long",

                year:
                    "numeric"
            }
        ).format(
            date
        );


    return (
        formatted.charAt(0).toUpperCase()
        +
        formatted.slice(1)
    );
}



/* =========================================================
   BOOKING HELPERS
========================================================= */

function isDaycare(
    reservation
) {

    return (
        reservation.booking
            ?.careType ===
        "daycare"

        ||

        reservation.booking
            ?.type ===
        "daycare"
    );
}



function isBoarding(
    reservation
) {

    return (
        reservation.booking
            ?.careType ===
        "boarding"

        ||

        reservation.booking
            ?.type ===
        "overnight"
    );
}



/*
    Nieuwe daycare-reservaties kunnen
    losse dagen bevatten:

        3 sept
        5 sept
        9 sept

    Die mogen NIET geïnterpreteerd worden
    als één verblijf van 3 t.e.m. 9 september.
*/

function getExactDaycareDates(
    reservation
) {

    if (
        isDaycare(
            reservation
        )
        &&
        Array.isArray(
            reservation.booking
                ?.dates
        )
        &&
        reservation.booking
            .dates
            .length >
        0
    ) {

        return reservation.booking
            .dates;
    }


    return [];
}



function reservationTouchesDate(
    reservation,
    dateString
) {

    const exactDates =
        getExactDaycareDates(
            reservation
        );


    if (
        exactDates.length >
        0
    ) {

        return exactDates.includes(
            dateString
        );
    }



    const start =
        reservation.booking
            ?.startDate;


    const end =
        reservation.booking
            ?.endDate
        ||
        start;


    if (
        !start ||
        !end
    ) {

        return false;
    }


    return (
        dateString >= start
        &&
        dateString <= end
    );
}



function reservationArrivesOn(
    reservation,
    dateString
) {

    const exactDates =
        getExactDaycareDates(
            reservation
        );


    if (
        exactDates.length >
        0
    ) {

        /*
            Iedere daycare-dag is een
            nieuwe aankomst.
        */

        return exactDates.includes(
            dateString
        );
    }


    return (
        reservation.booking
            ?.startDate ===
        dateString
    );
}



function reservationDepartsOn(
    reservation,
    dateString
) {

    const exactDates =
        getExactDaycareDates(
            reservation
        );


    if (
        exactDates.length >
        0
    ) {

        /*
            Daycare vertrekt op
            iedere geselecteerde dag.
        */

        return exactDates.includes(
            dateString
        );
    }


    const end =
        reservation.booking
            ?.endDate
        ||
        reservation.booking
            ?.startDate;


    return (
        end ===
        dateString
    );
}



/* =========================================================
   PERIOD FORMAT
========================================================= */

function formatReservationPeriod(
    reservation
) {

    const exactDates =
        getExactDaycareDates(
            reservation
        );


    if (
        exactDates.length >
        0
    ) {

        if (
            exactDates.length ===
            1
        ) {

            return formatDate(
                exactDates[0]
            );
        }


        if (
            exactDates.length <=
            3
        ) {

            return exactDates
                .map(
                    formatDate
                )
                .join(", ");
        }


        return `${exactDates.length} losse dagen`;
    }



    const start =
        reservation.booking
            ?.startDate;


    const end =
        reservation.booking
            ?.endDate
        ||
        start;


    if (
        !start
    ) {

        return "—";
    }


    if (
        start ===
        end
    ) {

        return formatDate(
            start
        );
    }


    return (
        `${formatDate(start)} → ${formatDate(end)}`
    );
}



/* =========================================================
   TYPE FORMAT
========================================================= */

function formatBookingType(
    reservation
) {

    if (
        isDaycare(
            reservation
        )
    ) {

        return "Dagopvang";
    }


    if (
        isBoarding(
            reservation
        )
    ) {

        return "Overnachting";
    }


    return "Opvang";
}



/* =========================================================
   STATUS FORMAT
========================================================= */

function getStatusText(
    status
) {

    switch (
    status
    ) {

        case "accepted":

            return "Goedgekeurd";


        case "rejected":

            return "Geweigerd";


        case "cancelled":

            return "Geannuleerd";


        case "pending":
        default:

            return "In afwachting";
    }
}



/* =========================================================
   LOGIN
========================================================= */

loginButton.addEventListener(
    "click",
    async () => {

        adminMessage.textContent =
            "";


        loginButton.disabled =
            true;


        loginButton.textContent =
            "Google openen...";


        try {

            await loginWithGoogle();


        } catch (error) {

            console.error(
                "Admin login mislukt:",
                error
            );


            if (
                error.code ===
                "auth/popup-closed-by-user"
            ) {

                adminMessage.textContent =
                    "Het inloggen werd geannuleerd.";

            } else {

                adminMessage.textContent =
                    "Inloggen is mislukt.";
            }


        } finally {

            loginButton.disabled =
                false;


            loginButton.textContent =
                "Inloggen met Google";
        }
    }
);



/* =========================================================
   LOGOUT
========================================================= */

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



/* =========================================================
   AUTH STATE
========================================================= */

watchAuthState(
    async user => {

        /*
            Niet ingelogd.
        */

        if (
            !user
        ) {

            loginSection.hidden =
                false;


            adminDashboard.hidden =
                true;


            return;
        }



        /*
            Ingelogd maar geen admin.
        */

        if (
            !ADMIN_UIDS.includes(
                user.uid
            )
        ) {

            loginSection.hidden =
                false;


            adminDashboard.hidden =
                true;


            adminMessage.textContent =
                "Dit Google-account heeft geen toegang tot TeckelWeb beheer.";


            try {

                await logout();

            } catch {

                // niets doen
            }


            return;
        }



        /*
            Geldige admin.
        */

        adminMessage.textContent =
            "";


        loginSection.hidden =
            true;


        adminDashboard.hidden =
            false;


        adminUser.textContent =
            user.email
            ||
            user.displayName
            ||
            "Beheerder";


        await loadAdminData();


        showAdminView(
            activeAdminView
        );
    }
);



/* =========================================================
   ADMIN VIEW NAVIGATIE
========================================================= */

async function showAdminView(
    viewName
) {

    if (
        !VIEW_TITLES[
        viewName
        ]
    ) {

        viewName =
            "overview";
    }


    activeAdminView =
        viewName;



    adminViews.forEach(
        view => {

            const active =
                view.dataset
                    .view ===
                viewName;


            view.hidden =
                !active;


            view.classList.toggle(
                "active",
                active
            );
        }
    );



    adminNavButtons.forEach(
        button => {

            button.classList.toggle(
                "active",
                button.dataset
                    .adminView ===
                viewName
            );
        }
    );



    adminPageEyebrow.textContent =
        VIEW_TITLES[
            viewName
        ].eyebrow;


    adminPageTitle.textContent =
        VIEW_TITLES[
            viewName
        ].title;



    /*
        Klanten en honden laden we pas
        wanneer ze echt nodig zijn.
    */

    if (
        viewName ===
        "clients"
        ||
        viewName ===
        "pets"
    ) {

        await ensureDirectoriesLoaded();
    }
}



adminNavButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            async () => {

                await showAdminView(
                    button.dataset
                        .adminView
                );
            }
        );
    }
);



goViewButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            async () => {

                await showAdminView(
                    button.dataset
                        .goView
                );
            }
        );
    }
);



/* =========================================================
   REFRESH
========================================================= */

refreshButton.addEventListener(
    "click",
    async () => {

        refreshButton.disabled =
            true;


        const oldText =
            refreshButton.textContent;


        refreshButton.textContent =
            "Vernieuwen...";


        try {

            directoriesLoaded =
                false;


            await loadAdminData();


            if (
                activeAdminView ===
                "clients"
                ||
                activeAdminView ===
                "pets"
            ) {

                await ensureDirectoriesLoaded();
            }


        } finally {

            refreshButton.disabled =
                false;


            refreshButton.textContent =
                oldText;
        }
    }
);



/* =========================================================
   NIEUWE RESERVATIE
========================================================= */

newBookingButton.addEventListener(
    "click",
    () => {

        /*
            Voorlopig opent dit de publieke
            bookingpagina.

            Later bouwen we eventueel een
            aparte handmatige admin booking.
        */

        window.open(
            "index.html",
            "_blank"
        );
    }
);



/* =========================================================
   DATA LADEN
========================================================= */

async function loadAdminData() {

    try {

        allReservations =
            await getReservations();



        /*
            Nieuwste eerst.
        */

        allReservations.sort(
            (
                a,
                b
            ) => {

                const timeA =
                    a.createdAt
                        ?.toMillis?.()
                    ||
                    0;


                const timeB =
                    b.createdAt
                        ?.toMillis?.()
                    ||
                    0;


                return (
                    timeB -
                    timeA
                );
            }
        );



        renderOverview();

        renderRequests();

        updatePendingCounters();



        /*
            Kalendermodule laten weten
            dat nieuwe reservatiedata
            beschikbaar is.
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
            "Admin data laden mislukt:",
            error
        );


        reservationsList.innerHTML = `
            <div class="admin-empty-state">

                <strong>
                    Reservaties konden niet geladen worden.
                </strong>

            </div>
        `;
    }
}



/* =========================================================
   PENDING COUNTERS
========================================================= */

function updatePendingCounters() {

    const pending =
        allReservations.filter(
            reservation =>
                reservation.status ===
                "pending"
        ).length;



    if (
        sidebarPendingCount
    ) {

        sidebarPendingCount.textContent =
            pending;


        sidebarPendingCount.hidden =
            pending ===
            0;
    }



    if (
        requestTabPending
    ) {

        requestTabPending.textContent =
            pending;
    }
}



/* =========================================================
   OVERVIEW
========================================================= */

function renderOverview() {

    const today =
        getTodayString();



    const accepted =
        allReservations.filter(
            reservation =>
                reservation.status ===
                "accepted"
        );



    const pending =
        allReservations.filter(
            reservation =>
                reservation.status ===
                "pending"
        );



    const todayReservations =
        accepted.filter(
            reservation =>
                reservationTouchesDate(
                    reservation,
                    today
                )
        );



    const arrivals =
        accepted.filter(
            reservation =>
                reservationArrivesOn(
                    reservation,
                    today
                )
        );



    const departures =
        accepted.filter(
            reservation =>
                reservationDepartsOn(
                    reservation,
                    today
                )
        );



    /*
        KPI's
    */

    statPending.textContent =
        pending.length;


    statToday.textContent =
        todayReservations.length;


    statArrivals.textContent =
        arrivals.length;


    statDepartures.textContent =
        departures.length;



    /*
        Legacy counters.
    */

    if (
        statAccepted
    ) {

        statAccepted.textContent =
            accepted.length;
    }



    if (
        statUpcoming
    ) {

        statUpcoming.textContent =
            accepted.filter(
                reservation => {

                    const end =
                        getReservationLastDate(
                            reservation
                        );


                    return (
                        end
                        &&
                        end >= today
                    );
                }
            ).length;
    }



    /*
        Titel.
    */

    overviewTodayTitle.textContent =
        formatLongDate(
            today
        );



    /*
        Counters vandaag.
    */

    todayArrivalsCount.textContent =
        arrivals.length;


    todayStayingCount.textContent =
        todayReservations.length;


    todayDeparturesCount.textContent =
        departures.length;



    renderOperationList(
        todayArrivalsList,
        arrivals,
        "arrival"
    );


    renderOperationList(
        todayStayingList,
        todayReservations,
        "staying"
    );


    renderOperationList(
        todayDeparturesList,
        departures,
        "departure"
    );



    renderOverviewPending(
        pending
    );
}



/* =========================================================
   LAATSTE DATUM VAN RESERVATIE
========================================================= */

function getReservationLastDate(
    reservation
) {

    const exactDates =
        getExactDaycareDates(
            reservation
        );


    if (
        exactDates.length >
        0
    ) {

        return [
            ...exactDates
        ].sort().at(
            -1
        );
    }


    return (
        reservation.booking
            ?.endDate

        ||

        reservation.booking
            ?.startDate

        ||

        null
    );
}



/* =========================================================
   DAGOPERATIES
========================================================= */

function renderOperationList(
    container,
    reservations,
    mode
) {

    container.innerHTML =
        "";


    if (
        reservations.length ===
        0
    ) {

        const labels = {

            arrival:
                "Geen aankomsten.",

            staying:
                "Geen honden aanwezig.",

            departure:
                "Geen vertrekken."
        };


        container.innerHTML = `
            <div class="admin-empty-small">
                ${labels[mode]}
            </div>
        `;


        return;
    }



    const sorted =
        [
            ...reservations
        ].sort(
            (
                a,
                b
            ) => {

                const timeA =
                    getOperationTime(
                        a,
                        mode
                    );


                const timeB =
                    getOperationTime(
                        b,
                        mode
                    );


                return timeA.localeCompare(
                    timeB
                );
            }
        );



    sorted.forEach(
        reservation => {

            const item =
                document.createElement(
                    "button"
                );


            item.type =
                "button";


            item.className =
                "admin-operation-item";


            const dog =
                escapeHtml(
                    reservation.dog
                        ?.name
                    ||
                    "Hond"
                );


            const customer =
                escapeHtml(
                    reservation.customer
                        ?.name
                    ||
                    "Onbekende klant"
                );


            const time =
                escapeHtml(
                    getOperationTime(
                        reservation,
                        mode
                    )
                );


            item.innerHTML = `
                <div class="admin-operation-main">

                    <strong>
                        ${dog}
                    </strong>

                    <span>
                        ${customer}
                    </span>

                </div>

                <span class="admin-operation-time">
                    ${time}
                </span>
            `;


            item.addEventListener(
                "click",
                async () => {

                    await openReservationFromAnywhere(
                        reservation.id
                    );
                }
            );


            container.appendChild(
                item
            );
        }
    );
}



/* =========================================================
   OPERATIETIJD
========================================================= */

function getOperationTime(
    reservation,
    mode
) {

    if (
        mode ===
        "arrival"
    ) {

        return (
            reservation.booking
                ?.arrivalTime
            ||
            "08:00"
        );
    }


    if (
        mode ===
        "departure"
    ) {

        return (
            reservation.booking
                ?.departureTime
            ||
            "18:00"
        );
    }


    if (
        isDaycare(
            reservation
        )
    ) {

        return (
            `${reservation.booking?.arrivalTime || "08:00"}`
            +
            " – "
            +
            `${reservation.booking?.departureTime || "18:00"}`
        );
    }


    return "Verblijf";
}



/* =========================================================
   OVERVIEW PENDING
========================================================= */

function renderOverviewPending(
    reservations
) {

    overviewPendingList.innerHTML =
        "";


    if (
        reservations.length ===
        0
    ) {

        overviewPendingList.innerHTML = `
            <div class="admin-empty-small">
                Geen nieuwe aanvragen.
            </div>
        `;


        return;
    }



    reservations
        .slice(
            0,
            5
        )
        .forEach(
            reservation => {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.className =
                    "admin-pending-preview-item";


                button.innerHTML = `
                    <div>

                        <strong>
                            ${escapeHtml(
                    reservation.dog?.name
                    ||
                    "Hond"
                )}
                        </strong>

                        <span>
                            ${escapeHtml(
                    reservation.customer?.name
                    ||
                    "Onbekende klant"
                )}
                        </span>

                    </div>

                    <small>
                        ${escapeHtml(
                    formatReservationPeriod(
                        reservation
                    )
                )}
                    </small>
                `;


                button.addEventListener(
                    "click",
                    async () => {

                        await openReservationFromAnywhere(
                            reservation.id
                        );
                    }
                );


                overviewPendingList.appendChild(
                    button
                );
            }
        );
}



/* =========================================================
   REQUEST FILTER
========================================================= */

requestFilterButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                activeRequestFilter =
                    button.dataset
                        .requestFilter;


                requestFilterButtons.forEach(
                    otherButton => {

                        otherButton.classList.toggle(
                            "active",
                            otherButton ===
                            button
                        );
                    }
                );


                renderRequests();
            }
        );
    }
);



reservationSearch.addEventListener(
    "input",
    renderRequests
);



/* =========================================================
   REQUEST FILTER DATA
========================================================= */

function getFilteredReservations() {

    let result =
        [
            ...allReservations
        ];



    if (
        activeRequestFilter !==
        "all"
    ) {

        result =
            result.filter(
                reservation =>
                    reservation.status ===
                    activeRequestFilter
            );
    }



    const search =
        reservationSearch
            .value
            .trim()
            .toLowerCase();



    if (
        search
    ) {

        result =
            result.filter(
                reservation => {

                    const haystack =
                        [
                            reservation.customer
                                ?.name,

                            reservation.customer
                                ?.email,

                            reservation.customer
                                ?.phone,

                            reservation.dog
                                ?.name,

                            reservation.dog
                                ?.breed
                        ]
                            .filter(
                                Boolean
                            )
                            .join(
                                " "
                            )
                            .toLowerCase();


                    return haystack.includes(
                        search
                    );
                }
            );
    }


    return result;
}



/* =========================================================
   REQUEST LIST
========================================================= */

function renderRequests() {

    const reservations =
        getFilteredReservations();



    reservationsList.innerHTML =
        "";



    if (
        reservations.length ===
        0
    ) {

        reservationsList.innerHTML = `
            <div class="admin-empty-state">

                <strong>
                    Geen reservaties gevonden
                </strong>

                <span>
                    Pas de filter of zoekopdracht aan.
                </span>

            </div>
        `;


        return;
    }



    reservations.forEach(
        reservation => {

            const card =
                createRequestCard(
                    reservation
                );


            reservationsList.appendChild(
                card
            );
        }
    );



    /*
        Als geselecteerde reservatie niet meer
        in huidige filter zit, detail sluiten.
    */

    if (
        selectedReservationId
        &&
        !reservations.some(
            reservation =>
                reservation.id ===
                selectedReservationId
        )
    ) {

        clearRequestDetail();
    }
}



/* =========================================================
   REQUEST CARD
========================================================= */

function createRequestCard(
    reservation
) {

    const card =
        document.createElement(
            "button"
        );


    card.type =
        "button";


    card.id =
        `reservation-${reservation.id}`;


    card.className =
        "admin-request-item";


    if (
        reservation.id ===
        selectedReservationId
    ) {

        card.classList.add(
            "selected"
        );
    }



    const dog =
        escapeHtml(
            reservation.dog
                ?.name
            ||
            "Hond"
        );


    const customer =
        escapeHtml(
            reservation.customer
                ?.name
            ||
            "Onbekende klant"
        );


    const period =
        escapeHtml(
            formatReservationPeriod(
                reservation
            )
        );


    const type =
        escapeHtml(
            formatBookingType(
                reservation
            )
        );


    const status =
        reservation.status
        ||
        "pending";



    card.innerHTML = `
        <div class="admin-request-item-top">

            <div class="admin-request-item-title">

                <strong>
                    ${dog}
                </strong>

                <span>
                    ${customer}
                </span>

            </div>

            <span class="reservation-status ${status}">
                ${escapeHtml(
        getStatusText(
            status
        )
    )}
            </span>

        </div>


        <div class="admin-request-item-meta">

            <span>
                ${type}
            </span>

            <span>
                ${period}
            </span>

        </div>
    `;



    card.addEventListener(
        "click",
        () => {

            showRequestDetail(
                reservation.id
            );
        }
    );


    return card;
}



/* =========================================================
   REQUEST DETAIL
========================================================= */

function showRequestDetail(
    reservationId
) {

    const reservation =
        allReservations.find(
            item =>
                item.id ===
                reservationId
        );


    if (
        !reservation
    ) {

        clearRequestDetail();

        return;
    }



    selectedReservationId =
        reservationId;



    /*
        Linker lijst selected state vernieuwen.
    */

    renderRequests();



    requestDetailEmpty.hidden =
        true;


    requestDetailContent.hidden =
        false;



    const dogName =
        reservation.dog
            ?.name
        ||
        "Hond";


    const customerName =
        reservation.customer
            ?.name
        ||
        "Onbekende klant";


    const status =
        reservation.status
        ||
        "pending";



    requestDetailDog.textContent =
        dogName;


    requestDetailCustomer.textContent =
        customerName;


    requestDetailStatus.className =
        `reservation-status ${status}`;


    requestDetailStatus.textContent =
        getStatusText(
            status
        );


    requestDetailType.textContent =
        formatBookingType(
            reservation
        );


    requestDetailPeriod.textContent =
        formatReservationPeriod(
            reservation
        );


    requestDetailArrival.textContent =
        reservation.booking
            ?.arrivalTime
        ||
        "—";


    requestDetailDeparture.textContent =
        reservation.booking
            ?.departureTime
        ||
        "—";


    requestDetailClientName.textContent =
        customerName;


    requestDetailEmail.textContent =
        reservation.customer
            ?.email
        ||
        "—";


    requestDetailPhone.textContent =
        reservation.customer
            ?.phone
        ||
        "—";


    requestPetName.textContent =
        dogName;


    requestPetInfo.textContent =
        formatPetInfo(
            reservation.dog
        );


    requestDetailNotes.textContent =
        buildReservationNotes(
            reservation
        );


    requestDetailPrice.textContent =
        reservation.price
        ||
        (
            reservation.estimatedPrice !==
                undefined
                ? `€${reservation.estimatedPrice}`
                : "—"
        );



    /*
        Alleen pending aanvragen
        mogen nog geaccepteerd/geweigerd worden.
    */

    requestDetailActions.hidden =
        status !==
        "pending";
}



/* =========================================================
   DETAIL LEEGMAKEN
========================================================= */

function clearRequestDetail() {

    selectedReservationId =
        null;


    requestDetailEmpty.hidden =
        false;


    requestDetailContent.hidden =
        true;
}



/* =========================================================
   PET INFO
========================================================= */

function formatPetInfo(
    dog = {}
) {

    const parts =
        [];


    if (
        dog.breed
    ) {

        parts.push(
            dog.breed
        );
    }


    if (
        dog.age !==
        null
        &&
        dog.age !==
        undefined
        &&
        dog.age !==
        ""
    ) {

        parts.push(
            `${dog.age} jaar`
        );
    }


    if (
        dog.weight !==
        null
        &&
        dog.weight !==
        undefined
        &&
        dog.weight !==
        ""
    ) {

        parts.push(
            `${dog.weight} kg`
        );
    }


    return (
        parts.join(
            " · "
        )
        ||
        "Hond"
    );
}



/* =========================================================
   RESERVATIE NOTITIES SAMENVOEGEN
========================================================= */

function buildReservationNotes(
    reservation
) {

    const blocks =
        [];



    if (
        reservation.notes
    ) {

        blocks.push(
            reservation.notes
        );
    }



    if (
        reservation.dog
            ?.notes
    ) {

        blocks.push(
            `Hond: ${reservation.dog.notes}`
        );
    }



    const addons =
        reservation.booking
            ?.addons;


    if (
        Array.isArray(
            addons
        )
        &&
        addons.length >
        0
    ) {

        const names = {

            "extra-walk":
                "Extra wandeling",

            "photo-update":
                "Foto-update",

            "individual-play":
                "Individueel speelmoment"
        };


        blocks.push(
            "Extra's: "
            +
            addons
                .map(
                    addon =>
                        names[addon]
                        ||
                        addon
                )
                .join(
                    ", "
                )
        );
    }



    const feeding =
        reservation.booking
            ?.feeding;


    if (
        feeding
    ) {

        const feedingParts =
            [];


        if (
            feeding.frequency
        ) {

            feedingParts.push(
                `${feeding.frequency}× per dag`
            );
        }


        if (
            feeding.source ===
            "owner"
        ) {

            feedingParts.push(
                "eigen voeding"
            );
        }


        if (
            feeding.source ===
            "facility"
        ) {

            feedingParts.push(
                "voeding opvang"
            );
        }


        if (
            feeding.notes
        ) {

            feedingParts.push(
                feeding.notes
            );
        }


        if (
            feedingParts.length >
            0
        ) {

            blocks.push(
                "Voeding: "
                +
                feedingParts.join(
                    " · "
                )
            );
        }
    }



    const medication =
        reservation.booking
            ?.medication;


    if (
        medication
            ?.needed
    ) {

        blocks.push(
            "Medicatie: "
            +
            (
                medication.notes
                ||
                "Medicatie nodig"
            )
        );
    }



    return (
        blocks.join(
            "\n\n"
        )
        ||
        "Geen opmerkingen."
    );
}



/* =========================================================
   REQUEST ACCEPTEREN
========================================================= */

requestAcceptButton.addEventListener(
    "click",
    async () => {

        await changeSelectedReservationStatus(
            "accepted"
        );
    }
);



/* =========================================================
   REQUEST WEIGEREN
========================================================= */

requestRejectButton.addEventListener(
    "click",
    async () => {

        const confirmed =
            window.confirm(
                "Wilt u deze reservatieaanvraag weigeren?"
            );


        if (
            !confirmed
        ) {

            return;
        }


        await changeSelectedReservationStatus(
            "rejected"
        );
    }
);



/* =========================================================
   STATUS AANPASSEN
========================================================= */

async function changeSelectedReservationStatus(
    newStatus
) {

    if (
        !selectedReservationId
    ) {

        return;
    }



    const reservationId =
        selectedReservationId;



    requestAcceptButton.disabled =
        true;


    requestRejectButton.disabled =
        true;



    if (
        newStatus ===
        "accepted"
    ) {

        requestAcceptButton.textContent =
            "Accepteren...";

    } else {

        requestRejectButton.textContent =
            "Weigeren...";
    }



    try {

        /*
            1. Status opslaan.
        */

        await updateReservationStatus(
            reservationId,
            newStatus
        );



        /*
            2. Mail versturen.

            Mailfout mag statuswijziging
            niet terugdraaien.
        */

        try {

            await sendReservationEmail(
                reservationId
            );


        } catch (emailError) {

            console.error(
                "Status gewijzigd maar e-mail mislukt:",
                emailError
            );
        }



        /*
            3. Alles opnieuw laden.
        */

        selectedReservationId =
            reservationId;


        directoriesLoaded =
            false;


        await loadAdminData();



        /*
            Reservatie opnieuw tonen.
        */

        showRequestDetail(
            reservationId
        );


    } catch (error) {

        console.error(
            "Status wijzigen mislukt:",
            error
        );


        alert(
            "De reservatiestatus kon niet gewijzigd worden."
        );


    } finally {

        requestAcceptButton.disabled =
            false;


        requestRejectButton.disabled =
            false;


        requestAcceptButton.textContent =
            "Accepteren";


        requestRejectButton.textContent =
            "Weigeren";
    }
}



/* =========================================================
   RESERVATIE VANUIT ANDERE VIEW OPENEN
========================================================= */

async function openReservationFromAnywhere(
    reservationId
) {

    /*
        Zorg dat "Alles" actief is als
        een niet-pending reservatie wordt geopend.
    */

    const reservation =
        allReservations.find(
            item =>
                item.id ===
                reservationId
        );


    if (
        !reservation
    ) {

        return;
    }



    activeRequestFilter =
        reservation.status ===
            "pending"
            ? "pending"
            : "all";



    requestFilterButtons.forEach(
        button => {

            button.classList.toggle(
                "active",
                button.dataset
                    .requestFilter ===
                activeRequestFilter
            );
        }
    );



    await showAdminView(
        "requests"
    );


    renderRequests();


    showRequestDetail(
        reservationId
    );



    const card =
        document.getElementById(
            `reservation-${reservationId}`
        );


    if (
        card
    ) {

        card.scrollIntoView(
            {
                behavior:
                    "smooth",

                block:
                    "center"
            }
        );
    }
}



/*
    Kalendermodule kan later dit event
    gebruiken om een reservatie te openen.
*/

window.addEventListener(
    "teckelweb:open-reservation",
    async event => {

        const reservationId =
            event.detail
                ?.reservationId;


        if (
            reservationId
        ) {

            await openReservationFromAnywhere(
                reservationId
            );
        }
    }
);



/* =========================================================
   CLIENT DIRECTORY LADEN
========================================================= */

async function ensureDirectoriesLoaded() {

    if (
        directoriesLoaded
    ) {

        renderClients();

        renderPets();

        return;
    }



    try {

        /*
            Voorlopig komen klanten en honden
            uit de reservatiegeschiedenis.
        */

        [
            clients,
            pets
        ] =
            await Promise.all(
                [
                    getClientDirectory(),
                    getPetDirectory()
                ]
            );


        directoriesLoaded =
            true;


        renderClients();

        renderPets();


    } catch (error) {

        console.error(
            "Directory laden mislukt:",
            error
        );


        clientsList.innerHTML = `
            <div class="admin-empty-state">

                <strong>
                    Klanten konden niet geladen worden.
                </strong>

            </div>
        `;


        petsList.innerHTML = `
            <div class="admin-empty-state">

                <strong>
                    Honden konden niet geladen worden.
                </strong>

            </div>
        `;
    }
}



/* =========================================================
   CLIENT SEARCH
========================================================= */

clientSearch.addEventListener(
    "input",
    renderClients
);



/* =========================================================
   CLIENTS RENDEREN
========================================================= */

function renderClients() {

    if (
        !directoriesLoaded
    ) {

        return;
    }



    const search =
        clientSearch
            .value
            .trim()
            .toLowerCase();



    const filtered =
        clients.filter(
            client => {

                if (
                    !search
                ) {

                    return true;
                }


                const haystack =
                    [
                        client.name,
                        client.email,
                        client.phone,
                        ...client.pets
                    ]
                        .filter(
                            Boolean
                        )
                        .join(
                            " "
                        )
                        .toLowerCase();


                return haystack.includes(
                    search
                );
            }
        );



    clientsList.innerHTML =
        "";



    if (
        filtered.length ===
        0
    ) {

        clientsList.innerHTML = `
            <div class="admin-empty-state">

                <strong>
                    Geen klanten gevonden
                </strong>

            </div>
        `;


        return;
    }



    filtered.forEach(
        client => {

            const item =
                document.createElement(
                    "article"
                );


            item.className =
                "admin-directory-item";



            const initials =
                makeInitials(
                    client.name
                );



            item.innerHTML = `
                <div class="admin-directory-avatar">
                    ${escapeHtml(initials)}
                </div>


                <div class="admin-directory-main">

                    <strong>
                        ${escapeHtml(
                client.name
                ||
                client.email
                ||
                "Onbekende klant"
            )}
                    </strong>

                    <span>
                        ${escapeHtml(
                client.email
                ||
                "Geen e-mail"
            )}
                    </span>

                    <small>
                        ${escapeHtml(
                client.phone
                ||
                "Geen telefoonnummer"
            )}
                    </small>

                </div>


                <div class="admin-directory-meta">

                    <span>
                        ${client.pets.length}
                        hond${client.pets.length === 1 ? "" : "en"}
                    </span>

                    <strong>
                        ${client.reservations.length}
                        reservatie${client.reservations.length === 1 ? "" : "s"}
                    </strong>

                </div>
            `;


            clientsList.appendChild(
                item
            );
        }
    );
}



/* =========================================================
   PET SEARCH
========================================================= */

petSearch.addEventListener(
    "input",
    renderPets
);



/* =========================================================
   PETS RENDEREN
========================================================= */

function renderPets() {

    if (
        !directoriesLoaded
    ) {

        return;
    }



    const search =
        petSearch
            .value
            .trim()
            .toLowerCase();



    const filtered =
        pets.filter(
            pet => {

                if (
                    !search
                ) {

                    return true;
                }


                const haystack =
                    [
                        pet.name,
                        pet.breed,
                        pet.owner?.name,
                        pet.owner?.email
                    ]
                        .filter(
                            Boolean
                        )
                        .join(
                            " "
                        )
                        .toLowerCase();


                return haystack.includes(
                    search
                );
            }
        );



    petsList.innerHTML =
        "";



    if (
        filtered.length ===
        0
    ) {

        petsList.innerHTML = `
            <div class="admin-empty-state">

                <strong>
                    Geen honden gevonden
                </strong>

            </div>
        `;


        return;
    }



    filtered.forEach(
        pet => {

            const item =
                document.createElement(
                    "article"
                );


            item.className =
                "admin-pet-directory-card";


            item.innerHTML = `
                <div class="admin-pet-directory-top">

                    <div class="admin-pet-avatar">
                        ♢
                    </div>

                    <div>

                        <strong>
                            ${escapeHtml(
                pet.name
                ||
                "Hond"
            )}
                        </strong>

                        <span>
                            ${escapeHtml(
                formatPetInfo(
                    pet
                )
            )}
                        </span>

                    </div>

                </div>


                <div class="admin-pet-directory-owner">

                    <span>
                        Eigenaar
                    </span>

                    <strong>
                        ${escapeHtml(
                pet.owner?.name
                ||
                pet.owner?.email
                ||
                "Onbekend"
            )}
                    </strong>

                </div>


                <div class="admin-pet-directory-footer">

                    <span>
                        ${pet.reservations.length}
                        reservatie${pet.reservations.length === 1 ? "" : "s"}
                    </span>

                </div>
            `;


            petsList.appendChild(
                item
            );
        }
    );
}



/* =========================================================
   INITIALS
========================================================= */

function makeInitials(
    name
) {

    if (
        !name
    ) {

        return "K";
    }


    return name
        .trim()
        .split(
            /\s+/
        )
        .slice(
            0,
            2
        )
        .map(
            part =>
                part.charAt(
                    0
                ).toUpperCase()
        )
        .join(
            ""
        )
        ||
        "K";
}



/* =========================================================
   SETTINGS
========================================================= */


/*
    Nog tijdelijk lokaal.

    Zodra we automatische capaciteit bouwen,
    verhuizen we dit naar een beveiligd
    Firestore settings-document.
*/

const SETTINGS_STORAGE_KEY =
    "teckelweb-admin-settings";



function loadLocalSettings() {

    let stored =
        null;


    try {

        stored =
            JSON.parse(
                localStorage.getItem(
                    SETTINGS_STORAGE_KEY
                )
            );

    } catch {

        stored =
            null;
    }



    if (
        !stored
    ) {

        return;
    }



    if (
        stored.maxCapacity
    ) {

        settingMaxCapacity.value =
            stored.maxCapacity;
    }


    if (
        stored.limitedCapacity
    ) {

        settingLimitedCapacity.value =
            stored.limitedCapacity;
    }


    if (
        stored.openingTime
    ) {

        settingOpeningTime.value =
            stored.openingTime;
    }


    if (
        stored.closingTime
    ) {

        settingClosingTime.value =
            stored.closingTime;
    }
}



saveSettingsButton.addEventListener(
    "click",
    () => {

        const maxCapacity =
            Number(
                settingMaxCapacity
                    .value
            );


        const limitedCapacity =
            Number(
                settingLimitedCapacity
                    .value
            );


        const openingTime =
            settingOpeningTime
                .value;


        const closingTime =
            settingClosingTime
                .value;



        if (
            !Number.isFinite(
                maxCapacity
            )
            ||
            maxCapacity <
            1
        ) {

            alert(
                "Geef een geldige maximale capaciteit in."
            );


            return;
        }



        if (
            !Number.isFinite(
                limitedCapacity
            )
            ||
            limitedCapacity <
            1
            ||
            limitedCapacity >
            maxCapacity
        ) {

            alert(
                "De grens voor beperkte beschikbaarheid moet tussen 1 en de maximale capaciteit liggen."
            );


            return;
        }



        if (
            !openingTime
            ||
            !closingTime
            ||
            closingTime <=
            openingTime
        ) {

            alert(
                "Controleer het openings- en sluitingsuur."
            );


            return;
        }



        const settings = {

            maxCapacity:
                maxCapacity,

            limitedCapacity:
                limitedCapacity,

            openingTime:
                openingTime,

            closingTime:
                closingTime
        };



        localStorage.setItem(
            SETTINGS_STORAGE_KEY,
            JSON.stringify(
                settings
            )
        );



        const originalText =
            saveSettingsButton
                .textContent;


        saveSettingsButton.textContent =
            "Opgeslagen ✓";


        saveSettingsButton.disabled =
            true;


        window.setTimeout(
            () => {

                saveSettingsButton.textContent =
                    originalText;


                saveSettingsButton.disabled =
                    false;
            },

            1400
        );
    }
);



/* =========================================================
   HTML ESCAPE
========================================================= */

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



/* =========================================================
   START
========================================================= */

loadLocalSettings();