'use client'

import { useEffect, useState, useRef } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

type Search = {
  query: string;
  created_at: string;
};

type Props = {
  userId: string;
  jwt?: string;
};

export default function UserSearches({ userId, jwt }: Props) {
  const [searches, setSearches] = useState<Search[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);

  // Vérifier si le contenu dépasse la hauteur disponible
  useEffect(() => {
    const checkOverflow = () => {
      if (contentRef.current) {
        const element = contentRef.current;
        const hasOverflow = element.scrollHeight > element.clientHeight;
        setHasOverflow(hasOverflow);
      }
    };

    checkOverflow();
    
    // Re-vérifier après le chargement des données
    const timer = setTimeout(checkOverflow, 100);
    
    // Vérifier aussi lors du redimensionnement
    window.addEventListener('resize', checkOverflow);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [searches, loading, error]);

  useEffect(() => {
    const fetchSearches = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_URL_BACKEND}/search/${userId}`, 
          jwt
            ? { headers: { Authorization: `Bearer ${jwt}` } }
            : undefined
        );
        
        const json = await res.json();

        if (json.success && Array.isArray(json.searches)) {
          const sortedSearches = json.searches.sort((a: Search, b: Search) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          setSearches(sortedSearches);
        } else {
          setError(json.message || "Erreur lors du chargement des recherches");
          console.error("Fetch searches error:", json.message);
        }
      } catch (err: any) {
        setError("Impossible de charger l'historique");
        console.error("Fetch API error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchSearches();
  }, [userId, jwt]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy HH:mm", { locale: fr });
    } catch {
      return dateString;
    }
  };

  const getRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: fr 
      });
    } catch {
      return "";
    }
  };

  const totalSearches = searches.length;
  const uniqueQueries = new Set(searches.map(s => s.query.toLowerCase())).size;

  return (
    <div className="bg-white rounded-lg border border-green-200 shadow-sm overflow-hidden flex flex-col">
      {/* En-tête de la card */}
      <div className="bg-green-50 border-b border-green-100 p-4 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-green-900">Historique des Recherches</h3>
            <p className="text-sm text-green-600 mt-1">ID: {userId.substring(0, 8)}...</p>
          </div>
          {!loading && !error && (
            <div className="flex gap-2">
              <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                {totalSearches} recherche{totalSearches > 1 ? 's' : ''}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contenu principal avec défilement conditionnel */}
      <div className="flex-1 p-4 overflow-auto">

        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-green-200 border-t-green-600 rounded-full animate-spin mb-3"></div>
            <p className="text-green-700 text-sm">Chargement de l'historique...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <div className="text-red-400 text-3xl mb-2">🔍</div>
            <p className="text-red-600 font-medium mb-1">Impossible de charger</p>
            <p className="text-gray-500 text-sm text-center">{error}</p>
          </div>
        ) : searches.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <div className="text-gray-300 text-4xl mb-3">📝</div>
            <p className="text-gray-500 font-medium">Aucune recherche</p>
            <p className="text-gray-400 text-sm text-center mt-1">
              L'utilisateur n'a effectué aucune recherche
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Statistiques rapides */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                <div className="text-xs text-green-700 mb-1">Total</div>
                <div className="text-xl font-bold text-green-900">{totalSearches}</div>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                <div className="text-xs text-gray-700 mb-1">Requêtes uniques</div>
                <div className="text-xl font-bold text-gray-900">{uniqueQueries}</div>
              </div>
            </div>

            {/* Liste des recherches */}
            <div className="space-y-2">
              {searches.map((search, index) => (
                <div 
                  key={`${search.query}-${search.created_at}-${index}`}
                  className="group border border-gray-100 rounded-lg p-3 hover:border-green-200 hover:bg-green-50 transition-all duration-200"
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                        <p className="font-medium text-gray-800 group-hover:text-green-900 line-clamp-2">
                          {search.query}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded ml-2">
                      #{index + 1}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-xs text-gray-500">
                      {formatDate(search.created_at)}
                    </div>
                    <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                      {getRelativeTime(search.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>


    </div>
  );
}