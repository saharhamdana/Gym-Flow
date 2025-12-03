// Fichier: frontend/src/pages/receptionist/subscriptions/SubscriptionCreate.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardBody,
    Typography,
    Button,
    Select,
    Option,
    Input,
    Alert,
    Textarea,
    Radio,
} from "@material-tailwind/react";
import { ArrowLeftIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import api from "@/api/axiosInstance";

const SubscriptionCreate = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // États pour les données
    const [members, setMembers] = useState([]);
    const [plans, setPlans] = useState([]);
    
    // Formulaire
    const [formData, setFormData] = useState({
        member: '',
        plan: '',
        start_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        amount_paid: '',
        notes: '',
    });

    // Membre sélectionné (pour affichage)
    const [selectedMember, setSelectedMember] = useState(null);
    const [selectedPlan, setSelectedPlan] = useState(null);

    // Charger les données initiales
    useEffect(() => {
        fetchMembers();
        fetchPlans();
    }, []);

    const fetchMembers = async () => {
        try {
            const response = await api.get('members/?status=ACTIVE');
            setMembers(response.data);
        } catch (err) {
            console.error("Erreur chargement membres:", err);
        }
    };

    const fetchPlans = async () => {
        try {
            const response = await api.get('subscriptions/plans/active/');
            setPlans(response.data);
        } catch (err) {
            console.error("Erreur chargement plans:", err);
        }
    };

    const handleMemberChange = (value) => {
        setFormData({ ...formData, member: value });
        const member = members.find(m => m.id === parseInt(value));
        setSelectedMember(member);
    };

    const handlePlanChange = (value) => {
        setFormData({ ...formData, plan: value });
        const plan = plans.find(p => p.id === parseInt(value));
        setSelectedPlan(plan);
        // Auto-remplir le montant avec le prix du plan
        if (plan) {
            setFormData(prev => ({ ...prev, plan: value, amount_paid: plan.price }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await api.post('subscriptions/subscriptions/', formData);
            
            setSuccess(true);
            
            // Redirection après succès
            setTimeout(() => {
                navigate('/receptionist/subscriptions');
            }, 2000);
        } catch (err) {
            console.error("Erreur création abonnement:", err);
            
            if (err.response?.data) {
                const errors = err.response.data;
                let errorMessage = "Erreur de validation:\n";
                
                Object.keys(errors).forEach(key => {
                    const errorValue = Array.isArray(errors[key]) ? errors[key][0] : errors[key];
                    errorMessage += `• ${key}: ${errorValue}\n`;
                });
                
                setError(errorMessage);
            } else {
                setError("Erreur lors de la création de l'abonnement");
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
                    onClick={() => navigate('/receptionist/subscriptions')}
                >
                    <ArrowLeftIcon className="h-4 w-4" /> Retour
                </Button>
            </div>

            <Typography variant="h4" color="blue-gray" className="mb-6">
                Créer un Nouvel Abonnement
            </Typography>

            {error && (
                <Alert color="red" className="mb-4 whitespace-pre-line">
                    {error}
                </Alert>
            )}

            {success && (
                <Alert color="green" className="mb-4" icon={<CheckCircleIcon className="h-6 w-6" />}>
                    ✅ Abonnement créé avec succès ! Membre activé. Redirection...
                </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Formulaire Principal */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardBody>
                            <form onSubmit={handleSubmit}>
                                <div className="space-y-6">
                                    {/* 1️⃣ Sélection du Membre */}
                                    <div>
                                        <Typography variant="h6" color="blue-gray" className="mb-4">
                                            1. Sélectionner le Membre
                                        </Typography>
                                        <Select
                                            label="Membre *"
                                            value={formData.member}
                                            onChange={handleMemberChange}
                                            required
                                        >
                                            {members.map(member => (
                                                <Option key={member.id} value={member.id.toString()}>
                                                    {member.first_name} {member.last_name} ({member.member_id})
                                                </Option>
                                            ))}
                                        </Select>
                                    </div>

                                    {/* 2️⃣ Sélection du Plan */}
                                    <div>
                                        <Typography variant="h6" color="blue-gray" className="mb-4">
                                            2. Choisir le Plan d'Abonnement
                                        </Typography>
                                        <div className="space-y-3">
                                            {plans.map(plan => (
                                                <div
                                                    key={plan.id}
                                                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                        formData.plan === plan.id.toString()
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-gray-200 hover:border-blue-300'
                                                    }`}
                                                    onClick={() => handlePlanChange(plan.id.toString())}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <Radio
                                                                name="plan"
                                                                checked={formData.plan === plan.id.toString()}
                                                                onChange={() => handlePlanChange(plan.id.toString())}
                                                            />
                                                            <div>
                                                                <Typography variant="h6" color="blue-gray">
                                                                    {plan.name}
                                                                </Typography>
                                                                <Typography variant="small" className="text-gray-600">
                                                                    {plan.duration_days} jours • {plan.description}
                                                                </Typography>
                                                            </div>
                                                        </div>
                                                        <Typography variant="h5" color="blue" className="font-bold">
                                                            {plan.price} DT
                                                        </Typography>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 3️⃣ Détails du Paiement */}
                                    <div>
                                        <Typography variant="h6" color="blue-gray" className="mb-4">
                                            3. Informations de Paiement
                                        </Typography>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Input
                                                label="Date de Début *"
                                                type="date"
                                                value={formData.start_date}
                                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                                required
                                            />

                                            <Input
                                                label="Montant Payé (DT) *"
                                                type="number"
                                                step="0.01"
                                                value={formData.amount_paid}
                                                onChange={(e) => setFormData({ ...formData, amount_paid: e.target.value })}
                                                required
                                            />

                                            <Select
                                                label="Méthode de Paiement *"
                                                value={formData.payment_method}
                                                onChange={(value) => setFormData({ ...formData, payment_method: value })}
                                            >
                                                <Option value="cash">💵 Espèces</Option>
                                                <Option value="card">💳 Carte Bancaire</Option>
                                                <Option value="check">📝 Chèque</Option>
                                                <Option value="transfer">🏦 Virement</Option>
                                            </Select>
                                        </div>

                                        <div className="mt-4">
                                            <Textarea
                                                label="Notes (optionnel)"
                                                value={formData.notes}
                                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                                placeholder="Remarques, conditions particulières..."
                                            />
                                        </div>
                                    </div>

                                    {/* Boutons */}
                                    <div className="flex gap-4 pt-4">
                                        <Button
                                            type="submit"
                                            color="blue"
                                            disabled={loading || !formData.member || !formData.plan}
                                            className="flex-1"
                                        >
                                            {loading ? 'Création...' : '✅ Créer et Activer l\'Abonnement'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outlined"
                                            onClick={() => navigate('/receptionist/subscriptions')}
                                            disabled={loading}
                                        >
                                            Annuler
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </CardBody>
                    </Card>
                </div>

                {/* Récapitulatif */}
                <div>
                    <Card className="sticky top-6">
                        <CardBody>
                            <Typography variant="h6" color="blue-gray" className="mb-4">
                                📋 Récapitulatif
                            </Typography>

                            <div className="space-y-4">
                                {/* Membre */}
                                {selectedMember && (
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <Typography variant="small" className="text-gray-600 mb-1">
                                            Membre
                                        </Typography>
                                        <Typography variant="h6" color="blue-gray">
                                            {selectedMember.first_name} {selectedMember.last_name}
                                        </Typography>
                                        <Typography variant="small" className="text-gray-600">
                                            {selectedMember.member_id}
                                        </Typography>
                                    </div>
                                )}

                                {/* Plan */}
                                {selectedPlan && (
                                    <div className="p-3 bg-green-50 rounded-lg">
                                        <Typography variant="small" className="text-gray-600 mb-1">
                                            Plan
                                        </Typography>
                                        <Typography variant="h6" color="blue-gray">
                                            {selectedPlan.name}
                                        </Typography>
                                        <Typography variant="small" className="text-gray-600">
                                            Durée: {selectedPlan.duration_days} jours
                                        </Typography>
                                    </div>
                                )}

                                {/* Montant */}
                                {formData.amount_paid && (
                                    <div className="p-3 bg-purple-50 rounded-lg">
                                        <Typography variant="small" className="text-gray-600 mb-1">
                                            Montant Total
                                        </Typography>
                                        <Typography variant="h4" color="purple" className="font-bold">
                                            {formData.amount_paid} DT
                                        </Typography>
                                    </div>
                                )}

                                {/* Date */}
                                {formData.start_date && selectedPlan && (
                                    <div className="p-3 bg-orange-50 rounded-lg">
                                        <Typography variant="small" className="text-gray-600 mb-1">
                                            Validité
                                        </Typography>
                                        <Typography variant="small" className="font-semibold">
                                            Du {new Date(formData.start_date).toLocaleDateString('fr-FR')}
                                        </Typography>
                                        <Typography variant="small" className="font-semibold">
                                            Au {new Date(
                                                new Date(formData.start_date).getTime() + 
                                                selectedPlan.duration_days * 24 * 60 * 60 * 1000
                                            ).toLocaleDateString('fr-FR')}
                                        </Typography>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                                <Typography variant="small" className="text-gray-700">
                                    ℹ️ <strong>Important:</strong> L'abonnement sera automatiquement activé et le membre passera au statut ACTIVE.
                                </Typography>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionCreate;