import React from 'react';
import api from '../../api/axiosInstance';  

const Step1BasicInfo = ({ formData, updateFormData }) => {
  const goalOptions = [
    { value: 'Perte de poids', label: '🔥 Perte de poids' },
    { value: 'Prise de masse musculaire', label: '💪 Prise de masse musculaire' },
    { value: 'Tonification', label: '✨ Tonification' },
    { value: 'Endurance', label: '🏃 Endurance' },
    { value: 'Force', label: '🏋️ Force' },
    { value: 'Rééducation', label: '🩹 Rééducation' },
    { value: 'Bien-être général', label: '🧘 Bien-être général' }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Informations de base
      </h2>

      {/* Titre du programme */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Titre du programme *
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => updateFormData('title', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Ex: Programme Débutant Full Body"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Décrivez le programme, ses objectifs et son public cible..."
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          Décrivez les objectifs et caractéristiques principales du programme
        </p>
      </div>

      {/* Objectif principal */}
      <div>
        <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-2">
          Objectif principal *
        </label>
        <select
          id="goal"
          value={formData.goal}
          onChange={(e) => updateFormData('goal', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="">Sélectionnez un objectif</option>
          {goalOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Affichage du résumé */}
      {formData.title && formData.description && formData.goal && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Aperçu</h3>
          <p className="text-sm text-blue-800">
            <strong>{formData.title}</strong> - {formData.goal}
          </p>
          <p className="text-sm text-blue-700 mt-1">
            {formData.description.substring(0, 150)}
            {formData.description.length > 150 && '...'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Step1BasicInfo;