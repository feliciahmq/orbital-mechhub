import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../../../lib/firebaseConfig';
import { doc, getDoc, setDoc, onSnapshot, collection } from 'firebase/firestore';
import { useAuth } from '../../../Auth';

const LikeCounter = createContext();

export const useLikes = () => useContext(LikeCounter);

export const LikeCountProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [likeCount, setLikeCount] = useState(0);

    useEffect(() => {
        if (currentUser) {
            const fetchLikeCount = async () => {
                const likeCountDoc = doc(db, 'Users', currentUser.uid, 'likeCount', 'counter');
                const likeCountSnapshot = await getDoc(likeCountDoc);

                if (likeCountSnapshot.exists()) {
                    setLikeCount(likeCountSnapshot.data().count);
                } else {
                    try {
                        await setDoc(likeCountDoc, { count: 0 });
                        setLikeCount(0);
                    } catch (err) {
                        console.log(err.message);
                    }
                }
            };

            fetchLikeCount();
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser) {
            const unsubscribe = onSnapshot(doc(db, 'Users', currentUser.uid, 'likeCount', 'counter'), (doc) => {
                if (doc.exists()) {
                    setLikeCount(doc.data().count);
                }
            });

            return () => unsubscribe();
        }
    }, [currentUser]);

    const updateLikeCountInFirestore = async (newCount) => {
        if (currentUser) {
            const likeCountDoc = doc(db, 'Users', currentUser.uid, 'likeCount', 'counter');
            await setDoc(likeCountDoc, { count: newCount });
        }
    };

    const increaseLikeCount = () => {
        setLikeCount((prevCount) => {
            const newCount = prevCount + 1;
            updateLikeCountInFirestore(newCount);
            return newCount;
        });
    };

    const decreaseLikeCount = () => {
        setLikeCount((prevCount) => {
            const newCount = prevCount > 0 ? prevCount - 1 : 0;
            updateLikeCountInFirestore(newCount);
            return newCount;
        });
    };

    useEffect(() => {
        if (currentUser) {
            const listingsCollection = collection(db, 'Users', currentUser.uid, 'listings');

            const unsubscribe = onSnapshot(listingsCollection, (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'removed') {
                        decreaseLikeCount();
                    }
                });
            });

            return () => unsubscribe();
        }
    }, [currentUser]);

    return (
        <LikeCounter.Provider value={{ likeCount, increaseLikeCount, decreaseLikeCount }}>
            {children}
        </LikeCounter.Provider>
    );
};