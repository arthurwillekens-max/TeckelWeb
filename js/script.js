import {
    saveReservation,
    loginWithGoogle,
    watchAuthState
} from "./firebase.js";
/* =========================================
   TECKELWEB
   KALENDER + RESERVATIE
========================================= */


/* -----------------------------------------
   BESCHIKBAARHEID

   Later komt dit uit Firebase.
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

    "2026-09-05": {
        status: "Volzet",
        type: "full",
        times: []
    },

    "2026-09-06": {
        status: "Volzet",
        type: "full",
        times: []
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

    "2026-09-19": {
        status: "Volzet",
        type: "full",
        times: []
    },

    "2026-09-20": {
        status: "Volzet",
        type: "full",
        times: []
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
   HTML-ELEMENTEN
----------------------------------------- */

/* Kalender */

const calendarGrid =
    document.getElementById("calendar-grid");

const calendarMonthTitle =
    document.getElementById("calendar-month-title");

const previousMonthButton =
    document.getElementById("calendar-prev");

const nextMonthButton =
    document.getElementById("calendar-next");


/* Detailpaneel */

const selectedDateTitle =
    document.getElementById("selected-date");

const dayStatus =
    document.querySelector(".day-status");

const timeSlots =
    document.querySelector(".time-slots");


/* Reservatie */

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


/* Prijs */

const calculateButton =
    document.getElementById("calculate-price");

const bookingMessage =
    document.getElementById("booking-message");

const priceResult =
    document.getElementById("price-result");

const priceValue =
    document.getElementById("price-value");


/* Nieuwe klantgegevens */

const bookingDetails =
    document.getElementById("booking-details");

const submitBookingButton =
    document.getElementById("submit-booking");

const customerNameInput =
    document.getElementById("customer-name");

const customerEmailInput =
    document.getElementById("customer-email");

const customerPhoneInput =
    document.getElementById("customer-phone");

const dogNameInput =
    document.getElementById("dog-name");

const bookingNotesInput =
    document.getElementById("booking-notes");
/* -----------------------------------------
   GOOGLE-ACCOUNT BIJ RESERVATIE
----------------------------------------- */

const bookingGoogleEmail =
    document.getElementById(
        "booking-google-email"
    );

const bookingGoogleHelp =
    document.getElementById(
        "booking-google-help"
    );

const bookingGoogleLoginButton =
    document.getElementById(
        "booking-google-login"
    );


/*
    Hier bewaren we de momenteel
    ingelogde Firebase-gebruiker.
*/

let bookingGoogleUser = null;
/* =========================================
   GOOGLE-ACCOUNT IN RESERVATIEFORMULIER
========================================= */

function updateBookingGoogleAccount(
    user
) {

    bookingGoogleUser =
        user;


    /*
        NIET INGELOGD
    */

    if (
        !user ||
        !user.email
    ) {

        bookingGoogleEmail.textContent =
            "Nog niet gekoppeld";


        bookingGoogleHelp.textContent =
            "Log in met het Google-account waarmee u later uw reservaties wilt bekijken.";


        bookingGoogleLoginButton.textContent =
            "Doorgaan met Google";


        customerEmailInput.value =
            "";


        customerEmailInput.readOnly =
            true;


        return;
    }


    /*
        WEL INGELOGD
    */

    const email =
        user.email
            .trim()
            .toLowerCase();


    bookingGoogleEmail.textContent =
        email;


    bookingGoogleHelp.textContent =
        "Dit account wordt aan uw reservatie gekoppeld.";


    bookingGoogleLoginButton.textContent =
        "Ander Google-account";


    /*
        Google e-mailadres automatisch
        in het reservatieformulier zetten.
    */

    customerEmailInput.value =
        email;


    customerEmailInput.readOnly =
        true;


    /*
        Naam van Google automatisch invullen.

        De klant mag zijn naam daarna nog
        zelf aanpassen indien nodig.
    */

    if (
        user.displayName &&
        !customerNameInput.value.trim()
    ) {

        customerNameInput.value =
            user.displayName;
    }
}



/* -----------------------------------------
   FIREBASE LOGINSTATUS VOLGEN
----------------------------------------- */

watchAuthState(
    user => {

        updateBookingGoogleAccount(
            user
        );
    }
);



/* -----------------------------------------
   GOOGLE-ACCOUNT KIEZEN / WISSELEN
----------------------------------------- */

bookingGoogleLoginButton.addEventListener(
    "click",
    async () => {

        bookingMessage.textContent =
            "";


        bookingGoogleLoginButton.disabled =
            true;


        const originalText =
            bookingGoogleLoginButton.textContent;


        bookingGoogleLoginButton.textContent =
            "Google openen...";


        try {

            /*
                firebase.js gebruikt:
                prompt: "select_account"

                Daardoor kan de gebruiker ook
                een ander Google-account kiezen.
            */

            await loginWithGoogle();


        } catch (error) {

            console.error(
                "Google-login bij reservatie mislukt:",
                error
            );


            if (
                error.code ===
                "auth/popup-closed-by-user"
            ) {

                bookingMessage.textContent =
                    "Het Google-inloggen werd geannuleerd.";

            } else {

                bookingMessage.textContent =
                    "Inloggen met Google is mislukt.";
            }

        } finally {

            bookingGoogleLoginButton.disabled =
                false;


            /*
                watchAuthState past de tekst
                automatisch aan indien login
                succesvol was.
            */

            if (!bookingGoogleUser) {

                bookingGoogleLoginButton.textContent =
                    originalText;
            }
        }
    }
);

/* -----------------------------------------
   HUIDIGE MAAND
----------------------------------------- */

const today = new Date();

let displayedMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
);



/* -----------------------------------------
   GESELECTEERDE PERIODE
----------------------------------------- */

let rangeStart = null;
let rangeEnd = null;

let isDragging = false;

let calendarDays = [];



/* -----------------------------------------
   DATUM HULPFUNCTIES
----------------------------------------- */

function parseDate(dateString) {

    const [year, month, day] =
        dateString.split("-").map(Number);

    return new Date(
        year,
        month - 1,
        day
    );
}



function makeDateString(year, month, day) {

    const formattedMonth =
        String(month + 1).padStart(2, "0");

    const formattedDay =
        String(day).padStart(2, "0");


    return `${year}-${formattedMonth}-${formattedDay}`;
}



function formatDate(dateString) {

    const date =
        parseDate(dateString);


    return new Intl.DateTimeFormat(
        "nl-BE",
        {
            weekday: "long",
            day: "numeric",
            month: "long"
        }
    ).format(date);
}



function formatShortDate(dateString) {

    return new Intl.DateTimeFormat(
        "nl-BE",
        {
            day: "numeric",
            month: "short"
        }
    ).format(
        parseDate(dateString)
    );
}



/* -----------------------------------------
   STATUS VAN EEN DAG
----------------------------------------- */

function getDayData(dateString) {

    if (dayData[dateString]) {
        return dayData[dateString];
    }


    return {
        status: "Beschikbaar",
        type: "available",
        times: defaultAvailableTimes
    };
}



/* -----------------------------------------
   KALENDER GENEREREN
----------------------------------------- */

function renderCalendar() {

    const year =
        displayedMonth.getFullYear();

    const month =
        displayedMonth.getMonth();


    /* Titel */

    let monthTitle =
        new Intl.DateTimeFormat(
            "nl-BE",
            {
                month: "long",
                year: "numeric"
            }
        ).format(displayedMonth);


    monthTitle =
        monthTitle.charAt(0).toUpperCase()
        + monthTitle.slice(1);


    calendarMonthTitle.textContent =
        monthTitle;


    /* Oude kalender leegmaken */

    calendarGrid.innerHTML = "";


    /*
        JavaScript:
        zondag = 0
        maandag = 1

        Onze kalender:
        maandag = eerste kolom
    */

    const firstDay =
        new Date(year, month, 1).getDay();

    const emptyCells =
        (firstDay + 6) % 7;


    /* Lege vakken vóór dag 1 */

    for (
        let i = 0;
        i < emptyCells;
        i++
    ) {

        const empty =
            document.createElement("div");

        empty.className =
            "calendar-empty";

        calendarGrid.appendChild(empty);
    }


    /* Aantal dagen */

    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    /* Kalenderdagen maken */

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


        const data =
            getDayData(dateString);


        const button =
            document.createElement("button");


        button.type = "button";

        button.className =
            `calendar-day ${data.type}`;

        button.dataset.date =
            dateString;

        button.textContent =
            day;


        if (data.type === "full") {
            button.disabled = true;
        }


        calendarGrid.appendChild(button);
    }


    /* Nieuwe kalenderdagen ophalen */

    calendarDays =
        Array.from(
            calendarGrid.querySelectorAll(
                ".calendar-day"
            )
        );


    addCalendarEvents();

    drawRange();
}



/* -----------------------------------------
   DETAILPANEEL
----------------------------------------- */

function showTimeSlots(times) {

    timeSlots.innerHTML = "";


    times.forEach(
        ([time, available]) => {

            const slot =
                document.createElement("div");


            slot.className =
                available
                    ? "time-slot available-time"
                    : "time-slot unavailable-time";


            slot.innerHTML = `
                <div>
                    <strong>${time}</strong>

                    <span>
                        ${available
                    ? "Beschikbaar"
                    : "Niet beschikbaar"
                }
                    </span>
                </div>
            `;


            timeSlots.appendChild(slot);
        }
    );
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


    dayStatus.textContent =
        text;
}



function showDayDetails(dateString) {

    const data =
        getDayData(dateString);


    selectedDateTitle.textContent =
        formatDate(dateString);


    updateStatus(
        data.type,
        data.status
    );


    if (data.type === "full") {

        timeSlots.innerHTML = `
            <div class="time-slot unavailable-time">
                <div>
                    <strong>
                        Deze dag is volzet
                    </strong>
                </div>
            </div>
        `;

        return;
    }


    showTimeSlots(data.times);
}



/* -----------------------------------------
   RANGE TONEN
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
        parseDate(
            rangeEnd || rangeStart
        );


    const first =
        start <= end
            ? start
            : end;

    const last =
        start <= end
            ? end
            : start;


    calendarDays.forEach(day => {

        const current =
            parseDate(
                day.dataset.date
            );


        if (
            current >= first &&
            current <= last
        ) {

            day.classList.add(
                "in-range"
            );
        }
    });


    const firstString =
        makeDateString(
            first.getFullYear(),
            first.getMonth(),
            first.getDate()
        );


    const lastString =
        makeDateString(
            last.getFullYear(),
            last.getMonth(),
            last.getDate()
        );


    const firstElement =
        calendarGrid.querySelector(
            `[data-date="${firstString}"]`
        );


    const lastElement =
        calendarGrid.querySelector(
            `[data-date="${lastString}"]`
        );


    if (firstElement) {

        firstElement.classList.add(
            "range-start",
            "selected"
        );
    }


    if (lastElement) {

        lastElement.classList.add(
            "range-end",
            "selected"
        );
    }
}



/* -----------------------------------------
   VOLLE DAG IN PERIODE?
----------------------------------------- */

function rangeContainsFullDay(
    startString,
    endString
) {

    let current =
        parseDate(startString);

    const end =
        parseDate(endString);


    const first =
        current <= end
            ? current
            : end;

    const last =
        current <= end
            ? end
            : current;


    current =
        new Date(first);


    while (current <= last) {

        const dateString =
            makeDateString(
                current.getFullYear(),
                current.getMonth(),
                current.getDate()
            );


        if (
            getDayData(dateString).type
            === "full"
        ) {

            return true;
        }


        current.setDate(
            current.getDate() + 1
        );
    }


    return false;
}



/* -----------------------------------------
   BEREKENDE GEGEVENS OPNIEUW VERBERGEN
----------------------------------------- */

function resetCalculatedBooking() {

    priceResult.hidden = true;

    if (bookingDetails) {
        bookingDetails.hidden = true;
    }


    bookingMessage.textContent = "";
}



/* -----------------------------------------
   FORMULIER BIJWERKEN
----------------------------------------- */

function updateBookingFields() {

    if (!rangeStart) {
        return;
    }


    let first =
        rangeStart;

    let last =
        rangeEnd || rangeStart;


    if (
        parseDate(first) >
        parseDate(last)
    ) {

        [first, last] =
            [last, first];
    }


    startDateInput.value =
        first;

    endDateInput.value =
        last;


    selectedPeriod.textContent =
        `${formatShortDate(first)} → ${formatShortDate(last)}`;


    resetCalculatedBooking();
}



/* -----------------------------------------
   SELECTIE STARTEN
----------------------------------------- */

function startSelection(day) {

    if (
        day.classList.contains("full")
    ) {
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


    if (
        day.classList.contains("full")
    ) {
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
   EVENTS OP KALENDER
----------------------------------------- */

function addCalendarEvents() {

    calendarDays.forEach(day => {

        if (
            day.classList.contains("full")
        ) {
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
}



document.addEventListener(
    "mouseup",
    () => {

        isDragging = false;
    }
);



/* -----------------------------------------
   VORIGE MAAND
----------------------------------------- */

previousMonthButton.addEventListener(
    "click",
    () => {

        displayedMonth =
            new Date(
                displayedMonth.getFullYear(),
                displayedMonth.getMonth() - 1,
                1
            );


        renderCalendar();
    }
);



/* -----------------------------------------
   VOLGENDE MAAND
----------------------------------------- */

nextMonthButton.addEventListener(
    "click",
    () => {

        displayedMonth =
            new Date(
                displayedMonth.getFullYear(),
                displayedMonth.getMonth() + 1,
                1
            );


        renderCalendar();
    }
);



/* -----------------------------------------
   DATUMVELDEN → KALENDER
----------------------------------------- */

function syncInputsToCalendar() {

    const start =
        startDateInput.value;

    const end =
        endDateInput.value;


    if (!start) {
        return;
    }


    rangeStart =
        start;

    rangeEnd =
        end || start;


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


    const startDate =
        parseDate(start);


    displayedMonth =
        new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            1
        );


    renderCalendar();

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
   ALS UREN OF TYPE WIJZIGEN:
   PRIJS OPNIEUW LATEN CONTROLEREN
----------------------------------------- */

arrivalTimeInput.addEventListener(
    "change",
    resetCalculatedBooking
);


departureTimeInput.addEventListener(
    "change",
    resetCalculatedBooking
);


document
    .querySelectorAll(
        'input[name="booking-type"]'
    )
    .forEach(radio => {

        radio.addEventListener(
            "change",
            resetCalculatedBooking
        );
    });



/* -----------------------------------------
   PRIJS BEREKENEN
----------------------------------------- */

calculateButton.addEventListener(
    "click",
    () => {

        bookingMessage.textContent = "";

        priceResult.hidden = true;

        if (bookingDetails) {
            bookingDetails.hidden = true;
        }


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


        /* Alles ingevuld? */

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


        /* Einddatum geldig? */

        if (
            parseDate(end) <
            parseDate(start)
        ) {

            bookingMessage.textContent =
                "De einddatum kan niet vóór de startdatum liggen.";

            return;
        }


        /* Volle dagen? */

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


        /* Aantal dagen */

        const difference =
            parseDate(end)
            - parseDate(start);


        const days =
            Math.floor(
                difference /
                (1000 * 60 * 60 * 24)
            );


        let price;


        /* Voorlopige testprijzen */

        if (
            bookingType.value
            === "daycare"
        ) {

            price =
                (days + 1) * 25;

        } else {

            const nights =
                Math.max(days, 1);

            price =
                nights * 35;
        }


        /* Prijs tonen */

        priceValue.textContent =
            `€${price}`;


        priceResult.hidden = false;


        /* Stap 2 tonen */

        if (bookingDetails) {
            bookingDetails.hidden = false;
        }


        bookingMessage.textContent =
            "De geselecteerde periode is geldig.";
    }
);



/* -----------------------------------------
   RESERVATIEGEGEVENS CONTROLEREN

   Nog GEEN Firebase.
----------------------------------------- */

if (submitBookingButton) {

    submitBookingButton.addEventListener(
        "click",
        async () => {

            bookingMessage.textContent =
                "";


            /* -------------------------------------
               GOOGLE LOGIN VERPLICHT
            ------------------------------------- */

            if (
                !bookingGoogleUser ||
                !bookingGoogleUser.email
            ) {

                bookingMessage.textContent =
                    "Log eerst in met Google zodat uw reservatie aan uw account gekoppeld kan worden.";


                return;
            }


            /*
                E-mailadres komt rechtstreeks
                van Firebase Authentication.
            
                Dus NIET van een handmatig tekstveld.
            */

            const email =
                bookingGoogleUser.email
                    .trim()
                    .toLowerCase();


            const name =
                customerNameInput.value.trim();

            const phone =
                customerPhoneInput.value.trim();

            const dogName =
                dogNameInput.value.trim();

            const notes =
                bookingNotesInput.value.trim();


            /* Verplichte velden */

            if (
                !name ||
                !phone ||
                !dogName
            ) {

                bookingMessage.textContent =
                    "Vul eerst alle verplichte gegevens in.";

                return;
            }


            /*
                Voor de zekerheid het veld opnieuw
                gelijkzetten aan Google.
            */

            customerEmailInput.value =
                email;


            /* E-mail controleren */

            if (
                !email.includes("@") ||
                !email.includes(".")
            ) {

                bookingMessage.textContent =
                    "Vul een geldig e-mailadres in.";

                return;
            }


            /* Reservatie maken */

            const reservation = {

                customer: {
                    uid: bookingGoogleUser.uid,
                    name: name,
                    email: email,
                    phone: phone
                },

                dog: {
                    name: dogName
                },

                booking: {
                    startDate:
                        startDateInput.value,

                    endDate:
                        endDateInput.value,

                    arrivalTime:
                        arrivalTimeInput.value,

                    departureTime:
                        departureTimeInput.value,

                    type:
                        document.querySelector(
                            'input[name="booking-type"]:checked'
                        )?.value || ""
                },

                notes: notes,

                price:
                    priceValue.textContent

            };


            /* Knop tijdelijk blokkeren */

            submitBookingButton.disabled = true;

            submitBookingButton.textContent =
                "Reservatie versturen...";


            try {

                const reservationId =
                    await saveReservation(
                        reservation
                    );


                console.log(
                    "Reservatie opgeslagen:",
                    reservationId
                );


                bookingMessage.textContent =
                    `Uw reservatieaanvraag werd succesvol verstuurd. 
                    U kunt ze later bekijken via "Mijn reservaties" 
                    met het Google-account van ${email}.`;

                submitBookingButton.textContent =
                    "Reservatie verstuurd";


            } catch (error) {

                console.error(
                    "Fout bij opslaan:",
                    error
                );


                bookingMessage.textContent =
                    "Er ging iets mis. Probeer opnieuw.";


                submitBookingButton.disabled = false;

                submitBookingButton.textContent =
                    "Reservatie aanvragen";
            }

        }
    );
}


/* -----------------------------------------
   WEBSITE STARTEN
----------------------------------------- */

renderCalendar();


const todayString =
    makeDateString(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );


showDayDetails(todayString);