import { useState } from 'react';
import { Button, Spinner } from "@material-tailwind/react";
import api from "@/api/axiosInstance";

const DownloadCardButton = ({ memberId }) => {
    const [downloading, setDownloading] = useState(false);
  
    const handleDownload = async () => {
        setDownloading(true);
        try {
            // S'assurer que le token est envoyé avec la requête
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('Non authentifié');
            }

            const response = await api.get(`members/generate-card/${memberId}/`, {
                responseType: 'blob', // Important pour recevoir le fichier
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            // Vérifier que nous avons reçu un blob
            if (!(response.data instanceof Blob)) {
                throw new Error('Réponse invalide du serveur');
            }

            // Créer un URL pour le blob
            const url = window.URL.createObjectURL(new Blob([response.data]));
            
            // Créer un lien temporaire et cliquer dessus pour télécharger
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `member_card_${memberId}.png`);
            document.body.appendChild(link);
            link.click();
            
            // Nettoyer
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erreur lors du téléchargement de la carte:', error);
            
            // Message d'erreur plus spécifique
            if (error.response?.status === 401) {
                alert('Veuillez vous reconnecter pour télécharger la carte.');
            } else if (error.response?.status === 403) {
                alert('Vous n\'avez pas les droits pour télécharger cette carte.');
            } else if (error.response?.status === 500) {
                alert('Erreur lors de la génération de la carte. Veuillez réessayer plus tard.');
            } else {
                alert('Erreur lors du téléchargement de la carte. Veuillez réessayer.');
            }
        } finally {
            setDownloading(false);
        }
    };

    return (
        <Button
            size="sm"
            className="flex items-center gap-2"
            onClick={handleDownload}
            disabled={downloading}
        >
            {downloading ? (
                <>
                    <Spinner className="h-4 w-4" />
                    <span>Téléchargement...</span>
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