// Fichier: frontend/src/pages/admin/members/MemberCreate.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardBody,
    Typography,
    Input,
    Button,
    Select,
    Option,
    Textarea,
    Alert,
} from "@material-tailwind/react";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import api from "@/api/axiosInstance";
import PhotoUpload from "@/components/common/PhotoUpload";

const MemberCreate = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [photoFile, setPhotoFile] = useState(null);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',  // ✅ Password obligatoire
        phone: '',
        date_of_birth: '',
        gender: 'M',
        address: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        status: 'INACTIVE',  // ✅ INACTIVE par défaut (sera activé lors de l'abonnement)
        height: '',
        weight: '',
        medical_conditions: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePhotoChange = (file) => {
        setPhotoFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // ✅ Créer un FormData pour supporter l'upload de fichier
            const formDataToSend = new FormData();
            
            // ✅ Ajouter les champs OBLIGATOIRES
            formDataToSend.append('first_name', formData.first_name);
            formDataToSend.append('last_name', formData.last_name);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('password', formData.password);  // ✅ Password obligatoire
            formDataToSend.append('phone', formData.phone);
            formDataToSend.append('date_of_birth', formData.date_of_birth);
            formDataToSend.append('gender', formData.gender);
            formDataToSend.append('emergency_contact_name', formData.emergency_contact_name);
            formDataToSend.append('emergency_contact_phone', formData.emergency_contact_phone);
            formDataToSend.append('status', formData.status);

            // ✅ Ajouter les champs OPTIONNELS (seulement s'ils ont une valeur)
            if (formData.address) {
                formDataToSend.append('address', formData.address);
            }
            if (formData.height) {
                formDataToSend.append('height', parseFloat(formData.height));
            }
            if (formData.weight) {
                formDataToSend.append('weight', parseFloat(formData.weight));
            }
            if (formData.medical_conditions) {
                formDataToSend.append('medical_conditions', formData.medical_conditions);
            }
            
            // ✅ Ajouter la photo si présente
            if (photoFile) {
                formDataToSend.append('photo', photoFile);
            }

            console.log('📤 Envoi des données membre...');
            
            // ✅ Envoyer la requête
            const response = await api.post('members/', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            
            console.log('✅ Membre créé avec succès:', response.data);
            
            setSuccess(true);
            setTimeout(() => {
                navigate(`/admin/members/${response.data.id}`);
            }, 1500);
            
        } catch (err) {
            console.error("❌ Erreur complète:", err);
            console.error("❌ Réponse serveur:", err.response?.data);
            
            // ✅ Meilleure gestion des erreurs
            if (err.response?.data) {
                const errors = err.response.data;
                let errorMessage = "Erreur de validation:\n";
                
                // Si c'est un objet d'erreurs
                if (typeof errors === 'object' && !Array.isArray(errors)) {
                    Object.keys(errors).forEach(key => {
                        const errorValue = Array.isArray(errors[key]) 
                            ? errors[key].join(', ') 
                            : errors[key];
                        errorMessage += `• ${key}: ${errorValue}\n`;
                    });
                } else if (typeof errors === 'string') {
                    errorMessage = errors;
                } else {
                    errorMessage = "Erreur inconnue lors de la création du membre";
                }
                
                setError(errorMessage);
            } else {
                setError("Erreur réseau. Vérifiez votre connexion et que le serveur est démarré.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-10 min-h-screen bg-gray-50">
            {/* En-tête */}
            <div className="flex items-center justify-between mb-6">
                <Button
                    variant="text"
                    className="flex items-center gap-2"
                    onClick={() => navigate('/admin/members')}
                >
                    <ArrowLeftIcon className="h-4 w-4" /> Retour
                </Button>
            </div>

            <Typography variant="h4" color="blue-gray" className="mb-6">
                Créer un Nouveau Membre
            </Typography>

            {error && (
                <Alert color="red" className="mb-4 whitespace-pre-line">
                    {error}
                </Alert>
            )}

            {success && (
                <Alert color="green" className="mb-4">
                    ✅ Membre créé avec succès ! Redirection...
                </Alert>
            )}

            <Card>
                <CardBody>
                    <form onSubmit={handleSubmit}>
                        {/* Photo de Profil */}
                        <div className="mb-8 flex justify-center">
                            <PhotoUpload
                                onPhotoChange={handlePhotoChange}
                                disabled={loading}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Informations Personnelles */}
                            <div className="md:col-span-2">
                                <Typography variant="h6" color="blue-gray" className="mb-4">
                                    Informations Personnelles
                                </Typography>
                            </div>

                            <Input
                                label="Prénom *"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                            />

                            <Input
                                label="Nom *"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                            />

                            <Input
                                label="Email *"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />

                            <Input
                                label="Mot de passe *"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Minimum 8 caractères"
                                required
                            />

                            <Input
                                label="Téléphone *"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+216XXXXXXXX"
                                required
                            />

                            <Input
                                label="Date de Naissance *"
                                type="date"
                                name="date_of_birth"
                                value={formData.date_of_birth}
                                onChange={handleChange}
                                required
                            />

                            <Select
                                label="Genre *"
                                value={formData.gender}
                                onChange={(value) => handleSelectChange('gender', value)}
                            >
                                <Option value="M">Masculin</Option>
                                <Option value="F">Féminin</Option>
                                <Option value="O">Autre</Option>
                            </Select>

                            <div className="md:col-span-2">
                                <Textarea
                                    label="Adresse"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Contact d'Urgence */}
                            <div className="md:col-span-2 mt-4">
                                <Typography variant="h6" color="blue-gray" className="mb-4">
                                    Contact d'Urgence
                                </Typography>
                            </div>

                            <Input
                                label="Nom du Contact d'Urgence *"
                                name="emergency_contact_name"
                                value={formData.emergency_contact_name}
                                onChange={handleChange}
                                required
                            />

                            <Input
                                label="Téléphone d'Urgence *"
                                name="emergency_contact_phone"
                                value={formData.emergency_contact_phone}
                                onChange={handleChange}
                                placeholder="+216XXXXXXXX"
                                required
                            />

                            {/* Informations Physiques */}
                            <div className="md:col-span-2 mt-4">
                                <Typography variant="h6" color="blue-gray" className="mb-4">
                                    Informations Physiques (Optionnel)
                                </Typography>
                            </div>

                            <Input
                                label="Taille (cm)"
                                type="number"
                                step="0.01"
                                name="height"
                                value={formData.height}
                                onChange={handleChange}
                                placeholder="Ex: 175.5"
                            />

                            <Input
                                label="Poids (kg)"
                                type="number"
                                step="0.01"
                                name="weight"
                                value={formData.weight}
                                onChange={handleChange}
                                placeholder="Ex: 70.5"
                            />

                            <div className="md:col-span-2">
                                <Textarea
                                    label="Conditions Médicales"
                                    name="medical_conditions"
                                    value={formData.medical_conditions}
                                    onChange={handleChange}
                                    placeholder="Allergies, conditions particulières..."
                                />
                            </div>

                            {/* Statut */}
                            <div className="md:col-span-2 mt-4">
                                <Select
                                    label="Statut *"
                                    value={formData.status}
                                    onChange={(value) => handleSelectChange('status', value)}
                                >
                                    <Option value="INACTIVE">Inactif (par défaut)</Option>
                                    <Option value="ACTIVE">Actif</Option>
                                    <Option value="SUSPENDED">Suspendu</Option>
                                    <Option value="EXPIRED">Expiré</Option>
                                </Select>
                                <Typography variant="small" className="text-gray-600 mt-2">
                                    💡 Le statut sera automatiquement mis à "Actif" lors de la souscription d'un abonnement
                                </Typography>
                            </div>
                        </div>

                        {/* Boutons */}
                        <div className="flex gap-4 mt-6">
                            <Button
                                type="submit"
                                color="blue"
                                disabled={loading}
                                className="flex-1"
                            >
                                {loading ? 'Création en cours...' : 'Créer le Membre'}
                            </Button>
                            <Button
                                type="button"
                                variant="outlined"
                                onClick={() => navigate('/admin/members')}
                                disabled={loading}
                            >
                                Annuler
                            </Button>
                        </div>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
};

export default MemberCreate;