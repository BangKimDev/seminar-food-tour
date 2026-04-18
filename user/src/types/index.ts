/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface POI {
    id: string;
    name: string;
    specialty: string;
    hours: string;
    rating: number;
    lat: number;
    lng: number;
    audioUrl: string;
    description: string;
    image: string;
    audioGuides?: {
        language: string;
        audioUrl: string;
    }[];
}

export interface Location {
    lat: number;
    lng: number;
}

export type TabType = 'map' | 'list' | 'tracking';