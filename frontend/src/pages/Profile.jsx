import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { 
  Avatar, 
  Typography, 
  Button, 
  Card, 
  CardBody,
  Chip,
  Progress,
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from "@material-tailwind/react";
import {
  MapPinIcon,
  PhoneIcon,
  CalendarIcon,
  TrophyIcon,
  FireIcon,
  ChartBarIcon,
  ClockIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/solid";
import { Footer } from "@/widgets/layout";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);


  // Fonction pour rafraîchir le token
const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      throw new Error("No refresh token");
    }

    const res = await axios.post("http://127.0.0.1:8000/api/auth/token/refresh/", {
      refresh: refreshToken,
    });

    localStorage.setItem("access_token", res.data.access);
    return res.data.access;
  } catch (err) {
    console.error("Erreur lors du rafraîchissement du token:", err);
    // Si le refresh échoue, déconnecter l'utilisateur
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    navigate("/sign-in");
    return null;
  }
};

  // Fonction pour récupérer les informations de l'utilisateur
const fetchUser = async (retryWithRefresh = true) => {
  try {
    let token = localStorage.getItem("access_token");
    
    if (!token) {
      navigate("/sign-in");
      return;
    }

    // Appel à l'API auth pour récupérer le profil
    const res = await axios.get("http://127.0.0.1:8000/api/auth/me/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    setUser(res.data);
    
    // Si l'utilisateur est un membre, récupérer ses abonnements
    if (res.data.role === "MEMBER") {
      fetchSubscriptions(token);
    }
  } catch (err) {
    console.error("Erreur lors du chargement de l'utilisateur:", err);
    
    // Si erreur 401 et qu'on n'a pas encore tenté de rafraîchir
    if (err.response?.status === 401 && retryWithRefresh) {
      console.log("Token expiré, tentative de rafraîchissement...");
      const newToken = await refreshAccessToken();
      
      if (newToken) {
        // Réessayer avec le nouveau token
        return fetchUser(false); // false = ne pas réessayer si ça échoue encore
      }
    } else {
      // Autre erreur ou échec du refresh
      setError("Impossible de charger les informations utilisateur.");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      navigate("/sign-in");
    }
  } finally {
    setLoading(false);
  }
};

  // Fonction pour récupérer les abonnements
  const fetchSubscriptions = async (token) => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/subscriptions/subscriptions/my-subscriptions/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSubscriptions(res.data);
      console.log("✅ Abonnements chargés:", res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des abonnements:", err);
      if (err.response?.status === 404) {
        console.log("Aucun abonnement trouvé");
      } else if (err.response?.status === 403) {
        console.log("Accès refusé - Seuls les membres peuvent voir leurs abonnements");
      } else {
        console.error("Erreur détaillée:", err.response?.data);
      }
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    navigate("/sign-in");
  };

  // Fonction pour uploader la photo de profil
  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image valide');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La taille de l\'image ne doit pas dépasser 5MB');
      return;
    }

    setUploadingImage(true);

    const formData = new FormData();
    formData.append('profile_picture', file);

    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.post(
        "http://127.0.0.1:8000/api/auth/me/upload-picture/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setUser(res.data);
      console.log("✅ Photo de profil mise à jour:", res.data);
    } catch (err) {
      console.error("Erreur lors de l'upload:", err);
      alert("Erreur lors de l'upload de la photo");
    } finally {
      setUploadingImage(false);
    }
  };

  // Fonction pour supprimer la photo de profil
  const handleDeleteProfilePicture = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer votre photo de profil ?')) {
      return;
    }

    setUploadingImage(true);

    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.delete(
        "http://127.0.0.1:8000/api/auth/me/delete-picture/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(res.data);
      console.log("✅ Photo de profil supprimée");
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      alert("Erreur lors de la suppression de la photo");
    } finally {
      setUploadingImage(false);
    }
  };

  // --- RENDU DES ÉTATS DE CHARGEMENT ET D'ERREUR ---
  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-96">
        <CardBody className="text-center">
          <Typography variant="h5" color="red" className="mb-2">
            Erreur
          </Typography>
          <Typography>{error}</Typography>
          <Button className="mt-4" onClick={() => navigate("/sign-in")}>
            Retour à la connexion
          </Button>
        </CardBody>
      </Card>
    </div>
  );

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <Typography className="mt-4">Chargement...</Typography>
      </div>
    </div>
  );

  // --- PRÉPARATION DES DONNÉES ---
  const displayName = user.first_name || user.last_name
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
    : user.username;

  const roleConfig = {
    ADMIN: { label: "Administrateur", color: "red", icon: Cog6ToothIcon },
    COACH: { label: "Coach Sportif", color: "blue", icon: TrophyIcon },
    RECEPTIONIST: { label: "Réceptionniste", color: "green", icon: UserCircleIcon },
    MEMBER: { label: "Membre", color: "gray", icon: UserCircleIcon },
  };

  const currentRole = roleConfig[user.role] || roleConfig.MEMBER;
  
  const stats = {
    workouts: 45,
    hours: 67,
    streak: 12,
    progress: 75,
  };

  const upcomingSessions = [
    { id: 1, name: "Yoga Matinal", date: "29 Oct 2025", time: "08:00", coach: "Marie Dubois" },
    { id: 2, name: "CrossFit", date: "30 Oct 2025", time: "18:00", coach: "Pierre Martin" },
    { id: 3, name: "Pilates", date: "31 Oct 2025", time: "10:00", coach: "Sophie Laurent" },
  ];

  // --- RENDU DU COMPOSANT ---
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec image de fond */}
      <section className="relative block h-[40vh] w-full">
        <div className="absolute top-0 h-full w-full bg-[url('/img/background-3.png')] bg-cover bg-center scale-105" />
        <div className="absolute top-0 h-full w-full bg-black/70 bg-cover bg-center" />
      </section>

      {/* Contenu principal */}
      <section className="relative bg-gray-50 py-16 px-4 w-full">
        <div className="relative mb-6 -mt-40 w-full">
          <div className="container mx-auto max-w-full px-4">
            
            {/* En-tête du profil */}
            <Card className="mb-6">
              <CardBody>
                <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                  {/* Avatar et infos de base */}
                  <div className="flex gap-6 items-start">
                    <div className="-mt-20 relative">
                      <Avatar
                        src={user.profile_picture_url || "/img/team-5.png"}
                        alt="Profile picture"
                        variant="circular"
                        size="xxl"
                        className="border-4 border-white shadow-xl"
                      />
                      {/* Boutons pour gérer la photo */}
                      <div className="absolute bottom-2 right-2 flex gap-2">
                        {/* Bouton supprimer (affiché seulement si photo existe) */}
                        {user.profile_picture_url && (
                          <button
                            onClick={handleDeleteProfilePicture}
                            disabled={uploadingImage}
                            className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Supprimer la photo de profil"
                          >
                            {uploadingImage ? (
                              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="w-5 h-5"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                />
                              </svg>
                            )}
                          </button>
                        )}
                        
                        {/* Bouton changer/ajouter */}
                        <label
                          htmlFor="profile-picture-upload"
                          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 cursor-pointer shadow-lg transition-all duration-200 hover:scale-110"
                          title={user.profile_picture_url ? "Changer la photo de profil" : "Ajouter une photo de profil"}
                        >
                          {uploadingImage ? (
                            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                              />
                            </svg>
                          )}
                        </label>
                      </div>
                      <input
                        id="profile-picture-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </div>
                    <div className="flex flex-col mt-2">
                      <div className="flex items-center gap-3 mb-2">
                        <Typography variant="h3" color="blue-gray">
                          {displayName}
                        </Typography>
                        <Chip
                          value={currentRole.label}
                          color={currentRole.color}
                          icon={<currentRole.icon className="h-4 w-4" />}
                          className="rounded-full"
                        />
                      </div>
                      <Typography variant="paragraph" color="gray" className="flex items-center gap-2 mb-1">
                        <PhoneIcon className="h-4 w-4" />
                        {user.email}
                      </Typography>
                      {user.phone && (
                        <Typography variant="paragraph" color="gray" className="flex items-center gap-2 mb-1">
                          <PhoneIcon className="h-4 w-4" />
                          {user.phone}
                        </Typography>
                      )}
                      {user.date_of_birth && (
                        <Typography variant="paragraph" color="gray" className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4" />
                          Né(e) le {new Date(user.date_of_birth).toLocaleDateString('fr-FR')}
                        </Typography>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 lg:items-end">
                    <Button
                      variant="outlined"
                      className="flex items-center gap-2"
                      onClick={() => navigate("/settings")}
                    >
                      <Cog6ToothIcon className="h-4 w-4" />
                      Paramètres
                    </Button>
                    <Button
                      color="red"
                      variant="outlined"
                      className="flex items-center gap-2"
                      onClick={handleLogout}
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4" />
                      Se déconnecter
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Statistiques pour les membres */}
            {user.role === "MEMBER" && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardBody className="text-center">
                    <FireIcon className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                    <Typography variant="h4" color="blue-gray">
                      {stats.workouts}
                    </Typography>
                    <Typography variant="small" className="text-gray-600">
                      Séances complétées
                    </Typography>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody className="text-center">
                    <ClockIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <Typography variant="h4" color="blue-gray">
                      {stats.hours}h
                    </Typography>
                    <Typography variant="small" className="text-gray-600">
                      Temps d'entraînement
                    </Typography>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody className="text-center">
                    <TrophyIcon className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <Typography variant="h4" color="blue-gray">
                      {stats.streak}
                    </Typography>
                    <Typography variant="small" className="text-gray-600">
                      Jours consécutifs
                    </Typography>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody className="text-center">
                    <ChartBarIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <Typography variant="h4" color="blue-gray">
                      {stats.progress}%
                    </Typography>
                    <Typography variant="small" className="text-gray-600">
                      Objectif mensuel
                    </Typography>
                  </CardBody>
                </Card>
              </div>
            )}

            {/* Onglets de contenu */}
            <Card>
              <CardBody>
                <Tabs value={activeTab}>
                  <TabsHeader
                    className="rounded-none border-b border-blue-gray-50 bg-transparent p-0"
                    indicatorProps={{
                      className: "bg-transparent border-b-2 border-gray-900 shadow-none rounded-none",
                    }}
                  >
                    <Tab
                      value="overview"
                      onClick={() => setActiveTab("overview")}
                      className={activeTab === "overview" ? "text-gray-900" : ""}
                    >
                      Vue d'ensemble
                    </Tab>
                    {user.role === "MEMBER" && (
                      <>
                        <Tab
                          value="sessions"
                          onClick={() => setActiveTab("sessions")}
                          className={activeTab === "sessions" ? "text-gray-900" : ""}
                        >
                          Mes séances
                        </Tab>
                        <Tab
                          value="subscription"
                          onClick={() => setActiveTab("subscription")}
                          className={activeTab === "subscription" ? "text-gray-900" : ""}
                        >
                          Abonnement
                        </Tab>
                      </>
                    )}
                  </TabsHeader>

                  <TabsBody>
                    {/* Onglet Vue d'ensemble */}
                    <TabPanel value="overview">
                      <div className="space-y-6">
                        <div>
                          <Typography variant="h5" className="mb-4">
                            Informations personnelles
                          </Typography>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Typography variant="small" className="text-gray-600 font-semibold">
                                Nom complet
                              </Typography>
                              <Typography>{displayName}</Typography>
                            </div>
                            <div>
                              <Typography variant="small" className="text-gray-600 font-semibold">
                                Email
                              </Typography>
                              <Typography>{user.email}</Typography>
                            </div>
                            <div>
                              <Typography variant="small" className="text-gray-600 font-semibold">
                                Téléphone
                              </Typography>
                              <Typography>{user.phone || "Non renseigné"}</Typography>
                            </div>
                            <div>
                              <Typography variant="small" className="text-gray-600 font-semibold">
                                Adresse
                              </Typography>
                              <Typography>{user.address || "Non renseignée"}</Typography>
                            </div>
                            <div>
                              <Typography variant="small" className="text-gray-600 font-semibold">
                                Rôle
                              </Typography>
                              <Typography>{currentRole.label}</Typography>
                            </div>
                            <div>
                              <Typography variant="small" className="text-gray-600 font-semibold">
                                Membre depuis
                              </Typography>
                              <Typography>
                                {new Date(user.created_at).toLocaleDateString('fr-FR')}
                              </Typography>
                            </div>
                          </div>
                        </div>

                        {user.role === "MEMBER" && (
                          <div>
                            <Typography variant="h5" className="mb-4">
                              Progression de l'objectif mensuel
                            </Typography>
                            <Progress value={stats.progress} color="blue" className="mb-2" />
                            <Typography variant="small" color="gray">
                              {stats.workouts} séances sur 60 ce mois-ci
                            </Typography>
                          </div>
                        )}
                      </div>
                    </TabPanel>

                    {/* Onglet Séances */}
                    {user.role === "MEMBER" && (
                      <TabPanel value="sessions">
                        <Typography variant="h5" className="mb-4">
                          Prochaines séances
                        </Typography>
                        <div className="space-y-3">
                          {upcomingSessions.map((session) => (
                            <Card key={session.id} className="border border-gray-200">
                              <CardBody className="flex justify-between items-center p-4">
                                <div>
                                  <Typography variant="h6" color="blue-gray">
                                    {session.name}
                                  </Typography>
                                  <Typography variant="small" color="gray">
                                    Coach: {session.coach}
                                  </Typography>
                                </div>
                                <div className="text-right">
                                  <Typography variant="small" className="font-semibold">
                                    {session.date}
                                  </Typography>
                                  <Typography variant="small" color="gray">
                                    {session.time}
                                  </Typography>
                                </div>
                              </CardBody>
                            </Card>
                          ))}
                        </div>
                        <Button variant="outlined" fullWidth className="mt-4">
                          Réserver une nouvelle séance
                        </Button>
                      </TabPanel>
                    )}

                    {/* Onglet Abonnement */}
                    {user.role === "MEMBER" && (
                      <TabPanel value="subscription">
                        <Typography variant="h5" className="mb-4">
                          Mon abonnement
                        </Typography>
                        {subscriptions.length > 0 ? (
                          subscriptions.map((sub, index) => (
                            <Card key={index} className="mb-4 border border-gray-200">
                              <CardBody>
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <Typography variant="h6" color="blue-gray">
                                      {sub.plan.name}
                                    </Typography>
                                    <Typography variant="small" color="gray">
                                      {sub.plan.description}
                                    </Typography>
                                  </div>
                                  <Chip
                                    value={sub.is_active ? "Actif" : "Inactif"}
                                    color={sub.is_active ? "green" : "gray"}
                                    className="rounded-full"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                  <div>
                                    <Typography variant="small" className="text-gray-600 font-semibold">
                                      Prix
                                    </Typography>
                                    <Typography className="text-lg font-bold text-blue-600">
                                      {sub.plan.price} TND
                                    </Typography>
                                  </div>
                                  <div>
                                    <Typography variant="small" className="text-gray-600 font-semibold">
                                      Durée
                                    </Typography>
                                    <Typography>
                                      {sub.plan.duration}
                                    </Typography>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Typography variant="small" className="text-gray-600 font-semibold">
                                      Date de début
                                    </Typography>
                                    <Typography>
                                      {new Date(sub.start_date).toLocaleDateString('fr-FR')}
                                    </Typography>
                                  </div>
                                  <div>
                                    <Typography variant="small" className="text-gray-600 font-semibold">
                                      Date de fin
                                    </Typography>
                                    <Typography>
                                      {sub.end_date ? new Date(sub.end_date).toLocaleDateString('fr-FR') : "Indéterminée"}
                                    </Typography>
                                  </div>
                                </div>
                                
                                {/* Fonctionnalités incluses */}
                                {sub.plan.features && sub.plan.features.length > 0 && (
                                  <div className="mt-4">
                                    <Typography variant="small" className="text-gray-600 font-semibold mb-2">
                                      Fonctionnalités incluses
                                    </Typography>
                                    <ul className="list-disc list-inside space-y-1">
                                      {sub.plan.features.map((feature, idx) => (
                                        <li key={idx}>
                                          <Typography variant="small" className="inline">
                                            {feature}
                                          </Typography>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </CardBody>
                            </Card>
                          ))
                        ) : (
                          <Card className="border border-gray-200">
                            <CardBody className="text-center py-8">
                              <Typography color="gray" className="mb-4">
                                Vous n'avez pas d'abonnement actif
                              </Typography>
                              <Button color="blue">
                                Choisir un abonnement
                              </Button>
                            </CardBody>
                          </Card>
                        )}
                      </TabPanel>
                    )}
                  </TabsBody>
                </Tabs>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      <div className="bg-white">
        <Footer />
      </div>
    </div>
  );
}