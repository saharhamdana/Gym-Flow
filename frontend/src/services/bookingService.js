// Fichier: frontend/src/services/bookingService.js

import api from '@/api/axiosInstance';

// ========== ROOMS ==========
export const roomService = {
  getAll: async (params = {}) => {
    const { data } = await api.get('/bookings/rooms/', { params });
    return data;
  },
  
  getById: async (id) => {
    const { data } = await api.get(`/bookings/rooms/${id}/`);
    return data;
  },
  
  create: async (roomData) => {
    const { data } = await api.post('/bookings/rooms/', roomData);
    return data;
  },
  
  update: async (id, roomData) => {
    const { data } = await api.patch(`/bookings/rooms/${id}/`, roomData);
    return data;
  },
  
  delete: async (id) => {
    await api.delete(`/bookings/rooms/${id}/`);
  },
};

// ========== COURSE TYPES ==========
export const courseTypeService = {
  getAll: async (params = {}) => {
    const { data } = await api.get('/bookings/course-types/', { params });
    return data;
  },
  
  getById: async (id) => {
    const { data } = await api.get(`/bookings/course-types/${id}/`);
    return data;
  },
  
  create: async (typeData) => {
    const { data } = await api.post('/bookings/course-types/', typeData);
    return data;
  },
  
  update: async (id, typeData) => {
    const { data } = await api.patch(`/bookings/course-types/${id}/`, typeData);
    return data;
  },
  
  delete: async (id) => {
    await api.delete(`/bookings/course-types/${id}/`);
  },
};

// ========== COURSES ==========
export const courseService = {
  getAll: async (params = {}) => {
    const { data } = await api.get('/bookings/courses/', { params });
    return data;
  },
  
  getById: async (id) => {
    const { data } = await api.get(`/bookings/courses/${id}/`);
    return data;
  },
  
  create: async (courseData) => {
    const { data } = await api.post('/bookings/courses/', courseData);
    return data;
  },
  
  update: async (id, courseData) => {
    const { data } = await api.patch(`/bookings/courses/${id}/`, courseData);
    return data;
  },
  
  delete: async (id) => {
    await api.delete(`/bookings/courses/${id}/`);
  },
  
  cancel: async (id) => {
    const { data } = await api.post(`/bookings/courses/${id}/cancel/`);
    return data;
  },
  
  getUpcoming: async () => {
    const { data } = await api.get('/bookings/courses/upcoming/');
    return data;
  },
  
  getToday: async () => {
    const { data } = await api.get('/bookings/courses/today/');
    return data;
  },
  
  getBookings: async (id) => {
    const { data } = await api.get(`/bookings/courses/${id}/bookings/`);
    return data;
  },
  
  getStatistics: async () => {
    const { data } = await api.get('/bookings/courses/statistics/');
    return data;
  },
};

// ========== BOOKINGS ==========
export const bookingService = {
  getAll: async (params = {}) => {
    const { data } = await api.get('/bookings/bookings/', { params });
    return data;
  },
  
  getById: async (id) => {
    const { data } = await api.get(`/bookings/bookings/${id}/`);
    return data;
  },
  
  create: async (bookingData) => {
    const { data } = await api.post('/bookings/bookings/', bookingData);
    return data;
  },
  
  cancel: async (id) => {
    const { data } = await api.post(`/bookings/bookings/${id}/cancel/`);
    return data;
  },
  
  checkIn: async (id) => {
    const { data } = await api.post(`/bookings/bookings/${id}/check_in/`);
    return data;
  },
  
  getMyBookings: async () => {
    const { data } = await api.get('/bookings/bookings/my_bookings/');
    return data;
  },
  
  getStatistics: async () => {
    const { data } = await api.get('/bookings/bookings/statistics/');
    return data;
  },
};