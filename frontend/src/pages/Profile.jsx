
import { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // Fonction pour récupérer les informations de l'utilisateur
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Appel au bon endpoint
      const res = await api.get("me/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(res.data);
    } catch (err) {
      setError("Impossible de charger les informations utilisateur.");
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!user) return <p>Chargement...</p>;

  return (
    <div style={{ maxWidth: 400, margin: "50px auto" }}>
      <h2>Profil de {user.username}</h2>
      <p>Email: {user.email}</p>
      <p>Nom complet: {user.first_name} {user.last_name}</p>
      <p>Rôle: {user.role}</p>
      <button onClick={handleLogout}>Se déconnecter</button>
    </div>
  );
}
