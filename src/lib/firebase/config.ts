import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if we are using placeholders (locally) or if config is missing
const isPlaceholder = !firebaseConfig.apiKey || firebaseConfig.apiKey.includes('placeholder');

// Initialize Firebase safely
let app;
let auth: any;

if (!isPlaceholder) {
    try {
        app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        auth = getAuth(app);
    } catch (error) {
        console.error('Failed to initialize Firebase:', error);
    }
}

if (isPlaceholder && typeof window !== 'undefined') {
    console.warn('Firebase is running with placeholder credentials or missing API key. Authentication will fail.');
}

export { app, auth };
