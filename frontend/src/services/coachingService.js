import api from '@/api/axiosInstance';  // ← CHANGEMENT ICI

const coachingService = {
  // ===== EXERCISE CATEGORIES =====
  getExerciseCategories: () => api.get('coaching/exercise-categories/'),
  createExerciseCategory: (data) => api.post('coaching/exercise-categories/', data),
  updateExerciseCategory: (id, data) => api.put(`coaching/exercise-categories/${id}/`, data),
  deleteExerciseCategory: (id) => api.delete(`coaching/exercise-categories/${id}/`),

  // ===== EXERCISES =====
  getExercises: (params) => api.get('coaching/exercises/', { params }),
  getExercise: (id) => api.get(`coaching/exercises/${id}/`),
  createExercise: (data) => api.post('coaching/exercises/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateExercise: (id, data) => api.put(`coaching/exercises/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteExercise: (id) => api.delete(`coaching/exercises/${id}/`),

  // ===== TRAINING PROGRAMS =====
  getPrograms: (params) => api.get('coaching/programs/', { params }),
  getProgram: (id) => api.get(`coaching/programs/${id}/`),
  createProgram: (data) => api.post('coaching/programs/', data),
  updateProgram: (id, data) => api.put(`coaching/programs/${id}/`, data),
  patchProgram: (id, data) => api.patch(`coaching/programs/${id}/`, data),
  deleteProgram: (id) => api.delete(`coaching/programs/${id}/`),
  duplicateProgram: (id) => api.post(`coaching/programs/${id}/duplicate/`),
  exportProgramPDF: (id) => api.get(`coaching/programs/${id}/export_pdf/`, {
    responseType: 'blob'
  }),

  // ===== WORKOUT SESSIONS =====
  getWorkoutSessions: (params) => api.get('coaching/workout-sessions/', { params }),
  getWorkoutSession: (id) => api.get(`coaching/workout-sessions/${id}/`),
  createWorkoutSession: (data) => api.post('coaching/workout-sessions/', data),
  updateWorkoutSession: (id, data) => api.put(`coaching/workout-sessions/${id}/`, data),
  deleteWorkoutSession: (id) => api.delete(`coaching/workout-sessions/${id}/`),

  // ===== PROGRESS TRACKING =====
  getProgressTrackings: (params) => api.get('coaching/progress-tracking/', { params }),
  getProgressTracking: (id) => api.get(`coaching/progress-tracking/${id}/`),
  createProgressTracking: (data) => api.post('coaching/progress-tracking/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateProgressTracking: (id, data) => api.put(`coaching/progress-tracking/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteProgressTracking: (id) => api.delete(`coaching/progress-tracking/${id}/`),
  getProgressStatistics: (memberId) => api.get('coaching/progress-tracking/statistics/', {
    params: { member: memberId }
  }),

  // ===== WORKOUT LOGS =====
  getWorkoutLogs: (params) => api.get('coaching/workout-logs/', { params }),
  getWorkoutLog: (id) => api.get(`coaching/workout-logs/${id}/`),
  createWorkoutLog: (data) => api.post('coaching/workout-logs/', data),
  updateWorkoutLog: (id, data) => api.put(`coaching/workout-logs/${id}/`, data),
  deleteWorkoutLog: (id) => api.delete(`coaching/workout-logs/${id}/`),

  // ===== MEMBERS (pour sélection dans formulaires) =====
  getMembers: (params) => api.get('coaching/members/', { params }),
};

export default coachingService;