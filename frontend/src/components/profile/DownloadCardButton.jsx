import { useState } from 'react';
import { Button, Spinner } from "@material-tailwind/react";
import api from "@/api/axiosInstance";

const DownloadCardButton = ({ memberId }) => {
    const [downloading, setDownloading] = useState(false);
  
    const handleDownload = async () => {
        setDownloading(true);
        try {
            console.log(`🔄 Tentative de téléchargement pour le membre: ${memberId}`);
            
            const response = await api.get(`members/generate-card/${memberId}/`, {
                responseType: 'blob',
            });
            
            console.log('✅ Réponse reçue:', response);
            
            // Vérifier le type de contenu
            if (response.data.type === 'application/json') {
                // C'est une erreur JSON, la lire
                const errorText = await new Response(response.data).text();
                const errorData = JSON.parse(errorText);
                throw new Error(errorData.error || errorData.detail || 'Erreur inconnue');
            }
            
            // Vérifier que c'est bien une image PNG
            if (response.data.type !== 'image/png') {
                console.warn('Type de contenu inattendu:', response.data.type);
            }

            // Créer le lien de téléchargement
            const url = window.URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `carte_membre_${memberId}.png`);
            document.body.appendChild(link);
            link.click();
            
            // Nettoyer
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            console.log('✅ Téléchargement réussi');
            
        } catch (error) {
            console.error('❌ Erreur détaillée:', error);
            
            let errorMessage = 'Erreur lors du téléchargement de la carte.';
            
            if (error.response?.status === 403) {
                if (error.response.data instanceof Blob) {
                    // Essayer de lire l'erreur depuis le blob
                    try {
                        const errorText = await new Response(error.response.data).text();
                        const errorData = JSON.parse(errorText);
                        errorMessage = errorData.detail || errorData.error || 'Accès refusé.';
                    } catch {
                        errorMessage = 'Vous n\'avez pas les permissions pour télécharger cette carte.';
                    }
                } else {
                    errorMessage = 'Accès refusé: permissions insuffisantes.';
                }
            } else if (error.response?.status === 404) {
                errorMessage = 'Membre non trouvé.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            alert(`❌ ${errorMessage}`);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <Button
            size="sm"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={handleDownload}
            disabled={downloading}
        >
            {downloading ? (
                <>
                    <Spinner className="h-4 w-4" />
                    <span>Génération...</span>
                </>
            ) : (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    <span>Télécharger la Carte</span>
                </>
            )}
        </Button>
    );
};

export default DownloadCardButton;