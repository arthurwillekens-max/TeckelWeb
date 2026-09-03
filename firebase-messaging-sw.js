/*
    TeckelWeb Firebase Cloud Messaging service worker.

    Dit bestand MOET in de root van de website staan.
*/

importScripts(
    "https://www.gstatic.com/firebasejs/12.18.0/firebase-app-compat.js"
);

importScripts(
    "https://www.gstatic.com/firebasejs/12.18.0/firebase-messaging-compat.js"
);


firebase.initializeApp(
    {
        apiKey:
            "AIzaSyBIvAp40mYiAi9mB2P7CQG8Lw5xQ8m85hE",

        authDomain:
            "teckelweb.firebaseapp.com",

        projectId:
            "teckelweb",

        storageBucket:
            "teckelweb.firebasestorage.app",

        messagingSenderId:
            "710164290013",

        appId:
            "1:710164290013:web:b0a4e6613dc4b3605e3e34"
    }
);


firebase.messaging();
