// Fichier: frontend/src/pages/admin/MemberEdit.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    Spinner,
} from "@material-tailwind/react";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import api from "@/api/axiosInstance";
import PhotoUpload from "@/components/PhotoUpload";

const MemberEdit = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [photoFile, setPhotoFile] = useState(null);
    const [currentPhoto, setCurrentPhoto] = useState(null);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        gender: 'M',
        address: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        status: 'ACTIVE',
        height: '',
        weight: '',
        medical_conditions: '',
    });

    // Charger les données du membre
    useEffect(() => {
        const fetchMember = async () => {
            try {
                const response = await api.get(`members/${userId}/`);
                const member = response.data;
                
                // Pré-remplir le formulaire
                setFormData({
                    first_name: member.first_name || '',
                    last_name: member.last_name || '',
                    email: member.email || '',
                    phone: member.phone || '',
                    date_of_birth: member.date_of_birth || '',
                    gender: member.gender || 'M',
                    address: member.address || '',
                    emergency_contact_name: member.emergency_contact_name || '',
                    emergency_contact_phone: member.emergency_contact_phone || '',
                    status: member.status || 'ACTIVE',
                    height: member.height || '',
                    weight: member.weight || '',
                    medical_conditions: member.medical_conditions || '',
                });
                
                // Stocker la photo actuelle
                setCurrentPhoto(member.photo);
                
                setError(null);
            } catch (err) {
                console.error("Erreur:", err);
                setError("Impossible de charger les informations du membre");
            } finally {
                setLoading(false);
            }
        };

        fetchMember();
    }, [userId]);

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
        setSubmitting(true);
        setError(null);

        try {
            // Si une photo est ajoutée, utiliser FormData
            if (photoFile) {
                const formDataToSend = new FormData();
                
                // Ajouter tous les champs
                formDataToSend.append('first_name', formData.first_name);
                formDataToSend.append('last_name', formData.last_name);
                formDataToSend.append('email', formData.email);
                formDataToSend.append('phone', formData.phone);
                formDataToSend.append('date_of_birth', formData.date_of_birth);
                formDataToSend.append('gender', formData.gender);
                formDataToSend.append('emergency_contact_name', formData.emergency_contact_name);
                formDataToSend.append('emergency_contact_phone', formData.emergency_contact_phone);
                formDataToSend.append('status', formData.status);
                
                if (formData.address) formDataToSend.append('address', formData.address);
                if (formData.height) formDataToSend.append('height', parseFloat(formData.height));
                if (formData.weight) formDataToSend.append('weight', parseFloat(formData.weight));
                if (formData.medical_conditions) formDataToSend.append('medical_conditions', formData.medical_conditions);
                
                // Ajouter la photo
                formDataToSend.append('photo', photoFile);

                await api.patch(`members/${userId}/`, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                });
            } else {
                // Sinon, utiliser JSON classique
                const dataToSend = {
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    email: formData.email,
                    phone: formData.phone,
                    date_of_birth: formData.date_of_birth,
                    gender: formData.gender,
                    emergency_contact_name: formData.emergency_contact_name,
                    emergency_contact_phone: formData.emergency_contact_phone,
                    status: formData.status,
                };

                if (formData.address) dataToSend.address = formData.address;
                if (formData.height) dataToSend.height = parseFloat(formData.height);
                if (formData.weight) dataToSend.weight = parseFloat(formData.weight);
                if (formData.medical_conditions) dataToSend.medical_conditions = formData.medical_conditions;

                await api.patch(`members/${userId}/`, dataToSend);
            }
            
            setSuccess(true);
            setTimeout(() => {
                navigate(`/admin/members/${userId}`);
            }, 1500);
        } catch (err) {
            console.error("Erreur de modification:", err);
            
            if (err.response?.data) {
                const errors = err.response.data;
                let errorMessage = "Erreur de validation:\n";
                
                Object.keys(errors).forEach(key => {
                    const errorValue = Array.isArray(errors[key]) ? errors[key][0] : errors[key];
                    errorMessage += `• ${key}: ${errorValue}\n`;
                });
                
                setError(errorMessage);
            } else {
                setError("Erreur lors de la modification du membre");
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spinner color="blue" className="h-12 w-12" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-10 min-h-screen bg-gray-50">
            <div className="flex items-center justify-between mb-6">
                <Button
                    variant="text"
                    className="flex items-center gap-2"
                    onClick={() => navigate(`/admin/members/${userId}`)}
                >
                    <ArrowLeftIcon className="h-4 w-4" /> Retour
                </Button>
            </div>

            <Typography variant="h4" color="blue-gray" className="mb-6">
                Modifier le Membre
            </Typography>

            {error && (
                <Alert color="red" className="mb-4 whitespace-pre-line">
                    {error}
                </Alert>
            )}

            {success && (
                <Alert color="green" className="mb-4">
                    Membre modifié avec succès ! Redirection...
                </Alert>
            )}

            <Card>
                <CardBody>
                    <form onSubmit={handleSubmit}>
                        {/* Photo de Profil */}
                        <div className="mb-8 flex justify-center">
                            <PhotoUpload
                                currentPhoto={currentPhoto}
                                onPhotoChange={handlePhotoChange}
                                disabled={submitting}
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
                                label="Téléphone *"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
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
                                required
                            />

                            {/* Informations Physiques */}
                            <div className="md:col-span-2 mt-4">
                                <Typography variant="h6" color="blue-gray" className="mb-4">
                                    Informations Physiques
                                </Typography>
                            </div>

                            <Input
                                label="Taille (cm)"
                                type="number"
                                step="0.01"
                                name="height"
                                value={formData.height}
                                onChange={handleChange}
                            />

                            <Input
                                label="Poids (kg)"
                                type="number"
                                step="0.01"
                                name="weight"
                                value={formData.weight}
                                onChange={handleChange}
                            />

                            <div className="md:col-span-2">
                                <Textarea
                                    label="Conditions Médicales"
                                    name="medical_conditions"
                                    value={formData.medical_conditions}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Statut */}
                            <div className="md:col-span-2 mt-4">
                                <Select
                                    label="Statut *"
                                    value={formData.status}
                                    onChange={(value) => handleSelectChange('status', value)}
                                >
                                    <Option value="ACTIVE">Actif</Option>
                                    <Option value="INACTIVE">Inactif</Option>
                                    <Option value="SUSPENDED">Suspendu</Option>
                                    <Option value="EXPIRED">Expiré</Option>
                                </Select>
                            </div>
                        </div>

                        {/* Boutons */}
                        <div className="flex gap-4 mt-6">
                            <Button
                                type="submit"
                                color="blue"
                                disabled={submitting}
                                className="flex-1"
                            >
                                {submitting ? 'Modification...' : 'Sauvegarder les Modifications'}
                            </Button>
                            <Button
                                type="button"
                                variant="outlined"
                                onClick={() => navigate(`/admin/members/${userId}`)}
                                disabled={submitting}
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

export default MemberEdit;