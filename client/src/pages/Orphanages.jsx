import React, { useEffect, useState, useRef } from 'react';
import API from '../utils/api';
import OrphanageCard from '../components/OrphanageCard';
import { Search, MapPin, SlidersHorizontal, Info } from 'lucide-react';
import L from 'leaflet';

// Setup standard Leaflet Icon assets manually to avoid package path mismatches
const customIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

const Orphanages = () => {
  const [orphanages, setOrphanages] = useState([]);
  const [filteredOrphanages, setFilteredOrphanages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters State
  const [searchCity, setSearchCity] = useState('');
  const [filterNeed, setFilterNeed] = useState('');
  const [filterCapacity, setFilterCapacity] = useState('');

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerLayerRef = useRef(null);

  // 1. Fetch Approved Orphanages
  useEffect(() => {
    const fetchOrphanages = async () => {
      try {
        const response = await API.get('/orphanages');
        setOrphanages(response.data);
        setFilteredOrphanages(response.data);
      } catch (error) {
        console.error("Failed to load orphanages data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrphanages();
  }, []);

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (!loading && !mapInstanceRef.current && mapContainerRef.current) {
      // Default center: India center geocoordinates
      mapInstanceRef.current = L.map(mapContainerRef.current).setView([20.5937, 78.9629], 5);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);

      markerLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }

    // Map Clean up
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerLayerRef.current = null;
      }
    };
  }, [loading]);

  // 3. Apply filters & Update map markers
  useEffect(() => {
    let result = orphanages;

    if (searchCity.trim()) {
      result = result.filter(o => o.city.toLowerCase().includes(searchCity.toLowerCase()));
    }

    if (filterNeed) {
      result = result.filter(o => 
        o.needs.some(n => n.item.toLowerCase().includes(filterNeed.toLowerCase()))
      );
    }

    if (filterCapacity) {
      result = result.filter(o => o.capacity >= parseInt(filterCapacity));
    }

    setFilteredOrphanages(result);

    // Update map markers
    if (mapInstanceRef.current && markerLayerRef.current) {
      markerLayerRef.current.clearLayers();

      const validCoords = result.filter(o => o.location && o.location.lat && o.location.lng);

      validCoords.forEach(o => {
        const marker = L.marker([o.location.lat, o.location.lng], { icon: customIcon });
        
        // Custom HTML popup inside Leaflet
        marker.bindPopup(`
          <div style="font-family: 'Poppins', sans-serif; padding: 4px; max-width: 200px;">
            <h4 style="margin: 0 0 4px; font-weight: 700; color: #3E2723; font-size: 13px;">${o.name}</h4>
            <p style="margin: 0 0 8px; color: #666; font-size: 11px;">📍 ${o.address}</p>
            <p style="margin: 0 0 8px; font-size: 11px; font-weight: 600; color: #FF6B35;">
              ${o.currentChildren}/${o.capacity} Children
            </p>
            <a href="/donate?orphanageId=${o._id}" 
               style="display: block; text-align: center; background-color: #FF6B35; color: white; padding: 6px 12px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 11px;">
              Help Orphanage
            </a>
          </div>
        `);
        markerLayerRef.current.addLayer(marker);
      });

      // Pan/Zoom map to fit markers if there are multiple
      if (validCoords.length > 0) {
        const bounds = L.latLngBounds(validCoords.map(o => [o.location.lat, o.location.lng]));
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }
    }
  }, [searchCity, filterNeed, filterCapacity, orphanages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-hn-secondary via-hn-white to-hn-secondary/30 dark:from-hn-dark/30 dark:via-hn-dark dark:to-hn-dark/60 pb-20 transition-colors duration-300">
      
      {/* Page Header */}
      <section className="bg-hn-dark text-hn-white py-12 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="text-hn-primary text-xs font-bold uppercase tracking-wider">
            Explore Verified Care Centers
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-extrabold mt-2 mb-4">
            Find Orphanages Near You
          </h1>
          <p className="text-sm text-hn-secondary/70 max-w-xl mx-auto">
            Interact with our geolocated registry map to discover active orphanages and supply specific needs.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
        
        {/* Interactive Map Wrapper */}
        <div className="bg-hn-white dark:bg-hn-dark rounded-3xl p-4 shadow-md border border-hn-secondary/30 dark:border-hn-dark/30 relative">
          <div className="flex items-center gap-2 mb-3 px-2 text-xs font-semibold text-hn-dark/50 dark:text-hn-secondary/60">
            <Info className="w-4 h-4 text-hn-primary" /> Click on pins to view quick needs or route directly.
          </div>
          <div className="h-96 w-full relative z-10 overflow-hidden rounded-2xl">
            {loading ? (
              <div className="absolute inset-0 skeleton-loading flex items-center justify-center">
                <span className="text-sm font-semibold text-hn-dark/40 dark:text-white/40">Initializing Map canvas...</span>
              </div>
            ) : (
              <div ref={mapContainerRef} className="w-full h-full" id="map-container" />
            )}
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-hn-white dark:bg-hn-dark rounded-3xl p-6 shadow-sm border border-hn-secondary/30 dark:border-hn-dark/30">
          <div className="flex items-center gap-2 mb-4 border-b border-hn-secondary/10 pb-3">
            <SlidersHorizontal className="w-5 h-5 text-hn-primary" />
            <h3 className="font-serif text-lg font-bold text-hn-dark dark:text-hn-white">Filter Centers</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Filter by City */}
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-hn-dark/40 dark:text-hn-secondary/40" />
              <input
                type="text"
                placeholder="Search by city (e.g. Mumbai)"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-hn-secondary/20 dark:bg-hn-dark/30 border border-hn-secondary/40 dark:border-hn-dark/40 rounded-xl text-sm focus:outline-none focus:border-hn-primary text-hn-dark dark:text-hn-white"
              />
            </div>

            {/* Filter by Needed Items */}
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-hn-dark/40 dark:text-hn-secondary/40" />
              <input
                type="text"
                placeholder="Filter by needed items (e.g. Rice)"
                value={filterNeed}
                onChange={(e) => setFilterNeed(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-hn-secondary/20 dark:bg-hn-dark/30 border border-hn-secondary/40 dark:border-hn-dark/40 rounded-xl text-sm focus:outline-none focus:border-hn-primary text-hn-dark dark:text-hn-white"
              />
            </div>

            {/* Filter by capacity limit */}
            <div>
              <select
                value={filterCapacity}
                onChange={(e) => setFilterCapacity(e.target.value)}
                className="w-full px-4 py-2.5 bg-hn-secondary/20 dark:bg-hn-dark/30 border border-hn-secondary/40 dark:border-hn-dark/40 rounded-xl text-sm focus:outline-none focus:border-hn-primary text-hn-dark/70 dark:text-hn-secondary/70"
              >
                <option value="">Minimum Capacity (All)</option>
                <option value="20">20+ Children</option>
                <option value="45">45+ Children</option>
                <option value="60">60+ Children</option>
              </select>
            </div>
          </div>
        </div>

        {/* Card Grid List */}
        <div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(n => (
                <div key={n} className="h-96 skeleton-loading rounded-3xl" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredOrphanages.map(orph => (
                  <OrphanageCard key={orph._id} orphanage={orph} />
                ))}
              </div>

              {filteredOrphanages.length === 0 && (
                <div className="text-center py-20 bg-hn-white dark:bg-hn-dark rounded-3xl border border-dashed border-hn-secondary/50 dark:border-hn-dark/40">
                  <span className="text-sm font-semibold text-hn-dark/40 dark:text-white/40 block mb-2">No matching orphanages found</span>
                  <p className="text-xs text-hn-dark/50 dark:text-hn-secondary/50">Try broadening your filter criteria or checking spelling.</p>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default Orphanages;
