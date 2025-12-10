import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ranchiLocations } from '../data/ranchiLocations';

// We'll load Leaflet dynamically to avoid SSR issues
let L = null;

// Popular Indian cities with coordinates
const INDIAN_CITIES = [
    { name: 'Ranchi', lat: 23.3441, lng: 85.3096, state: 'Jharkhand' },
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777, state: 'Maharashtra' },
    { name: 'Delhi', lat: 28.7041, lng: 77.1025, state: 'Delhi' },
    { name: 'Bangalore', lat: 12.9716, lng: 77.5946, state: 'Karnataka' },
    { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, state: 'Telangana' },
    { name: 'Chennai', lat: 13.0827, lng: 80.2707, state: 'Tamil Nadu' },
    { name: 'Kolkata', lat: 22.5726, lng: 88.3639, state: 'West Bengal' },
    { name: 'Pune', lat: 18.5204, lng: 73.8567, state: 'Maharashtra' },
    { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, state: 'Gujarat' },
    { name: 'Jaipur', lat: 26.9124, lng: 75.7873, state: 'Rajasthan' },
    { name: 'Lucknow', lat: 26.8467, lng: 80.9462, state: 'Uttar Pradesh' },
    { name: 'Chandigarh', lat: 30.7333, lng: 76.7794, state: 'Chandigarh' },
    { name: 'Indore', lat: 22.7196, lng: 75.8577, state: 'Madhya Pradesh' },
    { name: 'Bhopal', lat: 23.2599, lng: 77.4126, state: 'Madhya Pradesh' },
    { name: 'Patna', lat: 25.5941, lng: 85.1376, state: 'Bihar' },
];

export default function LocationMap() {
    const [userLocation, setUserLocation] = useState(null);
    const [nearbyPlaces, setNearbyPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [locationMethod, setLocationMethod] = useState('city'); // 'ip', 'device', or 'city'
    const [selectedCity, setSelectedCity] = useState('Ranchi');
    const [mapCenter, setMapCenter] = useState([23.3441, 85.3096]); // Default: Ranchi
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);

    // Load Leaflet CSS and JS
    useEffect(() => {
        // Add Leaflet CSS
        if (!document.getElementById('leaflet-css')) {
            const link = document.createElement('link');
            link.id = 'leaflet-css';
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
        }

        // Load Leaflet JS
        if (!window.L) {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.async = true;
            script.onload = () => {
                L = window.L;
                initializeMap();
            };
            document.body.appendChild(script);
        } else {
            L = window.L;
            initializeMap();
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    const initializeMap = () => {
        if (!mapRef.current || mapInstanceRef.current) return;

        const map = L.map(mapRef.current, {
            center: mapCenter,
            zoom: 13,
            zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;

        // Start location detection
        initLocation();
    };

    const updateMapView = (lat, lng) => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([lat, lng], 13);
        }
    };

    const clearMarkers = () => {
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
    };

    const addMarkers = (location, places) => {
        if (!mapInstanceRef.current || !L) return;

        clearMarkers();

        // Custom icons
        const userIcon = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        const libraryIcon = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        const bookstoreIcon = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        const bookClubIcon = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        // Add user location marker
        if (location && location.lat && location.lng) {
            const userMarker = L.marker([location.lat, location.lng], { icon: userIcon })
                .addTo(mapInstanceRef.current)
                .bindPopup(`
          <div style="font-family: Inter, sans-serif;">
            <strong>📍 You are here</strong>
            ${location.city ? `<p style="margin: 4px 0;">${location.city}, ${location.country}</p>` : ''}
            <p style="margin: 4px 0; font-size: 12px; color: #666;">
              ${locationMethod === 'ip' ? 'Approximate location from IP' : 'Precise device location'}
            </p>
          </div>
        `);
            markersRef.current.push(userMarker);
        }

        // Add place markers
        places.forEach(place => {
            let icon = libraryIcon;
            let emoji = '📚';

            if (place.type === 'Bookstore') {
                icon = bookstoreIcon;
                emoji = '📖';
            } else if (place.type === 'Book Club') {
                icon = bookClubIcon;
                emoji = '📗';
            }

            const marker = L.marker([place.lat, place.lng], { icon })
                .addTo(mapInstanceRef.current)
                .bindPopup(`
          <div style="font-family: Inter, sans-serif; min-width: 200px;">
            <strong style="font-size: 16px;">${emoji} ${place.name}</strong>
            <p style="display: inline-block; background: linear-gradient(90deg, #6c5ce7, #00c2ff); color: white; padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; margin: 8px 0;">
              ${place.type}
            </p>
            ${place.rating ? `<p style="font-size: 13px; color: #f59e0b; font-weight: 600; margin: 4px 0;">⭐ ${place.rating}/5</p>` : ''}
            <p style="font-size: 13px; color: #334155; margin: 4px 0;">📍 ${place.address}</p>
            ${place.phone !== 'N/A' && place.phone ? `<p style="font-size: 13px; color: #334155; margin: 4px 0;">📞 ${place.phone}</p>` : ''}
            ${place.website !== 'N/A' ? `<a href="${place.website}" target="_blank" style="display: inline-block; margin-top: 8px; color: #6c5ce7; font-weight: 600; font-size: 13px; text-decoration: none;">Visit Website →</a>` : ''}
          </div>
        `);
            markersRef.current.push(marker);
        });
    };

    const getIPLocation = async () => {
        try {
            const response = await axios.get('https://ipapi.co/json/');
            const { latitude, longitude, city, country_name } = response.data;

            if (latitude && longitude) {
                const location = { lat: latitude, lng: longitude, city, country: country_name };
                setUserLocation(location);
                setMapCenter([latitude, longitude]);
                updateMapView(latitude, longitude);
                return location;
            }
        } catch (err) {
            console.error('IP location error:', err);
        }
        return { lat: 20.5937, lng: 78.9629 };
    };

    const getDeviceLocation = () => {
        setLoading(true);
        setError('');

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                setUserLocation(location);
                setMapCenter([location.lat, location.lng]);
                setLocationMethod('device');
                setSelectedCity('Device Location'); // Update dropdown to show Device Location
                updateMapView(location.lat, location.lng);
                await fetchNearbyPlaces(location.lat, location.lng);
                setLoading(false);
            },
            (err) => {
                console.error('Geolocation error:', err);
                setError('Unable to retrieve your location. Using approximate location.');
                setLoading(false);
            }
        );
    };

    const fetchNearbyPlaces = async (lat, lng, radius = 20000, cityName = null) => { // Increased to 20 km for more results
        try {
            // Check if the city is Ranchi - use CSV data
            if (cityName === 'Ranchi' || (userLocation?.city === 'Ranchi')) {
                // Use CSV data for Ranchi
                const places = ranchiLocations.map((location, index) => {
                    // Determine type based on category
                    let type = 'Library';
                    const category = location.category.toLowerCase();
                    if (category.includes('book store') || category.includes('bookstore') ||
                        category === 'book store' || category.includes('depot')) {
                        type = 'Bookstore';
                    } else if (category.includes('library')) {
                        type = 'Library';
                    } else if (category.includes('book club')) {
                        type = 'Book Club';
                    }

                    return {
                        id: `ranchi-${index}`,
                        name: location.name,
                        type: type,
                        lat: location.lat,
                        lng: location.lng,
                        address: location.address || 'Address not available',
                        phone: location.phone || 'N/A',
                        website: 'N/A',
                        rating: location.rating
                    };
                });

                setNearbyPlaces(places);
                addMarkers({ lat, lng, city: 'Ranchi', country: 'India' }, places);
                return;
            }

            // For other cities, use Overpass API as before
            const query = `
        [out:json][timeout:25];
        (
          node["amenity"="library"](around:${radius},${lat},${lng});
          way["amenity"="library"](around:${radius},${lat},${lng});
          node["shop"="books"](around:${radius},${lat},${lng});
          way["shop"="books"](around:${radius},${lat},${lng});
          node["club"="book"](around:${radius},${lat},${lng});
          way["club"="book"](around:${radius},${lat},${lng});
          node["amenity"="community_centre"]["community_centre:for"="book_club"](around:${radius},${lat},${lng});
        );
        out body;
        >;
        out skel qt;
      `;

            const response = await axios.post(
                'https://overpass-api.de/api/interpreter',
                query,
                {
                    headers: { 'Content-Type': 'text/plain' },
                    timeout: 30000
                }
            );

            if (response.data && response.data.elements) {
                const places = response.data.elements
                    .filter(element => element.lat && element.lon)
                    .map(element => {
                        let type = 'Library';
                        if (element.tags?.shop === 'books') type = 'Bookstore';
                        if (element.tags?.club === 'book' || element.tags?.['community_centre:for'] === 'book_club') type = 'Book Club';

                        return {
                            id: element.id,
                            name: element.tags?.name || 'Unnamed',
                            type: type,
                            lat: element.lat,
                            lng: element.lon,
                            address: element.tags?.['addr:street']
                                ? `${element.tags['addr:street']}${element.tags['addr:housenumber'] ? ' ' + element.tags['addr:housenumber'] : ''}`
                                : 'Address not available',
                            phone: element.tags?.phone || 'N/A',
                            website: element.tags?.website || element.tags?.['contact:website'] || 'N/A',
                        };
                    });

                setNearbyPlaces(places);
                addMarkers({ lat, lng, city: userLocation?.city, country: userLocation?.country }, places);
            }
        } catch (err) {
            console.error('Overpass API error:', err);
            setNearbyPlaces([]);
        }
    };

    const handleCityChange = async (cityName) => {
        const city = INDIAN_CITIES.find(c => c.name === cityName);
        if (!city) return;

        setSelectedCity(cityName);
        setLocationMethod('city');
        setLoading(true);

        const location = { lat: city.lat, lng: city.lng, city: city.name, country: 'India' };
        setUserLocation(location);
        setMapCenter([city.lat, city.lng]);
        updateMapView(city.lat, city.lng);

        await fetchNearbyPlaces(city.lat, city.lng, 20000, cityName);
        setLoading(false);
    };

    const initLocation = async () => {
        setLoading(true);
        try {
            // Start with Ranchi as default
            const ranchi = INDIAN_CITIES[0]; // Ranchi
            const location = { lat: ranchi.lat, lng: ranchi.lng, city: ranchi.name, country: 'India' };
            setUserLocation(location);
            await fetchNearbyPlaces(ranchi.lat, ranchi.lng, 20000, 'Ranchi');
        } catch (err) {
            console.error('Init error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="location-map-section">
            <div className="map-header">
                <div>
                    <h2>📍 Find Book Clubs & Libraries Near You</h2>
                    <p className="map-subtitle">
                        Discover reading communities and libraries in your area
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label htmlFor="city-select" style={{ fontSize: '12px', color: 'rgba(230, 238, 248, 0.7)', fontWeight: '600' }}>
                            Select City
                        </label>
                        <select
                            id="city-select"
                            value={selectedCity}
                            onChange={(e) => {
                                if (e.target.value !== 'Device Location') {
                                    handleCityChange(e.target.value);
                                }
                            }}
                            className="city-selector"
                            disabled={loading}
                        >
                            <option value="Device Location">📍 Device Location</option>
                            {INDIAN_CITIES.map(city => (
                                <option key={city.name} value={city.name}>
                                    {city.name}, {city.state}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        className="precise-location-btn"
                        onClick={getDeviceLocation}
                        disabled={loading}
                        style={{ alignSelf: 'flex-end' }}
                    >
                        <span className="location-icon">🎯</span>
                        {locationMethod === 'device' ? 'Using Device Location' : 'Use Device Location'}
                    </button>
                </div>
            </div>

            {error && <div className="map-error">{error}</div>}

            <div className="map-container">
                {loading && (
                    <div className="map-loading-overlay">
                        <div className="spinner"></div>
                        <p>Loading map...</p>
                    </div>
                )}
                <div
                    ref={mapRef}
                    style={{
                        width: '100%',
                        height: '500px',
                        borderRadius: '16px',
                        zIndex: 1
                    }}
                />
            </div>

            <div className="map-stats">
                <div className="stat-item">
                    <span className="stat-icon">📚</span>
                    <span className="stat-value">{nearbyPlaces.filter(p => p.type === 'Library').length}</span>
                    <span className="stat-label">Libraries</span>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">📖</span>
                    <span className="stat-value">{nearbyPlaces.filter(p => p.type === 'Bookstore').length}</span>
                    <span className="stat-label">Bookstores</span>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">📗</span>
                    <span className="stat-value">{nearbyPlaces.filter(p => p.type === 'Book Club').length}</span>
                    <span className="stat-label">Book Clubs</span>
                </div>
            </div>
        </section>
    );
}
