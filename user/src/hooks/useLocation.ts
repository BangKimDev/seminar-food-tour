/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Location, POI } from '../types';
import { MOCK_POIS } from '../data/mockData';
import { calculateDistance } from '../utils/geoUtils';

export function useLocationTracking(isTracking: boolean) {
    const [userLocation, setUserLocation] = useState<Location>({ lat: 21.0320, lng: 105.8490 });
    const [activeGeofencePoi, setActiveGeofencePoi] = useState<POI | null>(null);
    const [notifications, setNotifications] = useState<string[]>([]);

    // Simulate movement
    useEffect(() => {
        if (!isTracking) return;
        const interval = setInterval(() => {
            setUserLocation(prev => ({
                lat: prev.lat + (Math.random() - 0.5) * 0.0005,
                lng: prev.lng + (Math.random() - 0.5) * 0.0005,
            }));
        }, 5000);
        return () => clearInterval(interval);
    }, [isTracking]);

    // Geofence Logic
    useEffect(() => {
        MOCK_POIS.forEach(poi => {
            const dist = calculateDistance(userLocation.lat, userLocation.lng, poi.lat, poi.lng);
            if (dist <= 50 && activeGeofencePoi?.id !== poi.id) {
                setActiveGeofencePoi(poi);
                setNotifications(prev => [`Đã đến ${poi.name}, phát audio guide?`, ...prev.slice(0, 4)]);
            } else if (dist > 70 && activeGeofencePoi?.id === poi.id) {
                setActiveGeofencePoi(null);
            }
        });
    }, [userLocation, activeGeofencePoi]);

    return { userLocation, setUserLocation, activeGeofencePoi, notifications };
}
