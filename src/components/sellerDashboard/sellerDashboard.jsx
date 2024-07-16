import React, { useState, useEffect } from "react";
import { db } from "../../lib/firebaseConfig";
import { doc, getDoc, collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from 'chart.js';
import { BoxPlotController, BoxAndWiskers } from '@sgratzl/chartjs-chart-boxplot';
import { Chart, Bar, Scatter, Line } from "react-chartjs-2";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import './SellerDashboard.css';
import SimilarProducts from '../../components/recommendation/similarProducts/similarProductsRec';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, BoxPlotController, BoxAndWiskers);

export default function SellerDashboard({ listingID }) {
    const [listingData, setListingData] = useState(null);
    const [similarListings, setSameProductType] = useState([]);
    const [priceData, setPriceData] = useState(null);
    const [clickData, setClickData] = useState(null);
    const [offerData, setOfferData] = useState(null);
    const [timeOnMarketData, setTimeOnMarketData] = useState(null);
    const [viewToggle, setViewToggle] = useState('price');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchAllData() {
            setIsLoading(true);
            try {
                const docRef = doc(db, "listings", listingID);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setListingData(data);

                    const [similarListings, clickData, offerData] = await Promise.all([
                        fetchSameProductType(data.title, data.productType),
                        fetchClickData(listingID, data.productType, data.title),
                        processOfferData(listingID, parseFloat(data.price))
                    ]);

                    setSameProductType(similarListings);
                    processPriceData(similarListings, data);
                    processTimeOnMarket(similarListings, data);
                    setClickData(clickData);
                    setOfferData(offerData);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchAllData();
    }, [listingID]);

    const fetchSameProductType = async (title, productType) => {
        const q = query(
            collection(db, "listings"),
            where("productType", "==", productType)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(),
            postDate: doc.data().postDate,
            soldDate: doc.data().soldDate,
            status: doc.data().status
        }));
    };

    // PRICE

    const processPriceData = (listings, listingData) => {
        if (listings.length === 0) {
            setPriceData(null);
            return;
        }

        const currentListingPrice = parseFloat(listingData.price);

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
        const upperQuartileIndex = Math.floor(3 * prices.length / 4) - 1;
        const upperQuartile = prices[upperQuartileIndex];

        const aboveUpperQuartile = currentListingPrice > upperQuartile;

        setPriceData({
            average: avgPrice,
            median: medianPrice,
            range: priceRange,
            currentListingPrice: currentListingPrice,
            aboveUpperQuartile: aboveUpperQuartile,
            chartData: {
                labels: [''],
                datasets: [
                    {
                        label: `${listingData.productType}`,
                        data: [prices],
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        borderColor: 'rgb(0, 0, 0)',
                        borderWidth: 1,
                        outlierColor: '#999999',
                        padding: 10,
                        itemRadius: 0,
                    },
                    {
                        label: 'Current Listing',
                        data: [{
                            min: currentListingPrice,
                            q1: currentListingPrice,
                            median: currentListingPrice,
                            q3: currentListingPrice,
                            max: currentListingPrice,
                        }],
                        backgroundColor: 'rgba(255, 0, 0, 0.7)',
                        borderColor: 'rgb(255, 0, 0)',
                        borderWidth: 2,
                        outlierColor: 'rgb(0, 0, 0)',
                        itemRadius: 8,
                    }
                ]
            }
        });
    };

    // CLICK

    const fetchClickData = async (listingID, productType, listingTitle) => {
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
        
        await Promise.all(avgClickCountSnapshot.docs.map(async (doc) => {
            const clickCountRef = collection(db, 'listings', doc.id, 'clickCount');
            const clickSnapshot = await getDocs(clickCountRef);
            clickSnapshot.docs.forEach(clickDoc => {
                const week = clickDoc.id;
                const count = clickDoc.data().count;
                if (!avgClickCounts[week]) {
                    avgClickCounts[week] = { count: 0, numListings: 0 };
                }
                avgClickCounts[week].count += count;
                avgClickCounts[week].numListings += 1;
            });
        }));
    
        const avgClickCountsArray = Object.keys(avgClickCounts).map(week => ({
            week,
            averageCount: avgClickCounts[week].count / avgClickCounts[week].numListings
        }));
    
        return processClickData(clickCounts, avgClickCountsArray, listingTitle, productType);
    };

    const processClickData = (clickCounts, avgClickCounts, listingTitle, productType) => {
        const totalClicks = clickCounts.reduce((sum, item) => sum + item.count, 0);
        const sortedClickCounts = clickCounts.sort((a, b) => new Date(a.week) - new Date(b.week));
        const sortedAvgClickCounts = avgClickCounts.sort((a, b) => new Date(a.week) - new Date(b.week));
    
        const labels = sortedClickCounts.map((item, index) => `Week ${index + 1}`);
        const avgLabels = sortedAvgClickCounts.map((item, index) => `Week ${index + 1}`);
    
        let weeksAboveAverage = 0;
        sortedClickCounts.forEach((item, index) => {
            if (item.count > sortedAvgClickCounts[index]?.averageCount) {
                weeksAboveAverage++;
            }
        });
        const percentageAboveAverage = (weeksAboveAverage / sortedClickCounts.length) * 100;
    
        return {
            total: totalClicks,
            percentageAboveAverage: percentageAboveAverage,
            chartData: {
                labels: labels,
                datasets: [
                    {
                        label: `Clicks per Week for ${listingTitle}`,
                        data: sortedClickCounts.map(item => item.count),
                        backgroundColor: 'rgba(255, 75, 43, 0.7)',
                    },
                    {
                        label: `Average Clicks per Week for ${productType}`,
                        data: sortedAvgClickCounts.map(item => item.averageCount),
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    }
                ]
            }
        };
    };

    // OFFER

    const processOfferData = async (listingID, listingPrice) => {
        console.log(listingID);
        try {
            const offersRef = collection(db, 'listings', listingID, 'offers');
            const offersQuery = query(offersRef, orderBy('timestamp', 'asc'));
            const offerSnapshot = await getDocs(offersQuery);
    
            const offers = offerSnapshot.docs.map(doc => ({
                id: doc.id,
                offerPrice: parseFloat(doc.data().offerPrice),
                timestamp: doc.data().timestamp.toDate()
            }));
    
            const totalOffers = offers.length;
            const chartData = {
                labels: offers.map(offer => offer.timestamp.toLocaleDateString()),
                datasets: [
                    {
                        label: 'Offer Prices',
                        data: offers.map(offer => offer.offerPrice),
                        borderColor: 'rgb(0, 0, 0)',
                        tension: 0.1
                    },
                    {
                        label: 'Listing Price',
                        data: Array(offers.length).fill(listingPrice),
                        borderColor: 'rgb(255, 75, 43)',
                        borderDash: [5, 5],
                        tension: 0
                    }
                ]
            };
    
            return {
                totalOffers,
                chartData,
                ...(totalOffers > 0
                    ? {
                        highestOffer: Math.max(...offers.map(offer => offer.offerPrice)),
                        lowestOffer: Math.min(...offers.map(offer => offer.offerPrice))
                      }
                    : {
                        highestOffer: 0,
                        lowestOffer: 0
                      }
                )
            };
        } catch (error) {
            console.error("Error processing offer data:", error);
            return null;
        }
    };

    // TIME ON MARKET

    const processTimeOnMarket = (listings, listingData) => {
        const marketData = listings.map(listing => {
            const postDate = new Date(listing.postDate);
            let timeOnMarket;
            if (listing.status === 'sold') {
                const soldDate = new Date(listing.soldDate);
                timeOnMarket = (soldDate - postDate) / (1000 * 60 * 60 * 24);
            } else {
                const now = new Date();
                timeOnMarket = (now - postDate) / (1000 * 60 * 60 * 24); 
            }
            return {
                x: parseFloat(listing.price), 
                y: timeOnMarket,
                status: listing.status
            };
        });

        const time = new Date() - new Date(listingData.postDate);
        const currentListingTimeOnMarket = time / (1000 * 60 * 60 * 24); 

        const currentListingData = {
            x: parseFloat(listingData.price), 
            y: currentListingTimeOnMarket,
            status: listingData.status
        }

        const totalDaysOnMarket = marketData.reduce((acc, data) => acc + data.y, 0);
        const averageTimeOnMarket = totalDaysOnMarket / marketData.length;
        const aboveAverage = currentListingData > averageTimeOnMarket;
        console.log(aboveAverage)
    
        setTimeOnMarketData({
            timeOnMarket: currentListingData.y,
            averageTimeOnMarket: averageTimeOnMarket,
            aboveAverage: aboveAverage,
            chartData: {
                datasets: [
                    {
                        label: 'Sold Listings',
                        data: marketData.filter(item => item.status === 'sold'),
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        pointRadius:4,
                    },
                    {
                        label: 'Available Listings',
                        data: marketData.filter(item => item.status !== 'sold'),
                        backgroundColor: 'rgba(253, 99, 76, 0.5)',
                        pointRadius: 4,
                    },
                    {
                        label: 'Your Listing',
                        data: [currentListingData],
                        backgroundColor: 'rgb(255, 75, 43)',
                        pointRadius: 8
                    }
                ]
            }
        });
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="seller-dashboard">
            <h2>Listing Insights</h2>

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
                <div
                    className={`toggle ${viewToggle === 'similarProducts' ? 'active' : ''}`}
                    onClick={() => setViewToggle('similarProducts')}
                >
                    Similar Products
                </div>
            </div>
            {viewToggle === 'price' && priceData && (
                <div className="price-section">
                    {priceData.aboveUpperQuartile && (
                        <p className="good-job-ehe">Your listing priced much higher than average
                            <br /> ʕ •ₒ• ʔ
                        </p>
                    )}
                    <p>Average Price: ${priceData.average?.toFixed(2) ?? 'N/A'}</p>
                    <p>Median Price: ${priceData.median?.toFixed(2) ?? 'N/A'}</p>
                    <p>Price Range: ${priceData.range?.[0]?.toFixed(2) ?? 'N/A'} - ${priceData.range?.[1]?.toFixed(2) ?? 'N/A'}</p>
                    <p>Your Listing Price: ${priceData.currentListingPrice?.toFixed(2) ?? 'N/A'}</p>
                    {priceData.chartData?.datasets?.[0]?.data?.[0]?.length > 0 && (
                        <div style={{ width: '100%', height: '100%' }}>
                            <Chart
                                type="boxplot"
                                data={priceData.chartData}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: {
                                            position: 'top',
                                        },
                                        title: {
                                            display: true,
                                            text: 'Price Distribution'
                                        },
                                        tooltip: {
                                            callbacks: {
                                                label: function(context) {
                                                    if (context.datasetIndex === 1) {
                                                        return `Your Listing: $${context.raw.median.toFixed(2)}`;
                                                    }
                                                    return context.chart.data.datasets[context.datasetIndex].label;
                                                }
                                            }
                                        }
                                    },
                                    scales: {
                                        y: {
                                            title: {
                                                display: true,
                                                text: 'Price ($)'
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                    )}
                </div>
            )}
            {viewToggle === 'clicks' && clickData && (
                <div className="click-section">
                    {clickData.percentageAboveAverage > 65 && (
                        <p className="good-job-ehe">Good job! Your Listing is getting lots of views!
                            <br />٩(`･ω･´)و
                        </p>
                    )}
                    <p>Total Clicks: {clickData.total}</p>
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
                    <p>Total Number of Offers: {offerData.totalOffers}</p>
                    <p>Highest Offer: ${offerData.highestOffer.toFixed(2)}</p>
                    <p>Lowest Offer: ${offerData.lowestOffer.toFixed(2)}</p>
                    <Line
                        data={offerData.chartData}
                        options={{
                            responsive: true,
                            plugins: {
                                title: {
                                    display: true,
                                    text: 'Offer Prices Over Time'
                                },
                                tooltip: {
                                    mode: 'index',
                                    intersect: false,
                                }
                            },
                            scales: {
                                x: {
                                    title: {
                                        display: true,
                                        text: 'Date'
                                    }
                                },
                                y: {
                                    title: {
                                        display: true,
                                        text: 'Price ($)'
                                    },
                                    beginAtZero: true
                                }
                            }
                        }}
                    />
                </div>
            )}
            {viewToggle === 'timeOnMarket' && timeOnMarketData && (
                <div className="time-on-market-section">
                    {timeOnMarketData.aboveAverage && (
                        <p className="good-job-ehe">Your listing has been on the market for longer than average
                            <br />ʕ •ₒ• ʔ
                        </p>
                    )}
                    <p>Time on Market: {timeOnMarketData.timeOnMarket.toFixed(2)} days</p>
                    <p>Average Time on Market: {timeOnMarketData.averageTimeOnMarket.toFixed(2)} days</p>
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
            {viewToggle === 'similarProducts' && (
                <SimilarProducts listingID={listingID} />
            )}
        </div>
    );
};