import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../../../firebase/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const LikeCounter = createContext();

export const useLikes = () => useContext(LikeCounter);

export const LikeCountProvider = ({ children }) => {
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    const fetchLikeCount = async () => {
      const likeCountDoc = doc(db, 'likeCount', 'counter');
      const likeCountSnapshot = await getDoc(likeCountDoc);

      if (likeCountSnapshot.exists()) {
        setLikeCount(likeCountSnapshot.data().count);
      }
    };

    fetchLikeCount();
  }, []);

  const updateLikeCountInFirestore = async (newCount) => {
    const likeCountDoc = doc(db, 'likeCount', 'counter');
    await setDoc(likeCountDoc, { count: newCount });
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

  return (
    <LikeCounter.Provider value={{ likeCount, increaseLikeCount, decreaseLikeCount }}>
      {children}
    </LikeCounter.Provider>
  );
};
