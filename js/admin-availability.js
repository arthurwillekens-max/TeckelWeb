import {
    watchAuthState,
    getAvailabilityForMonth,
    saveAvailability,
    getReservations
} from "./firebase.js";



/* =========================================
   ADMIN ACCOUNTS
========================================= */

const ADMIN_UIDS = [
    "3v8qJh6ZXrPYqfzxJ3f6if4BH3r2"
];



/* =========================================
   HTML
========================================= */

const calendarTitle =
    document.getElementById(
        "admin-calendar-title"
    );

const calendarGrid =
    document.getElementById(
        "admin-calendar-grid"
    );

const previousMonthButton =
    document.getElementById(
        "admin-calendar-prev"
    );

const nextMonthButton =
    document.getElementById(
        "admin-calendar-next"
    );

const selectedDateTitle =
    document.getElementById(
        "admin-selected-date"
    );

const saveButton =
    document.getElementById(
        "admin-save-availability"
    );

const message =
    document.getElementById(
        "admin-availability-message"
    );



/* -----------------------------------------
   DAGPLANNING
----------------------------------------- */

const daySummary =
    document.getElementById(
        "admin-day-summary"
    );

const confirmedCount =
    document.getElementById(
        "admin-day-confirmed-count"
    );

const pendingCount =
    document.getElementById(
        "admin-day-pending-count"
    );

const dayPlanning =
    document.getElementById(
        "admin-day-planning"
    );

const dayBookings =
    document.getElementById(
        "admin-day-bookings"
    );

const dayPending =
    document.getElementById(
        "admin-day-pending"
    );

const dayPendingList =
    document.getElementById(
        "admin-day-pending-list"
    );



/* =========================================
   STATE
========================================= */

const today =
    new Date();


let displayedMonth =
    new Date(
        today.getFullYear(),
        today.getMonth(),
        1
    );


let availabilityData =
    {};


let reservations =
    [];


let selectedDate =
    null;



/* =========================================
   DATUM HELPERS
========================================= */

function makeDateString(
    year,
    month,
    day
) {

    const formattedMonth =
        String(
            month + 1
        ).padStart(
            2,
            "0"
        );


    const formattedDay =
        String(
            day
        ).padStart(
            2,
            "0"
        );


    return (
        `${year}-${formattedMonth}-${formattedDay}`
    );
}



function parseDate(
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


    return new Date(
        year,
        month - 1,
        day
    );
}



function formatSelectedDate(
    dateString
) {

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
            parseDate(
                dateString
            )
        );


    return (
        formatted.charAt(0).toUpperCase()
        +
        formatted.slice(1)
    );
}



/* =========================================
   BESCHIKBAARHEIDSSTATUS
========================================= */

function getStatusForDate(
    dateString
) {

    return (
        availabilityData[
            dateString
        ]?.status
        ||
        "available"
    );
}



/* =========================================
   RESERVATIE VALT OP DEZE DAG?
========================================= */

function reservationTouchesDate(
    reservation,
    dateString
) {

    const startDate =
        reservation.booking
            ?.startDate;


    const endDate =
        reservation.booking
            ?.endDate
        ||
        startDate;


    if (
        !startDate ||
        !endDate
    ) {

        return false;
    }


    return (
        dateString >= startDate
        &&
        dateString <= endDate
    );
}



/* =========================================
   RESERVATIES VOOR EEN DAG
========================================= */

function getReservationsForDate(
    dateString
) {

    return reservations.filter(
        reservation =>
            reservationTouchesDate(
                reservation,
                dateString
            )
    );
}



/* =========================================
   BEVESTIGDE HONDEN OP DAG
========================================= */

function getConfirmedCountForDate(
    dateString
) {

    return getReservationsForDate(
        dateString
    ).filter(
        reservation =>
            reservation.status ===
            "accepted"
    ).length;
}



/* =========================================
   TIJD HELPERS
========================================= */

function timeToMinutes(
    time
) {

    if (
        !time ||
        !time.includes(":")
    ) {

        return null;
    }


    const [
        hours,
        minutes
    ] =
        time
            .split(":")
            .map(Number);


    return (
        hours * 60
        +
        minutes
    );
}



/* =========================================
   TIJDEN VAN RESERVATIE OP SPECIFIEKE DAG
========================================= */

function getReservationTimesForDay(
    reservation,
    dateString
) {

    const booking =
        reservation.booking
        || {};


    const startDate =
        booking.startDate;


    const endDate =
        booking.endDate
        ||
        startDate;



    /*
        Reservatie van één dag.
    */

    if (
        startDate ===
        endDate
    ) {

        return {
            start:
                booking.arrivalTime
                ||
                "08:00",

            end:
                booking.departureTime
                ||
                "18:00"
        };
    }



    /*
        Eerste dag van meerdaagse reservatie.
    */

    if (
        dateString ===
        startDate
    ) {

        return {
            start:
                booking.arrivalTime
                ||
                "08:00",

            end:
                "18:00"
        };
    }



    /*
        Laatste dag.
    */

    if (
        dateString ===
        endDate
    ) {

        return {
            start:
                "08:00",

            end:
                booking.departureTime
                ||
                "18:00"
        };
    }



    /*
        Tussendag van een meerdaagse reservatie.
    */

    return {
        start:
            "08:00",

        end:
            "18:00"
    };
}



/* =========================================
   TIJDLIJN POSITIE BEREKENEN
========================================= */

function getTimelinePosition(
    startTime,
    endTime
) {

    const timelineStart =
        8 * 60;

    const timelineEnd =
        18 * 60;

    const timelineDuration =
        timelineEnd -
        timelineStart;


    let start =
        timeToMinutes(
            startTime
        );


    let end =
        timeToMinutes(
            endTime
        );


    start =
        Math.max(
            timelineStart,
            start ?? timelineStart
        );


    end =
        Math.min(
            timelineEnd,
            end ?? timelineEnd
        );


    if (
        end < start
    ) {

        end =
            start;
    }


    const left =
        (
            (
                start -
                timelineStart
            )
            /
            timelineDuration
        )
        *
        100;


    const width =
        (
            (
                end -
                start
            )
            /
            timelineDuration
        )
        *
        100;


    return {
        left:
            left,

        width:
            Math.max(
                width,
                1
            )
    };
}



/* =========================================
   TYPE OPVANG
========================================= */

function formatBookingType(
    type
) {

    if (
        type ===
        "daycare"
    ) {

        return "Dagopvang";
    }


    if (
        type ===
        "overnight"
    ) {

        return "Overnachting";
    }


    return "Opvang";
}



/* =========================================
   HTML VEILIG TONEN
========================================= */

function escapeHtml(
    value
) {

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



/* =========================================
   BESCHIKBAARHEID LADEN
========================================= */

async function loadAvailability() {

    message.textContent =
        "Beschikbaarheid laden...";


    try {

        availabilityData =
            await getAvailabilityForMonth(
                displayedMonth.getFullYear(),
                displayedMonth.getMonth()
            );


        renderCalendar();


        if (
            selectedDate
        ) {

            renderDayPlanning(
                selectedDate
            );
        }


        message.textContent =
            "";


    } catch (error) {

        console.error(
            "Beschikbaarheid laden mislukt:",
            error
        );


        message.textContent =
            "Beschikbaarheid kon niet geladen worden.";
    }
}



/* =========================================
   RESERVATIES VOOR PLANNING LADEN
========================================= */

async function loadReservationsForPlanning() {

    try {

        reservations =
            await getReservations();


        renderCalendar();


        if (
            selectedDate
        ) {

            renderDayPlanning(
                selectedDate
            );
        }


    } catch (error) {

        console.error(
            "Reservaties voor planning laden mislukt:",
            error
        );
    }
}



/* =========================================
   KALENDER RENDEREN
========================================= */

function renderCalendar() {

    const year =
        displayedMonth.getFullYear();

    const month =
        displayedMonth.getMonth();



    /* -------------------------------------
       TITEL
    ------------------------------------- */

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


    calendarTitle.textContent =
        title;



    /* -------------------------------------
       GRID LEEGMAKEN
    ------------------------------------- */

    calendarGrid.innerHTML =
        "";



    /* -------------------------------------
       LEGE VAKKEN VOOR DAG 1
    ------------------------------------- */

    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    const emptyCells =
        (
            firstDay + 6
        ) % 7;


    for (
        let index = 0;
        index < emptyCells;
        index++
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



    /* -------------------------------------
       DAGEN
    ------------------------------------- */

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
            makeDateString(
                year,
                month,
                day
            );


        const status =
            getStatusForDate(
                dateString
            );


        const confirmed =
            getConfirmedCountForDate(
                dateString
            );


        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.className =
            `admin-calendar-day ${status}`;


        button.dataset.date =
            dateString;



        /* ---------------------------------
           DAGNUMMER
        --------------------------------- */

        const dayNumber =
            document.createElement(
                "span"
            );


        dayNumber.className =
            "admin-calendar-day-number";


        dayNumber.textContent =
            day;


        button.appendChild(
            dayNumber
        );



        /* ---------------------------------
           AANTAL BEVESTIGDE HONDEN
        --------------------------------- */

        if (
            confirmed > 0
        ) {

            const bookingCount =
                document.createElement(
                    "span"
                );


            bookingCount.className =
                "admin-calendar-booking-count";


            bookingCount.textContent =
                confirmed;


            bookingCount.title =
                `${confirmed} bevestigde hond${confirmed === 1 ? "" : "en"}`;


            button.appendChild(
                bookingCount
            );
        }



        /* ---------------------------------
           GESELECTEERDE DAG
        --------------------------------- */

        if (
            selectedDate ===
            dateString
        ) {

            button.classList.add(
                "selected"
            );
        }



        button.addEventListener(
            "click",
            () => {

                selectDate(
                    dateString
                );
            }
        );


        calendarGrid.appendChild(
            button
        );
    }
}



/* =========================================
   DAG SELECTEREN
========================================= */

function selectDate(
    dateString
) {

    selectedDate =
        dateString;


    selectedDateTitle.textContent =
        formatSelectedDate(
            dateString
        );


    const status =
        getStatusForDate(
            dateString
        );


    const radio =
        document.querySelector(
            `input[name="availability-status"][value="${status}"]`
        );


    if (
        radio
    ) {

        radio.checked =
            true;
    }


    saveButton.disabled =
        false;


    message.textContent =
        "";


    renderCalendar();


    renderDayPlanning(
        dateString
    );
}



/* =========================================
   DAGPLANNING TONEN
========================================= */

function renderDayPlanning(
    dateString
) {

    const allForDay =
        getReservationsForDate(
            dateString
        );


    const accepted =
        allForDay.filter(
            reservation =>
                reservation.status ===
                "accepted"
        );


    const pending =
        allForDay.filter(
            reservation =>
                reservation.status ===
                "pending"
        );



    /* -------------------------------------
       COUNTERS
    ------------------------------------- */

    confirmedCount.textContent =
        accepted.length;


    pendingCount.textContent =
        pending.length;


    daySummary.hidden =
        false;


    dayPlanning.hidden =
        false;



    /* =====================================
       BEVESTIGDE RESERVATIES
    ===================================== */

    dayBookings.innerHTML =
        "";


    if (
        accepted.length ===
        0
    ) {

        dayBookings.innerHTML = `
            <div class="admin-day-empty">

                <strong>
                    Geen honden gepland
                </strong>

                <span>
                    Er zijn nog geen bevestigde reservaties voor deze dag.
                </span>

            </div>
        `;

    } else {

        accepted
            .sort(
                (a, b) => {

                    const timeA =
                        getReservationTimesForDay(
                            a,
                            dateString
                        ).start;


                    const timeB =
                        getReservationTimesForDay(
                            b,
                            dateString
                        ).start;


                    return (
                        timeA.localeCompare(
                            timeB
                        )
                    );
                }
            )
            .forEach(
                reservation => {

                    createDayBooking(
                        reservation,
                        dateString
                    );
                }
            );
    }



    /* =====================================
       PENDING RESERVATIES
    ===================================== */

    if (
        pending.length ===
        0
    ) {

        dayPending.hidden =
            true;


        dayPendingList.innerHTML =
            "";

    } else {

        dayPending.hidden =
            false;


        dayPendingList.innerHTML =
            "";


        pending
            .sort(
                (a, b) => {

                    const timeA =
                        getReservationTimesForDay(
                            a,
                            dateString
                        ).start;


                    const timeB =
                        getReservationTimesForDay(
                            b,
                            dateString
                        ).start;


                    return (
                        timeA.localeCompare(
                            timeB
                        )
                    );
                }
            )
            .forEach(
                reservation => {

                    createPendingBooking(
                        reservation,
                        dateString
                    );
                }
            );
    }
}



/* =========================================
   BEVESTIGDE RESERVATIEKAART
========================================= */

function createDayBooking(
    reservation,
    dateString
) {

    const times =
        getReservationTimesForDay(
            reservation,
            dateString
        );


    const position =
        getTimelinePosition(
            times.start,
            times.end
        );


    const card =
        document.createElement(
            "article"
        );


    card.className =
        "admin-day-booking";


    const bookingType =
        formatBookingType(
            reservation.booking
                ?.type
        );


    card.innerHTML = `
        <div class="admin-day-booking-header">

            <div class="admin-day-booking-name">

                <strong>
                    ${escapeHtml(
        reservation.dog?.name
        || "Hond"
    )}
                </strong>

                <span>
                    ${escapeHtml(
        reservation.customer?.name
        || "Onbekende klant"
    )}
                </span>

            </div>


            <span class="admin-day-booking-type">
                ${escapeHtml(
        bookingType
    )}
            </span>

        </div>


        <div class="admin-day-booking-meta">

            <span>
                ${escapeHtml(
        times.start
    )}
                –
                ${escapeHtml(
        times.end
    )}
            </span>


            ${reservation.customer?.phone
            ? `
                        <span>
                            ${escapeHtml(
                reservation.customer.phone
            )}
                        </span>
                    `
            : ""
        }

        </div>


        <div class="admin-day-track">

            <div
                class="admin-day-track-bar"
                style="
                    left: ${position.left}%;
                    width: ${position.width}%;
                "
            ></div>

        </div>


        <button
            type="button"
            class="admin-day-view-reservation"
        >
            Bekijk reservatie
        </button>
    `;


    const viewButton =
        card.querySelector(
            ".admin-day-view-reservation"
        );


    viewButton.addEventListener(
        "click",
        () => {

            scrollToReservation(
                reservation.id
            );
        }
    );


    dayBookings.appendChild(
        card
    );
}



/* =========================================
   PENDING RESERVATIEKAART
========================================= */

function createPendingBooking(
    reservation,
    dateString
) {

    const times =
        getReservationTimesForDay(
            reservation,
            dateString
        );


    const card =
        document.createElement(
            "button"
        );


    card.type =
        "button";


    card.className =
        "admin-day-pending-card";


    card.innerHTML = `
        <span class="admin-day-pending-main">

            <strong>
                ${escapeHtml(
        reservation.dog?.name
        || "Hond"
    )}
            </strong>

            <small>
                ${escapeHtml(
        reservation.customer?.name
        || "Onbekende klant"
    )}
            </small>

        </span>


        <span class="admin-day-pending-time">

            ${escapeHtml(
        times.start
    )}

            –

            ${escapeHtml(
        times.end
    )}

        </span>
    `;


    card.addEventListener(
        "click",
        () => {

            scrollToReservation(
                reservation.id
            );
        }
    );


    dayPendingList.appendChild(
        card
    );
}



/* =========================================
   NAAR RESERVATIE SCROLLEN
========================================= */

function scrollToReservation(
    reservationId
) {

    const reservationElement =
        document.getElementById(
            `reservation-${reservationId}`
        );


    if (
        !reservationElement
    ) {

        return;
    }


    reservationElement.scrollIntoView(
        {
            behavior:
                "smooth",

            block:
                "center"
        }
    );


    reservationElement.classList.add(
        "reservation-highlight"
    );


    window.setTimeout(
        () => {

            reservationElement.classList.remove(
                "reservation-highlight"
            );
        },

        1800
    );
}



/* =========================================
   VORIGE MAAND
========================================= */

previousMonthButton.addEventListener(
    "click",
    async () => {

        displayedMonth =
            new Date(
                displayedMonth.getFullYear(),
                displayedMonth.getMonth() - 1,
                1
            );


        selectedDate =
            null;


        selectedDateTitle.textContent =
            "Kies een dag";


        daySummary.hidden =
            true;


        dayPlanning.hidden =
            true;


        dayPending.hidden =
            true;


        saveButton.disabled =
            true;


        await loadAvailability();
    }
);



/* =========================================
   VOLGENDE MAAND
========================================= */

nextMonthButton.addEventListener(
    "click",
    async () => {

        displayedMonth =
            new Date(
                displayedMonth.getFullYear(),
                displayedMonth.getMonth() + 1,
                1
            );


        selectedDate =
            null;


        selectedDateTitle.textContent =
            "Kies een dag";


        daySummary.hidden =
            true;


        dayPlanning.hidden =
            true;


        dayPending.hidden =
            true;


        saveButton.disabled =
            true;


        await loadAvailability();
    }
);



/* =========================================
   BESCHIKBAARHEID OPSLAAN
========================================= */

saveButton.addEventListener(
    "click",
    async () => {

        if (
            !selectedDate
        ) {

            return;
        }


        const selectedStatus =
            document.querySelector(
                'input[name="availability-status"]:checked'
            );


        if (
            !selectedStatus
        ) {

            message.textContent =
                "Kies eerst een status.";


            return;
        }


        const status =
            selectedStatus.value;


        saveButton.disabled =
            true;


        saveButton.textContent =
            "Opslaan...";


        message.textContent =
            "";


        try {

            await saveAvailability(
                selectedDate,
                status
            );


            /*
                Available wordt niet in Firestore opgeslagen.
            */

            if (
                status ===
                "available"
            ) {

                delete availabilityData[
                    selectedDate
                ];

            } else {

                availabilityData[
                    selectedDate
                ] = {
                    date:
                        selectedDate,

                    status:
                        status
                };
            }


            renderCalendar();


            message.textContent =
                "Beschikbaarheid opgeslagen.";


        } catch (error) {

            console.error(
                "Beschikbaarheid opslaan mislukt:",
                error
            );


            message.textContent =
                "Opslaan is mislukt.";
        }


        saveButton.disabled =
            false;


        saveButton.textContent =
            "Beschikbaarheid opslaan";
    }
);



/* =========================================
   RESERVATIES VERANDERD
========================================= */

window.addEventListener(
    "teckelweb:reservations-updated",
    event => {

        if (
            !Array.isArray(
                event.detail
                    ?.reservations
            )
        ) {

            return;
        }


        reservations =
            event.detail
                .reservations;


        /*
            Kalender opnieuw tekenen zodat
            aantal honden per dag direct verandert.
        */

        renderCalendar();


        if (
            selectedDate
        ) {

            renderDayPlanning(
                selectedDate
            );
        }
    }
);



/* =========================================
   START NA LOGIN
========================================= */

watchAuthState(
    async user => {

        if (
            !user ||
            !ADMIN_UIDS.includes(
                user.uid
            )
        ) {

            return;
        }


        /*
            Availability en reservaties
            tegelijk ophalen.
        */

        await Promise.all(
            [
                loadAvailability(),
                loadReservationsForPlanning()
            ]
        );
    }
);