import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    doc,
    updateDoc,
    setDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    getIdToken
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


/* =========================================
   FIREBASE CONFIG
========================================= */

const firebaseConfig = {
    apiKey: "AIzaSyBIvAp40mYiAi9mB2P7CQG8Lw5xQ8m85hE",
    authDomain: "teckelweb.firebaseapp.com",
    projectId: "teckelweb",
    storageBucket: "teckelweb.firebasestorage.app",
    messagingSenderId: "710164290013",
    appId: "1:710164290013:web:b0a4e6613dc4b3605e3e34"
};


/* =========================================
   FIREBASE STARTEN
========================================= */

const app =
    initializeApp(firebaseConfig);

const db =
    getFirestore(app);

const auth =
    getAuth(app);


/* =========================================
   GOOGLE AUTHENTICATION
========================================= */

const googleProvider =
    new GoogleAuthProvider();

/* =========================================
   CLOUDFLARE MAIL WORKER
========================================= */

const MAIL_WORKER_URL =
    "https://teckelweb-mailer.arthurwillekens.workers.dev";


/*
    Laat bij een nieuwe login altijd toe
    om een Google-account te kiezen.
*/

googleProvider.setCustomParameters({
    prompt: "select_account"
});



/* =========================================
   RESERVATIE OPSLAAN
========================================= */

export async function saveReservation(
    reservation
) {

    const docRef =
        await addDoc(
            collection(
                db,
                "reservations"
            ),
            {
                ...reservation,

                status:
                    "pending",

                createdAt:
                    serverTimestamp()
            }
        );


    return docRef.id;
}



/* =========================================
   ADMIN: ALLE RESERVATIES OPHALEN
========================================= */

export async function getReservations() {

    const reservationsQuery =
        query(
            collection(
                db,
                "reservations"
            ),
            orderBy(
                "createdAt",
                "desc"
            )
        );


    const snapshot =
        await getDocs(
            reservationsQuery
        );


    return snapshot.docs.map(
        document => {

            return {
                id:
                    document.id,

                ...document.data()
            };
        }
    );
}



/* =========================================
   KLANT: EIGEN RESERVATIES OPHALEN
========================================= */

export async function getCustomerReservations(
    email
) {

    const normalizedEmail =
        email
            .trim()
            .toLowerCase();


    const reservationsQuery =
        query(
            collection(
                db,
                "reservations"
            ),

            where(
                "customer.email",
                "==",
                normalizedEmail
            )
        );


    const snapshot =
        await getDocs(
            reservationsQuery
        );


    const reservations =
        snapshot.docs.map(
            document => {

                return {
                    id:
                        document.id,

                    ...document.data()
                };
            }
        );


    /*
        Nieuwste eerst.
    */

    reservations.sort(
        (a, b) => {

            const dateA =
                a.createdAt
                    ?.toMillis?.() || 0;

            const dateB =
                b.createdAt
                    ?.toMillis?.() || 0;


            return (
                dateB -
                dateA
            );
        }
    );


    return reservations;
}



/* =========================================
   KLANT: RESERVATIE ANNULEREN
========================================= */

export async function cancelCustomerReservation(
    reservationId
) {

    const reservationRef =
        doc(
            db,
            "reservations",
            reservationId
        );


    await updateDoc(
        reservationRef,
        {
            status:
                "cancelled"
        }
    );
}



/* =========================================
   ADMIN: STATUS AANPASSEN
========================================= */

export async function updateReservationStatus(
    reservationId,
    newStatus
) {

    const allowedStatuses = [
        "pending",
        "accepted",
        "rejected",
        "cancelled"
    ];


    if (
        !allowedStatuses.includes(
            newStatus
        )
    ) {

        throw new Error(
            "Ongeldige reservatiestatus."
        );
    }


    const reservationRef =
        doc(
            db,
            "reservations",
            reservationId
        );


    await updateDoc(
        reservationRef,
        {
            status:
                newStatus,

            statusUpdatedAt:
                serverTimestamp()
        }
    );
}
/* =========================================
   BESCHIKBAARHEID
========================================= */

/*
    In Firestore bewaren we alleen uitzonderingen.

    Geen document:
        → beschikbaar

    Document met:
        status = "limited"
        → beperkt beschikbaar

    Document met:
        status = "full"
        → volzet

    Als admin een dag opnieuw op
    "available" zet, verwijderen we
    het Firestore-document opnieuw.
*/


/* -----------------------------------------
   BESCHIKBAARHEID VAN EEN MAAND
----------------------------------------- */

export async function getAvailabilityForMonth(
    year,
    month
) {

    /*
        month:
        JavaScript gebruikt 0 = januari,
        1 = februari, ...
    */

    const monthNumber =
        String(
            month + 1
        ).padStart(
            2,
            "0"
        );


    const startDate =
        `${year}-${monthNumber}-01`;


    const lastDay =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    const endDate =
        `${year}-${monthNumber}-${String(lastDay).padStart(2, "0")}`;


    return getAvailabilityBetween(
        startDate,
        endDate
    );
}



/* -----------------------------------------
   BESCHIKBAARHEID TUSSEN TWEE DATUMS
----------------------------------------- */

export async function getAvailabilityBetween(
    startDate,
    endDate
) {

    const availabilityQuery =
        query(
            collection(
                db,
                "availability"
            ),

            where(
                "date",
                ">=",
                startDate
            ),

            where(
                "date",
                "<=",
                endDate
            ),

            orderBy(
                "date",
                "asc"
            )
        );


    const snapshot =
        await getDocs(
            availabilityQuery
        );


    const availability =
        {};


    snapshot.docs.forEach(
        document => {

            const data =
                document.data();


            availability[
                document.id
            ] = {

                date:
                    data.date,

                status:
                    data.status
            };
        }
    );


    return availability;
}



/* -----------------------------------------
   ADMIN: STATUS VAN DAG OPSLAAN
----------------------------------------- */

export async function saveAvailability(
    date,
    status
) {

    const allowedStatuses = [
        "available",
        "limited",
        "full"
    ];


    if (
        !allowedStatuses.includes(
            status
        )
    ) {

        throw new Error(
            "Ongeldige beschikbaarheidsstatus."
        );
    }


    /*
        Document-ID is gewoon:
        2026-09-15
    */

    const availabilityRef =
        doc(
            db,
            "availability",
            date
        );


    /*
        Beschikbaar is de standaard.

        Daarvoor hoeven we niets in
        Firestore te bewaren.
    */

    if (
        status ===
        "available"
    ) {

        await deleteDoc(
            availabilityRef
        );


        return;
    }


    /*
        Alleen limited en full worden
        echt opgeslagen.
    */

    await setDoc(
        availabilityRef,
        {
            date:
                date,

            status:
                status,

            updatedAt:
                serverTimestamp(),

            updatedBy:
                auth.currentUser
                    ?.uid
                || null
        }
    );
}
/* =========================================
   RESERVATIEMAIL VERSTUREN
========================================= */

export async function sendReservationEmail(
    reservationId
) {

    /*
        De Worker moet weten wie de huidige
        Firebase-gebruiker is.

        Zonder login mag er geen mailrequest
        worden uitgevoerd.
    */

    const user =
        auth.currentUser;


    if (!user) {

        throw new Error(
            "Geen ingelogde gebruiker gevonden."
        );
    }


    /*
        Firebase ID-token ophalen.

        De Cloudflare Worker stuurt dit token
        door naar Firestore.

        Daardoor blijven Firestore Security
        Rules gewoon actief.
    */

    const token =
        await getIdToken(
            user
        );


    const response =
        await fetch(
            MAIL_WORKER_URL,
            {
                method:
                    "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${token}`
                },

                body:
                    JSON.stringify({
                        reservationId:
                            reservationId
                    })
            }
        );


    /*
        Worker-response proberen lezen.
    */

    let result =
        {};


    try {

        result =
            await response.json();

    } catch {

        result =
            {};
    }


    /*
        Bij fout tonen we zoveel mogelijk
        informatie in de browserconsole.
    */

    if (!response.ok) {

        const errorMessage =
            result?.resend?.message
            ||
            result?.error
            ||
            `Mailer fout HTTP ${response.status}`;


        throw new Error(
            errorMessage
        );
    }


    return result;
}

/* =========================================
   GOOGLE LOGIN
========================================= */

export async function loginWithGoogle() {

    const result =
        await signInWithPopup(
            auth,
            googleProvider
        );


    return result.user;
}



/* =========================================
   UITLOGGEN
========================================= */

export async function logout() {

    await signOut(auth);
}



/* =========================================
   LOGINSTATUS VOLGEN
========================================= */

export function watchAuthState(
    callback
) {

    return onAuthStateChanged(
        auth,
        callback
    );
}