
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";

export default function Register() {
  const navigate = useNavigate();
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
    if (!form.username || !form.password) {
      setError("Remplissez tous les champs requis.");
      return;
    }
    if (form.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setLoading(true);
    try {
      await api.post("register/", form);
      setSuccess("Inscription réussie — redirection vers la page de connexion...");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      console.error(err);
      // Récupère message d'erreur du backend si présent
      const msg =
        err?.response?.data?.error ||
        err?.response?.data ||
        err?.message ||
        "Erreur lors de l'inscription.";
      setError(typeof msg === "object" ? JSON.stringify(msg) : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>Inscription</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 8 }}>
          <input
            name="username"
            placeholder="Nom d'utilisateur *"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <input
            name="email"
            type="email"
            placeholder="Email (facultatif)"
            value={form.email}
            onChange={handleChange}
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <input
            name="password"
            type="password"
            placeholder="Mot de passe *"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Envoi..." : "S'inscrire"}
        </button>
      </form>

      {error && <p style={{ color: "red", marginTop: 12 }}>{error}</p>}
      {success && <p style={{ color: "green", marginTop: 12 }}>{success}</p>}
    </div>
  );
}
