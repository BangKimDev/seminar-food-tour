/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Location, POI } from '../types/index.ts';
import { calculateDistance } from '../utils/geoUtils.ts';

export function useLocationTracking(isTracking: boolean, pois: POI[] = []) {
    const [userLocation, setUserLocation] = useState<Location>({ lat: 10.7602, lng: 106.6815 });
    const [activeGeofencePoi, setActiveGeofencePoi] = useState<POI | null>(null);
    const [notifications, setNotifications] = useState<string[]>([]);

    // Hỏi và lấy vị trí thực tế của người dùng khi bắt đầu sử dụng app
    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.warn("Lỗi lấy vị trí người dùng:", error.message);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        }
    }, []);

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
        pois.forEach(poi => {
            const dist = calculateDistance(userLocation.lat, userLocation.lng, poi.lat, poi.lng);
            if (dist <= 50 && activeGeofencePoi?.id !== poi.id) {
                setActiveGeofencePoi(poi);
                setNotifications(prev => [`Đã đến ${poi.name}, phát audio guide?`, ...prev.slice(0, 4)]);
            } else if (dist > 70 && activeGeofencePoi?.id === poi.id) {
                setActiveGeofencePoi(null);
            }
        });
    }, [userLocation, activeGeofencePoi, pois]);

    return { userLocation, setUserLocation, activeGeofencePoi, notifications };
}
