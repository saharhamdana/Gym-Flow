import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    Input,
    Button,
    Typography,
    Checkbox,
} from "@material-tailwind/react";
import api from "../../api/axiosInstance";

export function SignIn() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // 🔑 CORRECTION : Ajout du préfixe 'auth/'
        api.post("auth/token/", form) 
            .then((res) => {
                // 🔑 Stockage des tokens
                localStorage.setItem("access_token", res.data.access);
                localStorage.setItem("refresh_token", res.data.refresh);

                // 🔑 CORRECTION : Ajout du préfixe 'auth/'
                api.get("auth/me/") 
                    .then((r) => {
                        const userProfile = r.data;
                        localStorage.setItem("user", JSON.stringify(userProfile));
                        setLoading(false);

                        // 🚀 Redirection basée sur le rôle
                        if (userProfile.role === "ADMIN" || userProfile.role === "COACH" || userProfile.role === "RECEPTIONIST") {
                            navigate("/admin/dashboard");
                        } else {
                            navigate("/profile");
                        }
                    })
                    .catch((err) => {
                        console.error("Erreur lors de la récupération du profil:", err);
                        setError("Connexion réussie, mais échec de la récupération du profil.");
                        setLoading(false);
                    });
            })
            .catch((err) => {
                console.error(err);
                setError("Identifiants invalides ou erreur de connexion.");
                setLoading(false);
            });
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
                
                {/* ⚠️ Affichage de l'erreur */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4" role="alert">
                        <strong className="font-bold">⚠️ Erreur : </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <form className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2" onSubmit={handleSubmit}>
                    <div className="mb-1 flex flex-col gap-6">
                        <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
                            Votre Email
                        </Typography>
                        <Input
                            size="lg"
                            placeholder="name@mail.com"
                            className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                            labelProps={{
                                className: "before:content-none after:content-none",
                            }}
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                        <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
                            Mot de passe
                        </Typography>
                        <Input
                            type="password"
                            size="lg"
                            placeholder="********"
                            className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                            labelProps={{
                                className: "before:content-none after:content-none",
                            }}
                            name="password"
                            value={form.password}
                            onChange={handleChange}
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