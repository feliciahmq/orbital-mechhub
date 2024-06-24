import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebaseConfig';
import { useUserStore } from '/src/lib/userStore'; 

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const { fetchUserInfo } = useUserStore();
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(user);
                fetchUserInfo(user.uid);
            } else {
                setCurrentUser(null);
                fetchUserInfo(null);
            }
        });
        return unsubscribe;
    }, [fetchUserInfo]);

    return (
        <AuthContext.Provider value={{ currentUser, useUserStore }}>
            {children}
        </AuthContext.Provider>
    );
};