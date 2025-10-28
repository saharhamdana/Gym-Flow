import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    Input,
    Button,
    Typography,
    Checkbox,
} from "@material-tailwind/react";
import api from "../api/axiosInstance";

export function SignIn() {
    const navigate = useNavigate();
    // ✅ Utilisation de 'email' au lieu de 'username'
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // 1. Appel pour obtenir les tokens avec email/password
        api.post("/token/", form)
            .then((res) => {
                // 🔑 Stockage des tokens
                localStorage.setItem("access_token", res.data.access);
                localStorage.setItem("refresh_token", res.data.refresh);

                // 2. Récupère le profil courant
                api.get("/me/")
                    .then((r) => {
                        const userProfile = r.data;
                        localStorage.setItem("user", JSON.stringify(userProfile));
                        setLoading(false);

                        // 🚀 Redirection basée sur le rôle
                        const userRole = userProfile.role.toLowerCase();
                        let redirectTo;

                        if (userRole === "admin" || userRole === "coach") {
                            redirectTo = "/admin/members";
                        } else {
                            redirectTo = "/profile";
                        }

                        navigate(redirectTo);
                    })
                    .catch(() => {
                        localStorage.removeItem("access_token");
                        localStorage.removeItem("refresh_token");
                        localStorage.removeItem("user");
                        setError("Connexion réussie, mais impossible de récupérer le profil. Veuillez réessayer.");
                        setLoading(false);
                    });
            })
            .catch((err) => {
                console.error("Erreur de connexion:", err.response?.data);
                setError(
                    err.response?.data?.detail || 
                    "Identifiants invalides ou erreur de connexion."
                );
                setLoading(false);
            });
    };

    return (
        <section className="m-8 flex gap-4">
            <div className="w-full lg:w-3/5 mt-24">
                <div className="text-center">
                    <Typography variant="h2" className="font-bold mb-4">
                        Connexion
                    </Typography>
                    <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">
                        Entrez votre email et votre mot de passe.
                    </Typography>
                    {error && (
                        <Typography variant="small" color="red" className="mt-4 font-medium">
                            ⚠️ {error}
                        </Typography>
                    )}
                </div>

                <form className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2" onSubmit={handleSubmit}>
                    <div className="mb-1 flex flex-col gap-6">

                        {/* ✅ Champ Email */}
                        <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
                            Email
                        </Typography>
                        <Input
                            name="email"
                            type="email"
                            size="lg"
                            placeholder="nom@exemple.com"
                            className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                            labelProps={{ className: "before:content-none after:content-none" }}
                            onChange={handleChange}
                            value={form.email}
                            required
                        />

                        {/* Champ Mot de passe */}
                        <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
                            Mot de passe
                        </Typography>
                        <Input
                            name="password"
                            type="password"
                            size="lg"
                            placeholder="********"
                            className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                            labelProps={{ className: "before:content-none after:content-none" }}
                            onChange={handleChange}
                            value={form.password}
                            required
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
                            <a href="#">Mot de passe oublié</a>
                        </Typography>
                    </div>

                    <Button className="mt-6" fullWidth type="submit" disabled={loading}>
                        {loading ? "Connexion..." : "Se Connecter"}
                    </Button>
                    
                    <Typography variant="paragraph" className="text-center text-blue-gray-500 font-medium mt-4">
                        Pas encore inscrit ?
                        <Link to="/register" className="text-gray-900 ml-1">
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