import * as admin from 'firebase-admin';

const privateKey = process.env.FIREBASE_PRIVATE_KEY;
const isPlaceholder = privateKey?.includes('placeholder') || !privateKey;

if (!admin.apps.length && !isPlaceholder) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey?.replace(/\\n/g, '\n'),
            }),
        });
    } catch (error) {
        console.error('Failed to initialize Firebase Admin:', error);
    }
}

export const adminAuth = isPlaceholder ? null : admin.auth();
export const adminDb = isPlaceholder ? null : admin.firestore();
