// frontend/src/hooks/useSubdomain.js
import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';

export const useSubdomain = () => {
    const [subdomain, setSubdomain] = useState(null);
    const [gymCenter, setGymCenter] = useState(null);
    const [allCenters, setAllCenters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMultiTenant, setIsMultiTenant] = useState(false);

    useEffect(() => {
        const detectSubdomain = () => {
            const hostname = window.location.hostname;
            const parts = hostname.split('.');

            // Développement local
            if (hostname === 'localhost' || hostname === '127.0.0.1') {
                console.log('Mode développement local détecté');
                setIsMultiTenant(false);
                setLoading(false);
                return;
            }

            // Production multi-tenant
            if (parts.length >= 3 && parts[0] !== 'www') {
                const detectedSubdomain = parts[0];
                console.log('Sous-domaine détecté:', detectedSubdomain);
                setSubdomain(detectedSubdomain);
                setIsMultiTenant(true);
                fetchGymCenter(detectedSubdomain);
            } else {
                // Domaine principal : charger tous les centres
                console.log('Domaine principal détecté - Chargement de tous les centres');
                setIsMultiTenant(true);
                fetchAllCenters();
            }
        };

        detectSubdomain();
    }, []);

    const fetchGymCenter = async (subdomain) => {
        try {
            console.log(`🔍 Recherche centre: ${subdomain}`);

            // 🔥 ESSAYER DIFFÉRENTES MÉTHODES
            let response;

            // Méthode 1: Via l'endpoint spécifique
            try {
                response = await api.get(`/auth/centers/${subdomain}/by-subdomain/`);
            } catch (err1) {
                console.log('Méthode 1 échouée, essai méthode 2...');
                // Méthode 2: Récupérer tous et filtrer
                const allResponse = await api.get('/auth/centers/');
                const center = allResponse.data.find(c => c.subdomain === subdomain);
                if (center) {
                    setGymCenter(center);
                    setError(null);
                    setLoading(false);
                    return;
                }
                throw new Error('Centre non trouvé');
            }

            if (response.data) {
                console.log('✅ Centre trouvé:', response.data);
                setGymCenter(response.data);
                setError(null);
            }
        } catch (err) {
            console.error('❌ Erreur détaillée:', err);

            // Message d'erreur spécifique
            if (err.code === 'ERR_NETWORK') {
                setError(`
                ❌ Impossible de se connecter au serveur.
                
                URL testée: ${api.defaults.baseURL}auth/centers/${subdomain}/by-subdomain/
                
                Vérifiez que:
                1. Django tourne: http://127.0.0.1:8000
                2. Testez: http://127.0.0.1:8000/api/auth/centers/
                3. Le proxy Vite est configuré
            `);
            } else {
                setError(`Erreur: ${err.message}`);
            }

            setGymCenter(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllCenters = async () => {
        try {
            console.log('Récupération de tous les centres...');
            const response = await api.get('/auth/centers/');

            console.log('Réponse API centers:', response); // Ajoutez ce log

            // Gérer différents formats de réponse
            let centers = [];

            if (Array.isArray(response.data)) {
                // Format direct : [ {...}, {...} ]
                centers = response.data;
            } else if (response.data && response.data.results && Array.isArray(response.data.results)) {
                // Format paginé : {results: [...]}
                centers = response.data.results;
            } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                // Format avec wrapper : {data: [...]}
                centers = response.data.data;
            } else {
                console.warn('Format de réponse inattendu:', response.data);
                centers = [];
            }

            console.log(`${centers.length} centre(s) trouvé(s)`, centers);
            setAllCenters(centers);
            setError(null);
        } catch (err) {
            console.error('Erreur lors de la récupération des centres:', err);
            console.error('Détails erreur:', err.response?.data || err.message);
            setError('Impossible de charger les centres');
            setAllCenters([]);
        } finally {
            setLoading(false);
        }
    };

    // Fonction pour rafraîchir les données
    const refresh = () => {
        setLoading(true);
        setError(null);

        if (subdomain) {
            fetchGymCenter(subdomain);
        } else {
            fetchAllCenters();
        }
    };

    return {
        subdomain,
        gymCenter,
        allCenters,
        loading,
        error,
        isMultiTenant,
        refresh
    };
};