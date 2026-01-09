'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext' // <-- on importe le contexte

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { login, user } = useAuth() // <-- hook pour accéder à login et user
  const router = useRouter()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await login(email, password) // <-- utilisation de la fonction login du contexte
      router.push('/')              // redirection après login
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Si déjà connecté, redirige vers la page principale
  if (user) {
    router.push('/')
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-8 border border-green-200 rounded-xl bg-white">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-green-900">
            Connexion Conseiller
          </h2>
          <p className="text-green-600 mt-2">
            Espace professionnel
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-green-200 rounded focus:outline-none focus:border-green-400"
                placeholder="Email"
              />
            </div>

            <div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-green-200 rounded focus:outline-none focus:border-green-400"
                placeholder="Mot de passe"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
