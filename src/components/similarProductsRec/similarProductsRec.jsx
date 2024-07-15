import React, { useState, useEffect } from "react";
import { db } from "../../lib/firebaseConfig";
import { collection, getDoc, doc, getDocs, query, where } from "firebase/firestore";
import * as tf from '@tensorflow/tfjs';

import ProductList from "../productcards/ProductList";

function SimilarProducts({listingID}) {
    const [similarListing, setSimilarListing] = useState([]);

    useEffect(() => {
        const fetchSimilarListings = async () => {
            if (!listingID) {
                console.error('ListingID is undefined');
                return;
            }
            try {
                const thisListingDoc = await getDoc(doc(db, 'listings', listingID));
                if (!thisListingDoc.exists()) {
                    console.log('Current listing not found');
                    return;
                }
        
                const thisListing = thisListingDoc.data();
                const listingQuery = query(
                    collection(db, "listings"),
                    where('status', '==', 'available'),
                );                
        
                const listingSnap = await getDocs(listingQuery);
                const listings = listingSnap.docs
                    .map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }))
                    .filter(listing => listing.id !== listingID);
                const similarListings = listings.map(listing => {
                    try {
                        return {
                            ...listing,
                            similarity: similarityScore(thisListing, listing)
                        };
                    } catch (error) {
                        console.error('Error calculating similarity for listing:', listing.id, error);
                        return { ...listing, similarity: 0 };
                    }
                });
        
                similarListings.sort((a, b) => b.similarity - a.similarity);
                setSimilarListing(similarListings.slice(0, 4));
            } catch (err) {
                console.error('Error fetching similar listings:', err);
            }
        };

        fetchSimilarListings();
    }, [listingID]); 

    const textToVector = (text) => {
        if (!text || typeof text !== 'string') {
            return tf.zeros([100]);
        }
        const words = text.toLowerCase().split(/\W+/).slice(0, 100);
        const vector = new Array(100).fill(0);
        words.forEach((word, index) => {
            if (index < 100) {
                vector[index] = 1;
            }
        });
        return tf.tensor1d(vector);
    };
    
    const cosineSimilarity = (vecA, vecB) => {
        if (!vecA || !vecB || vecA.size !== vecB.size) {
            return 0;
        }
        const dotProduct = tf.sum(tf.mul(vecA, vecB));
        const magnitudeA = tf.norm(vecA);
        const magnitudeB = tf.norm(vecB);
        const magnitudes = tf.mul(magnitudeA, magnitudeB);
        const similarity = tf.div(dotProduct, magnitudes);
        return similarity.dataSync()[0] || 0;
    };
    
    const similarityScore = (listing1, listing2) => {
        try {
            const titleVec1 = textToVector(listing1.title);
            const titleVec2 = textToVector(listing2.title);
            const titleSimilarity = cosineSimilarity(titleVec1, titleVec2);
            
            const descriptionVec1 = textToVector(listing1.description);
            const descriptionVec2 = textToVector(listing2.description);
            const descriptionSimilarity = cosineSimilarity(descriptionVec1, descriptionVec2);
            
            const price1 = parseFloat(listing1.price) || 0;
            const price2 = parseFloat(listing2.price) || 0;
            const priceDifference = Math.abs(price1 - price2) / Math.max(price1, price2, 1);
            
            const similarity = (0.4 * titleSimilarity) + (0.4 * descriptionSimilarity) + (0.2 * (1 - priceDifference));
            return similarity;
        } catch (error) {
            console.error('Error calculating similarity:', error);
            return 0;
        }
    };

    return (
        <ProductList heading={`Similar Listings`} products={similarListing} />
    );
}

export default SimilarProducts;