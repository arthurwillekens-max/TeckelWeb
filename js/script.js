/* =========================================
   TECKELWEB - KALENDER & RESERVATIE
========================================= */


/* -----------------------------------------
   VOORBEELD BESCHIKBAARHEID
----------------------------------------- */

const dayData = {

    "2026-09-03": {
        status: "Beperkt beschikbaar",
        type: "limited",
        times: [
            ["08:00 – 12:00", true],
            ["12:00 – 14:00", false],
            ["14:00 – 18:00", true]
        ]
    },

    "2026-09-11": {
        status: "Beperkt beschikbaar",
        type: "limited",
        times: [
            ["08:00 – 10:30", true],
            ["10:30 – 13:30", false],
            ["13:30 – 18:00", true]
        ]
    },

    "2026-09-15": {
        status: "Beperkt beschikbaar",
        type: "limited",
        times: [
            ["08:00 – 12:00", true],
            ["12:00 – 14:00", false],
            ["14:00 – 18:00", true]
        ]
    },

    "2026-09-23": {
        status: "Beperkt beschikbaar",
        type: "limited",
        times: [
            ["08:00 – 11:00", true],
            ["11:00 – 15:00", false],
            ["15:00 – 18:00", true]
        ]
    }
};


const defaultAvailableTimes = [
    ["08:00 – 12:00", true],
    ["12:00 – 14:00", true],
    ["14:00 – 18:00", true]
];



/* -----------------------------------------
   ELEMENTEN
----------------------------------------- */

const calendarDays = Array.from(
    document.querySelectorAll(".calendar-day")
);

const selectedDateTitle =
    document.getElementById("selected-date");

const dayStatus =
    document.querySelector(".day-status");

const timeSlots =
    document.querySelector(".time-slots");

const startDateInput =
    document.getElementById("start-date");

const endDateInput =
    document.getElementById("end-date");

const arrivalTimeInput =
    document.getElementById("arrival-time");

const departureTimeInput =
    document.getElementById("departure-time");

const selectedPeriod =
    document.getElementById("selected-period");

const calculateButton =
    document.getElementById("calculate-price");

const bookingMessage =
    document.getElementById("booking-message");

const priceResult =
    document.getElementById("price-result");

const priceValue =
    document.getElementById("price-value");



/* -----------------------------------------
   SELECTIESTATUS
----------------------------------------- */

let rangeStart = null;
let rangeEnd = null;

let isDragging = false;



/* -----------------------------------------
   DATUMFUNCTIES
----------------------------------------- */

function parseDate(dateString) {

    const [year, month, day] = dateString
        .split("-")
        .map(Number);

    return new Date(year, month - 1, day);
}


function formatDate(dateString) {

    const date = parseDate(dateString);

    return new Intl.DateTimeFormat("nl-BE", {
        weekday: "long",
        day: "numeric",
        month: "long"
    }).format(date);
}


function formatShortDate(dateString) {

    const date = parseDate(dateString);

    return new Intl.DateTimeFormat("nl-BE", {
        day: "numeric",
        month: "short"
    }).format(date);
}



/* -----------------------------------------
   DETAILS VAN ÉÉN DAG
----------------------------------------- */

function showTimeSlots(times) {

    timeSlots.innerHTML = "";

    times.forEach(([time, available]) => {

        const slot = document.createElement("div");

        slot.className = available
            ? "time-slot available-time"
            : "time-slot unavailable-time";

        slot.innerHTML = `
            <div>
                <strong>${time}</strong>
                <span>
                    ${available
                ? "Beschikbaar"
                : "Niet beschikbaar"}
                </span>
            </div>
        `;

        timeSlots.appendChild(slot);
    });
}


function updateStatus(type, text) {

    dayStatus.classList.remove(
        "available-status",
        "limited-status",
        "full-status"
    );

    dayStatus.classList.add(
        `${type}-status`
    );

    dayStatus.textContent = text;
}


function showDayDetails(date) {

    selectedDateTitle.textContent =
        formatDate(date);


    if (dayData[date]) {

        const data = dayData[date];

        updateStatus(
            data.type,
            data.status
        );

        showTimeSlots(
            data.times
        );

    } else {

        updateStatus(
            "available",
            "Beschikbaar"
        );

        showTimeSlots(
            defaultAvailableTimes
        );
    }
}



/* -----------------------------------------
   RANGE OP KALENDER TONEN
----------------------------------------- */

function clearRangeClasses() {

    calendarDays.forEach(day => {

        day.classList.remove(
            "selected",
            "range-start",
            "range-end",
            "in-range"
        );
    });
}


function drawRange() {

    clearRangeClasses();

    if (!rangeStart) {
        return;
    }


    const start =
        parseDate(rangeStart);

    const end =
        parseDate(rangeEnd || rangeStart);


    const first =
        start <= end ? start : end;

    const last =
        start <= end ? end : start;


    calendarDays.forEach(day => {

        const current =
            parseDate(day.dataset.date);


        if (
            current >= first &&
            current <= last
        ) {

            day.classList.add("in-range");
        }
    });


    function dateToLocalString(date) {

        const year = date.getFullYear();

        const month = String(
            date.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            date.getDate()
        ).padStart(2, "0");


        return `${year}-${month}-${day}`;
    }


    const startString =
        dateToLocalString(first);

    const endString =
        dateToLocalString(last);


    const startElement =
        document.querySelector(
            `.calendar-day[data-date="${startString}"]`
        );

    const endElement =
        document.querySelector(
            `.calendar-day[data-date="${endString}"]`
        );


    if (startElement) {
        startElement.classList.add(
            "range-start",
            "selected"
        );
    }


    if (endElement) {
        endElement.classList.add(
            "range-end",
            "selected"
        );
    }
}



/* -----------------------------------------
   CHECK OP VOLLE DAGEN
----------------------------------------- */

function rangeContainsFullDay(startString, endString) {

    const start = parseDate(startString);
    const end = parseDate(endString);

    const first =
        start <= end ? start : end;

    const last =
        start <= end ? end : start;


    return calendarDays.some(day => {

        if (!day.classList.contains("full")) {
            return false;
        }

        const date =
            parseDate(day.dataset.date);

        return (
            date >= first &&
            date <= last
        );
    });
}



/* -----------------------------------------
   FORMULIER BIJWERKEN
----------------------------------------- */

function updateBookingFields() {

    if (!rangeStart) {
        return;
    }


    let first = rangeStart;
    let last = rangeEnd || rangeStart;


    if (
        parseDate(first) >
        parseDate(last)
    ) {

        [first, last] =
            [last, first];
    }


    startDateInput.value = first;
    endDateInput.value = last;


    selectedPeriod.textContent =
        `${formatShortDate(first)} → ${formatShortDate(last)}`;


    priceResult.hidden = true;
    bookingMessage.textContent = "";
}



/* -----------------------------------------
   START VAN SELECTIE
----------------------------------------- */

function startSelection(day) {

    if (day.classList.contains("full")) {
        return;
    }


    isDragging = true;

    rangeStart =
        day.dataset.date;

    rangeEnd =
        day.dataset.date;


    showDayDetails(
        day.dataset.date
    );

    drawRange();

    updateBookingFields();
}



/* -----------------------------------------
   SELECTIE UITBREIDEN
----------------------------------------- */

function extendSelection(day) {

    if (!isDragging) {
        return;
    }

    if (day.classList.contains("full")) {
        return;
    }


    const candidateEnd =
        day.dataset.date;


    if (
        rangeContainsFullDay(
            rangeStart,
            candidateEnd
        )
    ) {
        return;
    }


    rangeEnd =
        candidateEnd;


    drawRange();

    updateBookingFields();
}



/* -----------------------------------------
   MUISINTERACTIE
----------------------------------------- */

calendarDays.forEach(day => {

    if (day.classList.contains("full")) {

        day.disabled = true;

        return;
    }


    day.addEventListener(
        "mousedown",
        event => {

            event.preventDefault();

            startSelection(day);
        }
    );


    day.addEventListener(
        "mouseenter",
        () => {

            extendSelection(day);
        }
    );


    day.addEventListener(
        "click",
        () => {

            showDayDetails(
                day.dataset.date
            );
        }
    );
});


document.addEventListener(
    "mouseup",
    () => {

        isDragging = false;
    }
);



/* -----------------------------------------
   DATUM INPUT → KALENDER
----------------------------------------- */

function syncInputsToCalendar() {

    const start =
        startDateInput.value;

    const end =
        endDateInput.value;


    if (!start) {
        return;
    }


    rangeStart = start;
    rangeEnd = end || start;


    if (
        rangeContainsFullDay(
            rangeStart,
            rangeEnd
        )
    ) {

        bookingMessage.textContent =
            "In deze periode zit een dag die volledig volzet is.";

        return;
    }


    bookingMessage.textContent = "";

    drawRange();

    updateBookingFields();
}


startDateInput.addEventListener(
    "change",
    syncInputsToCalendar
);


endDateInput.addEventListener(
    "change",
    syncInputsToCalendar
);



/* -----------------------------------------
   PRIJS BEREKENEN
----------------------------------------- */

calculateButton.addEventListener(
    "click",
    () => {

        bookingMessage.textContent = "";

        priceResult.hidden = true;


        const start =
            startDateInput.value;

        const end =
            endDateInput.value;

        const arrival =
            arrivalTimeInput.value;

        const departure =
            departureTimeInput.value;

        const bookingType =
            document.querySelector(
                'input[name="booking-type"]:checked'
            );


        if (
            !start ||
            !end ||
            !arrival ||
            !departure ||
            !bookingType
        ) {

            bookingMessage.textContent =
                "Vul eerst alle gegevens in.";

            return;
        }


        if (
            parseDate(end) <
            parseDate(start)
        ) {

            bookingMessage.textContent =
                "De einddatum kan niet vóór de startdatum liggen.";

            return;
        }


        if (
            rangeContainsFullDay(
                start,
                end
            )
        ) {

            bookingMessage.textContent =
                "Deze periode bevat een dag die volledig volzet is.";

            return;
        }


        const difference =
            parseDate(end) -
            parseDate(start);


        const days =
            Math.floor(
                difference /
                (1000 * 60 * 60 * 24)
            );


        let price;


        if (
            bookingType.value === "daycare"
        ) {

            price =
                (days + 1) * 25;

        } else {

            const nights =
                Math.max(days, 1);

            price =
                nights * 35;
        }


        priceValue.textContent =
            `€${price}`;


        priceResult.hidden = false;


        bookingMessage.textContent =
            "De geselecteerde periode is geldig.";
    }
);