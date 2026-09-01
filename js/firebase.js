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
    onAuthStateChanged,
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


const firebaseConfig = {
    apiKey: "AIzaSyBIvAp40mYiAi9mB2P7CQG8Lw5xQ8m85hE",
    authDomain: "teckelweb.firebaseapp.com",
    projectId: "teckelweb",
    storageBucket: "teckelweb.firebasestorage.app",
    messagingSenderId: "710164290013",
    appId: "1:710164290013:web:b0a4e6613dc4b3605e3e34"
};


/* Firebase starten */

const app =
    initializeApp(firebaseConfig);


/* Firestore */

const db =
    getFirestore(app);


/* Authentication */

const auth =
    getAuth(app);

const googleProvider =
    new GoogleAuthProvider();



/* -----------------------------------------
   RESERVATIE OPSLAAN
----------------------------------------- */

export async function saveReservation(reservation) {

    const docRef =
        await addDoc(
            collection(db, "reservations"),
            {
                ...reservation,

                status: "pending",

                createdAt:
                    serverTimestamp()
            }
        );


    return docRef.id;
}

/* -----------------------------------------
   RESERVATIES OPHALEN
----------------------------------------- */

export async function getReservations() {

    const reservationsQuery =
        query(
            collection(db, "reservations"),
            orderBy("createdAt", "desc")
        );


    const snapshot =
        await getDocs(reservationsQuery);


    return snapshot.docs.map(doc => {

        return {
            id: doc.id,
            ...doc.data()
        };

    });
}
/* -----------------------------------------
   RESERVATIES VAN ÉÉN KLANT OPHALEN
----------------------------------------- */

export async function getCustomerReservations(email) {

    const reservationsQuery =
        query(
            collection(db, "reservations"),

            where(
                "customer.email",
                "==",
                email
            )
        );


    const snapshot =
        await getDocs(
            reservationsQuery
        );


    const reservations =
        snapshot.docs.map(doc => {

            return {
                id: doc.id,
                ...doc.data()
            };

        });


    reservations.sort((a, b) => {

        const dateA =
            a.createdAt?.toMillis?.() || 0;

        const dateB =
            b.createdAt?.toMillis?.() || 0;

        return dateB - dateA;
    });


    return reservations;
}
/* -----------------------------------------
   KLANT: RESERVATIE ANNULEREN
----------------------------------------- */

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
            status: "cancelled"
        }
    );
}
/* -----------------------------------------
   GOOGLE LOGIN
----------------------------------------- */

export async function loginWithGoogle() {

    const result =
        await signInWithPopup(
            auth,
            googleProvider
        );


    return result.user;
}



/* -----------------------------------------
   KLANT: EMAIL INLOGLINK STUREN
----------------------------------------- */

export async function sendCustomerLoginLink(email) {

    const actionCodeSettings = {
        url: "http://localhost:5500/mijn-reservaties.html",
        handleCodeInApp: true
    };


    await sendSignInLinkToEmail(
        auth,
        email,
        actionCodeSettings
    );


    localStorage.setItem(
        "emailForSignIn",
        email
    );
}



/* -----------------------------------------
   CONTROLEREN OF URL EEN LOGINLINK IS
----------------------------------------- */

export function isCustomerLoginLink() {

    return isSignInWithEmailLink(
        auth,
        window.location.href
    );
}



/* -----------------------------------------
   KLANT INLOGGEN VIA EMAIL LINK
----------------------------------------- */

export async function completeCustomerLogin(email) {

    const result =
        await signInWithEmailLink(
            auth,
            email,
            window.location.href
        );


    localStorage.removeItem(
        "emailForSignIn"
    );


    return result.user;
}



/* -----------------------------------------
   UITLOGGEN
----------------------------------------- */

export async function logout() {

    await signOut(auth);
}



/* -----------------------------------------
   CONTROLEREN OF IEMAND INGELOGD IS
----------------------------------------- */

export function watchAuthState(callback) {

    return onAuthStateChanged(
        auth,
        callback
    );
}