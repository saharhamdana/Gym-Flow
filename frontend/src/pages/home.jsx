// File: frontend/src/pages/home.jsx
import React from "react";
import { Spinner, Alert } from "@material-tailwind/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { useSubdomain } from "../hooks/useSubdomain";
import GeneralHome from "./GeneralHome";
import TenantHome from "./TenantHome";

export function Home() {
  const { subdomain, gymCenter, loading, error, isMultiTenant } = useSubdomain();

  // Afficher un loader pendant le chargement
  if (loading && isMultiTenant) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  // Si erreur (sous-domaine invalide)
  if (error && isMultiTenant && subdomain) {
    return (
      <div className="container mx-auto px-4 py-12 min-h-screen flex items-center justify-center">
        <Alert color="red" icon={<ExclamationTriangleIcon className="h-6 w-6" />} className="max-w-2xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Centre non trouvé</h2>
            <p className="mb-4">
              Le sous-domaine "{subdomain}" n'existe pas ou n'est pas actif.
            </p>
            <button
              className="mt-4 px-6 py-2 text-white rounded hover:opacity-90 transition"
              style={{ backgroundColor: "#00357a" }}
              onClick={() => (window.location.href = "/")}
            >
              Retour à la page d'accueil
            </button>
          </div>
        </Alert>
      </div>
    );
  }

  // Mode développement local (pas de multi-tenant)
  if (!isMultiTenant) {
    // En local, vous pouvez choisir :
    // Option 1: Afficher la page générale
    return <GeneralHome />;
    
    // Option 2: Simuler un centre pour le développement (décommentez si besoin)
    // const mockCenter = {
    //   id: 1,
    //   name: "GymFlow Demo",
    //   subdomain: "demo",
    //   description: "Centre de démonstration pour le développement",
    //   logo: null,
    //   full_url: "http://localhost:5173"
    // };
    // return <TenantHome gymCenter={mockCenter} />;
  }

  // Si domaine principal (pas de sous-domaine) : afficher la liste des centres
  if (isMultiTenant && !subdomain && !gymCenter) {
    return <GeneralHome />;
  }

  // Si sous-domaine valide : afficher la page du centre
  if (gymCenter) {
    return <TenantHome gymCenter={gymCenter} />;
  }

  // Fallback : afficher la page générale
  return <GeneralHome />;
}

export default Home;