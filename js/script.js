import {
    saveReservation,
    loginWithGoogle,
    watchAuthState,
    sendReservationEmail,
    getAvailabilityForMonth,
    getAvailabilityBetween,
    getCustomerReservations
} from "./firebase.js";



/* =========================================================
   TECKELWEB ONLINE BOOKING
========================================================= */


/*
    Deze booking flow is opgebouwd als een
    echte lineaire reserveringsapp:

    0. Google-account
    1. Type opvang
    2. Hond
    3. Data
    4. Dienst
    5. Extra's
    6. Tijden + verzorging
    7. Controle
    8. Bevestiging
*/



/* =========================================================
   CONFIGURATIE
========================================================= */

const PRICES = {

    daycare:
        25,

    overnight:
        35,

    addons: {

        "extra-walk":
            8,

        "photo-update":
            3,

        "individual-play":
            7
    }
};



const ADDON_NAMES = {

    "extra-walk":
        "Extra wandeling",

    "photo-update":
        "Foto-update",

    "individual-play":
        "Individueel speelmoment"
};



const BOOKING_STEPS =
    7;



/* =========================================================
   ALGEMENE HTML ELEMENTEN
========================================================= */

const publicSite =
    document.getElementById(
        "public-site"
    );

const bookingApp =
    document.getElementById(
        "booking-app"
    );

const bookingCloseButton =
    document.getElementById(
        "booking-close"
    );

const finishBookingButton =
    document.getElementById(
        "finish-booking"
    );



/* =========================================================
   BOOKING NAVIGATIE
========================================================= */

const bookingScreens =
    Array.from(
        document.querySelectorAll(
            ".booking-step-screen"
        )
    );

const bookingNavigation =
    document.getElementById(
        "booking-navigation"
    );

const bookingBackButton =
    document.getElementById(
        "booking-back"
    );

const bookingNextButton =
    document.getElementById(
        "booking-next"
    );

const bookingProgressText =
    document.getElementById(
        "booking-progress-text"
    );

const bookingProgressFill =
    document.getElementById(
        "booking-progress-fill"
    );

const bookingFooterLabel =
    document.getElementById(
        "booking-footer-label"
    );

const bookingFooterValue =
    document.getElementById(
        "booking-footer-value"
    );



/* =========================================================
   GOOGLE
========================================================= */

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



/* =========================================================
   TYPE OPVANG
========================================================= */

const careTypeButtons =
    Array.from(
        document.querySelectorAll(
            ".booking-care-card"
        )
    );



/* =========================================================
   HOND
========================================================= */

const petsList =
    document.getElementById(
        "booking-pets-list"
    );

const showAddPetButton =
    document.getElementById(
        "show-add-pet"
    );

const addPetForm =
    document.getElementById(
        "booking-add-pet"
    );

const dogNameInput =
    document.getElementById(
        "dog-name"
    );

const dogBreedInput =
    document.getElementById(
        "dog-breed"
    );

const dogAgeInput =
    document.getElementById(
        "dog-age"
    );

const dogWeightInput =
    document.getElementById(
        "dog-weight"
    );

const dogNotesInput =
    document.getElementById(
        "dog-notes"
    );



/* =========================================================
   KALENDER
========================================================= */

const calendarGrid =
    document.getElementById(
        "calendar-grid"
    );

const calendarMonthTitle =
    document.getElementById(
        "calendar-month-title"
    );

const previousMonthButton =
    document.getElementById(
        "calendar-prev"
    );

const nextMonthButton =
    document.getElementById(
        "calendar-next"
    );

const selectedPeriod =
    document.getElementById(
        "selected-period"
    );

const bookingSummaryStart =
    document.getElementById(
        "booking-summary-start"
    );

const bookingSummaryEnd =
    document.getElementById(
        "booking-summary-end"
    );



/*
    Deze twee hidden inputs blijven bestaan
    voor compatibiliteit met onze database-
    structuur.
*/

const startDateInput =
    document.getElementById(
        "start-date"
    );

const endDateInput =
    document.getElementById(
        "end-date"
    );



/* =========================================================
   SERVICE
========================================================= */

const serviceOptions =
    Array.from(
        document.querySelectorAll(
            ".booking-service-option"
        )
    );

const serviceRadios =
    Array.from(
        document.querySelectorAll(
            'input[name="booking-type"]'
        )
    );



/* =========================================================
   EXTRA'S
========================================================= */

const addonInputs =
    Array.from(
        document.querySelectorAll(
            'input[name="booking-addon"]'
        )
    );

const skipAddonsButton =
    document.getElementById(
        "skip-addons"
    );



/* =========================================================
   TIJDEN + VERZORGING
========================================================= */

const arrivalTimeInput =
    document.getElementById(
        "arrival-time"
    );

const departureTimeInput =
    document.getElementById(
        "departure-time"
    );

const feedingFrequencyInput =
    document.getElementById(
        "feeding-frequency"
    );

const foodSourceInput =
    document.getElementById(
        "food-source"
    );

const feedingNotesInput =
    document.getElementById(
        "feeding-notes"
    );

const needsMedicationInput =
    document.getElementById(
        "needs-medication"
    );

const medicationFields =
    document.getElementById(
        "medication-fields"
    );

const medicationNotesInput =
    document.getElementById(
        "medication-notes"
    );

const bookingNotesInput =
    document.getElementById(
        "booking-notes"
    );



/* =========================================================
   KLANT
========================================================= */

const customerNameInput =
    document.getElementById(
        "customer-name"
    );

const customerEmailInput =
    document.getElementById(
        "customer-email"
    );

const customerPhoneInput =
    document.getElementById(
        "customer-phone"
    );

const bookingPolicyInput =
    document.getElementById(
        "booking-policy"
    );



/* =========================================================
   REVIEW
========================================================= */

const reviewDog =
    document.getElementById(
        "review-dog"
    );

const reviewService =
    document.getElementById(
        "review-service"
    );

const reviewDates =
    document.getElementById(
        "review-dates"
    );

const reviewTimes =
    document.getElementById(
        "review-times"
    );

const reviewAddons =
    document.getElementById(
        "review-addons"
    );

const priceValue =
    document.getElementById(
        "price-value"
    );

const submitBookingButton =
    document.getElementById(
        "submit-booking"
    );

const bookingMessage =
    document.getElementById(
        "booking-message"
    );

const confirmationSummary =
    document.getElementById(
        "confirmation-summary"
    );



/* =========================================================
   STATE
========================================================= */

let bookingGoogleUser =
    null;


let currentStep =
    0;


let displayedMonth =
    new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
    );


let availabilityData =
    {};


let knownPets =
    [];


let selectedKnownPetKey =
    null;



const bookingState = {

    careType:
        null,

    pet:
        null,

    daycareDates:
        [],

    boardingStart:
        null,

    boardingEnd:
        null,

    service:
        null,

    addons:
        [],

    totalPrice:
        0
};



/* =========================================================
   DATUM HELPERS
========================================================= */

function makeDateString(
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



function todayString() {

    const today =
        new Date();


    return makeDateString(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );
}



function formatDate(
    dateString
) {

    if (!dateString) {

        return "—";
    }


    return new Intl.DateTimeFormat(
        "nl-BE",
        {
            weekday:
                "short",

            day:
                "numeric",

            month:
                "short",

            year:
                "numeric"
        }
    ).format(
        parseDate(
            dateString
        )
    );
}



function formatShortDate(
    dateString
) {

    if (!dateString) {

        return "—";
    }


    return new Intl.DateTimeFormat(
        "nl-BE",
        {
            day:
                "numeric",

            month:
                "short"
        }
    ).format(
        parseDate(
            dateString
        )
    );
}



function differenceInDays(
    start,
    end
) {

    const milliseconds =
        parseDate(end)
        -
        parseDate(start);


    return Math.round(
        milliseconds /
        (
            1000 *
            60 *
            60 *
            24
        )
    );
}



/* =========================================================
   OPEN / SLUIT BOOKING APP
========================================================= */

async function openBooking(
    preselectedCareType = null
) {

    /*
        Als iemand op "Boek dagopvang"
        of "Boek overnachting" klikt,
        onthouden we dat.
    */

    if (
        preselectedCareType ===
        "daycare"
        ||
        preselectedCareType ===
        "boarding"
    ) {

        selectCareType(
            preselectedCareType
        );
    }


    publicSite.hidden =
        true;

    bookingApp.hidden =
        false;


    document.body.classList.add(
        "booking-open"
    );


    /*
        Ingelogde klant hoeft het
        login-scherm niet opnieuw te zien.
    */

    if (
        bookingGoogleUser
    ) {

        await setStep(
            1
        );

    } else {

        await setStep(
            0
        );
    }
}



function closeBooking() {

    bookingApp.hidden =
        true;

    publicSite.hidden =
        false;


    document.body.classList.remove(
        "booking-open"
    );


    window.scrollTo(
        {
            top:
                0,

            behavior:
                "smooth"
        }
    );
}



/* =========================================================
   OPEN BOOKING BUTTONS
========================================================= */

document
    .querySelectorAll(
        "[data-open-booking]"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    openBooking();
                }
            );
        }
    );



const mainOpenBookingButton =
    document.getElementById(
        "open-booking"
    );


if (
    mainOpenBookingButton
) {

    mainOpenBookingButton.addEventListener(
        "click",
        () => {

            openBooking();
        }
    );
}



/*
    Dienstknoppen op homepage.
*/

document
    .querySelectorAll(
        "[data-booking-type]"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    openBooking(
                        button.dataset
                            .bookingType
                    );
                }
            );
        }
    );



bookingCloseButton.addEventListener(
    "click",
    closeBooking
);



finishBookingButton.addEventListener(
    "click",
    () => {

        resetBooking();

        closeBooking();
    }
);



/* =========================================================
   GOOGLE ACCOUNT
========================================================= */

function updateGoogleAccount(
    user
) {

    bookingGoogleUser =
        user;


    if (
        !user ||
        !user.email
    ) {

        bookingGoogleEmail.textContent =
            "Nog niet ingelogd";


        bookingGoogleHelp.textContent =
            "Log in met Google om verder te gaan.";


        bookingGoogleLoginButton.textContent =
            "Doorgaan met Google";


        customerEmailInput.value =
            "";


        return;
    }



    const email =
        user.email
            .trim()
            .toLowerCase();


    bookingGoogleEmail.textContent =
        email;


    bookingGoogleHelp.textContent =
        "Dit account wordt gebruikt voor uw reservaties.";


    bookingGoogleLoginButton.textContent =
        "Ander Google-account";


    customerEmailInput.value =
        email;


    if (
        user.displayName
        &&
        !customerNameInput.value.trim()
    ) {

        customerNameInput.value =
            user.displayName;
    }


    /*
        Bestaande honden proberen ophalen
        uit vroegere reservaties.
    */

    loadKnownPets();
}



watchAuthState(
    user => {

        updateGoogleAccount(
            user
        );
    }
);



bookingGoogleLoginButton.addEventListener(
    "click",
    async () => {

        bookingMessage.textContent =
            "";


        bookingGoogleLoginButton.disabled =
            true;


        const originalText =
            bookingGoogleLoginButton
                .textContent;


        bookingGoogleLoginButton.textContent =
            "Google openen...";


        try {

            const user =
                await loginWithGoogle();


            updateGoogleAccount(
                user
            );


            /*
                Na succesvolle login
                meteen naar opvangkeuze.
            */

            await setStep(
                1
            );


        } catch (error) {

            console.error(
                "Google login mislukt:",
                error
            );


            if (
                error.code ===
                "auth/popup-closed-by-user"
            ) {

                bookingMessage.textContent =
                    "Het inloggen werd geannuleerd.";

            } else {

                bookingMessage.textContent =
                    "Inloggen met Google is mislukt.";
            }


        } finally {

            bookingGoogleLoginButton.disabled =
                false;


            if (
                !bookingGoogleUser
            ) {

                bookingGoogleLoginButton.textContent =
                    originalText;
            }
        }
    }
);



/* =========================================================
   BEKENDE HONDEN UIT RESERVATIEGESCHIEDENIS
========================================================= */

async function loadKnownPets() {

    if (
        !bookingGoogleUser
        ||
        !bookingGoogleUser.email
    ) {

        knownPets =
            [];

        renderKnownPets();

        return;
    }


    try {

        const reservations =
            await getCustomerReservations(
                bookingGoogleUser.email
            );


        const petMap =
            new Map();


        reservations.forEach(
            reservation => {

                const dog =
                    reservation.dog;


                if (
                    !dog?.name
                ) {

                    return;
                }


                const key =
                    [
                        dog.name
                            .trim()
                            .toLowerCase(),

                        dog.breed
                            ?.trim()
                            .toLowerCase()
                        ||
                        ""
                    ].join("|");


                if (
                    !petMap.has(
                        key
                    )
                ) {

                    petMap.set(
                        key,
                        {
                            key:
                                key,

                            name:
                                dog.name
                                || "",

                            breed:
                                dog.breed
                                || "",

                            age:
                                dog.age
                                ?? "",

                            weight:
                                dog.weight
                                ?? "",

                            notes:
                                dog.notes
                                || ""
                        }
                    );
                }
            }
        );


        knownPets =
            Array.from(
                petMap.values()
            );


        renderKnownPets();


    } catch (error) {

        console.error(
            "Bestaande honden ophalen mislukt:",
            error
        );


        knownPets =
            [];


        renderKnownPets();
    }
}



/* =========================================================
   HONDEN TONEN
========================================================= */

function renderKnownPets() {

    petsList.innerHTML =
        "";


    if (
        knownPets.length ===
        0
    ) {

        petsList.innerHTML = `
            <div class="booking-pets-empty">

                <span class="booking-pet-placeholder">
                    🐾
                </span>

                <strong>
                    Nog geen hond gevonden
                </strong>

                <p>
                    Voeg hieronder de gegevens
                    van uw hond toe.
                </p>

            </div>
        `;


        addPetForm.hidden =
            false;


        return;
    }



    knownPets.forEach(
        pet => {

            const card =
                document.createElement(
                    "button"
                );


            card.type =
                "button";


            card.className =
                "booking-pet-card";


            if (
                selectedKnownPetKey ===
                pet.key
            ) {

                card.classList.add(
                    "selected"
                );
            }


            card.innerHTML = `
                <span class="booking-pet-placeholder">
                    🐾
                </span>

                <span>

                    <strong>
                        ${escapeHtml(
                pet.name
            )}
                    </strong>

                    <small>
                        ${pet.breed
                    ? escapeHtml(
                        pet.breed
                    )
                    : "Hond"
                }
                    </small>

                </span>
            `;


            card.addEventListener(
                "click",
                () => {

                    selectKnownPet(
                        pet
                    );
                }
            );


            petsList.appendChild(
                card
            );
        }
    );
}



/* =========================================================
   BESTAANDE HOND SELECTEREN
========================================================= */

function selectKnownPet(
    pet
) {

    selectedKnownPetKey =
        pet.key;


    dogNameInput.value =
        pet.name
        || "";

    dogBreedInput.value =
        pet.breed
        || "";

    dogAgeInput.value =
        pet.age
        ?? "";

    dogWeightInput.value =
        pet.weight
        ?? "";

    dogNotesInput.value =
        pet.notes
        || "";


    capturePetForm();


    renderKnownPets();


    addPetForm.hidden =
        false;


    updateFooterSummary();
}



/* =========================================================
   NIEUWE HOND
========================================================= */

showAddPetButton.addEventListener(
    "click",
    () => {

        selectedKnownPetKey =
            null;


        clearPetForm();


        bookingState.pet =
            null;


        addPetForm.hidden =
            false;


        renderKnownPets();


        dogNameInput.focus();
    }
);



function clearPetForm() {

    dogNameInput.value =
        "";

    dogBreedInput.value =
        "";

    dogAgeInput.value =
        "";

    dogWeightInput.value =
        "";

    dogNotesInput.value =
        "";
}



/* =========================================================
   HOND FORMULIER → STATE
========================================================= */

function capturePetForm() {

    const ageValue =
        dogAgeInput.value
            .trim();


    const weightValue =
        dogWeightInput.value
            .trim();


    bookingState.pet = {

        name:
            dogNameInput.value
                .trim(),

        breed:
            dogBreedInput.value
                .trim(),

        age:
            ageValue
                ? Number(
                    ageValue
                )
                : null,

        weight:
            weightValue
                ? Number(
                    weightValue
                )
                : null,

        notes:
            dogNotesInput.value
                .trim()
    };


    updateFooterSummary();
}



/*
    Tijdens typen state blijven bijwerken.
*/

[
    dogNameInput,
    dogBreedInput,
    dogAgeInput,
    dogWeightInput,
    dogNotesInput
]
    .forEach(
        input => {

            input.addEventListener(
                "input",
                capturePetForm
            );
        }
    );



/* =========================================================
   TYPE OPVANG
========================================================= */

function selectCareType(
    careType
) {

    bookingState.careType =
        careType;


    careTypeButtons.forEach(
        button => {

            button.classList.toggle(
                "selected",
                button.dataset
                    .careType ===
                careType
            );
        }
    );


    /*
        Als type verandert, oude datumselectie
        wissen. Boarding en daycare werken
        namelijk anders.
    */

    bookingState.daycareDates =
        [];

    bookingState.boardingStart =
        null;

    bookingState.boardingEnd =
        null;


    startDateInput.value =
        "";

    endDateInput.value =
        "";


    updateDateSummary();

    configureServiceOptions();

    updateFooterSummary();
}



careTypeButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                selectCareType(
                    button.dataset
                        .careType
                );
            }
        );
    }
);



/* =========================================================
   SERVICE OPTIES
========================================================= */

function configureServiceOptions() {

    serviceOptions.forEach(
        option => {

            const serviceFor =
                option.dataset
                    .serviceFor;


            option.hidden =
                serviceFor !==
                bookingState.careType;
        }
    );


    /*
        Momenteel is er per care type één
        concrete service.

        Later kunnen hier bijvoorbeeld
        "halve dag", "premium boarding", ...
        bijkomen.
    */

    if (
        bookingState.careType ===
        "daycare"
    ) {

        const radio =
            document.querySelector(
                'input[name="booking-type"][value="daycare"]'
            );


        if (radio) {

            radio.checked =
                true;


            bookingState.service =
                "daycare";
        }

    } else if (
        bookingState.careType ===
        "boarding"
    ) {

        const radio =
            document.querySelector(
                'input[name="booking-type"][value="overnight"]'
            );


        if (radio) {

            radio.checked =
                true;


            bookingState.service =
                "overnight";
        }
    }
}



serviceRadios.forEach(
    radio => {

        radio.addEventListener(
            "change",
            () => {

                if (
                    radio.checked
                ) {

                    bookingState.service =
                        radio.value;


                    updateFooterSummary();
                }
            }
        );
    }
);



/* =========================================================
   AVAILABILITY LADEN
========================================================= */

async function loadAvailabilityForDisplayedMonth() {

    const year =
        displayedMonth.getFullYear();

    const month =
        displayedMonth.getMonth();


    try {

        const monthData =
            await getAvailabilityForMonth(
                year,
                month
            );


        /*
            Oude data van deze maand wissen.
        */

        const prefix =
            `${year}-${String(month + 1).padStart(2, "0")}-`;


        Object
            .keys(
                availabilityData
            )
            .forEach(
                date => {

                    if (
                        date.startsWith(
                            prefix
                        )
                    ) {

                        delete availabilityData[
                            date
                        ];
                    }
                }
            );


        Object.assign(
            availabilityData,
            monthData
        );


        return true;


    } catch (error) {

        console.error(
            "Beschikbaarheid laden mislukt:",
            error
        );


        bookingMessage.textContent =
            "De beschikbaarheid kon niet geladen worden.";


        return false;
    }
}



/* =========================================================
   STATUS VAN DAG
========================================================= */

function getAvailabilityStatus(
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



/* =========================================================
   KALENDER TEKENEN
========================================================= */

function renderCalendar() {

    calendarGrid.innerHTML =
        "";


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
        monthTitle
            .charAt(0)
            .toUpperCase()
        +
        monthTitle.slice(1);


    calendarMonthTitle.textContent =
        monthTitle;



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
        let i = 0;
        i < emptyCells;
        i++
    ) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "booking-calendar-empty";


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
            makeDateString(
                year,
                month,
                day
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
            `booking-calendar-day ${status}`;


        button.dataset.date =
            dateString;


        button.textContent =
            day;



        /*
            Geen verleden.
        */

        if (
            dateString <
            todayString()
        ) {

            button.disabled =
                true;


            button.classList.add(
                "past"
            );
        }



        /*
            Volzet kan niet gekozen worden.
        */

        if (
            status ===
            "full"
        ) {

            button.disabled =
                true;
        }



        applyDateSelectionClass(
            button,
            dateString
        );



        if (
            !button.disabled
        ) {

            button.addEventListener(
                "click",
                async () => {

                    await selectCalendarDate(
                        dateString
                    );
                }
            );
        }


        calendarGrid.appendChild(
            button
        );
    }
}



/* =========================================================
   SELECTIEKLASSEN KALENDER
========================================================= */

function applyDateSelectionClass(
    button,
    dateString
) {

    /*
        DAYCARE:

        meerdere individuele dagen,
        ook niet-aaneengesloten.
    */

    if (
        bookingState.careType ===
        "daycare"
    ) {

        if (
            bookingState
                .daycareDates
                .includes(
                    dateString
                )
        ) {

            button.classList.add(
                "selected"
            );
        }


        return;
    }



    /*
        BOARDING:

        check-in → check-out.
    */

    if (
        bookingState.careType !==
        "boarding"
    ) {

        return;
    }


    const start =
        bookingState
            .boardingStart;

    const end =
        bookingState
            .boardingEnd;


    if (!start) {

        return;
    }


    if (
        dateString ===
        start
    ) {

        button.classList.add(
            "range-start",
            "selected"
        );
    }


    if (
        end
        &&
        dateString ===
        end
    ) {

        button.classList.add(
            "range-end",
            "selected"
        );
    }


    if (
        end
        &&
        dateString > start
        &&
        dateString < end
    ) {

        button.classList.add(
            "in-range"
        );
    }
}



/* =========================================================
   DATUM AANKLIKKEN
========================================================= */

async function selectCalendarDate(
    dateString
) {

    bookingMessage.textContent =
        "";


    if (
        bookingState.careType ===
        "daycare"
    ) {

        toggleDaycareDate(
            dateString
        );


        renderCalendar();

        updateDateSummary();

        updateFooterSummary();


        return;
    }



    if (
        bookingState.careType ===
        "boarding"
    ) {

        await selectBoardingDate(
            dateString
        );


        return;
    }
}



/* =========================================================
   DAYCARE: LOSSE DAGEN
========================================================= */

function toggleDaycareDate(
    dateString
) {

    const index =
        bookingState
            .daycareDates
            .indexOf(
                dateString
            );


    if (
        index >=
        0
    ) {

        bookingState
            .daycareDates
            .splice(
                index,
                1
            );

    } else {

        bookingState
            .daycareDates
            .push(
                dateString
            );
    }



    bookingState
        .daycareDates
        .sort();



    const dates =
        bookingState
            .daycareDates;


    startDateInput.value =
        dates[0]
        ||
        "";


    endDateInput.value =
        dates[
        dates.length - 1
        ]
        ||
        "";
}



/* =========================================================
   BOARDING: CHECK-IN → CHECK-OUT
========================================================= */

async function selectBoardingDate(
    dateString
) {

    /*
        Geen start geselecteerd
        OF volledige range stond er al:

        → nieuwe selectie starten.
    */

    if (
        !bookingState.boardingStart
        ||
        bookingState.boardingEnd
    ) {

        bookingState.boardingStart =
            dateString;


        bookingState.boardingEnd =
            null;


        startDateInput.value =
            dateString;


        endDateInput.value =
            "";


        renderCalendar();

        updateDateSummary();

        updateFooterSummary();


        return;
    }



    let proposedStart =
        bookingState
            .boardingStart;


    let proposedEnd =
        dateString;



    /*
        Indien gebruiker vóór start klikt,
        draaien we de datums om.
    */

    if (
        proposedEnd <
        proposedStart
    ) {

        [
            proposedStart,
            proposedEnd
        ] =
            [
                proposedEnd,
                proposedStart
            ];
    }



    /*
        Een echte boarding moet minstens
        één nacht bevatten.
    */

    if (
        proposedStart ===
        proposedEnd
    ) {

        bookingMessage.textContent =
            "Kies voor een overnachting ook een vertrekdatum.";


        return;
    }



    /*
        Direct server controleren of
        volledige range beschikbaar is.
    */

    try {

        const containsFull =
            await boardingRangeContainsFullDay(
                proposedStart,
                proposedEnd
            );


        if (
            containsFull
        ) {

            bookingMessage.textContent =
                "In deze verblijfsperiode zit minstens één volzette dag.";


            return;
        }


    } catch (error) {

        console.error(
            "Beschikbaarheid controleren mislukt:",
            error
        );


        bookingMessage.textContent =
            "De beschikbaarheid kon niet gecontroleerd worden.";


        return;
    }



    bookingState.boardingStart =
        proposedStart;


    bookingState.boardingEnd =
        proposedEnd;


    startDateInput.value =
        proposedStart;


    endDateInput.value =
        proposedEnd;


    renderCalendar();

    updateDateSummary();

    updateFooterSummary();
}



/* =========================================================
   SERVER AVAILABILITY BOARDING
========================================================= */

async function boardingRangeContainsFullDay(
    start,
    end
) {

    const availability =
        await getAvailabilityBetween(
            start,
            end
        );


    return Object
        .values(
            availability
        )
        .some(
            day =>
                day.status ===
                "full"
        );
}



/* =========================================================
   SERVER AVAILABILITY DAYCARE
========================================================= */

async function selectedDaycareContainsFullDay() {

    const dates =
        bookingState
            .daycareDates;


    if (
        dates.length ===
        0
    ) {

        return false;
    }


    const first =
        dates[0];


    const last =
        dates[
        dates.length - 1
        ];


    const availability =
        await getAvailabilityBetween(
            first,
            last
        );


    return dates.some(
        date =>
            availability[
                date
            ]?.status ===
            "full"
    );
}



/* =========================================================
   DATUMSAMENVATTING
========================================================= */

function updateDateSummary() {

    if (
        bookingState.careType ===
        "daycare"
    ) {

        const dates =
            bookingState
                .daycareDates;


        if (
            dates.length ===
            0
        ) {

            selectedPeriod.textContent =
                "Nog geen datum gekozen";


            bookingSummaryStart.textContent =
                "—";


            bookingSummaryEnd.textContent =
                "—";


            return;
        }



        selectedPeriod.textContent =
            dates.length === 1
                ? "1 dag geselecteerd"
                : `${dates.length} dagen geselecteerd`;


        bookingSummaryStart.textContent =
            formatDate(
                dates[0]
            );


        if (
            dates.length ===
            1
        ) {

            bookingSummaryEnd.textContent =
                "Dezelfde dag";

        } else {

            bookingSummaryEnd.textContent =
                `${dates.length} losse dagen`;
        }


        return;
    }



    if (
        bookingState.careType ===
        "boarding"
    ) {

        const start =
            bookingState
                .boardingStart;


        const end =
            bookingState
                .boardingEnd;


        if (!start) {

            selectedPeriod.textContent =
                "Nog geen periode gekozen";


            bookingSummaryStart.textContent =
                "—";


            bookingSummaryEnd.textContent =
                "—";


            return;
        }



        bookingSummaryStart.textContent =
            formatDate(
                start
            );


        bookingSummaryEnd.textContent =
            end
                ? formatDate(
                    end
                )
                : "Kies vertrekdatum";


        if (!end) {

            selectedPeriod.textContent =
                "Kies nu de vertrekdatum";

        } else {

            const nights =
                differenceInDays(
                    start,
                    end
                );


            selectedPeriod.textContent =
                nights === 1
                    ? "1 nacht"
                    : `${nights} nachten`;
        }
    }
}



/* =========================================================
   MAAND NAVIGATIE
========================================================= */

previousMonthButton.addEventListener(
    "click",
    async () => {

        displayedMonth =
            new Date(
                displayedMonth.getFullYear(),
                displayedMonth.getMonth() - 1,
                1
            );


        await loadAvailabilityForDisplayedMonth();

        renderCalendar();
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


        await loadAvailabilityForDisplayedMonth();

        renderCalendar();
    }
);



/* =========================================================
   EXTRA'S
========================================================= */

function captureAddons() {

    bookingState.addons =
        addonInputs
            .filter(
                input =>
                    input.checked
            )
            .map(
                input =>
                    input.value
            );


    updateFooterSummary();
}



addonInputs.forEach(
    input => {

        input.addEventListener(
            "change",
            captureAddons
        );
    }
);



skipAddonsButton.addEventListener(
    "click",
    async () => {

        addonInputs.forEach(
            input => {

                input.checked =
                    false;
            }
        );


        captureAddons();


        await setStep(
            6
        );
    }
);



/* =========================================================
   MEDICATIE
========================================================= */

needsMedicationInput.addEventListener(
    "change",
    () => {

        medicationFields.hidden =
            !needsMedicationInput
                .checked;


        if (
            !needsMedicationInput.checked
        ) {

            medicationNotesInput.value =
                "";
        }
    }
);



/* =========================================================
   PRIJS
========================================================= */

function calculatePrice() {

    let basePrice =
        0;



    if (
        bookingState.careType ===
        "daycare"
    ) {

        basePrice =
            bookingState
                .daycareDates
                .length
            *
            PRICES.daycare;
    }



    if (
        bookingState.careType ===
        "boarding"
        &&
        bookingState.boardingStart
        &&
        bookingState.boardingEnd
    ) {

        const nights =
            differenceInDays(
                bookingState.boardingStart,
                bookingState.boardingEnd
            );


        basePrice =
            nights
            *
            PRICES.overnight;
    }



    let addonsPrice =
        0;


    bookingState
        .addons
        .forEach(
            addon => {

                addonsPrice +=
                    PRICES.addons[
                    addon
                    ]
                    ||
                    0;
            }
        );


    bookingState.totalPrice =
        basePrice
        +
        addonsPrice;


    return {

        base:
            basePrice,

        addons:
            addonsPrice,

        total:
            bookingState.totalPrice
    };
}



/* =========================================================
   REVIEW
========================================================= */

function renderReview() {

    capturePetForm();

    captureAddons();


    const price =
        calculatePrice();



    reviewDog.textContent =
        bookingState.pet?.name
        ||
        "—";



    reviewService.textContent =
        bookingState.careType ===
            "daycare"
            ? "Dagopvang"
            : "Overnachting";



    if (
        bookingState.careType ===
        "daycare"
    ) {

        const dates =
            bookingState.daycareDates;


        if (
            dates.length <=
            3
        ) {

            reviewDates.textContent =
                dates
                    .map(
                        formatShortDate
                    )
                    .join(", ");

        } else {

            reviewDates.textContent =
                `${dates.length} dagen geselecteerd`;
        }

    } else {

        reviewDates.textContent =
            `${formatShortDate(
                bookingState.boardingStart
            )} → ${formatShortDate(
                bookingState.boardingEnd
            )}`;
    }



    reviewTimes.textContent =
        `${arrivalTimeInput.value
        ||
        "—"
        } → ${departureTimeInput.value
        ||
        "—"
        }`;



    if (
        bookingState
            .addons
            .length ===
        0
    ) {

        reviewAddons.textContent =
            "Geen";

    } else {

        reviewAddons.textContent =
            bookingState
                .addons
                .map(
                    addon =>
                        ADDON_NAMES[
                        addon
                        ]
                        ||
                        addon
                )
                .join(", ");
    }



    priceValue.textContent =
        `€${price.total}`;



    /*
        Google-naam en e-mail alvast
        invullen.
    */

    if (
        bookingGoogleUser
    ) {

        customerEmailInput.value =
            bookingGoogleUser.email
                ?.trim()
                .toLowerCase()
            ||
            "";


        if (
            bookingGoogleUser.displayName
            &&
            !customerNameInput
                .value
                .trim()
        ) {

            customerNameInput.value =
                bookingGoogleUser
                    .displayName;
        }
    }


    updateFooterSummary();
}



/* =========================================================
   FOOTER SAMENVATTING
========================================================= */

function updateFooterSummary() {

    if (
        currentStep ===
        0
    ) {

        bookingFooterLabel.textContent =
            "Account";


        bookingFooterValue.textContent =
            bookingGoogleUser
                ? bookingGoogleUser.email
                : "Log in om te starten";


        return;
    }



    let label =
        "Reservatie";


    let value =
        "Nog niet volledig";


    if (
        bookingState.careType ===
        "daycare"
    ) {

        label =
            "Dagopvang";


        if (
            bookingState
                .daycareDates
                .length >
            0
        ) {

            value =
                `${bookingState
                    .daycareDates
                    .length
                } dag${bookingState
                    .daycareDates
                    .length === 1
                    ? ""
                    : "en"
                }`;
        }

    } else if (
        bookingState.careType ===
        "boarding"
    ) {

        label =
            "Overnachting";


        if (
            bookingState.boardingStart
            &&
            bookingState.boardingEnd
        ) {

            const nights =
                differenceInDays(
                    bookingState.boardingStart,
                    bookingState.boardingEnd
                );


            value =
                `${nights} nacht${nights === 1
                    ? ""
                    : "en"
                }`;
        }
    }



    if (
        bookingState.pet?.name
    ) {

        value +=
            ` · ${bookingState.pet.name
            }`;
    }


    bookingFooterLabel.textContent =
        label;


    bookingFooterValue.textContent =
        value;
}



/* =========================================================
   STAP TONEN
========================================================= */

async function setStep(
    step
) {

    currentStep =
        step;



    bookingScreens.forEach(
        screen => {

            const screenStep =
                Number(
                    screen.dataset
                        .step
                );


            screen.hidden =
                screenStep !==
                step;


            screen.classList.toggle(
                "active",
                screenStep ===
                step
            );
        }
    );



    /*
        Scroll nieuwe stap naar boven.
    */

    const bookingMain =
        document.querySelector(
            ".booking-app-main"
        );


    if (
        bookingMain
    ) {

        bookingMain.scrollTop =
            0;
    }



    /*
        Step-specifieke acties.
    */

    if (
        step ===
        2
    ) {

        await loadKnownPets();
    }



    if (
        step ===
        3
    ) {

        if (
            bookingState.boardingStart
        ) {

            const date =
                parseDate(
                    bookingState.boardingStart
                );


            displayedMonth =
                new Date(
                    date.getFullYear(),
                    date.getMonth(),
                    1
                );
        }


        if (
            bookingState.daycareDates
                .length >
            0
        ) {

            const date =
                parseDate(
                    bookingState
                        .daycareDates[0]
                );


            displayedMonth =
                new Date(
                    date.getFullYear(),
                    date.getMonth(),
                    1
                );
        }


        await loadAvailabilityForDisplayedMonth();


        renderCalendar();

        updateDateSummary();
    }



    if (
        step ===
        4
    ) {

        configureServiceOptions();
    }



    if (
        step ===
        7
    ) {

        renderReview();
    }



    updateBookingNavigation();

    updateFooterSummary();
}



/* =========================================================
   PROGRESS
========================================================= */

function updateBookingNavigation() {

    /*
        LOGIN
    */

    if (
        currentStep ===
        0
    ) {

        bookingProgressText.textContent =
            "Aanmelden";


        bookingProgressFill.style.width =
            "5%";


        bookingBackButton.disabled =
            true;


        bookingNextButton.hidden =
            false;


        bookingNextButton.textContent =
            "Verder";


        bookingNextButton.disabled =
            !bookingGoogleUser;


        bookingNavigation.hidden =
            false;


        return;
    }



    /*
        BEVESTIGING
    */

    if (
        currentStep ===
        8
    ) {

        bookingProgressText.textContent =
            "Voltooid";


        bookingProgressFill.style.width =
            "100%";


        bookingNavigation.hidden =
            true;


        return;
    }



    const progress =
        Math.min(
            100,
            (
                currentStep
                /
                BOOKING_STEPS
            )
            *
            100
        );


    bookingProgressText.textContent =
        `Stap ${currentStep} van ${BOOKING_STEPS}`;


    bookingProgressFill.style.width =
        `${progress}%`;


    bookingBackButton.disabled =
        false;


    bookingNavigation.hidden =
        false;



    /*
        Op reviewpagina staat de echte
        verzendknop in de kaart zelf.
    */

    if (
        currentStep ===
        7
    ) {

        bookingNextButton.hidden =
            true;

    } else {

        bookingNextButton.hidden =
            false;


        bookingNextButton.textContent =
            "Verder";
    }
}



/* =========================================================
   STAP VALIDATIE
========================================================= */

async function validateCurrentStep() {

    bookingMessage.textContent =
        "";



    /* LOGIN */

    if (
        currentStep ===
        0
    ) {

        if (
            !bookingGoogleUser
        ) {

            bookingMessage.textContent =
                "Log eerst in met Google.";


            return false;
        }


        return true;
    }



    /* TYPE OPVANG */

    if (
        currentStep ===
        1
    ) {

        if (
            !bookingState.careType
        ) {

            bookingMessage.textContent =
                "Kies eerst dagopvang of overnachting.";


            return false;
        }


        return true;
    }



    /* HOND */

    if (
        currentStep ===
        2
    ) {

        capturePetForm();


        if (
            !bookingState.pet?.name
        ) {

            bookingMessage.textContent =
                "Vul minstens de naam van uw hond in.";


            dogNameInput.focus();


            return false;
        }


        return true;
    }



    /* DATA */

    if (
        currentStep ===
        3
    ) {

        if (
            bookingState.careType ===
            "daycare"
        ) {

            if (
                bookingState
                    .daycareDates
                    .length ===
                0
            ) {

                bookingMessage.textContent =
                    "Selecteer minstens één dag voor de dagopvang.";


                return false;
            }


            try {

                if (
                    await selectedDaycareContainsFullDay()
                ) {

                    bookingMessage.textContent =
                        "Minstens één geselecteerde dag is ondertussen volzet.";


                    return false;
                }


            } catch (error) {

                console.error(
                    error
                );


                bookingMessage.textContent =
                    "De beschikbaarheid kon niet gecontroleerd worden.";


                return false;
            }


            return true;
        }



        if (
            bookingState.careType ===
            "boarding"
        ) {

            if (
                !bookingState.boardingStart
                ||
                !bookingState.boardingEnd
            ) {

                bookingMessage.textContent =
                    "Kies een aankomst- en vertrekdatum.";


                return false;
            }


            try {

                if (
                    await boardingRangeContainsFullDay(
                        bookingState.boardingStart,
                        bookingState.boardingEnd
                    )
                ) {

                    bookingMessage.textContent =
                        "De gekozen periode bevat een volzette dag.";


                    return false;
                }


            } catch (error) {

                console.error(
                    error
                );


                bookingMessage.textContent =
                    "De beschikbaarheid kon niet gecontroleerd worden.";


                return false;
            }


            return true;
        }
    }



    /* SERVICE */

    if (
        currentStep ===
        4
    ) {

        const service =
            document.querySelector(
                'input[name="booking-type"]:checked'
            );


        if (
            !service
        ) {

            bookingMessage.textContent =
                "Kies een opvangformule.";


            return false;
        }


        bookingState.service =
            service.value;


        return true;
    }



    /* EXTRA'S */

    if (
        currentStep ===
        5
    ) {

        captureAddons();


        return true;
    }



    /* TIJDEN + VERZORGING */

    if (
        currentStep ===
        6
    ) {

        const arrival =
            arrivalTimeInput.value;


        const departure =
            departureTimeInput.value;



        if (
            !arrival
            ||
            !departure
        ) {

            bookingMessage.textContent =
                "Kies een aankomst- en vertrekuur.";


            return false;
        }



        /*
            Bij dagopvang gebeurt aankomst
            en vertrek op dezelfde dag.
        */

        if (
            bookingState.careType ===
            "daycare"
            &&
            departure <=
            arrival
        ) {

            bookingMessage.textContent =
                "Het vertrekuur moet na het aankomstuur liggen.";


            return false;
        }



        if (
            needsMedicationInput.checked
            &&
            !medicationNotesInput
                .value
                .trim()
        ) {

            bookingMessage.textContent =
                "Geef de medicatie-instructies in.";


            medicationNotesInput.focus();


            return false;
        }


        return true;
    }



    return true;
}



/* =========================================================
   VOLGENDE / TERUG
========================================================= */

bookingNextButton.addEventListener(
    "click",
    async () => {

        const valid =
            await validateCurrentStep();


        if (!valid) {

            return;
        }


        if (
            currentStep <
            7
        ) {

            await setStep(
                currentStep + 1
            );
        }
    }
);



bookingBackButton.addEventListener(
    "click",
    async () => {

        if (
            currentStep <=
            0
        ) {

            return;
        }


        await setStep(
            currentStep - 1
        );
    }
);



/* =========================================================
   CONTACT VALIDATIE
========================================================= */

function validateCustomerDetails() {

    const name =
        customerNameInput
            .value
            .trim();


    const phone =
        customerPhoneInput
            .value
            .trim();


    const email =
        bookingGoogleUser
            ?.email
            ?.trim()
            .toLowerCase()
        ||
        "";


    if (
        !name
    ) {

        bookingMessage.textContent =
            "Vul uw naam in.";


        customerNameInput.focus();


        return false;
    }


    if (
        !phone
    ) {

        bookingMessage.textContent =
            "Vul uw telefoonnummer in.";


        customerPhoneInput.focus();


        return false;
    }


    if (
        !email
    ) {

        bookingMessage.textContent =
            "Er is geen geldig Google-account gekoppeld.";


        return false;
    }


    if (
        !bookingPolicyInput.checked
    ) {

        bookingMessage.textContent =
            "Ga eerst akkoord met de reservatievoorwaarden.";


        return false;
    }


    return true;
}



/* =========================================================
   LAATSTE AVAILABILITY CHECK
========================================================= */

async function finalAvailabilityCheck() {

    if (
        bookingState.careType ===
        "daycare"
    ) {

        return !(
            await selectedDaycareContainsFullDay()
        );
    }


    if (
        bookingState.careType ===
        "boarding"
    ) {

        return !(
            await boardingRangeContainsFullDay(
                bookingState.boardingStart,
                bookingState.boardingEnd
            )
        );
    }


    return false;
}



/* =========================================================
   RESERVATIE OBJECT MAKEN
========================================================= */

function buildReservation() {

    capturePetForm();

    captureAddons();

    calculatePrice();



    const email =
        bookingGoogleUser.email
            .trim()
            .toLowerCase();



    let startDate =
        "";


    let endDate =
        "";


    let dates =
        [];



    if (
        bookingState.careType ===
        "daycare"
    ) {

        dates =
            [
                ...bookingState
                    .daycareDates
            ];


        startDate =
            dates[0];


        endDate =
            dates[
            dates.length - 1
            ];

    } else {

        startDate =
            bookingState
                .boardingStart;


        endDate =
            bookingState
                .boardingEnd;
    }



    return {

        source:
            "online-booking",

        customer: {

            uid:
                bookingGoogleUser.uid,

            name:
                customerNameInput
                    .value
                    .trim(),

            email:
                email,

            phone:
                customerPhoneInput
                    .value
                    .trim()
        },


        dog: {

            name:
                bookingState.pet.name,

            breed:
                bookingState.pet.breed
                || "",

            age:
                bookingState.pet.age,

            weight:
                bookingState.pet.weight,

            notes:
                bookingState.pet.notes
                || ""
        },


        booking: {

            careType:
                bookingState.careType,

            type:
                bookingState.service,

            startDate:
                startDate,

            endDate:
                endDate,

            /*
                Voor daycare bewaren we de
                exacte losse dagen.

                Boarding gebruikt de range.
            */

            dates:
                dates,

            arrivalTime:
                arrivalTimeInput.value,

            departureTime:
                departureTimeInput.value,

            addons:
                [
                    ...bookingState
                        .addons
                ],

            feeding: {

                frequency:
                    feedingFrequencyInput
                        .value,

                source:
                    foodSourceInput
                        .value,

                notes:
                    feedingNotesInput
                        .value
                        .trim()
            },

            medication: {

                needed:
                    needsMedicationInput
                        .checked,

                notes:
                    needsMedicationInput
                        .checked
                        ? medicationNotesInput
                            .value
                            .trim()
                        : ""
            }
        },


        notes:
            bookingNotesInput
                .value
                .trim(),

        estimatedPrice:
            bookingState.totalPrice,

        price:
            `€${bookingState.totalPrice}`
    };
}



/* =========================================================
   RESERVATIE VERSTUREN
========================================================= */

submitBookingButton.addEventListener(
    "click",
    async () => {

        bookingMessage.textContent =
            "";



        if (
            !bookingGoogleUser
        ) {

            bookingMessage.textContent =
                "Uw sessie is verlopen. Log opnieuw in.";


            return;
        }



        if (
            !validateCustomerDetails()
        ) {

            return;
        }



        submitBookingButton.disabled =
            true;


        submitBookingButton.textContent =
            "Beschikbaarheid controleren...";



        /*
            Laatste servercontrole.
        */

        try {

            const stillAvailable =
                await finalAvailabilityCheck();


            if (
                !stillAvailable
            ) {

                bookingMessage.textContent =
                    "De geselecteerde periode is ondertussen niet meer beschikbaar.";


                submitBookingButton.disabled =
                    false;


                submitBookingButton.textContent =
                    "Reservatie aanvragen";


                return;
            }


        } catch (error) {

            console.error(
                "Laatste availability check mislukt:",
                error
            );


            bookingMessage.textContent =
                "De beschikbaarheid kon niet gecontroleerd worden.";


            submitBookingButton.disabled =
                false;


            submitBookingButton.textContent =
                "Reservatie aanvragen";


            return;
        }



        const reservation =
            buildReservation();



        submitBookingButton.textContent =
            "Reservatie versturen...";



        try {

            /*
                1. Firestore
            */

            const reservationId =
                await saveReservation(
                    reservation
                );


            console.log(
                "Reservatie opgeslagen:",
                reservationId
            );



            /*
                2. Mail.

                Een mailfout mag de reservatie
                zelf niet ongedaan maken.
            */

            try {

                await sendReservationEmail(
                    reservationId
                );


            } catch (emailError) {

                console.error(
                    "Reservatie opgeslagen, mail mislukt:",
                    emailError
                );
            }



            /*
                3. Confirmation scherm.
            */

            confirmationSummary.textContent =
                makeConfirmationSummary();


            await setStep(
                8
            );



        } catch (error) {

            console.error(
                "Reservatie opslaan mislukt:",
                error
            );


            bookingMessage.textContent =
                "De reservatie kon niet opgeslagen worden. Probeer opnieuw.";


            submitBookingButton.disabled =
                false;


            submitBookingButton.textContent =
                "Reservatie aanvragen";
        }
    }
);



/* =========================================================
   CONFIRMATION TEXT
========================================================= */

function makeConfirmationSummary() {

    const dog =
        bookingState.pet
            ?.name
        ||
        "Uw hond";


    if (
        bookingState.careType ===
        "daycare"
    ) {

        const count =
            bookingState
                .daycareDates
                .length;


        return (
            `${dog} · `
            +
            `${count} dag${count === 1
                ? ""
                : "en"
            } dagopvang`
        );
    }



    const nights =
        differenceInDays(
            bookingState.boardingStart,
            bookingState.boardingEnd
        );


    return (
        `${dog} · `
        +
        `${nights} nacht${nights === 1
            ? ""
            : "en"
        }`
    );
}



/* =========================================================
   RESET BOOKING
========================================================= */

function resetBooking() {

    currentStep =
        0;


    bookingState.careType =
        null;


    bookingState.pet =
        null;


    bookingState.daycareDates =
        [];


    bookingState.boardingStart =
        null;


    bookingState.boardingEnd =
        null;


    bookingState.service =
        null;


    bookingState.addons =
        [];


    bookingState.totalPrice =
        0;


    selectedKnownPetKey =
        null;



    /* Hond */

    clearPetForm();



    /* Datum */

    startDateInput.value =
        "";

    endDateInput.value =
        "";


    updateDateSummary();



    /* Services */

    serviceRadios.forEach(
        radio => {

            radio.checked =
                false;
        }
    );



    /* Addons */

    addonInputs.forEach(
        input => {

            input.checked =
                false;
        }
    );



    /* Tijden */

    arrivalTimeInput.value =
        "";

    departureTimeInput.value =
        "";



    /* Verzorging */

    feedingFrequencyInput.value =
        "";

    foodSourceInput.value =
        "";

    feedingNotesInput.value =
        "";

    needsMedicationInput.checked =
        false;

    medicationFields.hidden =
        true;

    medicationNotesInput.value =
        "";

    bookingNotesInput.value =
        "";



    /* Klant */

    customerPhoneInput.value =
        "";

    bookingPolicyInput.checked =
        false;



    if (
        bookingGoogleUser
    ) {

        customerEmailInput.value =
            bookingGoogleUser.email
                ?.trim()
                .toLowerCase()
            ||
            "";


        customerNameInput.value =
            bookingGoogleUser
                .displayName
            ||
            "";

    } else {

        customerEmailInput.value =
            "";

        customerNameInput.value =
            "";
    }



    submitBookingButton.disabled =
        false;


    submitBookingButton.textContent =
        "Reservatie aanvragen";


    bookingMessage.textContent =
        "";


    renderKnownPets();

    updateFooterSummary();
}



/* =========================================================
   HTML ESCAPEN
========================================================= */

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



/* =========================================================
   INIT
========================================================= */

async function initialiseWebsite() {

    /*
        Booking-app begint verborgen.
    */

    bookingApp.hidden =
        true;


    publicSite.hidden =
        false;



    /*
        Kalender start op huidige maand.
    */

    const today =
        new Date();


    displayedMonth =
        new Date(
            today.getFullYear(),
            today.getMonth(),
            1
        );


    await loadAvailabilityForDisplayedMonth();


    renderCalendar();

    updateDateSummary();

    updateBookingNavigation();

    updateFooterSummary();
}



initialiseWebsite();