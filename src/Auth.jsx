import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebaseConfig';
import { useUserStore } from './lib/userStore'; 

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const { fetchUserInfo } = useUserStore();
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
            setCurrentUser(user);
            await fetchUserInfo(user.uid);
        } else {
            setCurrentUser(null);
            await fetchUserInfo(null);
        }
        setLoading(false);
        });
        return unsubscribe;
    }, [fetchUserInfo]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ currentUser, useUserStore }}>
        {children}
        </AuthContext.Provider>
    );
};
