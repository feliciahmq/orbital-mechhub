import React from 'react';
import { render, act } from '@testing-library/react';
import SellerDashboard from '../../../src/components/sellerDashboard/sellerDashboard';
import '@testing-library/jest-dom';

jest.mock('../../../src/lib/firebaseConfig', () => ({
    db: {}
}));

jest.mock('firebase/firestore', () => ({
    doc: jest.fn(),
    getDoc: jest.fn(),
    collection: jest.fn(),
    getDocs: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn()
}));

jest.mock('react-chartjs-2', () => ({
    Chart: () => null,
    Bar: () => null,
    Scatter: () => null,
    Line: () => null,
}));

describe('SellerDashboard', () => {
    let component;
    
    beforeEach(() => {
        component = render(<SellerDashboard listingID="test-listing-id" />).container;
    });

    it('renders seller dashboard', () => {
        expect(component.textContent).toContain('Loading...');
    });

    describe('processPriceData', () => {
        it('correctly processes price data', () => {
            const instance = component.querySelector('.seller-dashboard').__reactInternalInstance;
            
            const mockListings = [
                { price: '100' },
                { price: '200' },
                { price: '300' },
                { price: '400' },
                { price: '500' },
            ];
            
            const mockListingData = {
                price: '250',
                productType: 'Test Product',
            };
            
            act(() => {
                instance.processPriceData(mockListings, mockListingData);
            });
            
            expect(instance.state.priceData).toEqual({
                average: 300,
                median: 300,
                range: [100, 500],
                currentListingPrice: 250,
                aboveUpperQuartile: false,
                chartData: expect.any(Object),
            });
        });
    });

    describe('processTimeOnMarket', () => {
        it('correctly processes time on market data', () => {
            const instance = component.querySelector('.seller-dashboard').__reactInternalInstance;
            
            const mockListings = [
                { price: '100', postDate: '2023-01-01', status: 'sold', soldDate: '2023-01-15' },
                { price: '200', postDate: '2023-01-01', status: 'available' },
                { price: '300', postDate: '2023-01-01', status: 'sold', soldDate: '2023-01-10' },
            ];
            
            const mockListingData = {
                price: '250',
                postDate: '2023-01-01',
                status: 'available'
            };

            jest.spyOn(global.Date, 'now').mockImplementation(() => new Date('2023-01-20').valueOf());
            
            act(() => {
                instance.processTimeOnMarket(mockListings, mockListingData);
            });
            
            expect(instance.state.timeOnMarketData).toEqual({
                timeOnMarket: 19,
                averageTimeOnMarket: expect.any(Number),
                aboveAverage: expect.any(Boolean),
                chartData: expect.any(Object),
            });
        });
    });

    describe('fetchClickData', () => {
        it('correctly fetches and processes click data', async () => {
            const instance = component.querySelector('.seller-dashboard').__reactInternalInstance;
            
            const mockClickCounts = [
                { id: 'week1', data: () => ({ count: 10 }) },
                { id: 'week2', data: () => ({ count: 15 }) },
            ];
            
            const mockAvgClickCounts = [
                { id: 'listing1', data: () => ({ clickCount: { week1: { count: 8 }, week2: { count: 12 } } }) },
                { id: 'listing2', data: () => ({ clickCount: { week1: { count: 6 }, week2: { count: 10 } } }) },
            ];

            const mockDocs = (data) => ({ docs: data });
            jest.spyOn(require('firebase/firestore'), 'getDocs')
                .mockResolvedValueOnce(mockDocs(mockClickCounts))
                .mockResolvedValueOnce(mockDocs(mockAvgClickCounts));
            
            await act(async () => {
                const result = await instance.fetchClickData('test-listing-id', 'Test Product', 'Test Listing');
                expect(result).toEqual({
                total: 25,
                percentageAboveAverage: expect.any(Number),
                chartData: expect.any(Object),
                });
            });
        });
    });
});