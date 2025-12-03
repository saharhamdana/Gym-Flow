import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export function SuperAdminSignIn() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("superadmin@gymflow.com");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            console.log("🔐 Tentative connexion superadmin...");
            
            // Déterminer l'URL de base
            const baseURL = window.location.hostname.includes('localhost') 
                ? 'http://127.0.0.1:8000'
                : window.location.protocol + '//api.gymflow.com';
            
            const apiUrl = `${baseURL}/api/superadmin/auth/login/`;
            
            console.log("📤 Envoi vers:", apiUrl);
            
            const response = await axios.post(apiUrl, {
                email,
                password
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    // PAS de X-Tenant-Subdomain ici !
                }
            });

            console.log("✅ Réponse reçue:", response.data);
            
            const { access, refresh, user } = response.data;
            
            // Stocker les tokens
            localStorage.setItem("access_token", access);
            localStorage.setItem("refresh_token", refresh);
            localStorage.setItem("user", JSON.stringify(user));
            
            setLoading(false);
            
            // Rediriger vers le dashboard
            navigate("/superadmin/dashboard");
            
        } catch (err) {
            console.error("❌ Erreur détaillée:", {
                status: err.response?.status,
                data: err.response?.data,
                message: err.message
            });
            
            setLoading(false);
            
            if (err.response?.data?.detail) {
                setError(err.response.data.detail);
            } else if (err.response?.data?.non_field_errors) {
                setError(err.response.data.non_field_errors[0]);
            } else if (err.response?.data?.email) {
                setError(`Email: ${err.response.data.email[0]}`);
            } else if (err.response?.data?.password) {
                setError(`Mot de passe: ${err.response.data.password[0]}`);
            } else {
                setError("Erreur de connexion. Vérifiez vos identifiants.");
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
            <div className="w-full max-w-md bg-white/5 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/10">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">👑</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">
                        SuperAdmin GymFlow
                    </h1>
                    <p className="text-gray-400 text-sm">
                        Connexion système - Pas de sous-domaine requis
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                            Email SuperAdmin
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            placeholder="superadmin@gymflow.com"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            placeholder="••••••••"
                            required
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Connexion...
                            </div>
                        ) : (
                            "Connexion SuperAdmin"
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                    <p className="text-xs text-gray-500 mb-3">
                        🔐 Endpoint spécial: /api/superadmin/auth/login/
                    </p>
                    <a 
                        href="/sign-in" 
                        className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition"
                    >
                        ← Connexion standard (avec sous-domaine)
                    </a>
                </div>
            </div>
        </div>
    );
}

export default SuperAdminSignIn;