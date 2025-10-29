import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
// 🎯 Assurez-vous que le chemin est correct. 
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
  const [form, setForm] = useState({ 
    username: "", 
    email: "", 
    password: "", 
    first_name: "", 
    last_name: "" 
  }); 
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
    
    // Si l'utilisateur n'a pas mis de first/last name, utiliser le username
    const dataToSend = {
      ...form,
      first_name: form.first_name || form.username,
      last_name: form.last_name || form.username,
    };

    try {
        setLoading(true);
        
        // 🔑 CORRECTION : L'URL complète sera : http://127.0.0.1:8000/api/auth/register/
        const response = await api.post("auth/register/", dataToSend); 
        
        setLoading(false);
        setSuccess("Inscription réussie. Vous pouvez maintenant vous connecter.");

        // Optionnel : Rediriger après quelques secondes
        setTimeout(() => {
          navigate("/sign-in");
        }, 2000);

    } catch (err) {
        setLoading(false);
        // Gérer les erreurs spécifiques de Django (ex: utilisateur/email déjà existant)
        if (err.response && err.response.data) {
            const errors = err.response.data;
            let errorMessage = "Erreur d'inscription.";

            if (errors.email) {
                errorMessage = "Email: " + errors.email.join(" ");
            } else if (errors.username) {
                errorMessage = "Nom d'utilisateur: " + errors.username.join(" ");
            } else if (errors.password) {
                errorMessage = "Mot de passe: " + errors.password.join(" ");
            }
            setError(errorMessage);
        } else {
            setError("Une erreur inattendue est survenue.");
        }
    }
  }

  return (
    <section className="m-8 flex">
      <div className="w-full lg:w-3/5 mt-24">
        <div className="text-center">
          <Typography variant="h2" className="font-bold mb-4">Inscription</Typography>
          <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">
            Créez votre compte pour accéder à votre espace membre.
          </Typography>
        </div>
        
        {/* Affichage de l'erreur/succès */}
        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4" role="alert">
                <strong className="font-bold">Erreur: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        )}
        {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative my-4" role="alert">
                <strong className="font-bold">Succès: </strong>
                <span className="block sm:inline">{success}</span>
            </div>
        )}

        <form className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2" onSubmit={handleSubmit}>
          <div className="mb-1 flex flex-col gap-6">
            
            {/* Champs d'inscription */}
            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Nom d'utilisateur*
            </Typography>
            <Input size="lg" placeholder="john_doe" name="username" value={form.username} onChange={handleChange} required />
            
            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Email*
            </Typography>
            <Input size="lg" placeholder="name@mail.com" name="email" value={form.email} onChange={handleChange} required type="email" />

            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Prénom
            </Typography>
            <Input size="lg" placeholder="John" name="first_name" value={form.first_name} onChange={handleChange} />

            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Nom de famille
            </Typography>
            <Input size="lg" placeholder="Doe" name="last_name" value={form.last_name} onChange={handleChange} />

            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Mot de passe*
            </Typography>
            <Input type="password" size="lg" placeholder="********" name="password" value={form.password} onChange={handleChange} required />
          </div>
          
          <Checkbox
            label={
              <Typography
                variant="small"
                color="gray"
                className="flex items-center justify-start font-medium"
              >
                J'accepte les&nbsp;
                <a
                  href="#"
                  className="font-normal text-gray-900 transition-colors hover:text-gray-700"
                >
                  Termes et Conditions
                </a>
              </Typography>
            }
            containerProps={{ className: "-ml-2.5" }}
          />

          <Button className="mt-6" fullWidth type="submit" disabled={loading}>
            {loading ? "Inscription en cours..." : "S'inscrire"}
          </Button>

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

export default SignUp;