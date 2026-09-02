import {
    watchAuthState,
    getAvailabilityForMonth,
    saveAvailability
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
   STATUS
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
   DATA LADEN
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
   KALENDER
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
       LEGE DAGEN VOOR DAG 1
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


        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.className =
            `admin-calendar-day ${status}`;


        button.textContent =
            day;


        button.dataset.date =
            dateString;


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


    if (radio) {

        radio.checked =
            true;
    }


    saveButton.disabled =
        false;


    message.textContent =
        "";


    renderCalendar();
}



/* =========================================
   MAAND NAVIGATIE
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


        saveButton.disabled =
            true;


        await loadAvailability();
    }
);



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


        saveButton.disabled =
            true;


        await loadAvailability();
    }
);



/* =========================================
   OPSLAAN
========================================= */

saveButton.addEventListener(
    "click",
    async () => {

        if (!selectedDate) {

            return;
        }


        const selectedStatus =
            document.querySelector(
                'input[name="availability-status"]:checked'
            );


        if (!selectedStatus) {

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
                Lokale data meteen bijwerken.
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
   STARTEN NA ADMINLOGIN
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


        await loadAvailability();
    }
);