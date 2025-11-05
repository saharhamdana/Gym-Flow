// frontend/src/pages/auth/ResetPassword.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    Input,
    Button,
    Typography,
    Alert,
} from "@material-tailwind/react";
import api from "../../api/axiosInstance";

export function ResetPassword() {
    const { uid, token } = useParams();
    const navigate = useNavigate();
    
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [validToken, setValidToken] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [userEmail, setUserEmail] = useState("");

    // Vérifier le token au chargement
    useEffect(() => {
        api.post("auth/password-reset/verify/", { uid, token })
            .then((res) => {
                setValidToken(true);
                setUserEmail(res.data.email);
                setVerifying(false);
            })
            .catch((err) => {
                console.error("Token invalide:", err);
                setValidToken(false);
                setVerifying(false);
                setError(err.response?.data?.error || "Le lien est invalide ou a expiré.");
            });
    }, [uid, token]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");

        // Validation
        if (password.length < 8) {
            setError("Le mot de passe doit contenir au moins 8 caractères.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        setLoading(true);

        api.post("auth/password-reset/confirm/", {
            uid,
            token,
            new_password: password
        })
            .then((res) => {
                setLoading(false);
                setSuccess(true);
                
                // Rediriger vers la page de connexion après 3 secondes
                setTimeout(() => {
                    navigate("/sign-in", {
                        state: { message: "Mot de passe réinitialisé avec succès ! Vous pouvez vous connecter." }
                    });
                }, 3000);
            })
            .catch((err) => {
                console.error("Erreur:", err);
                setLoading(false);
                setError(err.response?.data?.detail || "Une erreur est survenue.");
            });
    };

    // Pendant la vérification du token
    if (verifying) {
        return (
            <section className="m-8 flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <svg className="animate-spin h-12 w-12 text-gray-900 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <Typography variant="h5" color="gray">
                        Vérification du lien...
                    </Typography>
                </div>
            </section>
        );
    }

    // Si le token est invalide
    if (!validToken) {
        return (
            <section className="m-8 flex justify-center items-center min-h-screen">
                <div className="w-full lg:w-2/5">
                    <Alert 
                        color="red"
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        }
                    >
                        <Typography variant="h6" color="white" className="mb-2">
                            ⚠️ Lien invalide
                        </Typography>
                        <Typography variant="small" color="white" className="mb-4">
                            {error}
                        </Typography>
                        <Link to="/forgot-password">
                            <Button size="sm" variant="outlined" color="white">
                                Demander un nouveau lien
                            </Button>
                        </Link>
                    </Alert>
                </div>
            </section>
        );
    }

    // Formulaire de réinitialisation
    return (
        <section className="m-8 flex justify-center items-center min-h-screen">
            <div className="w-full lg:w-2/5">
                <div className="text-center mb-8">
                    <Typography variant="h2" className="font-bold mb-4">
                        Nouveau mot de passe
                    </Typography>
                    <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">
                        Pour le compte : <strong>{userEmail}</strong>
                    </Typography>
                </div>

                {/* Message de succès */}
                {success && (
                    <Alert 
                        color="green" 
                        className="mb-6"
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    >
                        <Typography variant="h6" color="white" className="mb-1">
                            ✅ Mot de passe réinitialisé !
                        </Typography>
                        <Typography variant="small" color="white">
                            Redirection vers la page de connexion...
                        </Typography>
                    </Alert>
                )}

                {/* Message d'erreur */}
                {error && !success && (
                    <Alert 
                        color="red" 
                        className="mb-6"
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                        }
                    >
                        <Typography variant="h6" color="white">
                            Erreur
                        </Typography>
                        <Typography variant="small" color="white" className="mt-1">
                            {error}
                        </Typography>
                    </Alert>
                )}

                <form className="mx-auto w-full max-w-md" onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                            Nouveau mot de passe
                        </Typography>
                        <Input
                            type="password"
                            size="lg"
                            placeholder="········"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading || success}
                            className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                        />
                        <Typography variant="small" color="gray" className="mt-2 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                            </svg>
                            Au moins 8 caractères
                        </Typography>
                    </div>

                    <div className="mb-6">
                        <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                            Confirmer le mot de passe
                        </Typography>
                        <Input
                            type="password"
                            size="lg"
                            placeholder="········"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={loading || success}
                            className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                        />
                    </div>

                    <Button 
                        className="mt-6" 
                        fullWidth 
                        type="submit" 
                        disabled={loading || success}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Réinitialisation...
                            </div>
                        ) : (
                            "Réinitialiser le mot de passe"
                        )}
                    </Button>
                </form>
            </div>
        </section>
    );
}

export default ResetPassword;