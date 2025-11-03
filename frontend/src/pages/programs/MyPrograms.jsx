import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import { Typography, Card, CardBody, Spinner, Button } from "@material-tailwind/react";
import { ArrowLongRightIcon, DocumentArrowDownIcon } from "@heroicons/react/24/solid";

export default function MyPrograms() {
    const navigate = useNavigate();
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                // Cette route est filtrée côté backend pour ne renvoyer que les programmes assignés à l'utilisateur
                const res = await api.get("training-programs/");
                setPrograms(res.data.results || []); // Utiliser res.data.results
                setLoading(false);
            } catch (err) {
                console.error("Erreur de chargement des programmes:", err);
                // Si la requête échoue (ex: 401 Unauthorized), rediriger
                if (err.response && err.response.status === 401) {
                    navigate("/sign-in");
                    return;
                }
                setError("Impossible de charger vos programmes d'entraînement.");
                setLoading(false);
            }
        };
        fetchPrograms();
    }, [navigate]);

    const handleExportPDF = async (programId) => {
        try {
            // 💡 Appel de la nouvelle route Django pour la génération PDF
            const res = await api.get(`training-programs/${programId}/export-pdf/`, {
                responseType: 'blob', // Indiquer qu'on attend un fichier binaire (PDF)
            });
            
            // Logique pour télécharger le fichier
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            // Définir le nom du fichier
            link.setAttribute('download', `programme-entrainement-${programId}.pdf`); 
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
        } catch (err) {
             console.error("Erreur lors de l'export PDF:", err);
             // Gestion de l'erreur pour les réponses non-PDF
             let errorMessage = "Échec de la génération du PDF. Vérifiez les permissions ou l'implémentation côté serveur.";
             if (err.response && err.response.data instanceof Blob) {
                 const reader = new FileReader();
                 reader.onload = function() {
                    try {
                        // Tenter de lire le message d'erreur JSON du blob (si le serveur a renvoyé un 403/404/500)
                        const errorJson = JSON.parse(reader.result);
                        alert(`Erreur: ${errorJson.error || errorMessage}`);
                    } catch (e) {
                         alert(errorMessage);
                    }
                 };
                 reader.readAsText(err.response.data);
             } else {
                 alert(errorMessage);
             }
        }
    };

    if (loading) return <div className="p-8 text-center"><Spinner className="h-12 w-12" /></div>;
    if (error) return <p className="p-8 text-red-600 font-bold">{error}</p>;
    if (programs.length === 0) return <p className="p-8">Vous n'avez aucun programme d'entraînement assigné pour le moment.</p>;

    return (
        <div className="p-8 container mx-auto">
            <Typography variant="h3" color="blue-gray" className="mb-6">
                Mes Programmes d'Entraînement
            </Typography>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {programs.map((program) => (
                    <Card key={program.id} className="shadow-lg hover:shadow-xl transition-shadow">
                        <CardBody>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <Typography variant="h5" color="blue-gray">
                                        {program.title}
                                    </Typography>
                                    <Typography variant="small" color="gray">
                                        Coach: {program.coach_username}
                                    </Typography>
                                </div>
                                <Button 
                                    size="sm" 
                                    variant="text" 
                                    onClick={() => handleExportPDF(program.id)}
                                    title="Exporter en PDF"
                                >
                                    <DocumentArrowDownIcon className="h-5 w-5" />
                                </Button>
                            </div>
                            
                            <Typography color="gray" className="font-normal text-sm mb-4">
                                Période: {program.start_date} au {program.end_date || 'En cours'}
                            </Typography>
                            
                            <Typography color="blue-gray" className="font-medium mb-2">
                                Détails du programme ({program.details.length} exercices)
                            </Typography>
                            
                            <Button size="sm" variant="gradient" className="flex items-center gap-2">
                                Voir la Séance <ArrowLongRightIcon className="h-4 w-4" />
                            </Button>
                        </CardBody>
                    </Card>
                ))}
            </div>
        </div>
    );
}