'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import UsersList from '@/components/Client'
import UserMap from '@/components/UserMap'
import UserSearches from '@/components/UserSearch'
import ServiceClick from '@/components/ServiceClicks'
import { useAuth,UserProfile } from '@/context/AuthContext'

export default function Home() {
  const [search, setSearch] = useState('')
  const { user, jwt, logout } = useAuth()
  const router = useRouter()
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);


  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  if (!user) return null


  return (
<div className="flex flex-col h-screen bg-white text-black overflow-hidden p-5">

  {/* Div de bienvenue avec déconnexion */}
  <div className="w-full p-5 bg-green-50 text-green-900 text-lg font-semibold rounded shadow-sm flex justify-between items-center">
    <span>Bienvenue, Conseiller : {user?.full_name || 'Conseiller'} !</span>
    <button
      onClick={logout}
      className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
    >
      Déconnexion
    </button>
  </div>

  {/* Conteneur principal */}
  <div className="flex flex-1 w-full overflow-hidden mt-5 gap-5">

    {/* Conteneur gauche */}
    <div className="w-1/3 bg-green-50 flex flex-col p-5">
      <input
        type="text"
        placeholder="Rechercher..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-3 mb-5 text-black border border-green-200 rounded"
      />

      {/* Liste des utilisateurs avec scroll */}
 <div className="flex-1 bg-white rounded p-4 border border-green-200 flex flex-col overflow-auto">
<UsersList search={search} jwt={jwt} onSelectUser={(id) => setSelectedUserId(id)} />

</div>

    </div>

{/* Conteneur droit */}
<div className="w-2/3 flex flex-col p-5 gap-5 h-136 border border-black">
  <div className="grid grid-cols-2 gap-5 flex-1 overflow-y-scroll">

    {/* Affichage du composant ServiceClick */}
    {selectedUserId && jwt && (
      <ServiceClick clientId={selectedUserId} jwt={jwt} />
    )}

    {/* Carte de l'utilisateur */}
    {selectedUserId && jwt && (
      <UserMap userId={selectedUserId} jwt={jwt} />
    )}

    {/* Historique des recherches */}
    {selectedUserId && jwt && (
      <UserSearches userId={selectedUserId} jwt={jwt} />
    )}

  </div>
</div>


  </div>
</div>

  )
}
