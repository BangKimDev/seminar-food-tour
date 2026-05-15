export interface GeocodingResult {
  lat: number;
  lng: number;
  displayName: string;
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  if (!address.trim()) return null;

  try {
    const url = `${NOMINATIM_URL}?q=${encodeURIComponent(address)}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'vi',
        'User-Agent': 'FoodTourAdmin/1.0',
      },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    if (!data || data.length === 0) return null;

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}
