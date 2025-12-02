// frontend/src/hooks/useSubdomain.js
import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';

export const useSubdomain = () => {
    const [subdomain, setSubdomain] = useState(null);
    const [gymCenter, setGymCenter] = useState(null);
    const [allCenters, setAllCenters] = useState([]); // 🆕 Liste de tous les centres
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMultiTenant, setIsMultiTenant] = useState(false);

    useEffect(() => {
        const detectSubdomain = () => {
            const hostname = window.location.hostname;
            const parts = hostname.split('.');

            // Développement local
            if (hostname === 'localhost' || hostname === '127.0.0.1') {
                setIsMultiTenant(false);
                setLoading(false);
                return;
            }

            // Production multi-tenant
            if (parts.length >= 3 && parts[0] !== 'www') {
                const detectedSubdomain = parts[0];
                setSubdomain(detectedSubdomain);
                setIsMultiTenant(true);
                fetchGymCenter(detectedSubdomain);
            } else {
                // 🆕 Domaine principal : charger tous les centres
                setIsMultiTenant(true);
                fetchAllCenters();
            }
        };

        detectSubdomain();
    }, []);

    const fetchGymCenter = async (subdomain) => {
        try {
            const response = await api.get(`/auth/centers/${subdomain}/by-subdomain/`);
            setGymCenter(response.data);
            setError(null);
        } catch (err) {
            console.error('Erreur:', err);
            setError(err.response?.data?.detail || 'Centre non trouvé');
        } finally {
            setLoading(false);
        }
    };

    // 🆕 Fonction pour charger tous les centres
    const fetchAllCenters = async () => {
        try {
            const response = await api.get('/auth/centers/');
            const centers = Array.isArray(response.data) ? response.data : response.data.results || [];
            setAllCenters(centers);
            setError(null);
        } catch (err) {
            console.error('Erreur:', err);
            setError('Impossible de charger les centres');
        } finally {
            setLoading(false);
        }
    };

    return { 
        subdomain, 
        gymCenter, 
        allCenters, // 🆕 Exposer la liste des centres
        loading, 
        error, 
        isMultiTenant 
    };
};