"use client";

import { useEffect, useState } from "react";
import { Lock, CheckCircle, AlertCircle, Key } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export default function ResetPasswordPage() {
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);

  /* --------------------------------
     Récupération des tokens depuis l’URL (#hash)
  -------------------------------- */
  useEffect(() => {
    const hash = window.location.hash;

    if (!hash) return;

    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (!accessToken || !refreshToken) {
      setErrorMessage("Lien de réinitialisation invalide ou expiré.");
      return;
    }

    const setSession = async () => {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        setErrorMessage(error.message);
      }
    };

    setSession();
  }, []);

  /* --------------------------------
     Update password via Supabase
  -------------------------------- */
  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      setErrorMessage("Veuillez remplir tous les champs.");
      return;
    }

    if (!PASSWORD_REGEX.test(password)) {
      setErrorMessage(
        "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial."
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
    } catch (err) {
      setErrorMessage(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------------
     UI
  -------------------------------- */
  return (
    <div className="min-h-screen bg-white flex justify-center items-center px-4">
      <div className="w-full max-w-md">

        <div className="flex justify-center mb-6">
          <Lock size={64} className="text-green-500" />
        </div>

        <h1 className="text-2xl font-bold text-center mb-6">
          Réinitialisation du mot de passe
        </h1>

        {errorMessage && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-300 p-3 rounded mb-4">
            <AlertCircle className="text-red-600" size={20} />
            <span className="text-sm">{errorMessage}</span>
          </div>
        )}

        {success ? (
          <div className="flex flex-col items-center gap-3 bg-green-50 border border-green-300 p-5 rounded text-center">
            <CheckCircle className="text-green-600" size={32} />
            <p className="font-semibold text-green-700">
              Mot de passe modifié avec succès 🎉
            </p>
            <p className="text-sm text-gray-600">
              Veuillez retourner sur l’application mobile et vous connecter
              avec votre nouveau mot de passe.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Nouveau mot de passe"
              className="w-full h-14 border rounded-xl px-4 bg-gray-50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />

            <input
              type="password"
              placeholder="Confirmer le mot de passe"
              className="w-full h-14 border rounded-xl px-4 bg-gray-50"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />

            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full h-14 rounded-xl flex items-center justify-center gap-2 text-white font-bold bg-green-500 hover:bg-green-600"
            >
              {loading ? "Chargement..." : (
                <>
                  <Key size={18} /> Réinitialiser
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
