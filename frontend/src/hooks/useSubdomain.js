// frontend/src/hooks/useSubdomain.js
import { useState, useEffect } from 'react';

export const useSubdomain = () => {
    const [subdomain, setSubdomain] = useState(null);
    const [gymCenter, setGymCenter] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isMultiTenant, setIsMultiTenant] = useState(false);

    useEffect(() => {
        const detectSubdomain = () => {
            const hostname = window.location.hostname;
            const parts = hostname.split('.');

            console.log('🌐 Hostname:', hostname);

            // Développement local - PAS de multi-tenant
            if (hostname === 'localhost' || hostname === '127.0.0.1') {
                console.log('✅ Mode développement local');
                setIsMultiTenant(false);
                setSubdomain('local');
                setGymCenter({
                    id: 1,
                    name: 'Gym Flow Local',
                    subdomain: 'local'
                });
                setLoading(false);
                return;
            }

            // Vercel - Extraire le tenant du domaine
            if (hostname.includes('.vercel.app')) {
                // gym-flow-virid.vercel.app → gym
                const subdomainPart = parts[0].split('-')[0];
                console.log('✅ Mode Vercel, tenant:', subdomainPart);
                
                setIsMultiTenant(true);
                setSubdomain(subdomainPart);
                setGymCenter({
                    id: 1,
                    name: `Gym Flow ${subdomainPart}`,
                    subdomain: subdomainPart
                });
                setLoading(false);
                return;
            }

            // Production .gymflow.com
            if (hostname.includes('.gymflow.com') && parts[0] !== 'www') {
                const detectedSubdomain = parts[0];
                console.log('✅ Mode production multi-tenant:', detectedSubdomain);
                
                setIsMultiTenant(true);
                setSubdomain(detectedSubdomain);
                setGymCenter({
                    id: 1,
                    name: `Gym Flow ${detectedSubdomain}`,
                    subdomain: detectedSubdomain
                });
                setLoading(false);
                return;
            }

            // Domaine principal - mode mono-tenant
            console.log('✅ Domaine principal - mono-tenant');
            setIsMultiTenant(false);
            setSubdomain('main');
            setGymCenter({
                id: 1,
                name: 'Gym Flow',
                subdomain: 'main'
            });
            setLoading(false);
        };

        detectSubdomain();
    }, []);

    return {
        subdomain,
        gymCenter,
        allCenters: [],
        loading,
        error,
        isMultiTenant,
        refresh: () => {}
    };
};