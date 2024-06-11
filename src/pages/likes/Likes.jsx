import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, addDoc, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

import Header from '../../components/header/Header';
import './Likes.css';

function LikesPage() {

    return (
        <div>
            <Header />
            <div className='liked-products'>

            </div>
            <div className='cart-checkout-area'>

            </div>
        </div>
    );
}

export default LikesPage;