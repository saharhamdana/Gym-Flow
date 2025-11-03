// Fichier: frontend/src/hooks/useSubdomain.js

import { useState, useEffect } from "react";
import { getSubdomain } from "../api/axiosInstance";
import gymCenterService from "../services/gymCenterService";

/**
 * Hook personnalisé pour gérer le sous-domaine et récupérer les infos du centre
 */
export function useSubdomain() {
  const [subdomain, setSubdomain] = useState(null);
  const [gymCenter, setGymCenter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCenterInfo = async () => {
      setLoading(true);
      setError(null);

      try {
        // Obtenir le sous-domaine actuel
        const currentSubdomain = getSubdomain();
        setSubdomain(currentSubdomain);

        // Si un sous-domaine existe, récupérer les infos du centre
        if (currentSubdomain) {
          const centerData = await gymCenterService.getCenterBySubdomain(
            currentSubdomain
          );
          setGymCenter(centerData);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération du centre:", err);
        setError(err.response?.data?.detail || "Centre non trouvé");
      } finally {
        setLoading(false);
      }
    };

    fetchCenterInfo();
  }, []);

  return {
    subdomain,
    gymCenter,
    loading,
    error,
    isMultiTenant: !!subdomain,
  };
}

export default useSubdomain;