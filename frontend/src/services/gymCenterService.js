// Fichier: frontend/src/services/gymCenterService.js

import api from "../api/axiosInstance";

/**
 * Service pour gérer les centres de sport (GymCenter)
 */
const gymCenterService = {
  /**
   * Récupérer un centre par son sous-domaine
   * @param {string} subdomain - Le sous-domaine du centre
   * @returns {Promise} Centre trouvé
   */
  getCenterBySubdomain: async (subdomain) => {
    try {
      const response = await api.get(`auth/centers/${subdomain}/`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération du centre:", error);
      throw error;
    }
  },

  /**
   * Récupérer tous les centres (pour les admins)
   * @returns {Promise} Liste des centres
   */
  getAllCenters: async () => {
    try {
      const response = await api.get("auth/centers/");
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des centres:", error);
      throw error;
    }
  },
};

export default gymCenterService;