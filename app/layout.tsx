// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { createClient } from '@/lib/supabase/server'
import { AuthProvider } from '@/context/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Application Conseiller',
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient()

  // ✅ Remplacer getSession par getUser pour garantir l'authenticité
  const { data: { user }, error } = await supabase.auth.getUser()
  
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-white text-gray-900`}>
        {/* AuthProvider avec utilisateur authentifié */}
        <AuthProvider initialUser={user}>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
