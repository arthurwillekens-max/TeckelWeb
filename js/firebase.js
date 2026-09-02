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
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
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