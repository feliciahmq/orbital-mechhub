import React, { useState, useEffect } from "react";
import { useQuery, gql } from "@apollo/client";
import { db } from "../../lib/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import './sellerDashboard.css';

const GET_SIMILAR_LISTINGS = gql`
  query GetSimilarListings($keyword: String!) {
    similarListings(keyword: $keyword) {
      id
      title
      price
      postDate
      clickCount
      offerCount
      timeOnMarket
    }
  }
`;

function SellerDashboard({ listingID }) {
    const [listing, setListing] = useState(null);
    const [similarListings, setSimilarListings] = useState([]);

    useEffect(() => {
        const fetchListing = async () => {
            const listingRef = collection(db, "listings");
            const q = query(listingRef, where("id", "==", listingID));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                setListing(querySnapshot.docs[0].data());
            }
        };
        fetchListing();
    }, [listingID]);

    const { loading, error, data } = useQuery(GET_SIMILAR_LISTINGS, {
        variables: { keyword: listing?.title },
        skip: !listing,
    });

    useEffect(() => {
        if (data && data.similarListings) {
            setSimilarListings(data.similarListings);
        }
    }, [data]);

    if (!listing) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    const calculateStats = () => {
        const prices = similarListings.map(item => item.price);
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        const medianPrice = prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)];
        const priceRange = [Math.min(...prices), Math.max(...prices)];
        
        const totalClicks = similarListings.reduce((sum, item) => sum + item.clickCount, 0);
        const avgClicks = totalClicks / similarListings.length;
        
        const avgTimeOnMarket = similarListings.reduce((sum, item) => sum + item.timeOnMarket, 0) / similarListings.length;
        
        const avgOffers = similarListings.reduce((sum, item) => sum + item.offerCount, 0) / similarListings.length;

        return { avgPrice, medianPrice, priceRange, totalClicks, avgClicks, avgTimeOnMarket, avgOffers };
    };

    const stats = calculateStats();

    const priceData = similarListings.map(item => ({
        date: new Date(item.postDate).toLocaleDateString(),
        price: item.price
    }));

    return (
        <div className="seller-dashboard">
            <h1>Seller Dashboard for {listing.title}</h1>
            <div className="stats-container">
                <div className="stat-box">
                    <h3>Price Statistics</h3>
                    <p>Average Price: ${stats.avgPrice.toFixed(2)}</p>
                    <p>Median Price: ${stats.medianPrice.toFixed(2)}</p>
                    <p>Price Range: ${stats.priceRange[0]} - ${stats.priceRange[1]}</p>
                </div>
                <div className="stat-box">
                    <h3>Click Statistics</h3>
                    <p>Total Clicks: {stats.totalClicks}</p>
                    <p>Average Clicks per Listing: {stats.avgClicks.toFixed(2)}</p>
                </div>
                <div className="stat-box">
                    <h3>Market Statistics</h3>
                    <p>Average Time on Market: {stats.avgTimeOnMarket.toFixed(1)} days</p>
                    <p>Average Number of Offers: {stats.avgOffers.toFixed(1)}</p>
                </div>
            </div>
            <div className="chart-container">
                <h3>Price Trends</h3>
                <LineChart width={600} height={300} data={priceData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="price" stroke="#8884d8" />
                </LineChart>
            </div>
        </div>
    );
}

export default SellerDashboard;