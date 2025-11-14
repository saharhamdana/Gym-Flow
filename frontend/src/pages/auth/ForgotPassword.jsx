// frontend/src/pages/auth/ForgotPassword.jsx

import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    Input,
    Button,
    Typography,
    Alert,
} from "@material-tailwind/react";
import api from "../../api/axiosInstance";

export function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        setSuccess(false);
        setLoading(true);

        api.post("auth/password-reset/request/", { email })
            .then((res) => {
                setLoading(false);
                setSuccess(true);
                setEmail(""); // Vider le champ
            })
            .catch((err) => {
                console.error("Erreur:", err);
                setLoading(false);
                
                if (err.response?.data?.detail) {
                    setError(err.response.data.detail);
                } else {
                    setError("Une erreur est survenue. Veuillez réessayer.");
                }
            });
    };

    return (
        <section className="m-8 flex justify-center items-center min-h-screen">
            <div className="w-full lg:w-2/5">
                <div className="text-center mb-8">
                    <Typography variant="h2" className="font-bold mb-4">
                        Mot de passe oublié ?
                    </Typography>
                    <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">
                        Entrez votre email pour recevoir un lien de réinitialisation
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
                            ✅ Email envoyé !
                        </Typography>
                        <Typography variant="small" color="white">
                            Si un compte existe avec cet email, vous recevrez un lien de réinitialisation dans quelques minutes.
                            Vérifiez également votre dossier spam.
                        </Typography>
                    </Alert>
                )}

                {/* Message d'erreur */}
                {error && (
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
                            Adresse Email
                        </Typography>
                        <Input
                            size="lg"
                            placeholder="name@mail.com"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading || success}
                            className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                </svg>
                            }
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
                                Envoi en cours...
                            </div>
                        ) : success ? (
                            <div className="flex items-center justify-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Email envoyé
                            </div>
                        ) : (
                            "Envoyer le lien de réinitialisation"
                        )}
                    </Button>

                    <div className="flex items-center justify-center gap-2 mt-6">
                        <Typography variant="small" className="font-normal text-gray-700">
                            Vous vous souvenez de votre mot de passe ?
                        </Typography>
                        <Link to="/sign-in" className="font-medium text-gray-900 hover:underline">
                            Se connecter
                        </Link>
                    </div>
                </form>

                {/* Informations supplémentaires */}
                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                    <Typography variant="small" color="blue-gray" className="font-medium mb-2">
                        ℹ️ Que se passe-t-il ensuite ?
                    </Typography>
                    <ul className="text-sm text-gray-700 space-y-1 ml-4">
                        <li>• Vous recevrez un email avec un lien sécurisé</li>
                        <li>• Le lien est valide pendant 24 heures</li>
                        <li>• Cliquez sur le lien pour créer un nouveau mot de passe</li>
                    </ul>
                </div>
            </div>
        </section>
    );
}

export default ForgotPassword;