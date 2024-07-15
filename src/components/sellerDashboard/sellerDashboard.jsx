import React, { useState, useEffect } from "react";
import { db } from "../../lib/firebaseConfig";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { Line, Bar, Scatter } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ScatterController } from 'chart.js';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import './SellerDashboard.css';
import similarProducts from '../similarProductsRec/similarProductsRec';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

function SellerDashboard({ listingID }) {
    const [listingData, setListingData] = useState(null);
    const [similarListings, setSameProductType] = useState([]);
    const [priceData, setPriceData] = useState(null);
    const [clickData, setClickData] = useState(null);
    const [offerData, setOfferData] = useState(null);
    const [timeOnMarketData, setTimeOnMarketData] = useState(null);
    const [viewToggle, setViewToggle] = useState('price');

    useEffect(() => {
        fetchListingData();
    }, [listingID]);

    const fetchListingData = async () => {
        const docRef = doc(db, "listings", listingID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            setListingData(data);
            console.log(listingData);
            fetchSameProductType(data.title, data.productType);
            fetchClickData(listingID, data.productType);
        }
    };

    const fetchSameProductType = async (title, productType) => {
        const q = query(
            collection(db, "listings"),
            where("productType", "==", productType)
        );
        const querySnapshot = await getDocs(q);
        const listings = querySnapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(),
            postDate: doc.data().postDate,
            soldDate: doc.data().soldDate,
            status: doc.data().status
        }));
        setSameProductType(listings);
        processData(listings);
        processTimeOnMarket(listings);
    };

    const fetchClickData = async (listingID, productType) => {
        const clickCountRef = collection(db, 'listings', listingID, 'clickCount');
        const clickCountSnapshot = await getDocs(clickCountRef);
        const clickCounts = clickCountSnapshot.docs.map(doc => ({
            week: doc.id,
            count: doc.data().count
        }));
    
        const avgClickCountRef = query(
            collection(db, 'listings'),
            where("productType", "==", productType)
        );
        const avgClickCountSnapshot = await getDocs(avgClickCountRef);
        const avgClickCounts = {};
        
        avgClickCountSnapshot.docs.forEach(doc => {
            const clickCountRef = collection(db, 'listings', doc.id, 'clickCount');
            getDocs(clickCountRef).then(clickSnapshot => {
                clickSnapshot.docs.forEach(clickDoc => {
                    const week = clickDoc.id;
                    const count = clickDoc.data().count;
                    if (!avgClickCounts[week]) {
                        avgClickCounts[week] = { count: 0, numListings: 0 };
                    }
                    avgClickCounts[week].count += count;
                    avgClickCounts[week].numListings += 1;
                });
            });
        });
    
        // Wait for all click count queries to complete
        await Promise.all(avgClickCountSnapshot.docs.map(doc => 
            getDocs(collection(db, 'listings', doc.id, 'clickCount'))
        ));
    
        const avgClickCountsArray = Object.keys(avgClickCounts).map(week => ({
            week,
            averageCount: avgClickCounts[week].count / avgClickCounts[week].numListings
        }));
    
        processClickData(clickCounts, avgClickCountsArray);
    };

    const processData = (listings) => {
        if (listings.length === 0) {
            setPriceData(null);
            setOfferData(null);
            return;
        }

        // Process price data
        const prices = listings
            .map(listing => parseFloat(listing.price))
            .filter(price => !isNaN(price));

        if (prices.length === 0) {
            setPriceData(null);
            return;
        }

        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        const medianPrice = prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)];
        const priceRange = [Math.min(...prices), Math.max(...prices)];

        setPriceData({
            average: avgPrice,
            median: medianPrice,
            range: priceRange,
            chartData: {
                labels: listings.map(listing => listing.postDate),
                datasets: [{
                    label: 'Price',
                    data: prices,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            }
        });

        // Process offer data
        const offerCounts = listings.map(listing => listing.offers ? listing.offers.length : 0);
        const avgOffers = offerCounts.reduce((a, b) => a + b, 0) / offerCounts.length;

        setOfferData({
            average: avgOffers
        });
    };

    const processClickData = (clickCounts, avgClickCounts) => {
        const totalClicks = clickCounts.reduce((sum, item) => sum + item.count, 0);
        const sortedClickCounts = clickCounts.sort((a, b) => new Date(a.week) - new Date(b.week));
        const sortedAvgClickCounts = avgClickCounts.sort((a, b) => new Date(a.week) - new Date(b.week));
    
        const labels = sortedClickCounts.map((item, index) => `Week ${index + 1}`);
        const avgLabels = sortedAvgClickCounts.map((item, index) => `Week ${index + 1}`);
    
        // Calculate the percentage of weeks where clicks are above average
        let weeksAboveAverage = 0;
        sortedClickCounts.forEach((item, index) => {
            if (item.count > sortedAvgClickCounts[index]?.averageCount) {
                weeksAboveAverage++;
            }
        });
        const percentageAboveAverage = (weeksAboveAverage / sortedClickCounts.length) * 100;
    
        setClickData({
            total: totalClicks,
            percentageAboveAverage: percentageAboveAverage,
            chartData: {
                labels: labels,
                datasets: [
                    {
                        // label: `Clicks per Week for ${listingData.title}`,
                        data: sortedClickCounts.map(item => item.count),
                        backgroundColor: 'rgba(53, 162, 235, 0.5)',
                    },
                    {
                        // label: `Average Clicks per Week for ${listingData.productType}`,
                        data: sortedAvgClickCounts.map(item => item.averageCount),
                        backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    }
                ]
            }
        });
    };

    const processTimeOnMarket = (listings) => {
        const marketData = listings.map(listing => {
            const postDate = new Date(listing.postDate);
            let timeOnMarket;
            if (listing.status === 'sold') {
                const soldDate = new Date(listing.soldDate);
                timeOnMarket = (soldDate - postDate) / (1000 * 60 * 60 * 24); // Convert to days
            } else {
                const now = new Date();
                timeOnMarket = (now - postDate) / (1000 * 60 * 60 * 24); // Convert to days
            }
            return {
                x: parseFloat(listing.price), // x-axis is price
                y: timeOnMarket, // y-axis is time on market
                status: listing.status
            };
        });
    
        setTimeOnMarketData({
            chartData: {
                datasets: [
                    {
                        label: 'Sold Listings',
                        data: marketData.filter(item => item.status === 'sold'),
                        backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    },
                    {
                        label: 'Available Listings',
                        data: marketData.filter(item => item.status !== 'sold'),
                        backgroundColor: 'rgba(53, 162, 235, 0.5)',
                    }
                ]
            }
        });
        console.log(marketData); // Log the data to check its structure
    };
    if (!listingData || !priceData || !clickData || !offerData) {
        return <div>Loading... or No data available</div>;
    }

    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
        centerMode: true,
        centerPadding: '0',
    };

    return (
        <div className="seller-dashboard">
            <h2>Listing Insights for {listingData.title}</h2>

            <div className="profile-toggle">
                <div
                    className={`toggle ${viewToggle === "price" ? 'active' : ''}`}
                    onClick={() => setViewToggle('price')}
                >
                    Price
                </div>
                <div
                    className={`toggle ${viewToggle === 'clicks' ? 'active' : ''}`}
                    onClick={() => setViewToggle('clicks')}
                >
                    Clicks
                </div>
                <div
                    className={`toggle ${viewToggle === 'offers' ? 'active' : ''}`}
                    onClick={() => setViewToggle('offers')}
                >
                    Offers
                </div>
                <div
                    className={`toggle ${viewToggle === 'timeOnMarket' ? 'active' : ''}`}
                    onClick={() => setViewToggle('timeOnMarket')}
                >
                    Time on Market
                </div>
            </div>
            {viewToggle === 'price' && priceData && (
                <div className="price-section">
                    <p>Average Price: ${priceData.average.toFixed(2)}</p>
                    <p>Median Price: ${priceData.median.toFixed(2)}</p>
                    <p>Price Range: ${priceData.range[0].toFixed(2)} - ${priceData.range[1].toFixed(2)}</p>
                    {priceData.chartData.datasets[0].data.length > 0 && (
                        <Line
                            data={priceData.chartData}
                            options={{
                                responsive: true,
                                plugins: {
                                    title: {
                                        display: true,
                                        text: 'Price Trends'
                                    }
                                }
                            }}
                        />
                    )}
                </div>
            )}
            {viewToggle === 'clicks' && clickData && (
                <div className="click-section">
                    <p>Total Clicks: {clickData.total}</p>
                    {clickData.percentageAboveAverage > 65 && (
                        <p className="good-job-ehe">Good job! Your Listing is getting lots of views!
                            <br />٩(`･ω･´)و
                        </p>
                    )}
                    <Bar
                        data={clickData.chartData}
                        options={{
                            responsive: true,
                            plugins: {
                                title: {
                                    display: true,
                                    text: 'Clicks per Week'
                                }
                            }
                        }}
                    />
                </div>
            )}
            {viewToggle === 'offers' && offerData && (
                <div className="offer-section">
                    <p>Average Number of Offers: {offerData.average.toFixed(2)}</p>
                </div>
            )}
            {viewToggle === 'timeOnMarket' && timeOnMarketData && (
                <div className="time-on-market-section">
                    <Scatter
                        data={timeOnMarketData.chartData}
                        options={{
                            responsive: true,
                            scales: {
                                x: {
                                    type: 'linear',
                                    position: 'bottom',
                                    title: {
                                        display: true,
                                        text: 'Price ($)'
                                    },
                                    min: 0,
                                    max: Math.max(...timeOnMarketData.chartData.datasets.flatMap(d => d.data.map(p => p.x))) * 1.1
                                },
                                y: {
                                    title: {
                                        display: true,
                                        text: 'Time on Market (days)'
                                    },
                                    min: 0,
                                    max: Math.max(...timeOnMarketData.chartData.datasets.flatMap(d => d.data.map(p => p.y))) * 1.1
                                }
                            },
                            plugins: {
                                tooltip: {
                                    callbacks: {
                                        label: function(context) {
                                            let label = context.dataset.label || '';
                                            if (label) {
                                                label += ': ';
                                            }
                                            if (context.parsed.x !== null) {
                                                label += `$${context.parsed.x.toFixed(2)}, `;
                                            }
                                            if (context.parsed.y !== null) {
                                                label += `${context.parsed.y.toFixed(0)} days`;
                                            }
                                            return label;
                                        }
                                    }
                                }
                            }
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default SellerDashboard;
