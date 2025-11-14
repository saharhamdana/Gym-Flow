import React from 'react';
import { Calendar, Target, Weight, FileText } from 'lucide-react';
import api from '../../api/axiosInstance';  

const Step3Configuration = ({ formData, updateFormData }) => {
  const statusOptions = [
    { value: 'draft', label: 'Brouillon', color: 'yellow' },
    { value: 'active', label: 'Actif', color: 'green' },
  ];

  const calculateEndDate = (startDate, weeks) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + (weeks * 7));
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Configuration du programme
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date de début */}
        <div>
          <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Date de début *
          </label>
          <input
            type="date"
            id="start_date"
            value={formData.start_date}
            onChange={(e) => updateFormData('start_date', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Durée en semaines */}
        <div>
          <label htmlFor="duration_weeks" className="block text-sm font-medium text-gray-700 mb-2">
            <Target className="w-4 h-4 inline mr-2" />
            Durée (semaines) *
          </label>
          <input
            type="number"
            id="duration_weeks"
            value={formData.duration_weeks}
            onChange={(e) => updateFormData('duration_weeks', parseInt(e.target.value) || 0)}
            min="1"
            max="52"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Entre 1 et 52 semaines
          </p>
        </div>
      </div>

      {/* Affichage de la date de fin calculée */}
      {formData.start_date && formData.duration_weeks > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Date de fin estimée:</strong>{' '}
            {calculateEndDate(formData.start_date, formData.duration_weeks)}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Objectif de poids */}
        <div>
          <label htmlFor="target_weight" className="block text-sm font-medium text-gray-700 mb-2">
            <Weight className="w-4 h-4 inline mr-2" />
            Objectif de poids (kg)
          </label>
          <input
            type="number"
            id="target_weight"
            value={formData.target_weight}
            onChange={(e) => updateFormData('target_weight', e.target.value)}
            step="0.1"
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: 75.5"
          />
          <p className="text-sm text-gray-500 mt-1">
            Optionnel - Poids cible à atteindre
          </p>
        </div>

        {/* Objectif de masse grasse */}
        <div>
          <label htmlFor="target_body_fat" className="block text-sm font-medium text-gray-700 mb-2">
            Objectif de masse grasse (%)
          </label>
          <input
            type="number"
            id="target_body_fat"
            value={formData.target_body_fat}
            onChange={(e) => updateFormData('target_body_fat', e.target.value)}
            step="0.1"
            min="0"
            max="100"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: 15.0"
          />
          <p className="text-sm text-gray-500 mt-1">
            Optionnel - Pourcentage de masse grasse cible
          </p>
        </div>
      </div>

      {/* Statut */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
          Statut du programme
        </label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => updateFormData('status', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-500 mt-1">
          Vous pourrez changer le statut plus tard
        </p>
      </div>

      {/* Notes du coach */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
          <FileText className="w-4 h-4 inline mr-2" />
          Notes du coach
        </label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => updateFormData('notes', e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Ajoutez des notes, recommandations ou instructions spécifiques pour ce programme..."
        />
        <p className="text-sm text-gray-500 mt-1">
          Ces notes seront visibles dans le PDF du programme
        </p>
      </div>

      {/* Récapitulatif visuel */}
      <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">Récapitulatif de configuration</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Durée totale</p>
            <p className="font-semibold text-gray-900">{formData.duration_weeks} semaines</p>
          </div>
          <div>
            <p className="text-gray-600">Statut</p>
            <p className="font-semibold text-gray-900">
              {statusOptions.find(s => s.value === formData.status)?.label}
            </p>
          </div>
          {formData.target_weight && (
            <div>
              <p className="text-gray-600">Objectif de poids</p>
              <p className="font-semibold text-gray-900">{formData.target_weight} kg</p>
            </div>
          )}
          {formData.target_body_fat && (
            <div>
              <p className="text-gray-600">Objectif de masse grasse</p>
              <p className="font-semibold text-gray-900">{formData.target_body_fat}%</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step3Configuration;