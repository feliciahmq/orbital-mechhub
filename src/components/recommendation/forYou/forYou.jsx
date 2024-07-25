import * as tf from '@tensorflow/tfjs';
import { collection, getDocs, query, where, doc } from 'firebase/firestore';
import { db } from '../../../lib/firebaseConfig';

class ForYou {
    constructor(userId) {
        this.userId = userId;
        this.userHistory = {
            likeHistory: [],
            searchHistory: [],
            reviewHistory: []
        };
        this.products = null;
        this.productFeatures = null;
    }
    
    async initialize() {
        await this.fetchUserHistory();
        await this.fetchProducts();
        this.prepareProductFeatures();
    }
    
    async fetchUserHistory() {
        const userHistoryRef = doc(db, 'userHistory', this.userId);

        const likeHistoryQuery = query(collection(userHistoryRef, 'likeHistory'));
        const likeHistorySnapshot = await getDocs(likeHistoryQuery);
        this.userHistory.likeHistory = likeHistorySnapshot.docs.map(doc => doc.data());
    
        const searchHistoryQuery = query(collection(userHistoryRef, 'searchHistory'));
        const searchHistorySnapshot = await getDocs(searchHistoryQuery);
        this.userHistory.searchHistory = searchHistorySnapshot.docs.map(doc => doc.data());
    
        const reviewHistoryQuery = query(collection(userHistoryRef, 'reviewHistory'));
        const reviewHistorySnapshot = await getDocs(reviewHistoryQuery);
        this.userHistory.reviewHistory = reviewHistorySnapshot.docs.map(doc => doc.data());
    }
    
    async fetchProducts() {
        const productsQuery = query(collection(db, "listings"), where('status', '==', 'available'));
        const productsSnapshot = await getDocs(productsQuery);
        this.products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    
    prepareProductFeatures() {
        this.productFeatures = this.products.map(product => [
            Number(product.price) || 0,
            Number(product.weeklyClicks) || 0,
            Number(product.likes) || 0,
            Number(product.offers) || 0,
        ]);
    }
    
    ensureNumeric(arr) {
        return arr.map(val => {
            const num = Number(val);
            return isNaN(num) ? 0 : num;
        });
    }
    
    calculateCosineSimilarity(a, b) {
        const numericA = this.ensureNumeric(a);
        const numericB = this.ensureNumeric(b);

        const tensorA = tf.tensor1d(numericA);
        const tensorB = tf.tensor1d(numericB);
    
        const dotProduct = tf.sum(tf.mul(tensorA, tensorB));
        const normA = tf.sqrt(tf.sum(tf.square(tensorA)));
        const normB = tf.sqrt(tf.sum(tf.square(tensorB)));
    
        return tf.div(dotProduct, tf.mul(normA, normB));
    }
    
    async getRecommendations() {
        if (!this.userHistory || !this.products || !this.productFeatures) {
            await this.initialize();
        }
    
        const userVector = this.createUserVector();
        const similarities = this.productFeatures.map((features, index) => ({
            product: this.products[index],
            similarity: this.calculateCosineSimilarity(userVector, features).dataSync()[0]
        }));
    
        similarities.sort((a, b) => b.similarity - a.similarity);
        return similarities.map(item => item.product);
    }
    
    createUserVector() {
        const vector = [0, 0, 0, 0]; 
    
        if (this.userHistory.likeHistory.length > 0) {
            this.userHistory.likeHistory.forEach(like => {
                const likedProduct = this.products.find(p => p.id === like.listingID);
                if (likedProduct) {
                vector[0] += Number(likedProduct.price) || 0;
                vector[2] += 1; 
                }
            });
        }
    
        if (this.userHistory.reviewHistory.length > 0) {
            this.userHistory.reviewHistory.forEach(review => {
                const reviewedProduct = this.products.find(p => p.title === review.listing);
                if (reviewedProduct) {
                vector[0] += Number(reviewedProduct.price) || 0;
                vector[3] += 1; 
                }
            });
        }

        const sum = vector.reduce((a, b) => a + b, 0);
        return vector.map(v => v / (sum || 1)); 
    }
}

export default ForYou;