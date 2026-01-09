'use client'

import { useEffect, useRef, useState } from "react";
import "@tomtom-international/web-sdk-maps/dist/maps.css";

type Props = {
  userId: string;
  jwt?: string;
};

export default function UserMap({ userId, jwt }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1️⃣ Fetch position depuis le backend
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        setLoading(true);
        setError(null);
        setCoords(null); // Réinitialiser les coordonnées
        
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_URL_BACKEND}/users/${userId}/location`,
          jwt
            ? { headers: { Authorization: `Bearer ${jwt}` } }
            : undefined
        );
        
        const json = await res.json();

        if (json.success && json.coords && 
            typeof json.coords.latitude === 'number' && 
            typeof json.coords.longitude === 'number') {
          setCoords({
            latitude: json.coords.latitude,
            longitude: json.coords.longitude,
          });
        } else {
          setError(json.message || "Aucune localisation disponible");
          console.error("Fetch location error:", json.message);
        }
      } catch (err: any) {
        setError("Impossible de récupérer la localisation");
        console.error("Fetch API error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchLocation();
  }, [userId, jwt]);

  // 2️⃣ Initialisation de la carte
  useEffect(() => {
    if (!coords || !mapRef.current || mapInstance.current) return;

    let tt: any;

    const initMap = async () => {
      try {
        const tomtom = await import("@tomtom-international/web-sdk-maps");
        tt = tomtom.default;

        mapInstance.current = tt.map({
          key: process.env.NEXT_PUBLIC_TOMTOM_API_KEY!,
          container: mapRef.current!,
          center: [coords.longitude, coords.latitude],
          zoom: 14,
          style: 'https://api.tomtom.com/style/1/style/22.2?map=basic_main',
          dragPan: true,
          scrollZoom: true,
        });

        // Ajout du marqueur
        new tt.Marker({
          color: '#10B981',
          scale: 1.2
        })
          .setLngLat([coords.longitude, coords.latitude])
          .addTo(mapInstance.current);

        // Ajout du popup
        new tt.Popup({ offset: 30 })
          .setLngLat([coords.longitude, coords.latitude])
          .setHTML(`<div class="p-2"><strong>Client</strong><br>${userId.substring(0, 8)}...</div>`)
          .addTo(mapInstance.current);

        // Contrôles de la carte
        mapInstance.current.addControl(new tt.NavigationControl());
        mapInstance.current.addControl(new tt.FullscreenControl());
        
      } catch (err) {
        console.error("Map initialization error:", err);
      }
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [coords, userId]);

  // Fonction helper pour formater les coordonnées
  const formatCoords = () => {
    if (!coords || typeof coords.latitude !== 'number' || typeof coords.longitude !== 'number') {
      return null;
    }
    return `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;
  };

  const formattedCoords = formatCoords();

  return (
    <div className="bg-white rounded-lg border border-green-200 shadow-sm overflow-hidden flex flex-col h-full">
      {/* En-tête de la card */}
      <div className="bg-green-50 border-b border-green-100 p-4 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-green-900">Localisation</h3>
          <p className="text-sm text-green-600 mt-1">ID: {userId.substring(0, 10)}...</p>
        </div>
        {formattedCoords && (
          <div className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full">
            {formattedCoords}
          </div>
        )}
      </div>

      {/* Contenu principal - La carte */}
      <div className="flex-1 relative min-h-[300px]">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white">
            <div className="w-10 h-10 border-3 border-green-200 border-t-green-600 rounded-full animate-spin mb-3"></div>
            <p className="text-green-700">Chargement de la carte...</p>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white p-6">
            <div className="text-red-400 text-4xl mb-3">📍</div>
            <p className="text-red-600 font-medium mb-2">Localisation indisponible</p>
            <p className="text-gray-500 text-sm text-center">{error}</p>
          </div>
        ) : coords && formattedCoords ? (
          <>
            <div 
              ref={mapRef} 
              className="w-full h-full absolute inset-0"
            />
            {/* Overlay avec infos */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-green-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium text-gray-800">Position du client</span>
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white">
            <div className="text-gray-400 text-4xl mb-3">🗺️</div>
            <p className="text-gray-500">Aucune donnée de localisation</p>
          </div>
        )}
      </div>

      {/* Pied de card */}
      <div className="border-t border-green-100 p-3 bg-white">
        <div className="flex justify-between items-center text-sm">
          <div className="text-gray-600">
            {loading ? "Chargement..." : 
             error ? "Erreur" : 
             coords && formattedCoords ? "Carte interactive" : "Non disponible"}
          </div>
          <div className="flex items-center gap-4">
            {coords && formattedCoords && (
              <>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Position</span>
                </div>
                <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                  Zoom: 14x
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}