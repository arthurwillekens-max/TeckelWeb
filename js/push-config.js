/*
    TECKELWEB PUSH CONFIG

    Vul alleen de PUBLIC VAPID key in die je krijgt via:
    Firebase Console → Project settings → Cloud Messaging → Web Push certificates

    Deze sleutel is publiek en mag in frontendcode staan.
*/

export const FIREBASE_VAPID_KEY =
    "";


/*
    Maak in Cloudflare Workers een aparte Worker met exact deze naam:
    teckelweb-push

    Als je Cloudflare account-subdomein anders is, pas alleen deze URL aan.
*/

export const ADMIN_PUSH_WORKER_URL =
    "https://teckelweb-push.arthurwillekens.workers.dev";
