// frontend/src/api/coachAPI.js
import api from './axiosInstance';

export const coachAPI = {
  // ========================================
  // DASHBOARD & STATS
  // ========================================
  
  getDashboardStats: async () => {
    try {
      const response = await api.get('/coaching/coach/dashboard-stats/');
      return response.data;
    } catch (error) {
      console.error('Erreur getDashboardStats:', error);
      return {
        sessions_today: 0,
        total_members: 0,
        completed_sessions: 0,
        satisfaction: 0
      };
    }
  },

  getUpcomingSessions: async () => {
    try {
      const response = await api.get('/coaching/coach/upcoming-sessions/');
      return Array.isArray(response.data) ? response.data : (response.data?.results || []);
    } catch (error) {
      console.error('Erreur getUpcomingSessions:', error);
      return [];
    }
  },

  // ========================================
  // MEMBRES
  // ========================================
  
  /**
   * Récupère tous les membres assignés au coach (pour affichage avec programmes)
   */
  getMyMembers: async () => {
    try {
      const response = await api.get('/coaching/coach/my-members/');
      console.log('Response getMyMembers:', response.data);
      
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data?.results) {
        return response.data.results;
      } else if (response.data?.data) {
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      console.error('Erreur getMyMembers:', error);
      console.error('Error details:', error.response?.data);
      return [];
    }
  },

  /**
   * Récupère la liste des membres pour sélection dans formulaires
   * Retourne les MÊMES membres que getMyMembers mais au format simple
   */
  getMembersForSelection: async (searchTerm = '') => {
    try {
      const params = searchTerm ? { search: searchTerm } : {};
      const response = await api.get('/coaching/members/', { params });
      
      console.log('Response getMembersForSelection:', response.data);
      
      // Gérer la pagination DRF
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data?.results) {
        return response.data.results;
      }
      
      return [];
    } catch (error) {
      console.error('Erreur getMembersForSelection:', error);
      return [];
    }
  },

  getMemberDetail: async (memberId) => {
    try {
      const response = await api.get(`/coaching/members/${memberId}/`);
      return response.data;
    } catch (error) {
      console.error('Erreur getMemberDetail:', error);
      throw error;
    }
  },

  // ========================================
  // PROGRAMMES
  // ========================================
  
  getPrograms: async (params = {}) => {
    try {
      const response = await api.get('/coaching/programs/', { params });
      console.log('Response getPrograms:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur getPrograms:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  },

  getProgramDetail: async (programId) => {
    try {
      const response = await api.get(`/coaching/programs/${programId}/`);
      return response.data;
    } catch (error) {
      console.error('Erreur getProgramDetail:', error);
      throw error;
    }
  },

  createProgram: async (programData) => {
    try {
      const response = await api.post('/coaching/programs/', programData);
      return response.data;
    } catch (error) {
      console.error('Erreur createProgram:', error);
      throw error;
    }
  },

  updateProgram: async (programId, programData) => {
    try {
      const response = await api.put(`/coaching/programs/${programId}/`, programData);
      return response.data;
    } catch (error) {
      console.error('Erreur updateProgram:', error);
      throw error;
    }
  },

  deleteProgram: async (programId) => {
    try {
      const response = await api.delete(`/coaching/programs/${programId}/`);
      return response.data;
    } catch (error) {
      console.error('Erreur deleteProgram:', error);
      throw error;
    }
  },

  duplicateProgram: async (programId) => {
    try {
      const response = await api.post(`/coaching/programs/${programId}/duplicate/`);
      return response.data;
    } catch (error) {
      console.error('Erreur duplicateProgram:', error);
      throw error;
    }
  },

  exportProgramPDF: async (programId) => {
    try {
      const response = await api.get(`/coaching/programs/${programId}/export/`, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.error('Erreur exportProgramPDF:', error);
      throw error;
    }
  },

  // ========================================
  // EXERCICES
  // ========================================
  
  getExercises: async (params = {}) => {
    try {
      const response = await api.get('/coaching/exercises/', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur getExercises:', error);
      return { data: [] };
    }
  },

  getExerciseCategories: async () => {
    try {
      const response = await api.get('/coaching/exercise-categories/');
      return response.data;
    } catch (error) {
      console.error('Erreur getExerciseCategories:', error);
      return { data: [] };
    }
  },

  // ========================================
  // SESSIONS D'ENTRAÎNEMENT
  // ========================================
  
  getProgramSessions: async (programId) => {
    try {
      const response = await api.get(`/coaching/programs/${programId}/sessions/`);
      return response.data;
    } catch (error) {
      console.error('Erreur getProgramSessions:', error);
      return [];
    }
  },
};

export default coachAPI;