'use client'

import React, { useEffect, useState } from 'react';

interface ServiceClickProps {
  clientId: string;
  jwt: string;
}

interface ClickData {
  service_id: string;
  service_name: string;
  clicks: string;
}

export default function ServiceClick({ clientId, jwt }: ServiceClickProps) {
  const [services, setServices] = useState<ClickData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId || !jwt) return;

    const fetchClicks = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_URL_BACKEND}/services/service-clicks/${clientId}`,
          {
            headers: { Authorization: `Bearer ${jwt}` },
          }
        );

        if (!res.ok) throw new Error('Erreur lors de la récupération des clics');

        const data = await res.json();
        setServices(data.clicks_per_service || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClicks();
  }, [clientId, jwt]);

  // Calcul du total des clics
  const totalClicks = services.reduce((sum, service) => sum + parseInt(service.clicks || '0'), 0);

  return (
    <div className="bg-white rounded-lg border border-green-200 shadow-sm overflow-hidden flex flex-col ">
      {/* En-tête de la card */}
      <div className="bg-green-50 border-b border-green-100 p-4">
        <h3 className="text-lg font-semibold text-green-900">Clics par Service</h3>
        <p className="text-sm text-green-600 mt-1">Client ID: {clientId.substring(0, 8)}...</p>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 p-4 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-green-600">Chargement des données...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-red-500 text-center p-3 bg-red-50 rounded border border-red-100">
              Erreur : {error}
            </div>
          </div>
        ) : services.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500 text-center p-4 bg-gray-50 rounded border border-gray-100">
              Aucun clic enregistré
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Carte du total */}
            <div className="bg-green-50 border border-green-100 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700">Total des clics</span>
                <span className="text-lg font-bold text-green-900">{totalClicks}</span>
              </div>
            </div>

            {/* Liste des services */}
            <div className="space-y-2">
              {services.map((service) => {
                const clicks = parseInt(service.clicks || '0');
                const percentage = totalClicks > 0 ? Math.round((clicks / totalClicks) * 100) : 0;
                
                return (
                  <div
                    key={service.service_id}
                    className="border border-green-100 rounded-lg p-3 hover:bg-green-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{service.service_name}</h4>
                        <p className="text-xs text-gray-500 mt-1">ID: {service.service_id.substring(0, 6)}...</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-700">{clicks}</div>
                        <div className="text-xs text-green-600 mt-1">{percentage}%</div>
                      </div>
                    </div>
                    
                    {/* Barre de progression */}
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-green-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}