'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, getIdToken } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

interface AuthContextType {
    user: User | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const FirebaseAuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Client-side auth listener
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);

            if (firebaseUser) {
                try {
                    // Get token and sync with cookie for SSR/Middleware
                    const token = await getIdToken(firebaseUser, true);
                    document.cookie = `firebase-token=${token}; path=/; max-age=3600; SameSite=Lax; Secure`;
                } catch (error) {
                    console.error('Failed to get Firebase token:', error);
                }
            } else {
                // Clear cookie on sign out
                document.cookie = `firebase-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
