import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    Input,
    Button,
    Typography,
    Checkbox,
    Alert,
} from "@material-tailwind/react";
import api from "../../api/axiosInstance";

export function SignIn() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [wrongTenantError, setWrongTenantError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        setWrongTenantError(null);
        setLoading(true);

        api.post("auth/token/", form)
            .then((res) => {
                // Stockage des tokens
                localStorage.setItem("access_token", res.data.access);
                localStorage.setItem("refresh_token", res.data.refresh);

                // Récupérer le profil utilisateur
                api.get("auth/me/")
                    .then((r) => {
                        const userProfile = r.data;
                        localStorage.setItem("user", JSON.stringify(userProfile));
                        setLoading(false);

                        // 🚀 Redirection basée sur le rôle
                        if (userProfile.role === "COACH") {

                            navigate("/coach"); // ← NOUVELLE REDIRECTION POUR LES COACH
                        } else if (userProfile.role === "ADMIN" || userProfile.role === "RECEPTIONIST") {

                            navigate("/admin/dashboard");
                        } else {
                            navigate("/portal");
                        }
                    })
                    .catch((err) => {
                        console.error("Erreur lors de la récupération du profil:", err);
                        setError("Connexion réussie, mais échec de la récupération du profil.");
                        setLoading(false);
                    });
            })
            .catch((err) => {
                console.error("Erreur de connexion:", err);
                setLoading(false);

                // Erreur de tenant (mauvais centre)
                if (err.response?.data?.error === "Mauvais centre") {
                    setWrongTenantError({
                        message: err.response.data.detail,
                        correctUrl: err.response.data.correct_url,
                        correctSubdomain: err.response.data.correct_subdomain
                    });
                }
                // Erreur Django "non_field_errors"
                else if (err.response?.data?.non_field_errors) {
                    setError(err.response.data.non_field_errors[0]);
                }
                // Erreur standard
                else if (err.response?.data?.detail) {
                    setError(err.response.data.detail);
                }
                // Erreur générique
                else {
                    setError("Identifiants invalides ou erreur de connexion.");
                }
            });
    };

    const redirectToCorrectCenter = () => {
        if (wrongTenantError?.correctUrl) {
            window.location.href = wrongTenantError.correctUrl + "/sign-in";
        }
    };

    return (
        <section className="m-8 flex">
            <div className="w-full lg:w-3/5 mt-24">
                <div className="text-center">
                    <Typography variant="h2" className="font-bold mb-4">Se Connecter</Typography>
                    <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">
                        Entrez votre email et votre mot de passe.
                    </Typography>
                </div>

                {/* ⚠️ Erreur tenant (mauvais sous-domaine) */}

                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4" role="alert">
                        <strong className="font-bold">⚠️ Erreur : </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>

                )}
                {/* ⚠️ Erreur de tenant (mauvais sous-domaine) */}

                {wrongTenantError && (
                    <Alert
                        color="amber"
                        className="mt-6 mx-auto w-80 max-w-screen-lg lg:w-1/2"
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        }
                    >
                        <Typography variant="h6" color="amber" className="mb-2">
                            ⚠️ Mauvais centre de fitness
                        </Typography>
                        <Typography variant="small" className="mb-3">
                            {wrongTenantError.message}
                        </Typography>
                        <Button
                            size="sm"
                            color="amber"
                            variant="outlined"
                            onClick={redirectToCorrectCenter}
                            className="flex items-center gap-2"
                        >
                            Me rediriger vers mon centre
                        </Button>
                    </Alert>
                )}

                {/* ⚠️ Autres erreurs */}
                {error && !wrongTenantError && (
                    <Alert
                        color="red"
                        className="mt-6 mx-auto w-80 max-w-screen-lg lg:w-1/2"
                    >
                        <Typography variant="h6" color="white">
                            Erreur de connexion
                        </Typography>
                        <Typography variant="small" color="white" className="mt-1">
                            {error}
                        </Typography>
                    </Alert>
                )}

                <form className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2" onSubmit={handleSubmit}>
                    <div className="mb-1 flex flex-col gap-6">
                        <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
                            Votre Email
                        </Typography>
                        <Input
                            size="lg"
                            placeholder="name@mail.com"
                            className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                            labelProps={{ className: "before:content-none after:content-none" }}
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />

                        <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
                            Mot de passe
                        </Typography>
                        <Input
                            type="password"
                            size="lg"
                            placeholder="········"
                            className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                            labelProps={{ className: "before:content-none after:content-none" }}
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-6">
                        <Checkbox
                            label={
                                <Typography variant="small" color="gray" className="flex items-center justify-start font-medium">
                                    Se souvenir de moi
                                </Typography>
                            }
                            containerProps={{ className: "-ml-2.5" }}
                        />
                        <Typography variant="small" className="font-medium text-gray-900">
                            <Link to="/forgot-password" className="hover:underline">
                                Mot de passe oublié ?
                            </Link>
                        </Typography>
                    </div>

                    <Button className="mt-6" fullWidth type="submit" disabled={loading}>
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Connexion...
                            </div>
                        ) : (
                            "Se Connecter"
                        )}
                    </Button>

                    <Typography variant="paragraph" className="text-center text-blue-gray-500 font-medium mt-4">
                        Pas encore inscrit ?
                        <Link to="/sign-up" className="text-gray-900 ml-1">
                            Créer un compte
                        </Link>
                    </Typography>
                </form>

            </div>

            <div className="w-2/5 h-full hidden lg:block">
                <img
                    src="/img/pattern.jpg"
                    className="h-full w-full object-cover rounded-3xl"
                    alt="Image de fond"
                />
            </div>

        </section>
    );
}

export default SignIn;
