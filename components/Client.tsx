'use client'

import { useEffect, useState } from "react";

interface UsersListProps {
  search: string;
  jwt: string | null;
  onSelectUser?: (userId: string) => void;
}

interface User {
  id: string;
  email?: string;
  full_name?: string;
  type: 'premium' | 'standard' | string;
}

export default function UsersList({ search, jwt, onSelectUser }: UsersListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!jwt) return;

    const fetchUsers = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_URL_BACKEND}/users/all`, {
          headers: { Authorization: `Bearer ${jwt}` },
        })

        if (!res.ok) throw new Error("Erreur lors de la récupération des utilisateurs");
        const data = await res.json();
        if (data.success) {
          setUsers(data.users);
        } else {
          setError("Impossible de récupérer les utilisateurs");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [jwt]);

  const handleClick = (userId: string) => {
    setSelectedUserId(userId);
    if (onSelectUser) onSelectUser(userId);
  };

  if (loading) return <p className="p-3 text-green-600">Chargement des utilisateurs...</p>;
  if (error) return <p className="p-3 text-red-500">{error}</p>;

  const premiumUsers = users.filter((user) => user.type === "premium");
  const standardUsers = users.filter((user) => user.type !== "premium");

  const filterUsers = (arr: User[]) =>
    arr.filter((user) =>
      (user.full_name || user.email || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  const renderUserItem = (user: User) => {
    const isSelected = selectedUserId === user.id;
    return (
      <div
        key={user.id}
        className={`p-3 rounded cursor-pointer transition-all duration-200 border ${
          isSelected
            ? "bg-green-100 border-green-400 border-l-4 border-l-green-600 shadow-sm"
            : "bg-white border-green-100 hover:bg-green-50 hover:border-green-200"
        }`}
        onClick={() => handleClick(user.id)}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className={`font-medium ${isSelected ? "text-green-900" : "text-gray-800"}`}>
              {user.full_name || "Nom non renseigné"}
            </p>
            <p className={`text-sm ${isSelected ? "text-green-700" : "text-gray-600"}`}>
              {user.email || user.id}
            </p>
          </div>
          <div className={`text-xs px-2 py-1 rounded ${
            user.type === "premium" ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-700"
          }`}>
            {user.type === "premium" ? "Premium" : "Standard"}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Sections Premium et Standard avec défilement */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Section Premium avec hauteur fixe et défilement */}
        <div className="flex-[2] flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-green-900">Clients Premium</h2>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              {filterUsers(premiumUsers).length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto rounded-lg p-2">
            <div className="flex flex-col gap-2">
              {filterUsers(premiumUsers).length > 0
                ? filterUsers(premiumUsers).map(renderUserItem)
                : <div className="p-4 text-center text-gray-500 bg-white rounded border border-green-100">
                    Aucun client premium
                  </div>}
            </div>
          </div>
        </div>

        {/* Séparateur */}
        <div className="h-4"></div>

        {/* Section Standard avec hauteur fixe et défilement */}
        <div className="flex-[2] flex flex-col min-h-0 mb-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-800">Clients Standard</h2>
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
              {filterUsers(standardUsers).length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto rounded-lg p-2">
            <div className="flex flex-col gap-2">
              {filterUsers(standardUsers).length > 0
                ? filterUsers(standardUsers).map(renderUserItem)
                : <div className="p-4 text-center text-gray-500 bg-white rounded border border-green-100">
                    Aucun client standard
                  </div>}
            </div>
          </div>
        </div>
      </div>

      {/* Section utilisateur sélectionné - TOUJOURS visible et FIXE */}
      <div className="flex-shrink-0 mt-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium text-green-900">
                  Utilisateur sélectionné
                </span>
              </div>
              {selectedUserId ? (
                <div className="mt-2">
                  <p className="font-medium text-green-800">
                    {users.find(u => u.id === selectedUserId)?.full_name || "Nom inconnu"}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {users.find(u => u.id === selectedUserId)?.email || selectedUserId}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-green-700 mt-2">
                  Cliquez sur un utilisateur pour le sélectionner
                </p>
              )}
            </div>
            
            {selectedUserId && (
              <div className={`text-xs px-3 py-1 rounded ${
                users.find(u => u.id === selectedUserId)?.type === "premium" 
                  ? "bg-green-200 text-green-800" 
                  : "bg-gray-200 text-gray-700"
              }`}>
                {users.find(u => u.id === selectedUserId)?.type === "premium" ? "Premium" : "Standard"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}