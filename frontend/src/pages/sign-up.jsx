import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
// 🎯 Assurez-vous que le chemin est correct. 
// Si le fichier est dans src/pages, l'API est dans src/api/axiosInstance.js
import api from "../api/axiosInstance"; 

import {
  Input,
  Checkbox,
  Button,
  Typography,
} from "@material-tailwind/react";

export function SignUp() {
  const navigate = useNavigate();
  // 🔑 Champs nécessaires pour l'enregistrement sur le backend Django
  const [form, setForm] = useState({ username: "", email: "", password: "" }); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // 1. Validation de base
    if (!form.username || !form.password) {
      setError("Le nom d'utilisateur et le mot de passe sont requis.");
      return;
    }
    if (form.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    
    // 2. Nettoyage des tokens avant l'inscription
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    setLoading(true);
    try {
      // 3. Appel à l'API Django (endpoint /api/register/)
      await api.post("register/", form); 
      
      setSuccess("Inscription réussie. Redirection vers la page de connexion...");
      
      // 4. Redirection vers la page de connexion (/login) après 1.2s
      // J'utilise /login car c'est la route par défaut que nous avons définie.
      setTimeout(() => navigate("/sign-in"), 1200); 

    } catch (err) {
      console.error("Erreur d'inscription:", err);
      // Gérer les erreurs du backend (ex: nom d'utilisateur déjà pris)
      const msg =
        err?.response?.data?.error ||
        "Erreur lors de l'inscription. Veuillez vérifier les informations.";
      setError(typeof msg === "object" ? JSON.stringify(msg) : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="m-8 flex">
      <div className="w-2/5 h-full hidden lg:block">
        <img
          src="/img/pattern.jpg" // Assurez-vous que cette image est dans votre dossier public/img
          className="h-full w-full object-cover rounded-3xl"
        />
      </div>
      <div className="w-full lg:w-3/5 flex flex-col items-center justify-center">
        <div className="text-center">
          <Typography variant="h2" className="font-bold mb-4">
            Rejoignez-nous
          </Typography>
          <Typography
            variant="paragraph"
            color="blue-gray"
            className="text-lg font-normal"
          >
            Entrez votre nom d'utilisateur, email et mot de passe pour vous
            inscrire.
          </Typography>
        </div>

        {/* Formulaire connecté à la logique d'enregistrement */}
        <form
          className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2"
          onSubmit={handleSubmit}
        >
          <div className="mb-1 flex flex-col gap-6">
            
            {/* Champ Nom d'utilisateur */}
            <Typography
              variant="small"
              color="blue-gray"
              className="-mb-3 font-medium"
            >
              Nom d'utilisateur *
            </Typography>
            <Input
              size="lg"
              name="username" // 🎯 CRITIQUE: le nom doit correspondre à l'état
              placeholder="votre_nom_utilisateur"
              value={form.username}
              onChange={handleChange}
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{ className: "before:content-none after:content-none" }}
              required
            />
            
            {/* Champ Email */}
            <Typography
              variant="small"
              color="blue-gray"
              className="-mb-3 font-medium"
            >
              Votre email (facultatif)
            </Typography>
            <Input
              size="lg"
              type="email"
              name="email" // 🎯 CRITIQUE: le nom doit correspondre à l'état
              placeholder="name@mail.com"
              value={form.email}
              onChange={handleChange}
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{ className: "before:content-none after:content-none" }}
            />

            {/* Champ Mot de passe */}
            <Typography
              variant="small"
              color="blue-gray"
              className="-mb-3 font-medium"
            >
              Mot de passe *
            </Typography>
            <Input
              size="lg"
              type="password"
              name="password" // 🎯 CRITIQUE: le nom doit correspondre à l'état
              placeholder="******"
              value={form.password}
              onChange={handleChange}
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{ className: "before:content-none after:content-none" }}
              required
            />

          </div>

          <Checkbox
            // J'ai désactivé le required ici car le backend n'a pas de champ terms_agreed.
            label={
              <Typography
                variant="small"
                color="gray"
                className="flex items-center justify-start font-medium"
              >
                J'accepte les&nbsp;
                <a
                  href="#"
                  className="font-normal text-black transition-colors hover:text-gray-900 underline"
                >
                  Conditions Générales
                </a>
              </Typography>
            }
            containerProps={{ className: "-ml-2.5" }}
          />

          {/* Affichage des messages d'erreur et de succès */}
          {error && (
            <Typography variant="small" color="red" className="mt-4 font-medium">
              Erreur: {error}
            </Typography>
          )}
          {success && (
            <Typography variant="small" color="green" className="mt-4 font-medium">
              {success}
            </Typography>
          )}
          
          <Button className="mt-6" fullWidth type="submit" disabled={loading}>
            {loading ? "Inscription en cours..." : "S'inscrire"}
          </Button>

          {/* Autres boutons (optionnels) */}
          <div className="space-y-4 mt-8">
            <Button size="lg" color="white" className="flex items-center gap-2 justify-center shadow-md" fullWidth>
              <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* SVG Google */}
              </svg>
              <span>S'inscrire avec Google</span>
            </Button>
            {/* ... Twitter Button ... */}
          </div>

          <Typography
            variant="paragraph"
            className="text-center text-blue-gray-500 font-medium mt-4"
          >
            Vous avez déjà un compte ?
            <Link to="/sign-in" className="text-gray-900 ml-1">
              Se connecter
            </Link>
          </Typography>
        </form>
      </div>
    </section>
  );
}

// Exportation par défaut pour la route
export default SignUp;