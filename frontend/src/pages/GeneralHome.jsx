import React from "react";
import {
  Card,
  CardBody,
  Typography,
  Button,
  Spinner,
  Alert,
} from "@material-tailwind/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { Footer } from "@/widgets/layout";
import { useSubdomain } from "../hooks/useSubdomain";

export function GeneralHome() {
  const { allCenters, loading, error } = useSubdomain();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative flex h-screen content-center items-center justify-center pt-16 pb-32">
        <div className="absolute top-0 h-full w-full bg-[url('/img/background-3.jpg')] bg-cover bg-center" />
        <div className="absolute top-0 h-full w-full bg-black/60" />
        
        <div className="container relative mx-auto px-4 max-w-7xl">
          <div className="text-center">
            <Typography variant="h1" color="white" className="mb-6 font-black">
              Bienvenue sur GymFlow
            </Typography>
            <Typography variant="lead" color="white" className="mb-12 opacity-80">
              La plateforme de gestion pour centres de fitness
            </Typography>

            {/* Grille des Centres Disponibles */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {allCenters.map((center) => (
                <Card 
  key={center.id}
  className="cursor-pointer hover:shadow-2xl transition-shadow"
  onClick={() => {
    // Construire l'URL avec le port actuel si en développement
    const currentPort = window.location.port;
    let targetUrl;
    
    // 🔥 FORCER HTTP en développement
    const protocol = 'http://'; // ← TOUJOURS HTTP en développement
    
    if (currentPort && currentPort !== '80' && currentPort !== '443') {
      // Développement avec port (ex: :5173)
      targetUrl = `${protocol}${center.subdomain}.gymflow.com:${currentPort}`;
    } else {
      // Production sans port
      targetUrl = `${protocol}${center.subdomain}.gymflow.com`;
    }
    
    console.log('🔗 Redirection vers:', targetUrl);
    window.location.href = targetUrl;
  }}
>
                  <CardBody className="text-center p-6">
                    {center.logo && (
                      <img 
                        src={center.logo} 
                        alt={center.name}
                        className="mx-auto mb-4 h-20 w-20 rounded-full object-cover"
                      />
                    )}
                    <Typography variant="h5" color="blue-gray" className="mb-2">
                      {center.name}
                    </Typography>
                    <Typography variant="small" className="text-gray-600 mb-4">
                      {center.description}
                    </Typography>
                    <Typography 
                      variant="small" 
                      style={{ color: "#00357a" }}
                      className="font-semibold"
                    >
                      🌐 {center.subdomain}.gymflow.com
                    </Typography>
                  </CardBody>
                </Card>
              ))}
            </div>

            {allCenters.length === 0 && !error && (
              <Alert color="amber" className="mt-8">
                Aucun centre disponible pour le moment.
              </Alert>
            )}

            {error && (
              <Alert color="red" icon={<ExclamationTriangleIcon className="h-6 w-6" />} className="mt-8">
                {error}
              </Alert>
            )}
          </div>
        </div>
      </div>

      {/* Section À propos */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <Typography variant="h2" style={{ color: "#00357a" }} className="mb-4">
              Pourquoi choisir GymFlow ?
            </Typography>
            <Typography className="text-gray-600 max-w-3xl mx-auto">
              GymFlow est la solution complète pour gérer votre centre de fitness. 
              Gestion des membres, planification des cours, suivi des performances et bien plus encore.
            </Typography>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardBody className="text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "#00357a20" }}>
                  <Typography variant="h3" style={{ color: "#00357a" }}>📊</Typography>
                </div>
                <Typography variant="h5" color="blue-gray" className="mb-2">
                  Gestion Simplifiée
                </Typography>
                <Typography className="text-gray-600">
                  Gérez vos membres, abonnements et paiements en quelques clics
                </Typography>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "#00357a20" }}>
                  <Typography variant="h3" style={{ color: "#00357a" }}>📅</Typography>
                </div>
                <Typography variant="h5" color="blue-gray" className="mb-2">
                  Planning Intelligent
                </Typography>
                <Typography className="text-gray-600">
                  Créez et gérez vos cours avec un système de réservation automatique
                </Typography>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "#00357a20" }}>
                  <Typography variant="h3" style={{ color: "#00357a" }}>📱</Typography>
                </div>
                <Typography variant="h5" color="blue-gray" className="mb-2">
                  Multi-tenant
                </Typography>
                <Typography className="text-gray-600">
                  Chaque centre dispose de son propre espace personnalisé
                </Typography>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4" style={{ backgroundColor: "#00357a" }}>
        <div className="container mx-auto max-w-7xl text-center">
          <Typography variant="h2" color="white" className="mb-4">
            Prêt à démarrer ?
          </Typography>
          <Typography variant="lead" color="white" className="mb-8 opacity-80">
            Choisissez votre centre et commencez votre parcours fitness dès aujourd'hui
          </Typography>
          <Button 
            size="lg" 
            style={{ backgroundColor: "#9b0e16" }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Voir les centres disponibles
          </Button>
        </div>
      </section>

      {/* Footer */}
      <div className="bg-white w-full">
        <Footer />
      </div>
    </div>
  );
}

export default GeneralHome;