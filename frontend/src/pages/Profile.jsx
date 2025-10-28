import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";

import { Avatar, Typography, Button } from "@material-tailwind/react";
import {
  MapPinIcon,
  BriefcaseIcon,
  BuildingLibraryIcon,
} from "@heroicons/react/24/solid";
// Assurez-vous que ce chemin est correct pour votre projet
import { Footer } from "@/widgets/layout"; 

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

      // Appel à l'API. L'interceptor dans axiosInstance gère l'ajout du token Bearer.
      const res = await api.get("me/");
      setUser(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement de l'utilisateur:", err);
      // Gestion de l'erreur 401 (token expiré/invalide)
      if (err.response && err.response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/login");
        return;
      }
      setError("Impossible de charger les informations utilisateur.");
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleLogout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");

 navigate("/"); 
};

  // --- RENDU DES ÉTATS DE CHARGEMENT ET D'ERREUR ---
  if (error) return <p className="p-4 text-red-600 font-bold">{error}</p>;
  if (!user) return <p className="p-4">Chargement...</p>;

  // --- PRÉPARATION DES DONNÉES DYNAMIQUES ---
  const displayName = user.first_name || user.last_name
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
    : user.username;
  const displayRole = user.role.charAt(0).toUpperCase() + user.role.slice(1);
  const roleText = user.is_superuser ? `${displayRole} (Administrateur Système)` : displayRole;
  const locationPlaceholder = "Los Angeles, California";
  const universityPlaceholder = "University of Computer Science";
  const profileBio = "An artist of considerable range, Jenna the name taken by Melbourne-raised, Brooklyn-based Nick Murphy writes, performs and records all of his own music, giving it a warm, intimate feel with a solid groove structure. An artist of considerable range.";
  
  // --- RENDU DU COMPOSANT DE PROFIL COMPLET ---
  return (
    <>
      <section className="relative block h-[50vh]">
        <div className="bg-profile-background absolute top-0 h-full w-full bg-[url('/img/background-3.png')] bg-cover bg-center scale-105" />
        <div className="absolute top-0 h-full w-full bg-black/60 bg-cover bg-center" />
      </section>
      <section className="relative bg-white py-16">
        <div className="relative mb-6 -mt-40 flex w-full px-4 min-w-0 flex-col break-words bg-white">
          <div className="container mx-auto">
            <div className="flex flex-col lg:flex-row justify-between">
              <div className="relative flex gap-6 items-start">
                <div className="-mt-20 w-40">
                  <Avatar
                    src="/img/team-5.png" // Placeholder image
                    alt="Profile picture"
                    variant="circular"
                    className="h-full w-full"
                  />
                </div>
                <div className="flex flex-col mt-2">
                  <Typography variant="h4" color="blue-gray">
                    {displayName}
                  </Typography>
                  <Typography variant="paragraph" color="gray" className="!mt-0 font-normal">
                    {user.email}
                  </Typography>
                </div>
              </div>

              <div className="mt-10 mb-10 flex lg:flex-col justify-between items-center lg:justify-end lg:mb-0 lg:px-4 flex-wrap lg:-mt-5">
                <Button 
                  className="bg-gray-900 w-fit lg:ml-auto"
                  onClick={handleLogout}
                >
                  Se déconnecter
                </Button>
                <div className="flex justify-start py-4 pt-8 lg:pt-4">
                  {/* Les statistiques restent statiques car les données ne sont pas fournies par l'API /me/ */}
                  <div className="mr-4 p-3 text-center">
                    <Typography
                      variant="lead"
                      color="blue-gray"
                      className="font-bold uppercase"
                    >
                      22
                    </Typography>
                    <Typography
                      variant="small"
                      className="font-normal text-blue-gray-500"
                    >
                      Friends
                    </Typography>
                  </div>
                  <div className="mr-4 p-3 text-center">
                    <Typography
                      variant="lead"
                      color="blue-gray"
                      className="font-bold uppercase"
                    >
                      10
                    </Typography>
                    <Typography
                      variant="small"
                      className="font-normal text-blue-gray-500"
                    >
                      Photos
                    </Typography>
                  </div>
                  <div className="p-3 text-center lg:mr-4">
                    <Typography
                      variant="lead"
                      color="blue-gray"
                      className="font-bold uppercase"
                    >
                      89
                    </Typography>
                    <Typography
                      variant="small"
                      className="font-normal text-blue-gray-500"
                    >
                      Comments
                    </Typography>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="-mt-4 container space-y-2">
              <div className="flex items-center gap-2">
                <MapPinIcon className="-mt-px h-4 w-4 text-blue-gray-500" />
                <Typography className="font-medium text-blue-gray-500">
                  {locationPlaceholder}
                </Typography>
              </div>
              <div className="flex items-center gap-2">
                <BriefcaseIcon className="-mt-px h-4 w-4 text-blue-gray-500" />
                {/* Affichage dynamique du rôle de l'utilisateur */}
                <Typography className="font-medium text-blue-gray-500">
                  Rôle: {roleText}
                </Typography>
              </div>
              <div className="flex items-center gap-2">
                <BuildingLibraryIcon className="-mt-px h-4 w-4 text-blue-gray-500" />
                <Typography className="font-medium text-blue-gray-500">
                  {universityPlaceholder}
                </Typography>
              </div>
            </div>
            
            <div className="mb-10 py-6">
              <div className="flex w-full flex-col items-start lg:w-1/2">
                <Typography className="mb-6 font-normal text-blue-gray-500">
                  {profileBio}
                </Typography>
                <Button variant="text">Show more</Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="bg-white">
        <Footer />
      </div>
    </>
  );
}