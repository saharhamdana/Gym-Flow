// Fichier: frontend/src/components/AddMeasurementModal.jsx

import React, { useState } from 'react';
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Typography,
    Input,
    Textarea,
    Alert
} from "@material-tailwind/react";
import { ScaleIcon } from "@heroicons/react/24/outline";

const AddMeasurementModal = ({ open, onClose, onSubmit, loading }) => {
    const [formData, setFormData] = useState({
        weight: '',
        body_fat_percentage: '',
        muscle_mass: '',
        chest: '',
        waist: '',
        hips: '',
        notes: ''
    });
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validation: au moins le poids doit être renseigné
        if (!formData.weight) {
            setError("Le poids est obligatoire");
            return;
        }

        // Préparer les données (convertir en nombres)
        const dataToSend = {};
        if (formData.weight) dataToSend.weight = parseFloat(formData.weight);
        if (formData.body_fat_percentage) dataToSend.body_fat_percentage = parseFloat(formData.body_fat_percentage);
        if (formData.muscle_mass) dataToSend.muscle_mass = parseFloat(formData.muscle_mass);
        if (formData.chest) dataToSend.chest = parseFloat(formData.chest);
        if (formData.waist) dataToSend.waist = parseFloat(formData.waist);
        if (formData.hips) dataToSend.hips = parseFloat(formData.hips);
        if (formData.notes) dataToSend.notes = formData.notes;

        try {
            await onSubmit(dataToSend);
            // Réinitialiser le formulaire
            setFormData({
                weight: '',
                body_fat_percentage: '',
                muscle_mass: '',
                chest: '',
                waist: '',
                hips: '',
                notes: ''
            });
            onClose();
        } catch (err) {
            setError(err.message || "Erreur lors de l'ajout de la mesure");
        }
    };

    return (
        <Dialog open={open} handler={onClose} size="md">
            <DialogHeader className="flex items-center gap-3">
                <ScaleIcon className="h-6 w-6 text-blue-500" />
                <Typography variant="h5">
                    Ajouter une Mesure Physique
                </Typography>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
                <DialogBody divider className="max-h-[60vh] overflow-y-auto">
                    {error && (
                        <Alert color="red" className="mb-4">
                            {error}
                        </Alert>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Poids (kg) *"
                            type="number"
                            step="0.01"
                            name="weight"
                            value={formData.weight}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            label="Masse Grasse (%)"
                            type="number"
                            step="0.1"
                            name="body_fat_percentage"
                            value={formData.body_fat_percentage}
                            onChange={handleChange}
                        />

                        <Input
                            label="Masse Musculaire (kg)"
                            type="number"
                            step="0.01"
                            name="muscle_mass"
                            value={formData.muscle_mass}
                            onChange={handleChange}
                        />

                        <Input
                            label="Tour de Poitrine (cm)"
                            type="number"
                            step="0.1"
                            name="chest"
                            value={formData.chest}
                            onChange={handleChange}
                        />

                        <Input
                            label="Tour de Taille (cm)"
                            type="number"
                            step="0.1"
                            name="waist"
                            value={formData.waist}
                            onChange={handleChange}
                        />

                        <Input
                            label="Tour de Hanches (cm)"
                            type="number"
                            step="0.1"
                            name="hips"
                            value={formData.hips}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="mt-4">
                        <Textarea
                            label="Notes (optionnel)"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>
                </DialogBody>
                <DialogFooter className="gap-2">
                    <Button
                        variant="text"
                        color="gray"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Annuler
                    </Button>
                    <Button
                        type="submit"
                        variant="filled"
                        color="green"
                        disabled={loading}
                    >
                        {loading ? 'Ajout en cours...' : 'Ajouter'}
                    </Button>
                </DialogFooter>
            </form>
        </Dialog>
    );
};

export default AddMeasurementModal;