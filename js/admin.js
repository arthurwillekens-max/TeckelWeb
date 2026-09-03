/* =========================================================
   TECKELWEB ADMIN
   CENTRALE ADMIN CONTROLLER

   Verantwoordelijk voor:
   - authenticatie
   - dashboard
   - navigatie
   - kalender
   - dag / week / maand
   - availability
   - reservatieaanvragen
   - accepteren / weigeren
   - e-mails
   - klanten
   - honden
   - instellingen
========================================================= */


import {
    loginWithGoogle,
    logout,
    watchAuthState,
    getReservations,
    watchReservations,
    setReservationTaskCompleted,
    registerAdminPushDevice,
    isAdminPushConfigured,
    updateReservationStatus,
    confirmReservationCompleted,
    reopenCompletedReservation,
    softDeleteReservation,
    restoreReservation,
    sendReservationEmail,
    getAvailabilityForMonth,
    saveAvailability
} from "./firebase.js";



/* =========================================================
   ADMIN ACCOUNTS
========================================================= */

const ADMIN_UIDS = [
    "3v8qJh6ZXrPYqfzxJ3f6if4BH3r2"
];



/* =========================================================
   ALGEMENE HELPERS
========================================================= */

function byId(id) {

    return document.getElementById(id);
}


function one(selector) {

    return document.querySelector(selector);
}


function all(selector) {

    return Array.from(
        document.querySelectorAll(selector)
    );
}



/* =========================================================
   AUTH ELEMENTEN
========================================================= */

const loginSection =
    one(".admin-login");

const loginButton =
    byId("google-login");

const adminMessage =
    byId("admin-message");

const adminDashboard =
    byId("admin-dashboard");

const adminUser =
    byId("admin-user");

const logoutButton =
    byId("logout-button");

const sidebarToggleButton =
    byId("admin-sidebar-toggle");



/* =========================================================
   TOPBAR
========================================================= */

const adminPageEyebrow =
    byId("admin-page-eyebrow");

const adminPageTitle =
    byId("admin-page-title");

const refreshButton =
    byId("admin-refresh");

const newBookingButton =
    byId("admin-new-booking");



/* =========================================================
   SIDEBAR / VIEWS
========================================================= */

const navigationButtons =
    all("[data-admin-view]");

const adminViews =
    all(".admin-view");

const quickViewButtons =
    all("[data-go-view]");



/* =========================================================
   DASHBOARD
========================================================= */

const statPending =
    byId("stat-pending");

const statToday =
    byId("stat-today");

const statArrivals =
    byId("stat-arrivals");

const statDepartures =
    byId("stat-departures");

const statAccepted =
    byId("stat-accepted");

const statUpcoming =
    byId("stat-upcoming");

const sidebarPendingCount =
    byId("sidebar-pending-count");

const requestTabPending =
    byId("request-tab-pending");


const overviewTodayTitle =
    byId("overview-today-title");


const todayArrivalsCount =
    byId("today-arrivals-count");

const todayStayingCount =
    byId("today-staying-count");

const todayDeparturesCount =
    byId("today-departures-count");


const todayArrivalsList =
    byId("today-arrivals-list");

const todayStayingList =
    byId("today-staying-list");

const todayDeparturesList =
    byId("today-departures-list");


const overviewPendingList =
    byId("overview-pending-list");

const enableNotificationsButton =
    byId("admin-enable-notifications");



/* =========================================================
   RESERVATIEAANVRAGEN
========================================================= */

const reservationsList =
    byId("reservations-list");

const reservationSearch =
    byId("reservation-search");

const requestFilterButtons =
    all("[data-request-filter]");



/* =========================================================
   REQUEST DETAIL
========================================================= */

const requestDetailPanel =
    one(".admin-request-detail");

const requestDetailBackdrop =
    byId("request-detail-backdrop");

const requestDetailClose =
    byId("request-detail-close");

const requestDetailEmpty =
    byId("request-detail-empty");

const requestDetailContent =
    byId("request-detail-content");

const requestDetailDog =
    byId("request-detail-dog");

const requestDetailCustomer =
    byId("request-detail-customer");

const requestDetailStatus =
    byId("request-detail-status");

const requestDetailType =
    byId("request-detail-type");

const requestDetailPeriod =
    byId("request-detail-period");

const requestDetailArrival =
    byId("request-detail-arrival");

const requestDetailDeparture =
    byId("request-detail-departure");

const requestDetailClientName =
    byId("request-detail-client-name");

const requestDetailEmail =
    byId("request-detail-email");

const requestDetailPhone =
    byId("request-detail-phone");

const requestPetName =
    byId("request-pet-name");

const requestPetInfo =
    byId("request-pet-info");

const requestDetailNotes =
    byId("request-detail-notes");

const requestDetailPrice =
    byId("request-detail-price");

const requestDetailActions =
    byId("request-detail-actions");

const requestAcceptButton =
    byId("request-accept");

const requestRejectButton =
    byId("request-reject");



/* =========================================================
   KLANTEN
========================================================= */

const clientsList =
    byId("clients-list");

const clientSearch =
    byId("client-search");

const clientDetailDrawer =
    byId("client-detail-drawer");

const clientDetailBackdrop =
    byId("client-detail-backdrop");

const clientDetailClose =
    byId("client-detail-close");



/* =========================================================
   HONDEN
========================================================= */

const petsList =
    byId("pets-list");

const petSearch =
    byId("pet-search");

const petDetailDrawer =
    byId("pet-detail-drawer");

const petDetailBackdrop =
    byId("pet-detail-backdrop");

const petDetailClose =
    byId("pet-detail-close");



/* =========================================================
   TAKEN
========================================================= */

const taskDateInput =
    byId("admin-task-date");

const taskPreviousButton =
    byId("admin-task-prev");

const taskNextButton =
    byId("admin-task-next");

const taskTodayButton =
    byId("admin-task-today");

const taskSearchInput =
    byId("admin-task-search");

const taskFilterButtons =
    all("[data-task-filter]");

const taskList =
    byId("admin-task-list");

const taskStatOpen =
    byId("task-stat-open");

const taskStatCompleted =
    byId("task-stat-completed");

const taskStatTotal =
    byId("task-stat-total");

const sidebarTaskCount =
    byId("sidebar-task-count");



/* =========================================================
   KALENDER
========================================================= */

const calendarTitle =
    byId("admin-calendar-title");

const calendarGrid =
    byId("admin-calendar-grid");

const calendarPrevious =
    byId("admin-calendar-prev");

const calendarNext =
    byId("admin-calendar-next");

const calendarToday =
    byId("admin-calendar-today");

const calendarModeButtons =
    all("[data-calendar-mode]");

const calendarWorkspace =
    one(".admin-calendar-workspace");



/* =========================================================
   DAGPLANNING
========================================================= */

const selectedDateTitle =
    byId("admin-selected-date");

const daySummary =
    byId("admin-day-summary");

const dayConfirmedCount =
    byId("admin-day-confirmed-count");

const dayPendingCount =
    byId("admin-day-pending-count");

const dayPlanning =
    byId("admin-day-planning");

const dayHours =
    one(".admin-day-hours");

const dayBookings =
    byId("admin-day-bookings");



/* =========================================================
   AVAILABILITY
========================================================= */

const availabilityStatusInputs =
    all(
        'input[name="availability-status"]'
    );

const saveAvailabilityButton =
    byId("admin-save-availability");

const availabilityMessage =
    byId("admin-availability-message");



/* =========================================================
   SETTINGS
========================================================= */

const settingsNavigation =
    all(".admin-settings-navigation button");

const settingsContent =
    one(".admin-settings-content");



/* =========================================================
   STATE
========================================================= */

let currentUser =
    null;


let reservations =
    [];


let clients =
    [];


let pets =
    [];


let availability =
    {};


let currentView =
    "overview";


let requestFilter =
    "pending";


let taskFilter =
    "all";


let selectedTaskDate =
    dateToString(
        new Date()
    );


let selectedReservationId =
    null;


let calendarMode =
    "day";


const today =
    new Date();


let displayedMonth =
    new Date(
        today.getFullYear(),
        today.getMonth(),
        1
    );


let selectedDate =
    dateToString(today);



/* =========================================================
   VIEW CONFIG
========================================================= */

const VIEW_CONFIG = {

    overview: {

        eyebrow:
            "Home",

        title:
            "Overzicht"
    },


    calendar: {

        eyebrow:
            "Planning",

        title:
            "Kalender"
    },


    tasks: {

        eyebrow:
            "Verzorging",

        title:
            "Taken"
    },


    requests: {

        eyebrow:
            "Online booking",

        title:
            "Reservatieaanvragen"
    },


    clients: {

        eyebrow:
            "Klanten",

        title:
            "Klanten"
    },


    pets: {

        eyebrow:
            "Honden",

        title:
            "Honden"
    },


    history: {

        eyebrow:
            "Archief",

        title:
            "Historiek"
    },


    settings: {

        eyebrow:
            "Beheer",

        title:
            "Instellingen"
    }
};



/* =========================================================
   LOCAL SETTINGS
========================================================= */

const SETTINGS_KEY =
    "teckelweb-admin-settings";


const DEFAULT_SETTINGS = {

    maxCapacity:
        6,

    limitedCapacity:
        4,

    openingTime:
        "08:00",

    closingTime:
        "18:00",

    daycarePrice:
        25,

    overnightPrice:
        35,

    onlineBooking:
        true,

    emailNotifications:
        true
};



function getSettings() {

    try {

        const stored =
            JSON.parse(
                localStorage.getItem(
                    SETTINGS_KEY
                )
            );


        return {

            ...DEFAULT_SETTINGS,

            ...(stored || {})
        };


    } catch {

        return {
            ...DEFAULT_SETTINGS
        };
    }
}



function saveSettings(settings) {

    localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(settings)
    );
}



/* =========================================================
   DATE HELPERS
========================================================= */

function dateToString(date) {

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



function createDateString(
    year,
    month,
    day
) {

    return [

        year,

        String(
            month + 1
        ).padStart(
            2,
            "0"
        ),

        String(
            day
        ).padStart(
            2,
            "0"
        )

    ].join("-");
}



function parseDate(dateString) {

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



function addDays(
    dateString,
    numberOfDays
) {

    const date =
        parseDate(dateString);


    date.setDate(
        date.getDate()
        +
        numberOfDays
    );


    return dateToString(date);
}



function startOfWeek(dateString) {

    const date =
        parseDate(dateString);


    const day =
        date.getDay();


    const difference =
        day === 0
            ? -6
            : 1 - day;


    date.setDate(
        date.getDate()
        +
        difference
    );


    return dateToString(date);
}



function formatDate(
    dateString,
    options = {}
) {

    const date =
        parseDate(dateString);


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
                "numeric",

            ...options
        }
    ).format(date);
}



function formatLongDate(
    dateString
) {

    const date =
        parseDate(dateString);


    if (!date) {

        return "—";
    }


    const result =
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
        ).format(date);


    return (
        result.charAt(0).toUpperCase()
        +
        result.slice(1)
    );
}



function formatShortDate(
    dateString
) {

    return formatDate(
        dateString,
        {
            weekday:
                "short",

            day:
                "numeric",

            month:
                "short",

            year:
                undefined
        }
    );
}



/* =========================================================
   TIME HELPERS
========================================================= */

function timeToMinutes(time) {

    if (
        !time
        ||
        !String(time).includes(":")
    ) {

        return null;
    }


    const [
        hours,
        minutes
    ] =
        String(time)
            .split(":")
            .map(Number);


    return (
        hours * 60
        +
        minutes
    );
}



function minutesToTime(minutes) {

    const hour =
        Math.floor(
            minutes / 60
        );


    const minute =
        minutes % 60;


    return (
        String(hour).padStart(2, "0")
        +
        ":"
        +
        String(minute).padStart(2, "0")
    );
}



/* =========================================================
   BOOKING HELPERS
========================================================= */

function isDaycare(reservation) {

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



function isBoarding(reservation) {

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



function getExactDaycareDates(
    reservation
) {

    if (
        !isDaycare(reservation)
    ) {

        return [];
    }


    const dates =
        reservation.booking
            ?.dates;


    if (
        Array.isArray(dates)
        &&
        dates.length
    ) {

        return dates;
    }


    return [];
}



function reservationTouchesDate(
    reservation,
    dateString
) {

    const daycareDates =
        getExactDaycareDates(
            reservation
        );


    if (
        daycareDates.length
    ) {

        return daycareDates.includes(
            dateString
        );
    }



    const startDate =
        reservation.booking
            ?.startDate;


    const endDate =
        reservation.booking
            ?.endDate
        ||
        startDate;


    if (
        !startDate
        ||
        !endDate
    ) {

        return false;
    }


    return (

        dateString >=
        startDate

        &&

        dateString <=
        endDate
    );
}



function reservationArrivesOn(
    reservation,
    dateString
) {

    const daycareDates =
        getExactDaycareDates(
            reservation
        );


    if (
        daycareDates.length
    ) {

        return daycareDates.includes(
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

    const daycareDates =
        getExactDaycareDates(
            reservation
        );


    if (
        daycareDates.length
    ) {

        return daycareDates.includes(
            dateString
        );
    }


    return (
        (
            reservation.booking
                ?.endDate

            ||

            reservation.booking
                ?.startDate
        )
        ===
        dateString
    );
}



function getReservationFinalDate(
    reservation
) {

    const daycareDates =
        getExactDaycareDates(
            reservation
        );


    if (
        daycareDates.length
    ) {

        return [
            ...daycareDates
        ]
            .sort()
            .at(-1);
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



function getReservationsForDate(
    dateString
) {

    return reservations.filter(
        reservation =>

            reservation.isDeleted !==
                true

            &&

            reservationTouchesDate(
                reservation,
                dateString
            )
    );
}



/* =========================================================
   TYPE / STATUS FORMAT
========================================================= */

function formatBookingType(
    reservation
) {

    if (
        isDaycare(reservation)
    ) {

        return "Dagopvang";
    }


    if (
        isBoarding(reservation)
    ) {

        return "Overnachting";
    }


    return "Opvang";
}



function formatStatus(status) {

    switch (status) {

        case "accepted":

            return "Goedgekeurd";


        case "rejected":

            return "Geweigerd";


        case "cancelled":

            return "Geannuleerd";


        case "pending":
        default:

            return "Nieuw";
    }
}



/* =========================================================
   RESERVATIE PERIODE
========================================================= */

function formatReservationPeriod(
    reservation
) {

    const daycareDates =
        getExactDaycareDates(
            reservation
        );


    if (
        daycareDates.length
    ) {

        if (
            daycareDates.length ===
            1
        ) {

            return formatDate(
                daycareDates[0]
            );
        }


        if (
            daycareDates.length <=
            3
        ) {

            return daycareDates
                .map(
                    date =>
                        formatDate(
                            date,
                            {
                                year:
                                    undefined
                            }
                        )
                )
                .join(", ");
        }


        return (
            `${daycareDates.length} opvangdagen`
        );
    }



    const startDate =
        reservation.booking
            ?.startDate;


    const endDate =
        reservation.booking
            ?.endDate
        ||
        startDate;


    if (!startDate) {

        return "—";
    }


    if (
        startDate ===
        endDate
    ) {

        return formatDate(startDate);
    }


    return (
        `${formatDate(startDate)} – `
        +
        `${formatDate(endDate)}`
    );
}



/* =========================================================
   RESERVATIETIJD VOOR DAG
========================================================= */

function getReservationTimesForDay(
    reservation,
    dateString
) {

    const settings =
        getSettings();


    const openingTime =
        settings.openingTime
        ||
        "08:00";


    const closingTime =
        settings.closingTime
        ||
        "18:00";


    const booking =
        reservation.booking
        ||
        {};


    const arrivalTime =
        booking.arrivalTime
        ||
        openingTime;


    const departureTime =
        booking.departureTime
        ||
        closingTime;



    /*
        Daycare:
        iedere geselecteerde dag heeft
        aankomst + vertrek.
    */

    if (
        isDaycare(reservation)
    ) {

        return {

            start:
                arrivalTime,

            end:
                departureTime
        };
    }



    const startDate =
        booking.startDate;


    const endDate =
        booking.endDate
        ||
        startDate;



    /*
        Boarding op aankomstdag.
    */

    if (
        dateString ===
        startDate
    ) {

        return {

            start:
                arrivalTime,

            end:
                closingTime
        };
    }



    /*
        Boarding op vertrekdag.
    */

    if (
        dateString ===
        endDate
    ) {

        return {

            start:
                openingTime,

            end:
                departureTime
        };
    }



    /*
        Volledige boarding-tussendag.
    */

    return {

        start:
            openingTime,

        end:
            closingTime
    };
}



/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(value) {

    return String(
        value ?? ""
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
   TOAST
========================================================= */

function showToast(
    message,
    type = "default"
) {

    let toast =
        byId(
            "teckelweb-admin-toast"
        );


    if (!toast) {

        toast =
            document.createElement(
                "div"
            );


        toast.id =
            "teckelweb-admin-toast";


        toast.style.position =
            "fixed";


        toast.style.right =
            "24px";


        toast.style.bottom =
            "24px";


        toast.style.zIndex =
            "9999";


        toast.style.maxWidth =
            "360px";


        toast.style.padding =
            "13px 17px";


        toast.style.borderRadius =
            "10px";


        toast.style.fontSize =
            "13px";


        toast.style.fontWeight =
            "650";


        toast.style.boxShadow =
            "0 10px 35px rgba(0,0,0,.16)";


        toast.style.transition =
            "opacity .2s ease";


        document.body.appendChild(
            toast
        );
    }



    if (
        type ===
        "error"
    ) {

        toast.style.background =
            "#fff1ee";


        toast.style.color =
            "#8e3f33";


        toast.style.border =
            "1px solid #e9c1ba";

    } else if (
        type ===
        "success"
    ) {

        toast.style.background =
            "#fff3e8";


        toast.style.color =
            "#a84a15";


        toast.style.border =
            "1px solid #ffd0b3";

    } else {

        toast.style.background =
            "#252525";


        toast.style.color =
            "white";


        toast.style.border =
            "1px solid #252525";
    }



    toast.textContent =
        message;


    toast.style.opacity =
        "1";


    clearTimeout(
        toast._timer
    );


    toast._timer =
        setTimeout(
            () => {

                toast.style.opacity =
                    "0";
            },

            2800
        );
}



/* =========================================================
   AUTH — LOGIN
========================================================= */

loginButton?.addEventListener(
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
                "Login mislukt:",
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
   AUTH — LOGOUT
========================================================= */

logoutButton?.addEventListener(
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

        currentUser =
            user;



        /*
            Niet ingelogd.
        */

        if (!user) {

            stopRealtimeReservationsV9();


            if (
                loginSection
            ) {

                loginSection.hidden =
                    false;
            }


            if (
                adminDashboard
            ) {

                adminDashboard.hidden =
                    true;
            }


            return;
        }



        /*
            Geen admin.
        */

        if (
            !ADMIN_UIDS.includes(
                user.uid
            )
        ) {

            if (
                loginSection
            ) {

                loginSection.hidden =
                    false;
            }


            if (
                adminDashboard
            ) {

                adminDashboard.hidden =
                    true;
            }


            adminMessage.textContent =
                "Dit account heeft geen beheerrechten.";


            try {

                await logout();

            } catch {

                // niets
            }


            return;
        }



        /*
            Geldige admin.
        */

        loginSection.hidden =
            true;


        adminDashboard.hidden =
            false;


        adminUser.textContent =
            user.displayName
            ||
            user.email
            ||
            "Beheerder";


        await initialiseAdmin();
    }
);



/* =========================================================
   ADMIN INITIALISEREN
========================================================= */

async function initialiseAdmin() {

    selectedDate =
        dateToString(
            new Date()
        );


    displayedMonth =
        new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1
        );


    try {

        await Promise.all(
            [
                loadReservations(),
                loadAvailability()
            ]
        );


        deriveDirectories();


        renderEverything();


        await openDeepLinkedAdminViewV10();


        startRealtimeReservationsV9();


    } catch (error) {

        console.error(
            "Admin initialisatie mislukt:",
            error
        );


        showToast(
            "De beheeromgeving kon niet volledig worden geladen.",
            "error"
        );
    }
}



/* =========================================================
   DATA LADEN — RESERVATIES
========================================================= */

async function loadReservations() {

    reservations =
        await getReservations();



    reservations.sort(
        (
            a,
            b
        ) => {

            const timestampA =
                a.createdAt
                    ?.toMillis?.()
                ||
                0;


            const timestampB =
                b.createdAt
                    ?.toMillis?.()
                ||
                0;


            return (
                timestampB -
                timestampA
            );
        }
    );
}



/* =========================================================
   DATA LADEN — AVAILABILITY
========================================================= */

async function loadAvailability() {

    availability =
        await getAvailabilityForMonth(

            displayedMonth
                .getFullYear(),

            displayedMonth
                .getMonth()
        );
}



/* =========================================================
   ALLES RENDEREN
========================================================= */

function renderEverythingLegacy() {

    renderOverview();

    renderRequestCounters();

    renderRequests();

    renderMiniCalendar();

    renderCalendarWorkspace();

    renderClients();

    renderPets();
}



/* =========================================================
   NAVIGATIE
========================================================= */

async function showView(
    viewName
) {

    if (
        !VIEW_CONFIG[
        viewName
        ]
    ) {

        viewName =
            "overview";
    }


    currentView =
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



    navigationButtons.forEach(
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
        VIEW_CONFIG[
            viewName
        ].eyebrow;


    adminPageTitle.textContent =
        VIEW_CONFIG[
            viewName
        ].title;



    /*
        Kalender opnieuw tekenen zodra
        view zichtbaar wordt.

        Dit voorkomt dat de agenda
        een breedte van 0 krijgt wanneer
        hij gerenderd werd terwijl hidden.
    */

    if (
        viewName ===
        "calendar"
    ) {

        requestAnimationFrame(
            () => {

                renderMiniCalendar();

                renderCalendarWorkspace();
            }
        );
    }


    if (
        viewName ===
        "tasks"
    ) {

        renderTasksV9();
    }
}



/* =========================================================
   SIDEBAR BUTTONS
========================================================= */

navigationButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            async () => {

                await showView(
                    button.dataset
                        .adminView
                );
            }
        );
    }
);



quickViewButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            async () => {

                await showView(
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

refreshButton?.addEventListener(
    "click",
    async () => {

        refreshButton.disabled =
            true;


        const oldText =
            refreshButton.textContent;


        refreshButton.textContent =
            "Laden...";


        try {

            await Promise.all(
                [
                    loadReservations(),
                    loadAvailability()
                ]
            );


            deriveDirectories();

            renderEverything();


            showToast(
                "Gegevens vernieuwd.",
                "success"
            );


        } catch (error) {

            console.error(
                error
            );


            showToast(
                "Vernieuwen is mislukt.",
                "error"
            );


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

newBookingButton?.addEventListener(
    "click",
    () => {

        /*
            Later bouwen we hier de echte
            MoeGo-achtige admin-create drawer.

            Voorlopig openen we de
            online booking flow.
        */

        window.location.href =
            "index.html";
    }
);



/* =========================================================
   DASHBOARD
========================================================= */

function renderOverview() {

    const today =
        dateToString(
            new Date()
        );


    const pending =
        reservations.filter(
            reservation =>
                reservation.isDeleted !==
                    true
                &&
                reservation.status ===
                    "pending"
        );


    const accepted =
        reservations.filter(
            reservation =>
                reservation.isDeleted !==
                    true
                &&
                reservation.status ===
                    "accepted"
        );


    const dogsToday =
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



    statPending.textContent =
        pending.length;


    statToday.textContent =
        dogsToday.length;


    statArrivals.textContent =
        arrivals.length;


    statDepartures.textContent =
        departures.length;



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

                    const finalDate =
                        getReservationFinalDate(
                            reservation
                        );


                    return (
                        finalDate
                        &&
                        finalDate >= today
                    );
                }
            ).length;
    }



    overviewTodayTitle.textContent =
        formatLongDate(
            today
        );



    todayArrivalsCount.textContent =
        arrivals.length;


    todayStayingCount.textContent =
        dogsToday.length;


    todayDeparturesCount.textContent =
        departures.length;



    renderTodayList(
        todayArrivalsList,
        arrivals,
        "arrival"
    );


    renderTodayList(
        todayStayingList,
        dogsToday,
        "stay"
    );


    renderTodayList(
        todayDeparturesList,
        departures,
        "departure"
    );


    renderPendingPreview(
        pending
    );
}



/* =========================================================
   DASHBOARD OPERATIONS
========================================================= */

function renderTodayList(
    container,
    list,
    type
) {

    if (!container) {

        return;
    }


    container.innerHTML =
        "";


    if (
        list.length ===
        0
    ) {

        const emptyText = {

            arrival:
                "Geen aankomsten.",

            stay:
                "Geen honden aanwezig.",

            departure:
                "Geen vertrekken."

        }[type];


        container.innerHTML = `
            <div class="admin-empty-small">
                ${emptyText}
            </div>
        `;


        return;
    }



    const sorted =
        [...list].sort(
            (
                a,
                b
            ) => {

                return (
                    getOperationTime(
                        a,
                        type
                    )
                        .localeCompare(
                            getOperationTime(
                                b,
                                type
                            )
                        )
                );
            }
        );



    sorted.forEach(
        reservation => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "admin-operation-item";


            button.innerHTML = `
                <div class="admin-operation-main">

                    <strong>
                        ${escapeHtml(
                reservation.dog
                    ?.name
                ||
                "Hond"
            )}
                    </strong>

                    <span>
                        ${escapeHtml(
                reservation.customer
                    ?.name
                ||
                "Onbekende klant"
            )}
                    </span>

                </div>

                <span class="admin-operation-time">
                    ${escapeHtml(
                getOperationTime(
                    reservation,
                    type
                )
            )}
                </span>
            `;


            button.addEventListener(
                "click",
                async () => {

                    await openReservation(
                        reservation.id
                    );
                }
            );


            container.appendChild(
                button
            );
        }
    );
}



/* =========================================================
   OPERATION TIME
========================================================= */

function getOperationTime(
    reservation,
    type
) {

    if (
        type ===
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
        type ===
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
        isDaycare(reservation)
    ) {

        return (
            `${reservation.booking
                ?.arrivalTime
            ||
            "08:00"
            } – ${reservation.booking
                ?.departureTime
            ||
            "18:00"
            }`
        );
    }


    return "Overnachting";
}



/* =========================================================
   PENDING PREVIEW
========================================================= */

function renderPendingPreview(
    pending
) {

    overviewPendingList.innerHTML =
        "";


    if (
        pending.length ===
        0
    ) {

        overviewPendingList.innerHTML = `
            <div class="admin-empty-small">
                Geen nieuwe aanvragen.
            </div>
        `;


        return;
    }



    pending
        .slice(
            0,
            6
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
                    reservation.dog
                        ?.name
                    ||
                    "Hond"
                )}
                        </strong>

                        <span>
                            ${escapeHtml(
                    reservation.customer
                        ?.name
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

                        await openReservation(
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
   REQUEST COUNTERS
========================================================= */

function renderRequestCounters() {

    const pending =
        reservations.filter(
            reservation =>
                reservation.isDeleted !==
                    true
                &&
                reservation.status ===
                    "pending"
        ).length;



    sidebarPendingCount.textContent =
        pending;


    sidebarPendingCount.hidden =
        pending ===
        0;


    requestTabPending.textContent =
        pending;
}



/* =========================================================
   REQUEST FILTERS
========================================================= */

requestFilterButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                requestFilter =
                    button.dataset
                        .requestFilter;


                requestFilterButtons.forEach(
                    other => {

                        other.classList.toggle(
                            "active",
                            other === button
                        );
                    }
                );


                renderRequests();
            }
        );
    }
);



reservationSearch?.addEventListener(
    "input",
    renderRequests
);



/* =========================================================
   REQUESTS FILTEREN
========================================================= */

function getVisibleRequestsLegacy() {

    let result =
        [...reservations];



    if (
        requestFilter !==
        "all"
    ) {

        result =
            result.filter(
                reservation =>
                    reservation.status ===
                    requestFilter
            );
    }



    const search =
        reservationSearch
            ?.value
            .trim()
            .toLowerCase()
        ||
        "";



    if (search) {

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
                                ?.breed,

                            formatBookingType(
                                reservation
                            )

                        ]
                            .filter(Boolean)
                            .join(" ")
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
   REQUESTS RENDEREN
========================================================= */

function renderRequests() {

    if (!reservationsList) {

        return;
    }


    const visible =
        getVisibleRequests();


    reservationsList.innerHTML =
        "";



    if (
        visible.length ===
        0
    ) {

        reservationsList.innerHTML = `
            <div class="admin-empty-state">

                <strong>
                    Geen reservaties gevonden
                </strong>

                <span>
                    Er zijn geen resultaten voor deze filter.
                </span>

            </div>
        `;


        clearRequestDetail();


        return;
    }



    visible.forEach(
        reservation => {

            reservationsList.appendChild(
                createRequestRow(
                    reservation
                )
            );
        }
    );
}



/* =========================================================
   REQUEST ROW
========================================================= */

function createRequestRowLegacy(
    reservation
) {

    const button =
        document.createElement(
            "button"
        );


    button.type =
        "button";


    button.id =
        `reservation-${reservation.id}`;


    button.className =
        "admin-request-item";


    if (
        reservation.id ===
        selectedReservationId
    ) {

        button.classList.add(
            "selected"
        );
    }



    const status =
        reservation.status
        ||
        "pending";


    button.classList.add(
        `status-${status}`
    );


    button.innerHTML = `
        <div class="admin-request-item-top">

            <div class="admin-request-item-title">

                <strong>
                    ${escapeHtml(
        reservation.dog
            ?.name
        ||
        "Hond"
    )}
                </strong>

                <span>
                    ${escapeHtml(
        reservation.customer
            ?.name
        ||
        "Onbekende klant"
    )}
                </span>

            </div>


            <span class="reservation-status ${status}">
                ${escapeHtml(
        formatStatus(
            status
        )
    )}
            </span>

        </div>


        <div class="admin-request-item-meta">

            <span>
                ${escapeHtml(
        formatBookingType(
            reservation
        )
    )}
            </span>

            <span>
                ${escapeHtml(
        formatReservationPeriod(
            reservation
        )
    )}
            </span>

        </div>
    `;


    button.addEventListener(
        "click",
        () => {

            showRequestDetail(
                reservation.id
            );
        }
    );


    return button;
}



/* =========================================================
   REQUEST DETAIL
========================================================= */

function showRequestDetail(
    reservationId
) {

    const reservation =
        reservations.find(
            item =>
                item.id ===
                reservationId
        );


    if (!reservation) {

        clearRequestDetail();

        return;
    }


    selectedReservationId =
        reservationId;


    requestDetailPanel?.classList.add(
        "open"
    );


    requestDetailBackdrop?.classList.add(
        "open"
    );



    all(
        ".admin-request-item"
    )
        .forEach(
            item => {

                item.classList.toggle(
                    "selected",
                    item.id ===
                    `reservation-${reservationId}`
                );
            }
        );



    requestDetailEmpty.hidden =
        true;


    requestDetailContent.hidden =
        false;



    const status =
        reservation.status
        ||
        "pending";


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



    requestDetailDog.textContent =
        dogName;


    requestDetailCustomer.textContent =
        customerName;


    requestDetailStatus.className =
        `reservation-status ${status}`;


    requestDetailStatus.textContent =
        formatStatus(status);


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
        formatDogInfo(
            reservation.dog
        );


    requestDetailNotes.textContent =
        buildReservationNotes(
            reservation
        );


    requestDetailPrice.textContent =
        getReservationPrice(
            reservation
        );


    requestDetailActions.hidden =
        status !==
        "pending";
}



/* =========================================================
   REQUEST DETAIL CLEAR
========================================================= */

function clearRequestDetail() {

    selectedReservationId =
        null;


    requestDetailPanel?.classList.remove(
        "open"
    );


    requestDetailBackdrop?.classList.remove(
        "open"
    );


    if (
        requestDetailEmpty
    ) {

        requestDetailEmpty.hidden =
            false;
    }


    if (
        requestDetailContent
    ) {

        requestDetailContent.hidden =
            true;
    }
}



/* =========================================================
   DOG INFO
========================================================= */

function formatDogInfo(
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
   PRICE
========================================================= */

function getReservationPrice(
    reservation
) {

    if (
        reservation.price
    ) {

        return reservation.price;
    }


    if (
        reservation.estimatedPrice !==
        undefined
        &&
        reservation.estimatedPrice !==
        null
    ) {

        return (
            `€${reservation.estimatedPrice}`
        );
    }


    return "—";
}



/* =========================================================
   NOTES
========================================================= */

function buildReservationNotes(
    reservation
) {

    const notes =
        [];



    if (
        reservation.notes
    ) {

        notes.push(
            reservation.notes
        );
    }



    if (
        reservation.dog
            ?.notes
    ) {

        notes.push(
            `Hond: ${reservation.dog.notes}`
        );
    }



    const feeding =
        reservation.booking
            ?.feeding;


    if (
        feeding
    ) {

        const parts =
            [];


        if (
            feeding.frequency
        ) {

            parts.push(
                `${feeding.frequency}× per dag`
            );
        }


        if (
            feeding.source ===
            "owner"
        ) {

            parts.push(
                "eigen voeding"
            );
        }


        if (
            feeding.source ===
            "facility"
        ) {

            parts.push(
                "voeding van opvang"
            );
        }


        if (
            feeding.notes
        ) {

            parts.push(
                feeding.notes
            );
        }


        if (
            parts.length
        ) {

            notes.push(
                "Voeding: "
                +
                parts.join(" · ")
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

        notes.push(
            "Medicatie: "
            +
            (
                medication.notes
                ||
                "medicatie nodig"
            )
        );
    }



    const addons =
        reservation.booking
            ?.addons;


    if (
        Array.isArray(addons)
        &&
        addons.length
    ) {

        const addonNames = {

            "extra-walk":
                "Extra wandeling",

            "photo-update":
                "Foto-update",

            "individual-play":
                "Individueel speelmoment"
        };


        notes.push(
            "Extra's: "
            +
            addons
                .map(
                    addon =>
                        addonNames[addon]
                        ||
                        addon
                )
                .join(", ")
        );
    }



    return (
        notes.join("\n\n")
        ||
        "Geen opmerkingen."
    );
}



/* =========================================================
   ACCEPT REQUEST
========================================================= */

requestAcceptButton?.addEventListener(
    "click",
    async () => {

        await updateSelectedRequest(
            "accepted"
        );
    }
);



/* =========================================================
   REJECT REQUEST
========================================================= */

requestRejectButton?.addEventListener(
    "click",
    async () => {

        if (
            !window.confirm(
                "Weet je zeker dat je deze aanvraag wilt weigeren?"
            )
        ) {

            return;
        }


        await updateSelectedRequest(
            "rejected"
        );
    }
);



/* =========================================================
   REQUEST STATUS UPDATE
========================================================= */

async function updateSelectedRequest(
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



    try {

        await updateReservationStatus(
            reservationId,
            newStatus
        );



        /*
            E-mail versturen.

            Mailfout blokkeert de
            statuswijziging niet.
        */

        try {

            await sendReservationEmail(
                reservationId
            );


        } catch (mailError) {

            console.error(
                "Mail mislukt:",
                mailError
            );


            showToast(
                "Status aangepast, maar de e-mail kon niet worden verstuurd.",
                "error"
            );
        }



        await loadReservations();


        deriveDirectories();


        renderEverything();



        const updated =
            reservations.find(
                reservation =>
                    reservation.id ===
                    reservationId
            );


        if (updated) {

            requestFilter =
                "all";


            requestFilterButtons.forEach(
                button => {

                    button.classList.toggle(
                        "active",
                        button.dataset
                            .requestFilter ===
                        "all"
                    );
                }
            );


            renderRequests();

            showRequestDetail(
                reservationId
            );
        }



        showToast(
            newStatus ===
                "accepted"
                ? "Reservatie goedgekeurd."
                : "Reservatie geweigerd.",
            "success"
        );


    } catch (error) {

        console.error(
            "Status aanpassen mislukt:",
            error
        );


        showToast(
            "De reservatie kon niet worden aangepast.",
            "error"
        );


    } finally {

        requestAcceptButton.disabled =
            false;


        requestRejectButton.disabled =
            false;
    }
}



/* =========================================================
   RESERVATIE VANUIT DASHBOARD / CALENDAR OPENEN
========================================================= */

async function openReservation(
    reservationId
) {

    const reservation =
        reservations.find(
            item =>
                item.id ===
                reservationId
        );


    if (!reservation) {

        return;
    }



    requestFilter =
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
                requestFilter
            );
        }
    );



    await showView(
        "requests"
    );


    renderRequests();


    showRequestDetail(
        reservationId
    );



    requestAnimationFrame(
        () => {

            const row =
                byId(
                    `reservation-${reservationId}`
                );


            row?.scrollIntoView(
                {
                    behavior:
                        "smooth",

                    block:
                        "center"
                }
            );
        }
    );
}



/* =========================================================
   DIRECTORY BOUWEN
========================================================= */

function deriveDirectories() {

    const clientMap =
        new Map();


    const petMap =
        new Map();



    reservations.forEach(
        reservation => {

            if (
                reservation.isDeleted ===
                true
            ) {

                return;
            }


            const customer =
                reservation.customer
                ||
                {};


            const dog =
                reservation.dog
                ||
                {};


            const ownerKey =
                customer.uid
                ||
                customer.email
                ||
                customer.name
                ||
                "unknown";



            /* -----------------------------------------
               CLIENT
            ----------------------------------------- */

            if (
                ownerKey !==
                "unknown"
            ) {

                if (
                    !clientMap.has(
                        ownerKey
                    )
                ) {

                    clientMap.set(
                        ownerKey,
                        {

                            id:
                                ownerKey,

                            name:
                                customer.name
                                ||
                                "",

                            email:
                                customer.email
                                ||
                                "",

                            phone:
                                customer.phone
                                ||
                                "",

                            pets:
                                new Set(),

                            reservations:
                                []
                        }
                    );
                }



                const client =
                    clientMap.get(
                        ownerKey
                    );


                if (
                    customer.name
                ) {

                    client.name =
                        customer.name;
                }


                if (
                    customer.email
                ) {

                    client.email =
                        customer.email;
                }


                if (
                    customer.phone
                ) {

                    client.phone =
                        customer.phone;
                }


                if (
                    dog.name
                ) {

                    client.pets.add(
                        dog.name
                    );
                }


                client.reservations.push(
                    reservation
                );
            }



            /* -----------------------------------------
               PET
            ----------------------------------------- */

            if (
                dog.name
            ) {

                const petKey =
                    `${ownerKey}|${dog.name.trim().toLowerCase()}`;


                if (
                    !petMap.has(
                        petKey
                    )
                ) {

                    petMap.set(
                        petKey,
                        {

                            id:
                                petKey,

                            name:
                                dog.name,

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

                            ownerName:
                                customer.name
                                ||
                                "",

                            ownerEmail:
                                customer.email
                                ||
                                "",

                            reservations:
                                []
                        }
                    );
                }



                const pet =
                    petMap.get(
                        petKey
                    );


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
        }
    );



    clients =
        Array.from(
            clientMap.values()
        )
            .map(
                client => ({

                    ...client,

                    pets:
                        Array.from(
                            client.pets
                        )
                })
            )
            .sort(
                (
                    a,
                    b
                ) =>

                    (
                        a.name
                        ||
                        a.email
                    )
                        .localeCompare(
                            b.name
                            ||
                            b.email,
                            "nl"
                        )
            );



    pets =
        Array.from(
            petMap.values()
        )
            .sort(
                (
                    a,
                    b
                ) =>

                    a.name.localeCompare(
                        b.name,
                        "nl"
                    )
            );
}



/* =========================================================
   CLIENT SEARCH
========================================================= */

clientSearch?.addEventListener(
    "input",
    renderClients
);



/* =========================================================
   CLIENTS
========================================================= */

function renderClientsLegacy() {

    if (!clientsList) {

        return;
    }


    const query =
        clientSearch
            ?.value
            .trim()
            .toLowerCase()
        ||
        "";



    const visible =
        clients.filter(
            client => {

                if (!query) {

                    return true;
                }


                return [

                    client.name,
                    client.email,
                    client.phone,
                    ...client.pets

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase()
                    .includes(query);
            }
        );



    clientsList.innerHTML =
        "";



    if (
        !visible.length
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



    visible.forEach(
        client => {

            const article =
                document.createElement(
                    "article"
                );


            article.className =
                "admin-directory-item";


            article.innerHTML = `
                <div class="admin-directory-avatar">

                    ${escapeHtml(
                getInitials(
                    client.name
                )
            )}

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
                "Geen e-mailadres"
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
                        ${client.pets.length
                }
                        hond${client.pets.length === 1
                    ? ""
                    : "en"
                }
                    </span>

                    <strong>
                        ${client.reservations.length
                }
                        reservatie${client.reservations.length === 1
                    ? ""
                    : "s"
                }
                    </strong>

                </div>
            `;


            clientsList.appendChild(
                article
            );
        }
    );
}



/* =========================================================
   PET SEARCH
========================================================= */

petSearch?.addEventListener(
    "input",
    renderPets
);



/* =========================================================
   PETS
========================================================= */

function renderPetsLegacy() {

    if (!petsList) {

        return;
    }


    const query =
        petSearch
            ?.value
            .trim()
            .toLowerCase()
        ||
        "";



    const visible =
        pets.filter(
            pet => {

                if (!query) {

                    return true;
                }


                return [

                    pet.name,
                    pet.breed,
                    pet.ownerName,
                    pet.ownerEmail

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase()
                    .includes(query);
            }
        );



    petsList.innerHTML =
        "";



    if (
        !visible.length
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



    visible.forEach(
        pet => {

            const article =
                document.createElement(
                    "article"
                );


            article.className =
                "admin-pet-directory-card";


            article.innerHTML = `
                <div class="admin-pet-directory-top">

                    <div class="admin-pet-avatar">
                        ♢
                    </div>


                    <div>

                        <strong>
                            ${escapeHtml(
                pet.name
            )}
                        </strong>

                        <span>
                            ${escapeHtml(
                formatDogInfo(
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
                pet.ownerName
                ||
                pet.ownerEmail
                ||
                "Onbekend"
            )}
                    </strong>

                </div>


                <div class="admin-pet-directory-footer">

                    ${pet.reservations.length
                }
                    reservatie${pet.reservations.length === 1
                    ? ""
                    : "s"
                }

                </div>
            `;


            petsList.appendChild(
                article
            );
        }
    );
}



/* =========================================================
   INITIALS
========================================================= */

function getInitials(name) {

    if (!name) {

        return "K";
    }


    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(
            part =>
                part[0]
                    ?.toUpperCase()
                ||
                ""
        )
        .join("")
        ||
        "K";
}



/* =========================================================
   CALENDAR — AVAILABILITY STATUS
========================================================= */

function getAvailabilityStatus(
    dateString
) {

    return (
        availability[
            dateString
        ]?.status
        ||
        "available"
    );
}



/* =========================================================
   MINI CALENDAR
========================================================= */

function renderMiniCalendar() {

    if (
        !calendarGrid
        ||
        !calendarTitle
    ) {

        return;
    }


    const year =
        displayedMonth.getFullYear();


    const month =
        displayedMonth.getMonth();



    let monthTitle =
        new Intl.DateTimeFormat(
            "nl-BE",
            {
                month:
                    "long",

                year:
                    "numeric"
            }
        ).format(
            displayedMonth
        );


    monthTitle =
        monthTitle.charAt(0).toUpperCase()
        +
        monthTitle.slice(1);


    calendarTitle.textContent =
        monthTitle;


    calendarGrid.innerHTML =
        "";



    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    const emptyCells =
        (
            firstDay + 6
        )
        %
        7;



    for (
        let i = 0;
        i < emptyCells;
        i++
    ) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "admin-calendar-empty";


        calendarGrid.appendChild(
            empty
        );
    }



    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();



    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const dateString =
            createDateString(
                year,
                month,
                day
            );


        const status =
            getAvailabilityStatus(
                dateString
            );


        const dayReservations =
            getReservationsForDate(
                dateString
            );


        const acceptedCount =
            dayReservations.filter(
                reservation =>
                    reservation.status ===
                    "accepted"
            ).length;


        const pendingCount =
            dayReservations.filter(
                reservation =>
                    reservation.status ===
                    "pending"
            ).length;



        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.className =
            `admin-calendar-day ${status}`;


        if (
            dateString ===
            selectedDate
        ) {

            button.classList.add(
                "selected"
            );
        }


        if (
            dateString ===
            dateToString(
                new Date()
            )
        ) {

            button.classList.add(
                "today"
            );
        }



        button.innerHTML = `
            <span class="admin-calendar-day-number">
                ${day}
            </span>
        `;



        if (
            acceptedCount
        ) {

            const badge =
                document.createElement(
                    "span"
                );


            badge.className =
                "admin-calendar-booking-count";


            badge.textContent =
                acceptedCount;


            button.appendChild(
                badge
            );
        }



        if (
            pendingCount
        ) {

            const badge =
                document.createElement(
                    "span"
                );


            badge.className =
                "admin-calendar-pending-count";


            badge.textContent =
                pendingCount;


            button.appendChild(
                badge
            );
        }



        button.addEventListener(
            "click",
            () => {

                selectCalendarDate(
                    dateString
                );
            }
        );


        calendarGrid.appendChild(
            button
        );
    }
}



/* =========================================================
   DATE SELECT
========================================================= */

function selectCalendarDate(
    dateString
) {

    selectedDate =
        dateString;


    syncAvailabilityControls();


    renderMiniCalendar();

    renderCalendarWorkspace();
}



/* =========================================================
   PREVIOUS MONTH
========================================================= */

calendarPrevious?.addEventListener(
    "click",
    async () => {

        displayedMonth =
            new Date(
                displayedMonth.getFullYear(),
                displayedMonth.getMonth() - 1,
                1
            );


        await loadAvailability();


        renderMiniCalendar();


        if (
            calendarMode ===
            "month"
        ) {

            renderCalendarWorkspace();
        }
    }
);



/* =========================================================
   NEXT MONTH
========================================================= */

calendarNext?.addEventListener(
    "click",
    async () => {

        displayedMonth =
            new Date(
                displayedMonth.getFullYear(),
                displayedMonth.getMonth() + 1,
                1
            );


        await loadAvailability();


        renderMiniCalendar();


        if (
            calendarMode ===
            "month"
        ) {

            renderCalendarWorkspace();
        }
    }
);



/* =========================================================
   TODAY
========================================================= */

calendarToday?.addEventListener(
    "click",
    async () => {

        const date =
            new Date();


        selectedDate =
            dateToString(
                date
            );


        displayedMonth =
            new Date(
                date.getFullYear(),
                date.getMonth(),
                1
            );


        calendarMode =
            "day";


        updateCalendarModeButtons();


        await loadAvailability();


        renderMiniCalendar();

        syncAvailabilityControls();

        renderCalendarWorkspace();
    }
);



/* =========================================================
   CALENDAR MODES
========================================================= */

calendarModeButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                calendarMode =
                    button.dataset
                        .calendarMode;


                updateCalendarModeButtons();

                renderCalendarWorkspace();
            }
        );
    }
);



function updateCalendarModeButtons() {

    calendarModeButtons.forEach(
        button => {

            button.classList.toggle(
                "active",

                button.dataset
                    .calendarMode ===
                calendarMode
            );
        }
    );
}



/* =========================================================
   CALENDAR WORKSPACE
========================================================= */

function renderCalendarWorkspace() {

    updateCalendarModeButtons();


    /*
        In week- en maandweergave krijgt de planning
        de volledige beschikbare breedte. De kleine
        kalender links is dan niet nodig.
    */

    calendarWorkspace?.classList.toggle(
        "wide-mode",
        calendarMode === "week"
        ||
        calendarMode === "month"
    );


    if (
        calendarMode ===
        "week"
    ) {

        renderWeekView();

        return;
    }


    if (
        calendarMode ===
        "month"
    ) {

        renderMonthView();

        return;
    }


    renderDayView();
}



/* =========================================================
   DAY VIEW
========================================================= */

function renderDayView() {

    selectedDateTitle.textContent =
        formatLongDate(
            selectedDate
        );


    dayPlanning.hidden =
        false;


    daySummary.hidden =
        false;


    if (
        dayHours
    ) {

        dayHours.hidden =
            false;
    }



    const dayReservations =
        getReservationsForDate(
            selectedDate
        )
            .filter(
                reservation =>

                    reservation.status ===
                    "accepted"

                    ||

                    reservation.status ===
                    "pending"
            );



    const confirmed =
        dayReservations.filter(
            reservation =>
                reservation.status ===
                "accepted"
        );


    const pending =
        dayReservations.filter(
            reservation =>
                reservation.status ===
                "pending"
        );



    dayConfirmedCount.textContent =
        confirmed.length;


    dayPendingCount.textContent =
        pending.length;


    renderDayHourAxis();


    renderDayBookings(
        dayReservations
    );
}



/* =========================================================
   DAY HOURS
========================================================= */

function renderDayHourAxis() {

    if (!dayHours) {

        return;
    }


    const settings =
        getSettings();


    const opening =
        timeToMinutes(
            settings.openingTime
        )
        ??
        480;


    const closing =
        timeToMinutes(
            settings.closingTime
        )
        ??
        1080;


    dayHours.innerHTML =
        "";


    let current =
        opening;


    while (
        current <=
        closing
    ) {

        const span =
            document.createElement(
                "span"
            );


        span.textContent =
            minutesToTime(
                current
            );


        dayHours.appendChild(
            span
        );


        current +=
            60;
    }



    if (
        (
            closing -
            opening
        )
        %
        60 !==
        0
    ) {

        const span =
            document.createElement(
                "span"
            );


        span.textContent =
            minutesToTime(
                closing
            );


        dayHours.appendChild(
            span
        );
    }
}



/* =========================================================
   DAY BOOKING ITEMS
========================================================= */

function prepareDayItems(
    dayReservations
) {

    const settings =
        getSettings();


    const opening =
        timeToMinutes(
            settings.openingTime
        )
        ??
        480;


    const closing =
        timeToMinutes(
            settings.closingTime
        )
        ??
        1080;



    return dayReservations
        .map(
            reservation => {

                const times =
                    getReservationTimesForDay(
                        reservation,
                        selectedDate
                    );


                let start =
                    timeToMinutes(
                        times.start
                    )
                    ??
                    opening;


                let end =
                    timeToMinutes(
                        times.end
                    )
                    ??
                    closing;


                start =
                    Math.max(
                        opening,
                        start
                    );


                end =
                    Math.min(
                        closing,
                        end
                    );


                if (
                    end <= start
                ) {

                    end =
                        Math.min(
                            closing,
                            start + 30
                        );
                }


                return {

                    reservation,
                    times,
                    start,
                    end,
                    lane:
                        0,

                    laneCount:
                        1
                };
            }
        )
        .sort(
            (
                a,
                b
            ) => {

                if (
                    a.start !==
                    b.start
                ) {

                    return (
                        a.start -
                        b.start
                    );
                }


                return (
                    b.end -
                    a.end
                );
            }
        );
}



/* =========================================================
   OVERLAP LANES
========================================================= */

function assignOverlapLanes(
    items
) {

    let cluster =
        [];


    let clusterEnd =
        -Infinity;



    function finishCluster() {

        if (
            !cluster.length
        ) {

            return;
        }


        assignClusterLanes(
            cluster
        );


        cluster =
            [];


        clusterEnd =
            -Infinity;
    }



    items.forEach(
        item => {

            if (
                cluster.length
                &&
                item.start >=
                clusterEnd
            ) {

                finishCluster();
            }


            cluster.push(
                item
            );


            clusterEnd =
                Math.max(
                    clusterEnd,
                    item.end
                );
        }
    );


    finishCluster();


    return items;
}



function assignClusterLanes(
    cluster
) {

    const laneEnds =
        [];


    cluster.forEach(
        item => {

            let lane =
                laneEnds.findIndex(
                    end =>
                        end <=
                        item.start
                );


            if (
                lane ===
                -1
            ) {

                lane =
                    laneEnds.length;


                laneEnds.push(
                    item.end
                );

            } else {

                laneEnds[
                    lane
                ] =
                    item.end;
            }


            item.lane =
                lane;
        }
    );


    const laneCount =
        Math.max(
            laneEnds.length,
            1
        );


    cluster.forEach(
        item => {

            item.laneCount =
                laneCount;
        }
    );
}



/* =========================================================
   DAY BOOKING RENDER
========================================================= */

function renderDayBookings(
    dayReservations
) {

    if (!dayBookings) {

        return;
    }


    const settings =
        getSettings();


    const opening =
        timeToMinutes(
            settings.openingTime
        )
        ??
        480;


    const closing =
        timeToMinutes(
            settings.closingTime
        )
        ??
        1080;


    const totalMinutes =
        Math.max(
            closing -
            opening,
            60
        );


    const hourCount =
        totalMinutes /
        60;


    const canvasHeight =
        Math.max(
            650,
            hourCount * 82
        );



    dayBookings.innerHTML =
        "";


    dayBookings.removeAttribute(
        "style"
    );


    dayBookings.style.position =
        "relative";


    dayBookings.style.height =
        `${canvasHeight}px`;


    dayBookings.style.minHeight =
        `${canvasHeight}px`;



    /*
        Horizontale uurlijnen.
    */

    const hourHeight =
        canvasHeight /
        hourCount;


    dayBookings.style.backgroundImage =
        `repeating-linear-gradient(
            to bottom,
            transparent,
            transparent ${hourHeight - 1}px,
            #ececec ${hourHeight - 1}px,
            #ececec ${hourHeight}px
        )`;



    if (
        !dayReservations.length
    ) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "admin-agenda-empty";


        empty.style.position =
            "absolute";


        empty.style.top =
            "28px";


        empty.style.left =
            "25px";


        empty.style.right =
            "25px";


        empty.innerHTML = `
            <strong>
                Geen reservaties
            </strong>

            <span>
                Er staan nog geen honden gepland voor deze dag.
            </span>
        `;


        dayBookings.appendChild(
            empty
        );


        return;
    }



    const items =
        assignOverlapLanes(
            prepareDayItems(
                dayReservations
            )
        );



    items.forEach(
        item => {

            const top =
                (
                    (
                        item.start -
                        opening
                    )
                    /
                    totalMinutes
                )
                *
                100;


            const height =
                (
                    (
                        item.end -
                        item.start
                    )
                    /
                    totalMinutes
                )
                *
                100;


            const columnWidth =
                100 /
                item.laneCount;


            const left =
                columnWidth *
                item.lane;



            const card =
                document.createElement(
                    "button"
                );


            card.type =
                "button";


            const reservation =
                item.reservation;


            card.className =
                [
                    "admin-agenda-booking",

                    reservation.status ===
                        "pending"
                        ? "pending"
                        : "confirmed",

                    isBoarding(
                        reservation
                    )
                        ? "overnight"
                        : "daycare"

                ].join(" ");



            card.style.position =
                "absolute";


            card.style.top =
                `calc(${top}% + 4px)`;


            card.style.height =
                `calc(${Math.max(height, 4)}% - 8px)`;


            card.style.left =
                `calc(${left}% + 6px)`;


            card.style.width =
                `calc(${columnWidth}% - 12px)`;


            card.style.minHeight =
                "48px";


            card.style.zIndex =
                "2";



            card.innerHTML = `
                <div class="admin-agenda-booking-header">

                    <strong>
                        ${escapeHtml(
                reservation.dog
                    ?.name
                ||
                "Hond"
            )}
                    </strong>

                    <span>
                        ${reservation.status ===
                    "pending"
                    ? "Nieuw"
                    : "Bevestigd"
                }
                    </span>

                </div>


                <div class="admin-agenda-booking-client">

                    ${escapeHtml(
                    reservation.customer
                        ?.name
                    ||
                    "Onbekende klant"
                )}

                </div>


                <div class="admin-agenda-booking-time">

                    ${escapeHtml(
                    item.times.start
                )}

                    –

                    ${escapeHtml(
                    item.times.end
                )}

                </div>


                <div class="admin-agenda-booking-service">

                    ${escapeHtml(
                    formatBookingType(
                        reservation
                    )
                )}

                </div>
            `;


            card.addEventListener(
                "click",
                async () => {

                    await openReservation(
                        reservation.id
                    );
                }
            );


            dayBookings.appendChild(
                card
            );
        }
    );
}



/* =========================================================
   WEEK VIEW
========================================================= */

function renderWeekView() {

    const weekStart =
        startOfWeek(
            selectedDate
        );


    const weekDays =
        [];


    for (
        let i = 0;
        i < 7;
        i++
    ) {

        weekDays.push(
            addDays(
                weekStart,
                i
            )
        );
    }



    selectedDateTitle.textContent =
        `${formatShortDate(
            weekDays[0]
        )} – ${formatShortDate(
            weekDays[6]
        )}`;


    daySummary.hidden =
        true;


    dayPlanning.hidden =
        false;


    if (
        dayHours
    ) {

        dayHours.hidden =
            true;
    }


    dayBookings.innerHTML =
        "";


    dayBookings.removeAttribute(
        "style"
    );


    dayBookings.style.display =
        "grid";


    dayBookings.style.gridTemplateColumns =
        "repeat(7, minmax(0, 1fr))";


    dayBookings.style.gap =
        "6px";


    dayBookings.style.width =
        "100%";


    dayBookings.style.minWidth =
        "0";


    dayBookings.style.height =
        "auto";


    dayBookings.style.overflowX =
        "hidden";



    weekDays.forEach(
        dateString => {

            const column =
                document.createElement(
                    "section"
                );


            column.className =
                "admin-week-column";


            const dateReservations =
                getReservationsForDate(
                    dateString
                )
                    .filter(
                        reservation =>

                            reservation.status ===
                            "accepted"

                            ||

                            reservation.status ===
                            "pending"
                    )
                    .sort(
                        (
                            a,
                            b
                        ) =>

                            getReservationTimesForDay(
                                a,
                                dateString
                            )
                                .start
                                .localeCompare(
                                    getReservationTimesForDay(
                                        b,
                                        dateString
                                    ).start
                                )
                    );



            column.innerHTML = `
                <div class="admin-week-column-header">

                    <strong>
                        ${escapeHtml(
                formatShortDate(
                    dateString
                )
            )}
                    </strong>

                    <span>
                        ${dateReservations.length
                }
                    </span>

                </div>
            `;



            if (
                !dateReservations.length
            ) {

                const empty =
                    document.createElement(
                        "div"
                    );


                empty.className =
                    "admin-week-empty";


                empty.textContent =
                    "Geen reservaties";


                column.appendChild(
                    empty
                );
            }



            dateReservations.forEach(
                reservation => {

                    const times =
                        getReservationTimesForDay(
                            reservation,
                            dateString
                        );


                    const button =
                        document.createElement(
                            "button"
                        );


                    button.type =
                        "button";


                    button.className =
                        `admin-week-booking ${reservation.status}`;


                    button.innerHTML = `
                        <strong>
                            ${escapeHtml(
                        reservation.dog
                            ?.name
                        ||
                        "Hond"
                    )}
                        </strong>

                        <span>
                            ${escapeHtml(
                        times.start
                    )}
                            –
                            ${escapeHtml(
                        times.end
                    )}
                        </span>

                        <small>
                            ${escapeHtml(
                        reservation.customer
                            ?.name
                        ||
                        ""
                    )}
                        </small>
                    `;


                    button.addEventListener(
                        "click",
                        async () => {

                            await openReservation(
                                reservation.id
                            );
                        }
                    );


                    column.appendChild(
                        button
                    );
                }
            );



            column.addEventListener(
                "dblclick",
                () => {

                    selectedDate =
                        dateString;


                    calendarMode =
                        "day";


                    updateCalendarModeButtons();

                    renderMiniCalendar();

                    renderDayView();
                }
            );


            dayBookings.appendChild(
                column
            );
        }
    );
}



/* =========================================================
   MONTH VIEW
========================================================= */

function renderMonthView() {

    const year =
        displayedMonth
            .getFullYear();


    const month =
        displayedMonth
            .getMonth();



    let title =
        new Intl.DateTimeFormat(
            "nl-BE",
            {
                month:
                    "long",

                year:
                    "numeric"
            }
        ).format(
            displayedMonth
        );


    title =
        title.charAt(0).toUpperCase()
        +
        title.slice(1);


    selectedDateTitle.textContent =
        title;


    daySummary.hidden =
        true;


    dayPlanning.hidden =
        false;


    if (
        dayHours
    ) {

        dayHours.hidden =
            true;
    }



    dayBookings.innerHTML =
        "";


    dayBookings.removeAttribute(
        "style"
    );


    dayBookings.style.display =
        "grid";


    dayBookings.style.gridTemplateColumns =
        "repeat(7, minmax(0, 1fr))";


    dayBookings.style.gap =
        "4px";


    dayBookings.style.width =
        "100%";


    dayBookings.style.minWidth =
        "0";


    dayBookings.style.height =
        "auto";


    dayBookings.style.overflowX =
        "hidden";


    [
        "Ma",
        "Di",
        "Wo",
        "Do",
        "Vr",
        "Za",
        "Zo"
    ].forEach(
        label => {

            const weekday =
                document.createElement(
                    "div"
                );


            weekday.className =
                "admin-month-weekday";


            weekday.textContent =
                label;


            dayBookings.appendChild(
                weekday
            );
        }
    );



    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    const emptyCount =
        (
            firstDay + 6
        )
        %
        7;



    for (
        let i = 0;
        i < emptyCount;
        i++
    ) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "admin-month-empty";


        dayBookings.appendChild(
            empty
        );
    }



    const days =
        new Date(
            year,
            month + 1,
            0
        ).getDate();



    for (
        let day = 1;
        day <= days;
        day++
    ) {

        const dateString =
            createDateString(
                year,
                month,
                day
            );


        const dateReservations =
            getReservationsForDate(
                dateString
            );


        const accepted =
            dateReservations.filter(
                reservation =>
                    reservation.status ===
                    "accepted"
            );


        const pending =
            dateReservations.filter(
                reservation =>
                    reservation.status ===
                    "pending"
            );


        const status =
            getAvailabilityStatus(
                dateString
            );


        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.className =
            `admin-month-day ${status}`;


        button.innerHTML = `
            <div class="admin-month-day-number">
                ${day}
            </div>


            <div class="admin-month-day-info">

                ${accepted.length
                ? `
                            <span class="confirmed">
                                ${accepted.length} bevestigd
                            </span>
                        `
                : ""
            }

                ${pending.length
                ? `
                            <span class="pending">
                                ${pending.length} nieuw
                            </span>
                        `
                : ""
            }

            </div>
        `;


        button.addEventListener(
            "click",
            () => {

                selectedDate =
                    dateString;


                calendarMode =
                    "day";


                updateCalendarModeButtons();

                renderMiniCalendar();

                syncAvailabilityControls();

                renderDayView();
            }
        );


        dayBookings.appendChild(
            button
        );
    }
}



/* =========================================================
   AVAILABILITY CONTROLS SYNC
========================================================= */

function syncAvailabilityControls() {

    const status =
        getAvailabilityStatus(
            selectedDate
        );


    availabilityStatusInputs.forEach(
        input => {

            input.checked =
                input.value ===
                status;
        }
    );


    if (
        saveAvailabilityButton
    ) {

        saveAvailabilityButton.disabled =
            false;
    }


    if (
        availabilityMessage
    ) {

        availabilityMessage.textContent =
            "";
    }
}



/* =========================================================
   AVAILABILITY SAVE
========================================================= */

saveAvailabilityButton?.addEventListener(
    "click",
    async () => {

        const selected =
            availabilityStatusInputs.find(
                input =>
                    input.checked
            );


        if (!selected) {

            showToast(
                "Kies eerst een beschikbaarheidsstatus.",
                "error"
            );


            return;
        }



        saveAvailabilityButton.disabled =
            true;


        const oldText =
            saveAvailabilityButton.textContent;


        saveAvailabilityButton.textContent =
            "Opslaan...";



        try {

            await saveAvailability(
                selectedDate,
                selected.value
            );



            if (
                selected.value ===
                "available"
            ) {

                delete availability[
                    selectedDate
                ];

            } else {

                availability[
                    selectedDate
                ] = {

                    date:
                        selectedDate,

                    status:
                        selected.value
                };
            }



            renderMiniCalendar();

            renderCalendarWorkspace();


            availabilityMessage.textContent =
                "Opgeslagen";


            showToast(
                "Beschikbaarheid aangepast.",
                "success"
            );


        } catch (error) {

            console.error(
                "Availability fout:",
                error
            );


            availabilityMessage.textContent =
                "Opslaan mislukt";


            showToast(
                "Beschikbaarheid kon niet worden opgeslagen.",
                "error"
            );


        } finally {

            saveAvailabilityButton.disabled =
                false;


            saveAvailabilityButton.textContent =
                oldText;
        }
    }
);



/* =========================================================
   SETTINGS TABS
========================================================= */

settingsNavigation.forEach(
    (
        button,
        index
    ) => {

        button.addEventListener(
            "click",
            () => {

                settingsNavigation.forEach(
                    other => {

                        other.classList.remove(
                            "active"
                        );
                    }
                );


                button.classList.add(
                    "active"
                );


                renderSettingsSection(
                    index
                );
            }
        );
    }
);



/* =========================================================
   SETTINGS RENDER
========================================================= */

function renderSettingsSection(
    index = 0
) {

    if (!settingsContent) {

        return;
    }


    const settings =
        getSettings();



    /* ---------------------------------------------------------
       CAPACITY
    --------------------------------------------------------- */

    if (
        index ===
        0
    ) {

        settingsContent.innerHTML = `
            <div class="admin-settings-heading">

                <span class="admin-panel-label">
                    Instellingen
                </span>

                <h2>
                    Opvang & capaciteit
                </h2>

                <p>
                    Stel de algemene capaciteit en openingsuren in.
                </p>

            </div>


            <div class="admin-settings-card">

                <div class="admin-setting-row">

                    <div>

                        <strong>
                            Maximale dagcapaciteit
                        </strong>

                        <span>
                            Maximum aantal honden tegelijk.
                        </span>

                    </div>


                    <div class="admin-setting-input">

                        <input
                            type="number"
                            id="setting-max-capacity"
                            min="1"
                            value="${settings.maxCapacity}"
                        >

                        <span>
                            honden
                        </span>

                    </div>

                </div>


                <div class="admin-setting-row">

                    <div>

                        <strong>
                            Beperkte beschikbaarheid vanaf
                        </strong>

                        <span>
                            Vanaf dit aantal is er nog weinig plaats.
                        </span>

                    </div>


                    <div class="admin-setting-input">

                        <input
                            type="number"
                            id="setting-limited-capacity"
                            min="1"
                            value="${settings.limitedCapacity}"
                        >

                        <span>
                            honden
                        </span>

                    </div>

                </div>


                <div class="admin-setting-row">

                    <div>

                        <strong>
                            Openingsuur
                        </strong>

                        <span>
                            Eerste mogelijke aankomst.
                        </span>

                    </div>


                    <input
                        type="time"
                        id="setting-opening-time"
                        value="${settings.openingTime}"
                    >

                </div>


                <div class="admin-setting-row">

                    <div>

                        <strong>
                            Sluitingsuur
                        </strong>

                        <span>
                            Laatste mogelijke ophaling.
                        </span>

                    </div>


                    <input
                        type="time"
                        id="setting-closing-time"
                        value="${settings.closingTime}"
                    >

                </div>

            </div>


            <div class="admin-settings-footer">

                <button
                    type="button"
                    class="admin-settings-save"
                    id="dynamic-save-settings"
                >
                    Opslaan
                </button>

            </div>
        `;



        byId(
            "dynamic-save-settings"
        )
            ?.addEventListener(
                "click",
                saveCapacitySettings
            );


        return;
    }



    /* ---------------------------------------------------------
       SERVICES
    --------------------------------------------------------- */

    if (
        index ===
        1
    ) {

        settingsContent.innerHTML = `
            <div class="admin-settings-heading">

                <span class="admin-panel-label">
                    Diensten
                </span>

                <h2>
                    Diensten & prijzen
                </h2>

                <p>
                    Basisprijzen voor de hondenopvang.
                </p>

            </div>


            <div class="admin-settings-card">

                <div class="admin-setting-row">

                    <div>

                        <strong>
                            Dagopvang
                        </strong>

                        <span>
                            Basisprijs per opvangdag.
                        </span>

                    </div>


                    <div class="admin-setting-input">

                        <input
                            type="number"
                            id="setting-daycare-price"
                            value="${settings.daycarePrice}"
                            min="0"
                        >

                        <span>
                            € / dag
                        </span>

                    </div>

                </div>


                <div class="admin-setting-row">

                    <div>

                        <strong>
                            Overnachting
                        </strong>

                        <span>
                            Basisprijs per nacht.
                        </span>

                    </div>


                    <div class="admin-setting-input">

                        <input
                            type="number"
                            id="setting-overnight-price"
                            value="${settings.overnightPrice}"
                            min="0"
                        >

                        <span>
                            € / nacht
                        </span>

                    </div>

                </div>

            </div>


            <div class="admin-settings-footer">

                <button
                    type="button"
                    id="dynamic-save-settings"
                    class="admin-settings-save"
                >
                    Opslaan
                </button>

            </div>
        `;


        byId(
            "dynamic-save-settings"
        )
            ?.addEventListener(
                "click",
                savePriceSettings
            );


        return;
    }



    /* ---------------------------------------------------------
       ONLINE BOOKING
    --------------------------------------------------------- */

    if (
        index ===
        2
    ) {

        settingsContent.innerHTML = `
            <div class="admin-settings-heading">

                <span class="admin-panel-label">
                    Online booking
                </span>

                <h2>
                    Online reserveren
                </h2>

                <p>
                    Bepaal of klanten online aanvragen kunnen indienen.
                </p>

            </div>


            <div class="admin-settings-card">

                <div class="admin-setting-row">

                    <div>

                        <strong>
                            Online reservaties
                        </strong>

                        <span>
                            Klanten kunnen via de website een aanvraag indienen.
                        </span>

                    </div>


                    <label>

                        <input
                            type="checkbox"
                            id="setting-online-booking"
                            ${settings.onlineBooking
                ? "checked"
                : ""
            }
                        >

                    </label>

                </div>

            </div>


            <div class="admin-settings-footer">

                <button
                    type="button"
                    id="dynamic-save-settings"
                    class="admin-settings-save"
                >
                    Opslaan
                </button>

            </div>
        `;


        byId(
            "dynamic-save-settings"
        )
            ?.addEventListener(
                "click",
                saveOnlineBookingSettings
            );


        return;
    }



    /* ---------------------------------------------------------
       NOTIFICATIONS
    --------------------------------------------------------- */

    settingsContent.innerHTML = `
        <div class="admin-settings-heading">

            <span class="admin-panel-label">
                Meldingen
            </span>

            <h2>
                Meldingen
            </h2>

            <p>
                Beheer e-mailmeldingen rond reservaties.
            </p>

        </div>


        <div class="admin-settings-card">

            <div class="admin-setting-row">

                <div>

                    <strong>
                        Reservatie-e-mails
                    </strong>

                    <span>
                        Verstuur e-mails bij statuswijzigingen.
                    </span>

                </div>


                <label>

                    <input
                        type="checkbox"
                        id="setting-email-notifications"
                        ${settings.emailNotifications
            ? "checked"
            : ""
        }
                    >

                </label>

            </div>

        </div>


        <div class="admin-settings-footer">

            <button
                type="button"
                id="dynamic-save-settings"
                class="admin-settings-save"
            >
                Opslaan
            </button>

        </div>
    `;


    byId(
        "dynamic-save-settings"
    )
        ?.addEventListener(
            "click",
            saveNotificationSettings
        );
}



/* =========================================================
   SETTINGS SAVE — CAPACITY
========================================================= */

function saveCapacitySettings() {

    const settings =
        getSettings();


    const maxCapacity =
        Number(
            byId(
                "setting-max-capacity"
            )?.value
        );


    const limitedCapacity =
        Number(
            byId(
                "setting-limited-capacity"
            )?.value
        );


    const openingTime =
        byId(
            "setting-opening-time"
        )?.value;


    const closingTime =
        byId(
            "setting-closing-time"
        )?.value;



    if (
        maxCapacity < 1
        ||
        limitedCapacity < 1
        ||
        limitedCapacity >
        maxCapacity
    ) {

        showToast(
            "Controleer de capaciteit.",
            "error"
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

        showToast(
            "Controleer de openingsuren.",
            "error"
        );


        return;
    }



    saveSettings(
        {

            ...settings,

            maxCapacity,
            limitedCapacity,
            openingTime,
            closingTime
        }
    );


    renderCalendarWorkspace();


    showToast(
        "Instellingen opgeslagen.",
        "success"
    );
}



/* =========================================================
   SETTINGS SAVE — PRICES
========================================================= */

function savePriceSettings() {

    const settings =
        getSettings();


    const daycarePrice =
        Number(
            byId(
                "setting-daycare-price"
            )?.value
        );


    const overnightPrice =
        Number(
            byId(
                "setting-overnight-price"
            )?.value
        );


    saveSettings(
        {

            ...settings,

            daycarePrice,
            overnightPrice
        }
    );


    showToast(
        "Prijzen opgeslagen.",
        "success"
    );
}



/* =========================================================
   SETTINGS SAVE — ONLINE
========================================================= */

function saveOnlineBookingSettings() {

    const settings =
        getSettings();


    saveSettings(
        {

            ...settings,

            onlineBooking:
                Boolean(
                    byId(
                        "setting-online-booking"
                    )?.checked
                )
        }
    );


    showToast(
        "Online booking-instellingen opgeslagen.",
        "success"
    );
}



/* =========================================================
   SETTINGS SAVE — NOTIFICATIONS
========================================================= */

function saveNotificationSettings() {

    const settings =
        getSettings();


    saveSettings(
        {

            ...settings,

            emailNotifications:
                Boolean(
                    byId(
                        "setting-email-notifications"
                    )?.checked
                )
        }
    );


    showToast(
        "Meldingsinstellingen opgeslagen.",
        "success"
    );
}



/* =========================================================
   INIT SETTINGS
========================================================= */

renderSettingsSection(0);

/* =========================================================
   =========================================================
   TECKELWEB ADMIN V5
   MANAGEMENT INSIGHTS / CLIENT & PET PROFILES / HISTORY
   =========================================================
   ========================================================= */


let selectedClientIdV5 =
    null;


let selectedPetIdV5 =
    null;


/* =========================================================
   MONEY + RESERVATION STATE HELPERS
========================================================= */

function getReservationAmount(
    reservation
) {

    const estimated =
        Number(
            reservation?.estimatedPrice
        );


    if (
        Number.isFinite(
            estimated
        )
    ) {

        return estimated;
    }


    const raw =
        String(
            reservation?.price
            ??
            ""
        );


    const cleaned =
        raw
            .replace(
                /[^0-9,.-]/g,
                ""
            )
            .replace(
                ",",
                "."
            );


    const parsed =
        Number(
            cleaned
        );


    return Number.isFinite(
        parsed
    )
        ? parsed
        : 0;
}



function formatCurrency(
    amount
) {

    return new Intl.NumberFormat(
        "nl-BE",
        {
            style:
                "currency",

            currency:
                "EUR",

            maximumFractionDigits:
                2
        }
    ).format(
        Number(amount) || 0
    );
}



function isPastAcceptedReservation(
    reservation
) {

    const finalDate =
        getReservationFinalDate(
            reservation
        );


    return (
        reservation?.status ===
            "accepted"
        &&
        Boolean(
            finalDate
        )
        &&
        finalDate <
            dateToString(
                new Date()
            )
    );
}



function isUpcomingAcceptedReservation(
    reservation
) {

    const finalDate =
        getReservationFinalDate(
            reservation
        );


    return (
        reservation?.status ===
            "accepted"
        &&
        Boolean(
            finalDate
        )
        &&
        finalDate >=
            dateToString(
                new Date()
            )
    );
}



function getReservationMonthKey(
    reservation
) {

    const finalDate =
        getReservationFinalDate(
            reservation
        );


    return finalDate
        ? finalDate.slice(
            0,
            7
        )
        : "";
}



function getCurrentMonthKey() {

    return dateToString(
        new Date()
    ).slice(
        0,
        7
    );
}



function getExactReservationDates(
    reservation
) {

    const exactDaycare =
        getExactDaycareDates(
            reservation
        );


    if (
        exactDaycare.length
    ) {

        return [
            ...exactDaycare
        ].sort();
    }


    const start =
        reservation?.booking
            ?.startDate;


    const end =
        reservation?.booking
            ?.endDate
        ||
        start;


    if (
        !start
    ) {

        return [];
    }


    if (
        !end
        ||
        end === start
    ) {

        return [
            start
        ];
    }


    const result =
        [];


    let cursor =
        start;


    let guard =
        0;


    while (
        cursor <= end
        &&
        guard < 370
    ) {

        result.push(
            cursor
        );


        cursor =
            addDays(
                cursor,
                1
            );


        guard +=
            1;
    }


    return result;
}



function getReservationSortDate(
    reservation
) {

    return (
        getReservationFinalDate(
            reservation
        )
        ||
        reservation?.booking
            ?.startDate
        ||
        ""
    );
}



/* =========================================================
   MANAGEMENT STATS
========================================================= */

function getAdminStatsV5() {

    const currentMonth =
        getCurrentMonthKey();


    const accepted =
        reservations.filter(
            reservation =>
                reservation.status ===
                "accepted"
        );


    const monthAccepted =
        accepted.filter(
            reservation =>
                getReservationMonthKey(
                    reservation
                ) ===
                currentMonth
        );


    const monthCompleted =
        monthAccepted.filter(
            isPastAcceptedReservation
        );


    const monthRevenue =
        monthAccepted.reduce(
            (
                sum,
                reservation
            ) =>
                sum
                +
                getReservationAmount(
                    reservation
                ),
            0
        );


    return {

        pending:
            reservations.filter(
                reservation =>
                    reservation.status ===
                    "pending"
            ).length,

        upcoming:
            reservations.filter(
                isUpcomingAcceptedReservation
            ).length,

        past:
            reservations.filter(
                isPastAcceptedReservation
            ).length,

        monthCompleted:
            monthCompleted.length,

        monthRevenue
    };
}



function renderManagementStatsV5() {

    const stats =
        getAdminStatsV5();


    const values = {

        "stat-month-revenue":
            formatCurrency(
                stats.monthRevenue
            ),

        "stat-upcoming-bookings":
            stats.upcoming,

        "stat-completed-month":
            stats.monthCompleted,

        "booking-stat-pending":
            stats.pending,

        "booking-stat-upcoming":
            stats.upcoming,

        "booking-stat-revenue":
            formatCurrency(
                stats.monthRevenue
            ),

        "booking-stat-past":
            stats.past
    };


    Object.entries(
        values
    )
        .forEach(
            (
                [
                    id,
                    value
                ]
            ) => {

                const element =
                    byId(
                        id
                    );


                if (
                    element
                ) {

                    element.textContent =
                        value;
                }
            }
        );
}



/* =========================================================
   REQUEST FILTERS V5
========================================================= */

function getVisibleRequests() {

    let result =
        reservations.filter(
            reservation =>
                reservation.isDeleted !==
                true
        );



    /*
        Oude, afgewerkte verblijven horen niet meer tussen
        de actieve online-booking workflow. Die staan onder
        Historiek.
    */

    if (
        requestFilter ===
        "upcoming"
    ) {

        result =
            result.filter(
                isUpcomingAcceptedReservation
            );

    } else if (
        requestFilter ===
        "all"
    ) {

        result =
            result.filter(
                reservation =>
                    !isPastAcceptedReservation(
                        reservation
                    )
            );

    } else {

        result =
            result.filter(
                reservation =>
                    reservation.status ===
                    requestFilter
            );


        if (
            requestFilter ===
            "accepted"
        ) {

            result =
                result.filter(
                    isUpcomingAcceptedReservation
                );
        }
    }



    const search =
        reservationSearch
            ?.value
            .trim()
            .toLowerCase()
        ||
        "";


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
                                ?.breed,

                            formatBookingType(
                                reservation
                            ),

                            formatReservationPeriod(
                                reservation
                            )

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



    return result.sort(
        (
            a,
            b
        ) => {

            const dateA =
                getReservationSortDate(
                    a
                );


            const dateB =
                getReservationSortDate(
                    b
                );


            if (
                requestFilter ===
                "pending"
            ) {

                return dateA.localeCompare(
                    dateB
                );
            }


            return dateA.localeCompare(
                dateB
            );
        }
    );
}



/* =========================================================
   REQUEST ROW V5
========================================================= */

function createRequestRow(
    reservation
) {

    const button =
        document.createElement(
            "button"
        );


    button.type =
        "button";


    button.id =
        `reservation-${reservation.id}`;


    const status =
        reservation.status
        ||
        "pending";


    button.className =
        `admin-request-item admin-request-table-row status-${status}`;


    if (
        reservation.id ===
        selectedReservationId
    ) {

        button.classList.add(
            "selected"
        );
    }


    const dogName =
        reservation.dog
            ?.name
        ||
        "Hond";


    const dogBreed =
        reservation.dog
            ?.breed
        ||
        "—";


    const customerName =
        reservation.customer
            ?.name
        ||
        "Onbekende klant";


    const customerContact =
        reservation.customer
            ?.phone
        ||
        reservation.customer
            ?.email
        ||
        "—";


    const type =
        formatBookingType(
            reservation
        );


    const period =
        formatReservationPeriod(
            reservation
        );


    const amount =
        getReservationAmount(
            reservation
        );


    button.innerHTML = `
        <span class="admin-request-cell dog">

            <strong>
                ${escapeHtml(
                    dogName
                )}
            </strong>

            <small>
                ${escapeHtml(
                    dogBreed
                )}
            </small>

        </span>


        <span class="admin-request-cell customer">

            <strong>
                ${escapeHtml(
                    customerName
                )}
            </strong>

            <small>
                ${escapeHtml(
                    customerContact
                )}
            </small>

        </span>


        <span class="admin-request-cell service">

            <span class="admin-service-pill">
                ${escapeHtml(
                    type
                )}
            </span>

        </span>


        <span class="admin-request-cell period">

            ${escapeHtml(
                period
            )}

        </span>


        <span class="admin-request-cell status">

            <span class="reservation-status ${status}">
                ${escapeHtml(
                    formatStatus(
                        status
                    )
                )}
            </span>

        </span>


        <span class="admin-request-cell price">

            <strong>
                ${formatCurrency(
                    amount
                )}
            </strong>

            <span class="admin-request-open-arrow">
                ›
            </span>

        </span>
    `;


    button.addEventListener(
        "click",
        () => {

            showRequestDetail(
                reservation.id
            );
        }
    );


    return button;
}



/* =========================================================
   CLIENTS V5
========================================================= */

function renderClients() {

    if (
        !clientsList
    ) {

        return;
    }


    const query =
        clientSearch
            ?.value
            .trim()
            .toLowerCase()
        ||
        "";


    const visible =
        clients.filter(
            client => {

                if (
                    !query
                ) {

                    return true;
                }


                return [

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
                    .toLowerCase()
                    .includes(
                        query
                    );
            }
        );


    clientsList.innerHTML =
        "";


    if (
        !visible.length
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



    visible.forEach(
        client => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "admin-directory-item admin-client-row";


            if (
                selectedClientIdV5 ===
                client.id
            ) {

                button.classList.add(
                    "selected"
                );
            }



            const past =
                client.reservations.filter(
                    isPastAcceptedReservation
                ).length;


            const upcoming =
                client.reservations.filter(
                    isUpcomingAcceptedReservation
                ).length;


            button.innerHTML = `
                <div class="admin-directory-avatar">

                    ${escapeHtml(
                        getInitials(
                            client.name
                        )
                    )}

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
                            "Geen e-mailadres"
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
                        hond${client.pets.length === 1
                            ? ""
                            : "en"
                        }
                    </span>

                    <strong>
                        ${upcoming} komend
                    </strong>

                    <small>
                        ${past} afgerond
                    </small>

                </div>

                <span class="admin-row-chevron">
                    ›
                </span>
            `;


            button.addEventListener(
                "click",
                () => {

                    showClientDetailV5(
                        client.id
                    );
                }
            );


            clientsList.appendChild(
                button
            );
        }
    );
}



function showClientDetailV5(
    clientId
) {

    const client =
        clients.find(
            item =>
                item.id ===
                clientId
        );


    if (
        !client
    ) {

        return;
    }


    selectedClientIdV5 =
        clientId;


    clientDetailDrawer?.classList.add(
        "open"
    );


    clientDetailBackdrop?.classList.add(
        "open"
    );


    renderClients();


    const empty =
        byId(
            "client-detail-empty"
        );


    const content =
        byId(
            "client-detail-content"
        );


    if (
        empty
    ) {

        empty.hidden =
            true;
    }


    if (
        content
    ) {

        content.hidden =
            false;
    }



    const sorted =
        [
            ...client.reservations
        ].sort(
            (
                a,
                b
            ) =>
                getReservationSortDate(
                    b
                ).localeCompare(
                    getReservationSortDate(
                        a
                    )
                )
        );


    const completed =
        sorted.filter(
            isCompletedReservationV7
        );


    const revenue =
        completed.reduce(
            (
                sum,
                reservation
            ) =>
                sum
                +
                getReservationAmount(
                    reservation
                ),
            0
        );


    const values = {

        "client-detail-name":
            client.name
            ||
            client.email
            ||
            "Onbekende klant",

        "client-detail-contact":
            [
                client.email,
                client.phone
            ]
                .filter(
                    Boolean
                )
                .join(
                    " · "
                )
            ||
            "Geen contactgegevens",

        "client-detail-total":
            client.reservations.length,

        "client-detail-upcoming":
            client.reservations.filter(
                isUpcomingAcceptedReservation
            ).length,

        "client-detail-past":
            client.reservations.filter(
                isCompletedReservationV7
            ).length,

        "client-detail-revenue":
            formatCurrency(
                revenue
            )
    };


    Object.entries(
        values
    ).forEach(
        (
            [
                id,
                value
            ]
        ) => {

            const element =
                byId(
                    id
                );


            if (
                element
            ) {

                element.textContent =
                    value;
            }
        }
    );



    const petTags =
        byId(
            "client-detail-pets"
        );


    if (
        petTags
    ) {

        petTags.innerHTML =
            client.pets.length
                ? client.pets
                    .map(
                        petName =>
                            `<span>♢ ${escapeHtml(
                                petName
                            )}</span>`
                    )
                    .join(
                        ""
                    )
                : `<span>Geen honden gevonden</span>`;
    }



    const list =
        byId(
            "client-detail-reservations"
        );


    if (
        list
    ) {

        list.innerHTML =
            "";


        if (
            !sorted.length
        ) {

            list.innerHTML = `
                <div class="admin-empty-state compact">
                    <strong>
                        Nog geen reservaties
                    </strong>
                </div>
            `;

            return;
        }


        sorted.forEach(
            reservation => {

                list.appendChild(
                    createEntityReservationRowV5(
                        reservation,
                        {
                            showCalendar:
                                true
                        }
                    )
                );
            }
        );
    }
}



/* =========================================================
   PETS V5
========================================================= */

function renderPets() {

    if (
        !petsList
    ) {

        return;
    }


    const query =
        petSearch
            ?.value
            .trim()
            .toLowerCase()
        ||
        "";


    const visible =
        pets.filter(
            pet => {

                if (
                    !query
                ) {

                    return true;
                }


                return [

                    pet.name,
                    pet.breed,
                    pet.ownerName,
                    pet.ownerEmail

                ]
                    .filter(
                        Boolean
                    )
                    .join(
                        " "
                    )
                    .toLowerCase()
                    .includes(
                        query
                    );
            }
        );


    petsList.innerHTML =
        "";


    if (
        !visible.length
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



    visible.forEach(
        pet => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "admin-pet-directory-card admin-pet-profile-button";


            if (
                selectedPetIdV5 ===
                pet.id
            ) {

                button.classList.add(
                    "selected"
                );
            }


            const upcoming =
                pet.reservations.filter(
                    isUpcomingAcceptedReservation
                );


            const nextReservation =
                [
                    ...upcoming
                ].sort(
                    (
                        a,
                        b
                    ) =>
                        getReservationSortDate(
                            a
                        ).localeCompare(
                            getReservationSortDate(
                                b
                            )
                        )
                )[0];


            button.innerHTML = `
                <div class="admin-pet-directory-top">

                    <div class="admin-pet-avatar">
                        ♢
                    </div>

                    <div>

                        <strong>
                            ${escapeHtml(
                                pet.name
                            )}
                        </strong>

                        <span>
                            ${escapeHtml(
                                formatDogInfo(
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
                            pet.ownerName
                            ||
                            pet.ownerEmail
                            ||
                            "Onbekend"
                        )}
                    </strong>

                </div>


                <div class="admin-pet-next-date">

                    <span>
                        Volgende verblijf
                    </span>

                    <strong>
                        ${nextReservation
                            ? escapeHtml(
                                formatReservationPeriod(
                                    nextReservation
                                )
                            )
                            : "Geen gepland verblijf"
                        }
                    </strong>

                </div>


                <div class="admin-pet-directory-footer">

                    <span>
                        ${pet.reservations.length}
                        reservatie${pet.reservations.length === 1
                            ? ""
                            : "s"
                        }
                    </span>

                    <strong>
                        Open profiel →
                    </strong>

                </div>
            `;


            button.addEventListener(
                "click",
                () => {

                    showPetDetailV5(
                        pet.id
                    );
                }
            );


            petsList.appendChild(
                button
            );
        }
    );
}



function showPetDetailV5(
    petId
) {

    const pet =
        pets.find(
            item =>
                item.id ===
                petId
        );


    if (
        !pet
    ) {

        return;
    }


    selectedPetIdV5 =
        petId;


    petDetailDrawer?.classList.add(
        "open"
    );


    petDetailBackdrop?.classList.add(
        "open"
    );


    renderPets();


    const empty =
        byId(
            "pet-detail-empty"
        );


    const content =
        byId(
            "pet-detail-content"
        );


    if (
        empty
    ) {

        empty.hidden =
            true;
    }


    if (
        content
    ) {

        content.hidden =
            false;
    }



    const values = {

        "pet-detail-name":
            pet.name,

        "pet-detail-info":
            formatDogInfo(
                pet
            ),

        "pet-detail-owner":
            pet.ownerName
            ||
            pet.ownerEmail
            ||
            "Onbekend",

        "pet-detail-owner-email":
            pet.ownerEmail
            ||
            "Geen e-mailadres"
    };


    Object.entries(
        values
    ).forEach(
        (
            [
                id,
                value
            ]
        ) => {

            const element =
                byId(
                    id
                );


            if (
                element
            ) {

                element.textContent =
                    value;
            }
        }
    );



    const list =
        byId(
            "pet-detail-reservations"
        );


    if (
        !list
    ) {

        return;
    }


    list.innerHTML =
        "";


    const sorted =
        [
            ...pet.reservations
        ].sort(
            (
                a,
                b
            ) =>
                getReservationSortDate(
                    b
                ).localeCompare(
                    getReservationSortDate(
                        a
                    )
                )
        );


    if (
        !sorted.length
    ) {

        list.innerHTML = `
            <div class="admin-empty-state compact">
                <strong>
                    Nog geen reservaties
                </strong>
            </div>
        `;


        return;
    }


    sorted.forEach(
        reservation => {

            list.appendChild(
                createEntityReservationRowV5(
                    reservation,
                    {
                        showDateChips:
                            true,

                        showCalendar:
                            true
                    }
                )
            );
        }
    );
}



/* =========================================================
   SHARED ENTITY RESERVATION ROW
========================================================= */

function createEntityReservationRowV5(
    reservation,
    options = {}
) {

    const article =
        document.createElement(
            "article"
        );


    article.className =
        "admin-entity-reservation-row";


    const status =
        reservation.status
        ||
        "pending";


    const dates =
        getExactReservationDates(
            reservation
        );


    article.innerHTML = `
        <div class="admin-entity-reservation-top">

            <div>

                <strong>
                    ${escapeHtml(
                        reservation.dog
                            ?.name
                        ||
                        "Hond"
                    )}
                </strong>

                <span>
                    ${escapeHtml(
                        formatBookingType(
                            reservation
                        )
                    )}
                    ·
                    ${escapeHtml(
                        formatReservationPeriod(
                            reservation
                        )
                    )}
                </span>

            </div>

            <span class="reservation-status ${status}">
                ${escapeHtml(
                    formatStatus(
                        status
                    )
                )}
            </span>

        </div>


        <div class="admin-entity-reservation-bottom">

            <strong>
                ${formatCurrency(
                    getReservationAmount(
                        reservation
                    )
                )}
            </strong>

            <button
                type="button"
                class="admin-open-request-button"
            >
                Open reservatie
            </button>

        </div>
    `;


    article
        .querySelector(
            ".admin-open-request-button"
        )
        ?.addEventListener(
            "click",
            async () => {

                await openReservation(
                    reservation.id
                );
            }
        );



    if (
        options.showDateChips
        &&
        dates.length
    ) {

        const dateStrip =
            document.createElement(
                "div"
            );


        dateStrip.className =
            "admin-date-chip-strip";


        dates.forEach(
            date => {

                const chip =
                    document.createElement(
                        "button"
                    );


                chip.type =
                    "button";


                chip.className =
                    "admin-date-chip";


                chip.textContent =
                    formatDate(
                        date,
                        {
                            year:
                                undefined
                        }
                    );


                chip.title =
                    "Open deze dag in kalender";


                chip.addEventListener(
                    "click",
                    async () => {

                        await openCalendarDateV5(
                            date
                        );
                    }
                );


                dateStrip.appendChild(
                    chip
                );
            }
        );


        article.appendChild(
            dateStrip
        );

    } else if (
        options.showCalendar
        &&
        dates[0]
    ) {

        const calendarButton =
            document.createElement(
                "button"
            );


        calendarButton.type =
            "button";


        calendarButton.className =
            "admin-calendar-jump-button";


        calendarButton.textContent =
            "Open in kalender";


        calendarButton.addEventListener(
            "click",
            async () => {

                await openCalendarDateV5(
                    dates[0]
                );
            }
        );


        article.appendChild(
            calendarButton
        );
    }


    return article;
}



/* =========================================================
   CALENDAR JUMP
========================================================= */

async function openCalendarDateV5(
    dateString
) {

    const date =
        parseDate(
            dateString
        );


    if (
        !date
    ) {

        return;
    }


    selectedDate =
        dateString;


    displayedMonth =
        new Date(
            date.getFullYear(),
            date.getMonth(),
            1
        );


    calendarMode =
        "day";


    await loadAvailability();


    await showView(
        "calendar"
    );


    syncAvailabilityControls();

    renderMiniCalendar();

    renderCalendarWorkspace();
}



/* =========================================================
   COMPLETION / DELETE HELPERS V7
========================================================= */

function isCompletedReservationV7(
    reservation
) {

    return (
        reservation?.isDeleted !==
            true
        &&
        reservation?.status ===
            "accepted"
        &&
        reservation?.completionStatus ===
            "completed"
    );
}



function needsCompletionConfirmationV7(
    reservation
) {

    const finalDate =
        getReservationFinalDate(
            reservation
        );


    return (
        reservation?.isDeleted !==
            true
        &&
        reservation?.status ===
            "accepted"
        &&
        reservation?.completionStatus !==
            "completed"
        &&
        Boolean(
            finalDate
        )
        &&
        finalDate <
            dateToString(
                new Date()
            )
    );
}



function getCompletedMonthKeyV7(
    reservation
) {

    return (
        reservation?.completedDate
        ||
        getReservationFinalDate(
            reservation
        )
        ||
        ""
    ).slice(
        0,
        7
    );
}



async function refreshAdminAfterLifecycleChangeV7() {

    await loadReservations();

    deriveDirectories();

    renderEverything();
}



async function confirmCompletedReservationV7(
    reservation
) {

    const finalDate =
        getReservationFinalDate(
            reservation
        );


    if (
        !finalDate
    ) {

        showToast(
            "Geen einddatum gevonden voor deze reservatie.",
            "error"
        );

        return;
    }


    if (
        !window.confirm(
            "Bevestigen dat dit verblijf effectief is afgerond? Het bedrag telt daarna mee in de omzet."
        )
    ) {

        return;
    }


    try {

        await confirmReservationCompleted(
            reservation.id,
            finalDate
        );


        await refreshAdminAfterLifecycleChangeV7();


        showToast(
            "Verblijf bevestigd en toegevoegd aan de historiek.",
            "success"
        );

    } catch (error) {

        console.error(
            "Afronden mislukt:",
            error
        );


        showToast(
            "Het verblijf kon niet worden bevestigd.",
            "error"
        );
    }
}



async function deletePastReservationV7(
    reservation
) {

    if (
        !window.confirm(
            "Deze reservatie naar de prullenbak verplaatsen? Ze wordt niet definitief verwijderd en kan later worden hersteld."
        )
    ) {

        return;
    }


    try {

        await softDeleteReservation(
            reservation.id
        );


        await refreshAdminAfterLifecycleChangeV7();


        showToast(
            "Reservatie naar de prullenbak verplaatst.",
            "success"
        );

    } catch (error) {

        console.error(
            "Verwijderen mislukt:",
            error
        );


        showToast(
            "De reservatie kon niet worden verwijderd.",
            "error"
        );
    }
}



async function restoreReservationV7(
    reservation
) {

    try {

        await restoreReservation(
            reservation.id
        );


        await refreshAdminAfterLifecycleChangeV7();


        showToast(
            "Reservatie hersteld.",
            "success"
        );

    } catch (error) {

        console.error(
            "Herstellen mislukt:",
            error
        );


        showToast(
            "De reservatie kon niet worden hersteld.",
            "error"
        );
    }
}



async function undoCompletionV7(
    reservation
) {

    if (
        !window.confirm(
            "Afronding terugdraaien? De reservatie verdwijnt dan uit de omzet en komt opnieuw bij te bevestigen verblijven."
        )
    ) {

        return;
    }


    try {

        await reopenCompletedReservation(
            reservation.id
        );


        await refreshAdminAfterLifecycleChangeV7();


        showToast(
            "Afronding teruggedraaid.",
            "success"
        );

    } catch (error) {

        console.error(
            "Terugdraaien mislukt:",
            error
        );


        showToast(
            "De afronding kon niet worden teruggedraaid.",
            "error"
        );
    }
}



/* =========================================================
   HISTORY
========================================================= */

function renderHistoryV5() {

    const input =
        byId(
            "history-month"
        );


    if (
        !input
    ) {

        return;
    }


    if (
        !input.value
    ) {

        input.value =
            getCurrentMonthKey();
    }


    const pendingCompletion =
        reservations
            .filter(
                needsCompletionConfirmationV7
            )
            .sort(
                (
                    a,
                    b
                ) =>
                    getReservationSortDate(
                        b
                    ).localeCompare(
                        getReservationSortDate(
                            a
                        )
                    )
            );


    const pendingCount =
        byId(
            "history-pending-count"
        );


    if (
        pendingCount
    ) {

        pendingCount.textContent =
            pendingCompletion.length;
    }


    const pendingList =
        byId(
            "history-pending-list"
        );


    if (
        pendingList
    ) {

        pendingList.innerHTML =
            "";


        if (
            !pendingCompletion.length
        ) {

            pendingList.innerHTML = `
                <div class="admin-empty-state compact">
                    <strong>
                        Geen voorbije verblijven te bevestigen
                    </strong>
                    <span>
                        Alles is bijgewerkt.
                    </span>
                </div>
            `;

        } else {

            pendingCompletion.forEach(
                reservation => {

                    const row =
                        document.createElement(
                            "article"
                        );


                    row.className =
                        "admin-completion-row";


                    row.innerHTML = `
                        <div class="admin-completion-dog">

                            <div class="admin-history-dog-icon">
                                ♢
                            </div>

                            <div>
                                <strong>
                                    ${escapeHtml(
                                        reservation.dog
                                            ?.name
                                        ||
                                        "Hond"
                                    )}
                                </strong>
                                <span>
                                    ${escapeHtml(
                                        formatReservationPeriod(
                                            reservation
                                        )
                                    )}
                                </span>
                            </div>

                        </div>

                        <div class="admin-completion-customer">
                            <strong>
                                ${escapeHtml(
                                    reservation.customer
                                        ?.name
                                    ||
                                    "Onbekende klant"
                                )}
                            </strong>
                            <span>
                                ${escapeHtml(
                                    reservation.customer
                                        ?.phone
                                    ||
                                    reservation.customer
                                        ?.email
                                    ||
                                    ""
                                )}
                            </span>
                        </div>

                        <strong class="admin-completion-price">
                            ${formatCurrency(
                                getReservationAmount(
                                    reservation
                                )
                            )}
                        </strong>

                        <div class="admin-completion-actions">

                            <button
                                type="button"
                                class="admin-completion-delete"
                            >
                                Verwijderen
                            </button>

                            <button
                                type="button"
                                class="admin-completion-confirm"
                            >
                                ✓ Verblijf afgerond
                            </button>

                        </div>
                    `;


                    row
                        .querySelector(
                            ".admin-completion-confirm"
                        )
                        ?.addEventListener(
                            "click",
                            () =>
                                confirmCompletedReservationV7(
                                    reservation
                                )
                        );


                    row
                        .querySelector(
                            ".admin-completion-delete"
                        )
                        ?.addEventListener(
                            "click",
                            () =>
                                deletePastReservationV7(
                                    reservation
                                )
                        );


                    pendingList.appendChild(
                        row
                    );
                }
            );
        }
    }



    const monthKey =
        input.value;


    const monthReservations =
        reservations
            .filter(
                reservation =>
                    isCompletedReservationV7(
                        reservation
                    )
                    &&
                    getCompletedMonthKeyV7(
                        reservation
                    ) ===
                    monthKey
            )
            .sort(
                (
                    a,
                    b
                ) =>
                    getReservationSortDate(
                        b
                    ).localeCompare(
                        getReservationSortDate(
                            a
                        )
                    )
            );


    const revenue =
        monthReservations.reduce(
            (
                sum,
                reservation
            ) =>
                sum
                +
                getReservationAmount(
                    reservation
                ),
            0
        );


    const clientsSet =
        new Set(
            monthReservations
                .map(
                    reservation =>
                        reservation.customer
                            ?.uid
                        ||
                        reservation.customer
                            ?.email
                        ||
                        reservation.customer
                            ?.name
                )
                .filter(
                    Boolean
                )
        );


    const values = {

        "history-stat-revenue":
            formatCurrency(
                revenue
            ),

        "history-stat-reservations":
            monthReservations.length,

        "history-stat-clients":
            clientsSet.size
    };


    Object.entries(
        values
    ).forEach(
        (
            [
                id,
                value
            ]
        ) => {

            const element =
                byId(
                    id
                );


            if (
                element
            ) {

                element.textContent =
                    value;
            }
        }
    );



    const list =
        byId(
            "history-list"
        );


    if (
        list
    ) {

        list.innerHTML =
            "";


        if (
            !monthReservations.length
        ) {

            list.innerHTML = `
                <div class="admin-empty-state">
                    <strong>
                        Geen bevestigde verblijven in deze maand
                    </strong>
                    <span>
                        Een verblijf verschijnt hier pas nadat u het als afgerond bevestigt.
                    </span>
                </div>
            `;

        } else {

            monthReservations.forEach(
                reservation => {

                    const row =
                        document.createElement(
                            "article"
                        );


                    row.className =
                        "admin-history-row admin-history-row-v7";


                    row.innerHTML = `
                        <div class="admin-history-stay">

                            <div class="admin-history-dog-icon">
                                ♢
                            </div>

                            <div>
                                <strong>
                                    ${escapeHtml(
                                        reservation.dog
                                            ?.name
                                        ||
                                        "Hond"
                                    )}
                                </strong>
                                <span>
                                    ${escapeHtml(
                                        formatBookingType(
                                            reservation
                                        )
                                    )}
                                    ·
                                    ${escapeHtml(
                                        formatReservationPeriod(
                                            reservation
                                        )
                                    )}
                                </span>
                            </div>

                        </div>

                        <div class="admin-history-client">
                            <strong>
                                ${escapeHtml(
                                    reservation.customer
                                        ?.name
                                    ||
                                    "Onbekende klant"
                                )}
                            </strong>
                            <span>
                                ${escapeHtml(
                                    reservation.customer
                                        ?.email
                                    ||
                                    ""
                                )}
                            </span>
                        </div>

                        <strong class="admin-history-price">
                            ${formatCurrency(
                                getReservationAmount(
                                    reservation
                                )
                            )}
                        </strong>

                        <button
                            type="button"
                            class="admin-history-undo"
                        >
                            Terugzetten
                        </button>
                    `;


                    row
                        .querySelector(
                            ".admin-history-undo"
                        )
                        ?.addEventListener(
                            "click",
                            () =>
                                undoCompletionV7(
                                    reservation
                                )
                        );


                    list.appendChild(
                        row
                    );
                }
            );
        }
    }



    const deletedReservations =
        reservations
            .filter(
                reservation =>
                    reservation.isDeleted ===
                    true
            )
            .sort(
                (
                    a,
                    b
                ) => {

                    const timeA =
                        a.deletedAt
                            ?.toMillis?.()
                        ||
                        0;


                    const timeB =
                        b.deletedAt
                            ?.toMillis?.()
                        ||
                        0;


                    return timeB - timeA;
                }
            );


    const trashCount =
        byId(
            "trash-count"
        );


    if (
        trashCount
    ) {

        trashCount.textContent =
            deletedReservations.length;
    }


    const trashList =
        byId(
            "trash-list"
        );


    if (
        trashList
    ) {

        trashList.innerHTML =
            "";


        if (
            !deletedReservations.length
        ) {

            trashList.innerHTML = `
                <div class="admin-empty-state compact">
                    <strong>
                        Prullenbak is leeg
                    </strong>
                </div>
            `;

        } else {

            deletedReservations.forEach(
                reservation => {

                    const row =
                        document.createElement(
                            "article"
                        );


                    row.className =
                        "admin-trash-row";


                    row.innerHTML = `
                        <div>

                            <strong>
                                ${escapeHtml(
                                    reservation.dog
                                        ?.name
                                    ||
                                    "Hond"
                                )}
                            </strong>

                            <span>
                                ${escapeHtml(
                                    reservation.customer
                                        ?.name
                                    ||
                                    "Onbekende klant"
                                )}
                                ·
                                ${escapeHtml(
                                    formatReservationPeriod(
                                        reservation
                                    )
                                )}
                            </span>

                        </div>

                        <button
                            type="button"
                            class="admin-trash-restore"
                        >
                            ↶ Herstellen
                        </button>
                    `;


                    row
                        .querySelector(
                            ".admin-trash-restore"
                        )
                        ?.addEventListener(
                            "click",
                            () =>
                                restoreReservationV7(
                                    reservation
                                )
                        );


                    trashList.appendChild(
                        row
                    );
                }
            );
        }
    }
}



/* =========================================================
   RENDER EVERYTHING V5
========================================================= */

function renderEverything() {

    renderOverview();

    renderRequestCounters();

    renderRequests();

    renderMiniCalendar();

    renderCalendarWorkspace();

    renderClients();

    renderPets();

    renderTasksV9();

    renderManagementStatsV5();

    renderHistoryV5();
}



/* =========================================================
   V5 INITIAL EVENT HOOKS
========================================================= */

byId(
    "history-month"
)
    ?.addEventListener(
        "change",
        renderHistoryV5
    );



/* =========================================================
   REQUEST DETAIL DRAWER CONTROLS
========================================================= */

requestDetailClose?.addEventListener(
    "click",
    clearRequestDetail
);


requestDetailBackdrop?.addEventListener(
    "click",
    clearRequestDetail
);


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Escape"
            &&
            requestDetailPanel?.classList.contains(
                "open"
            )
        ) {

            clearRequestDetail();
        }
    }
);



/* =========================================================
   CLIENT / PET DETAIL DRAWERS V7
========================================================= */

function closeClientDetailV7() {

    selectedClientIdV5 =
        null;


    clientDetailDrawer?.classList.remove(
        "open"
    );


    clientDetailBackdrop?.classList.remove(
        "open"
    );


    renderClients();
}



function closePetDetailV7() {

    selectedPetIdV5 =
        null;


    petDetailDrawer?.classList.remove(
        "open"
    );


    petDetailBackdrop?.classList.remove(
        "open"
    );


    renderPets();
}



clientDetailClose?.addEventListener(
    "click",
    closeClientDetailV7
);


clientDetailBackdrop?.addEventListener(
    "click",
    closeClientDetailV7
);


petDetailClose?.addEventListener(
    "click",
    closePetDetailV7
);


petDetailBackdrop?.addEventListener(
    "click",
    closePetDetailV7
);


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !==
            "Escape"
        ) {

            return;
        }


        if (
            clientDetailDrawer?.classList.contains(
                "open"
            )
        ) {

            closeClientDetailV7();
        }


        if (
            petDetailDrawer?.classList.contains(
                "open"
            )
        ) {

            closePetDetailV7();
        }
    }
);



/* =========================================================
   ADMIN SIDEBAR COLLAPSE
========================================================= */

const ADMIN_SIDEBAR_KEY =
    "teckelweb-admin-sidebar-collapsed";


function setAdminSidebarCollapsed(
    collapsed
) {

    if (
        !adminDashboard
    ) {

        return;
    }


    adminDashboard.classList.toggle(
        "sidebar-collapsed",
        collapsed
    );


    if (
        sidebarToggleButton
    ) {

        sidebarToggleButton.textContent =
            collapsed
                ? "›"
                : "‹";


        sidebarToggleButton.setAttribute(
            "aria-expanded",
            String(
                !collapsed
            )
        );


        sidebarToggleButton.setAttribute(
            "aria-label",
            collapsed
                ? "Zijbalk uitklappen"
                : "Zijbalk verkleinen"
        );


        sidebarToggleButton.title =
            collapsed
                ? "Zijbalk uitklappen"
                : "Zijbalk verkleinen";
    }


    try {

        localStorage.setItem(
            ADMIN_SIDEBAR_KEY,
            collapsed
                ? "1"
                : "0"
        );

    } catch {
        // localStorage kan in sommige privacy-modi geblokkeerd zijn.
    }


    /*
        Kalender opnieuw tekenen nadat de gridbreedte
        veranderd is.
    */

    if (
        currentView ===
        "calendar"
    ) {

        window.setTimeout(
            () => {

                renderMiniCalendar();

                renderCalendarWorkspace();
            },
            220
        );
    }
}



function getStoredSidebarCollapsed() {

    try {

        return (
            localStorage.getItem(
                ADMIN_SIDEBAR_KEY
            ) ===
            "1"
        );

    } catch {

        return false;
    }
}



sidebarToggleButton?.addEventListener(
    "click",
    () => {

        const collapsed =
            !adminDashboard
                ?.classList
                .contains(
                    "sidebar-collapsed"
                );


        setAdminSidebarCollapsed(
            collapsed
        );
    }
);


/*
    Herstel de keuze van de beheerder
    bij het openen van de admin.
*/

setAdminSidebarCollapsed(
    getStoredSidebarCollapsed()
);



/* =========================================================
   DEEP LINKS V10
========================================================= */

async function openDeepLinkedAdminViewV10() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const reservationId =
        params.get(
            "reservation"
        );


    const requestedView =
        params.get(
            "view"
        );


    if (
        reservationId
        &&
        reservations.some(
            reservation =>
                reservation.id ===
                reservationId
        )
    ) {

        await openReservation(
            reservationId
        );


        return;
    }


    if (
        requestedView
        &&
        VIEW_CONFIG[
            requestedView
        ]
    ) {

        await showView(
            requestedView
        );


        return;
    }


    await showView(
        currentView
    );
}



/* =========================================================
   =========================================================
   TECKELWEB ADMIN V9
   REALTIME BOOKING ALERTS + DAILY CARE TASKS
   =========================================================
   ========================================================= */


/* =========================================================
   REALTIME RESERVATIONS
========================================================= */

let realtimeReservationUnsubscribeV9 =
    null;


let realtimeReservationReadyV9 =
    false;



function stopRealtimeReservationsV9() {

    if (
        typeof realtimeReservationUnsubscribeV9 ===
        "function"
    ) {

        realtimeReservationUnsubscribeV9();
    }


    realtimeReservationUnsubscribeV9 =
        null;


    realtimeReservationReadyV9 =
        false;
}



function startRealtimeReservationsV9() {

    if (
        !currentUser
        ||
        !ADMIN_UIDS.includes(
            currentUser.uid
        )
    ) {

        return;
    }


    stopRealtimeReservationsV9();


    realtimeReservationUnsubscribeV9 =
        watchReservations(
            payload => {

                const isFirstSnapshot =
                    !realtimeReservationReadyV9;


                reservations =
                    [
                        ...payload.reservations
                    ];


                reservations.sort(
                    (
                        a,
                        b
                    ) => {

                        const timestampA =
                            a.createdAt
                                ?.toMillis?.()
                            ||
                            0;


                        const timestampB =
                            b.createdAt
                                ?.toMillis?.()
                            ||
                            0;


                        return (
                            timestampB -
                            timestampA
                        );
                    }
                );


                deriveDirectories();

                renderEverything();


                if (
                    !isFirstSnapshot
                ) {

                    payload.changes
                        .filter(
                            change =>
                                change.type ===
                                    "added"
                                &&
                                change.reservation
                                    ?.source ===
                                    "online-booking"
                                &&
                                change.reservation
                                    ?.status ===
                                    "pending"
                                &&
                                change.reservation
                                    ?.isDeleted !==
                                    true
                        )
                        .forEach(
                            change => {

                                notifyNewReservationV9(
                                    change.reservation
                                );
                            }
                        );
                }


                realtimeReservationReadyV9 =
                    true;
            },

            error => {

                console.error(
                    "Realtime adminmeldingen gestopt:",
                    error
                );


                showToast(
                    "Live reservatiemeldingen zijn tijdelijk niet beschikbaar.",
                    "error"
                );
            }
        );
}



function notifyNewReservationV9(
    reservation
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


    const period =
        formatReservationPeriod(
            reservation
        );


    showToast(
        `Nieuwe reservatie: ${dogName} · ${customerName}`,
        "success"
    );


    playAdminNotificationSoundV9();


    if (
        "Notification" in window
        &&
        Notification.permission ===
            "granted"
    ) {

        const notification =
            new Notification(
                "Nieuwe reservatie · TeckelWeb",
                {
                    body:
                        `${dogName} · ${customerName}\n${period}`
                }
            );


        notification.onclick =
            async () => {

                window.focus();

                await openReservation(
                    reservation.id
                );


                notification.close();
            };
    }
}



function playAdminNotificationSoundV9() {

    try {

        const AudioContextClass =
            window.AudioContext
            ||
            window.webkitAudioContext;


        if (
            !AudioContextClass
        ) {

            return;
        }


        const context =
            new AudioContextClass();


        const oscillator =
            context.createOscillator();


        const gain =
            context.createGain();


        oscillator.frequency.value =
            760;


        gain.gain.setValueAtTime(
            0.0001,
            context.currentTime
        );


        gain.gain.exponentialRampToValueAtTime(
            0.08,
            context.currentTime
                +
                0.01
        );


        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            context.currentTime
                +
                0.22
        );


        oscillator.connect(
            gain
        );


        gain.connect(
            context.destination
        );


        oscillator.start();


        oscillator.stop(
            context.currentTime
                +
                0.24
        );

    } catch {
        // Geluid is een extra; fouten mogen de admin niet beïnvloeden.
    }
}



/* =========================================================
   TASK CONFIG
========================================================= */

const TASK_ADDON_CONFIG_V9 = {

    "extra-walk": {

        title:
            "Extra wandeling",

        time:
            "15:00"
    },

    "photo-update": {

        title:
            "Foto-update",

        time:
            "16:00"
    },

    "individual-play": {

        title:
            "Individueel speelmoment",

        time:
            "14:00"
    }
};



function getFeedingScheduleV9(
    frequency
) {

    const value =
        String(
            frequency
            ||
            ""
        );


    if (
        value ===
        "1"
    ) {

        return [
            {
                key:
                    "feeding-noon",

                time:
                    "12:00"
            }
        ];
    }


    if (
        value ===
        "2"
    ) {

        return [
            {
                key:
                    "feeding-am",

                time:
                    "08:00"
            },
            {
                key:
                    "feeding-pm",

                time:
                    "17:00"
            }
        ];
    }


    if (
        value ===
        "3"
    ) {

        return [
            {
                key:
                    "feeding-am",

                time:
                    "08:00"
            },
            {
                key:
                    "feeding-noon",

                time:
                    "12:00"
            },
            {
                key:
                    "feeding-pm",

                time:
                    "17:00"
            }
        ];
    }


    if (
        value ===
        "custom"
    ) {

        return [
            {
                key:
                    "feeding-custom",

                time:
                    "—"
            }
        ];
    }


    return [];
}



function getTaskCompletionV9(
    reservation,
    dateString,
    key
) {

    return (
        reservation
            ?.taskCompletions
            ?.[dateString]
            ?.[key] ===
        true
    );
}



function buildTasksForDateV9(
    dateString
) {

    const dateReservations =
        getReservationsForDate(
            dateString
        )
            .filter(
                reservation =>
                    reservation.status ===
                    "accepted"
                &&
                    reservation.isDeleted !==
                    true
            );


    const tasks =
        [];


    dateReservations.forEach(
        reservation => {

            const booking =
                reservation.booking
                ||
                {};


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


            /*
                VOEDING
            */

            const feeding =
                booking.feeding
                ||
                {};


            let feedingSchedule =
                getFeedingScheduleV9(
                    feeding.frequency
                );


            if (
                !feedingSchedule.length
                &&
                (
                    feeding.source
                    ||
                    feeding.notes
                )
            ) {

                feedingSchedule = [
                    {
                        key:
                            "feeding-general",

                        time:
                            "—"
                    }
                ];
            }


            const foodSource = {

                owner:
                    "Eigen voeding",

                facility:
                    "Voeding van opvang"

            }[
                feeding.source
            ]
            ||
            "";


            feedingSchedule.forEach(
                item => {

                    const detail =
                        [
                            foodSource,
                            feeding.notes
                        ]
                            .filter(
                                Boolean
                            )
                            .join(
                                " · "
                            )
                        ||
                        "Voeding volgens afspraak";


                    tasks.push(
                        {
                            reservation,
                            reservationId:
                                reservation.id,

                            key:
                                item.key,

                            category:
                                "feeding",

                            title:
                                "Voeding",

                            detail,

                            time:
                                item.time,

                            dogName,
                            customerName,

                            completed:
                                getTaskCompletionV9(
                                    reservation,
                                    dateString,
                                    item.key
                                )
                        }
                    );
                }
            );


            /*
                MEDICATIE
            */

            if (
                booking.medication
                    ?.needed
            ) {

                const key =
                    "medication";


                tasks.push(
                    {
                        reservation,
                        reservationId:
                            reservation.id,

                        key,

                        category:
                            "medication",

                        title:
                            "Medicatie",

                        detail:
                            booking.medication
                                ?.notes
                            ||
                            "Medicatie volgens afspraak",

                        time:
                            "—",

                        dogName,
                        customerName,

                        completed:
                            getTaskCompletionV9(
                                reservation,
                                dateString,
                                key
                            )
                    }
                );
            }


            /*
                EXTRA'S
            */

            (
                Array.isArray(
                    booking.addons
                )
                    ? booking.addons
                    : []
            )
                .forEach(
                    addon => {

                        const config =
                            TASK_ADDON_CONFIG_V9[
                                addon
                            ]
                            ||
                            {
                                title:
                                    addon,

                                time:
                                    "—"
                            };


                        const key =
                            `addon-${String(
                                addon
                            )
                                .replace(
                                    /[^a-zA-Z0-9_-]/g,
                                    "_"
                                )}`;


                        tasks.push(
                            {
                                reservation,
                                reservationId:
                                    reservation.id,

                                key,

                                category:
                                    "addons",

                                title:
                                    config.title,

                                detail:
                                    "Extra verzorging",

                                time:
                                    config.time,

                                dogName,
                                customerName,

                                completed:
                                    getTaskCompletionV9(
                                        reservation,
                                        dateString,
                                        key
                                    )
                            }
                        );
                    }
                );
        }
    );


    return tasks.sort(
        (
            a,
            b
        ) => {

            if (
                a.completed !==
                b.completed
            ) {

                return a.completed
                    ? 1
                    : -1;
            }


            const timeA =
                a.time ===
                    "—"
                    ? "99:99"
                    : a.time;


            const timeB =
                b.time ===
                    "—"
                    ? "99:99"
                    : b.time;


            return (
                timeA.localeCompare(
                    timeB
                )
                ||
                a.dogName.localeCompare(
                    b.dogName,
                    "nl"
                )
            );
        }
    );
}



/* =========================================================
   TASK RENDERING
========================================================= */

function renderTasksV9() {

    if (
        !taskList
    ) {

        return;
    }


    if (
        taskDateInput
    ) {

        taskDateInput.value =
            selectedTaskDate;
    }


    const allTasks =
        buildTasksForDateV9(
            selectedTaskDate
        );


    const openCount =
        allTasks.filter(
            task =>
                !task.completed
        ).length;


    const completedCount =
        allTasks.length
        -
        openCount;


    if (
        taskStatOpen
    ) {

        taskStatOpen.textContent =
            openCount;
    }


    if (
        taskStatCompleted
    ) {

        taskStatCompleted.textContent =
            completedCount;
    }


    if (
        taskStatTotal
    ) {

        taskStatTotal.textContent =
            allTasks.length;
    }


    /*
        Sidebarbadge toont altijd open taken VANDAAG,
        ook wanneer de gebruiker een andere dag bekijkt.
    */

    if (
        sidebarTaskCount
    ) {

        const todayOpen =
            buildTasksForDateV9(
                dateToString(
                    new Date()
                )
            )
                .filter(
                    task =>
                        !task.completed
                )
                .length;


        sidebarTaskCount.textContent =
            todayOpen;


        sidebarTaskCount.hidden =
            todayOpen ===
            0;
    }


    const search =
        taskSearchInput
            ?.value
            .trim()
            .toLowerCase()
        ||
        "";


    const visible =
        allTasks.filter(
            task => {

                if (
                    taskFilter !==
                        "all"
                    &&
                    task.category !==
                        taskFilter
                ) {

                    return false;
                }


                if (
                    search
                ) {

                    const haystack =
                        [
                            task.dogName,
                            task.customerName,
                            task.title,
                            task.detail
                        ]
                            .join(
                                " "
                            )
                            .toLowerCase();


                    if (
                        !haystack.includes(
                            search
                        )
                    ) {

                        return false;
                    }
                }


                return true;
            }
        );


    taskList.innerHTML =
        "";


    if (
        !visible.length
    ) {

        taskList.innerHTML = `
            <div class="admin-empty-state">
                <strong>
                    Geen taken gevonden
                </strong>
                <span>
                    Voor deze dag en filter zijn er geen verzorgingstaken.
                </span>
            </div>
        `;


        return;
    }


    visible.forEach(
        task => {

            const row =
                document.createElement(
                    "article"
                );


            row.className =
                `admin-task-row category-${task.category}`;


            if (
                task.completed
            ) {

                row.classList.add(
                    "completed"
                );
            }


            row.innerHTML = `
                <div class="admin-task-pet">

                    <div class="admin-task-pet-avatar">
                        ${escapeHtml(
                            task.dogName
                                .charAt(0)
                                .toUpperCase()
                        )}
                    </div>

                    <div>
                        <strong>
                            ${escapeHtml(
                                task.dogName
                            )}
                        </strong>
                        <span>
                            ${escapeHtml(
                                formatDogInfo(
                                    task.reservation.dog
                                )
                            )}
                        </span>
                    </div>

                </div>


                <div class="admin-task-description">

                    <strong>
                        ${escapeHtml(
                            task.title
                        )}
                    </strong>

                    <span>
                        ${escapeHtml(
                            task.detail
                        )}
                    </span>

                </div>


                <strong class="admin-task-time">
                    ${escapeHtml(
                        task.time
                    )}
                </strong>


                <span class="admin-task-customer">
                    ${escapeHtml(
                        task.customerName
                    )}
                </span>


                <button
                    type="button"
                    class="admin-task-status-button ${task.completed
                        ? "completed"
                        : ""
                    }"
                >
                    ${task.completed
                        ? "✓ Klaar"
                        : "Markeer klaar"
                    }
                </button>
            `;


            const button =
                row.querySelector(
                    ".admin-task-status-button"
                );


            button?.addEventListener(
                "click",
                async () => {

                    const newCompleted =
                        !task.completed;


                    button.disabled =
                        true;


                    try {

                        await setReservationTaskCompleted(
                            task.reservationId,
                            selectedTaskDate,
                            task.key,
                            newCompleted
                        );


                        if (
                            !task.reservation
                                .taskCompletions
                        ) {

                            task.reservation
                                .taskCompletions =
                                {};
                        }


                        if (
                            !task.reservation
                                .taskCompletions[
                                    selectedTaskDate
                                ]
                        ) {

                            task.reservation
                                .taskCompletions[
                                    selectedTaskDate
                                ] =
                                {};
                        }


                        task.reservation
                            .taskCompletions[
                                selectedTaskDate
                            ][
                                task.key
                            ] =
                            newCompleted;


                        renderTasksV9();


                    } catch (error) {

                        console.error(
                            "Taak bijwerken mislukt:",
                            error
                        );


                        showToast(
                            "Taak kon niet worden bijgewerkt.",
                            "error"
                        );


                        button.disabled =
                            false;
                    }
                }
            );


            taskList.appendChild(
                row
            );
        }
    );
}



/* =========================================================
   TASK CONTROLS
========================================================= */

taskFilterButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                taskFilter =
                    button.dataset
                        .taskFilter
                    ||
                    "all";


                taskFilterButtons.forEach(
                    other => {

                        other.classList.toggle(
                            "active",
                            other === button
                        );
                    }
                );


                renderTasksV9();
            }
        );
    }
);



taskSearchInput?.addEventListener(
    "input",
    renderTasksV9
);



taskDateInput?.addEventListener(
    "change",
    () => {

        if (
            taskDateInput.value
        ) {

            selectedTaskDate =
                taskDateInput.value;


            renderTasksV9();
        }
    }
);



taskPreviousButton?.addEventListener(
    "click",
    () => {

        selectedTaskDate =
            addDays(
                selectedTaskDate,
                -1
            );


        renderTasksV9();
    }
);



taskNextButton?.addEventListener(
    "click",
    () => {

        selectedTaskDate =
            addDays(
                selectedTaskDate,
                1
            );


        renderTasksV9();
    }
);



taskTodayButton?.addEventListener(
    "click",
    () => {

        selectedTaskDate =
            dateToString(
                new Date()
            );


        renderTasksV9();
    }
);



/* =========================================================
   PUSH NOTIFICATION PERMISSION
========================================================= */

function syncNotificationPermissionButtonV9() {

    if (
        !enableNotificationsButton
    ) {

        return;
    }


    if (
        !isAdminPushConfigured()
    ) {

        enableNotificationsButton.textContent =
            "🔔 Push instellen";


        enableNotificationsButton.classList.remove(
            "enabled"
        );


        return;
    }


    if (
        !(
            "Notification" in window
        )
    ) {

        enableNotificationsButton.hidden =
            true;

        return;
    }


    const registered =
        localStorage.getItem(
            "teckelweb-admin-push-enabled"
        ) ===
        "1";


    if (
        Notification.permission ===
            "granted"
        &&
        registered
    ) {

        enableNotificationsButton.textContent =
            "🔔 Push aan";


        enableNotificationsButton.classList.add(
            "enabled"
        );

    } else if (
        Notification.permission ===
            "denied"
    ) {

        enableNotificationsButton.textContent =
            "🔕 Push geblokkeerd";


        enableNotificationsButton.classList.remove(
            "enabled"
        );

    } else {

        enableNotificationsButton.textContent =
            "🔔 Push activeren";


        enableNotificationsButton.classList.remove(
            "enabled"
        );
    }
}



enableNotificationsButton?.addEventListener(
    "click",
    async () => {

        if (
            !isAdminPushConfigured()
        ) {

            showToast(
                "Push is voorbereid, maar de Firebase Web Push-sleutel moet nog worden ingevuld.",
                "error"
            );

            return;
        }


        enableNotificationsButton.disabled =
            true;


        const oldText =
            enableNotificationsButton.textContent;


        enableNotificationsButton.textContent =
            "Push activeren...";


        try {

            await registerAdminPushDevice();


            syncNotificationPermissionButtonV9();


            showToast(
                "Pushmeldingen zijn actief op dit toestel.",
                "success"
            );

        } catch (error) {

            console.error(
                "Push activeren mislukt:",
                error
            );


            enableNotificationsButton.textContent =
                oldText;


            showToast(
                error.message
                ||
                "Pushmeldingen konden niet worden ingeschakeld.",
                "error"
            );

        } finally {

            enableNotificationsButton.disabled =
                false;
        }
    }
);


syncNotificationPermissionButtonV9();
