import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Dumbbell, Clock, Calendar } from 'lucide-react';
import coachingService from '../../services/coachingService';
import api from '../../api/axiosInstance';  
const Step4Sessions = ({ formData, updateFormData }) => {
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchExercises();
    fetchCategories();
  }, []);

  const fetchExercises = async () => {
    try {
      const response = await coachingService.getExercises();
      setExercises(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des exercices:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/coaching/exercise-categories/');
      setCategories(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des catégories:', err);
    }
  };

  const addSession = (sessionData) => {
    const newSessions = [...formData.workout_sessions, sessionData];
    updateFormData('workout_sessions', newSessions);
    setShowSessionModal(false);
  };

  const updateSession = (index, sessionData) => {
    const newSessions = [...formData.workout_sessions];
    newSessions[index] = sessionData;
    updateFormData('workout_sessions', newSessions);
    setEditingSession(null);
    setShowSessionModal(false);
  };

  const deleteSession = (index) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette session ?')) {
      const newSessions = formData.workout_sessions.filter((_, i) => i !== index);
      updateFormData('workout_sessions', newSessions);
    }
  };

  const openEditModal = (session, index) => {
    setEditingSession({ ...session, index });
    setShowSessionModal(true);
  };

  // Organiser les sessions par semaine
  const sessionsByWeek = formData.workout_sessions.reduce((acc, session, index) => {
    const week = session.week_number;
    if (!acc[week]) acc[week] = [];
    acc[week].push({ ...session, originalIndex: index });
    return acc;
  }, {});

  const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Sessions d'entraînement
        </h2>
        <button
          onClick={() => {
            setEditingSession(null);
            setShowSessionModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Ajouter une session
        </button>
      </div>

      {/* Liste des sessions par semaine */}
      {formData.workout_sessions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Dumbbell className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">Aucune session d'entraînement</p>
          <button
            onClick={() => setShowSessionModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Créer la première session
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.keys(sessionsByWeek).sort((a, b) => parseInt(a) - parseInt(b)).map(week => (
            <div key={week} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">
                  Semaine {week}
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {sessionsByWeek[week].map((session) => (
                  <div key={session.originalIndex} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {session.title}
                        </h4>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {dayNames[session.day_of_week - 1]}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {session.duration_minutes} min
                          </div>
                          <div className="flex items-center">
                            <Dumbbell className="w-4 h-4 mr-1" />
                            {session.exercises?.length || 0} exercice(s)
                          </div>
                        </div>
                        {session.notes && (
                          <p className="text-sm text-gray-600 mt-2 italic">
                            {session.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => openEditModal(session, session.originalIndex)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteSession(session.originalIndex)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {formData.workout_sessions.length > 0 && (
        <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-900">
              {formData.workout_sessions.length}
            </p>
            <p className="text-sm text-blue-700">Session(s)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-900">
              {Object.keys(sessionsByWeek).length}
            </p>
            <p className="text-sm text-blue-700">Semaine(s)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-900">
              {formData.workout_sessions.reduce((sum, s) => sum + (s.exercises?.length || 0), 0)}
            </p>
            <p className="text-sm text-blue-700">Exercice(s)</p>
          </div>
        </div>
      )}

      {/* Modal de création/édition de session */}
      {showSessionModal && (
        <SessionModal
          session={editingSession}
          exercises={exercises}
          categories={categories}
          maxWeeks={formData.duration_weeks}
          onSave={(sessionData) => {
            if (editingSession?.index !== undefined) {
              updateSession(editingSession.index, sessionData);
            } else {
              addSession(sessionData);
            }
          }}
          onClose={() => {
            setShowSessionModal(false);
            setEditingSession(null);
          }}
        />
      )}
    </div>
  );
};

// Modal de création/édition de session
const SessionModal = ({ session, exercises, categories, maxWeeks, onSave, onClose }) => {
  const [formData, setFormData] = useState(session || {
    title: '',
    week_number: 1,
    day_of_week: 1,
    duration_minutes: 60,
    notes: '',
    order: 1,
    exercises: []
  });

  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const dayOptions = [
    { value: 1, label: 'Lundi' },
    { value: 2, label: 'Mardi' },
    { value: 3, label: 'Mercredi' },
    { value: 4, label: 'Jeudi' },
    { value: 5, label: 'Vendredi' },
    { value: 6, label: 'Samedi' },
    { value: 7, label: 'Dimanche' }
  ];

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addExercise = (exercise) => {
    const newExercise = {
      exercise: exercise.id,
      exercise_name: exercise.name,
      exercise_category: exercise.category_name,
      sets: 3,
      reps: '10-12',
      weight: '',
      rest_seconds: 60,
      notes: '',
      order: formData.exercises.length + 1
    };
    updateField('exercises', [...formData.exercises, newExercise]);
    setShowExerciseModal(false);
  };

  const updateExercise = (index, field, value) => {
    const newExercises = [...formData.exercises];
    newExercises[index] = { ...newExercises[index], [field]: value };
    updateField('exercises', newExercises);
  };

  const removeExercise = (index) => {
    updateField('exercises', formData.exercises.filter((_, i) => i !== index));
  };

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || ex.category === parseInt(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = () => {
    if (!formData.title) {
      alert('Veuillez entrer un titre pour la session');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h3 className="text-xl font-bold text-gray-900">
            {session ? 'Modifier la session' : 'Nouvelle session'}
          </h3>
        </div>

        <div className="p-6 space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre de la session *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Full Body - Séance A"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semaine *
              </label>
              <input
                type="number"
                value={formData.week_number}
                onChange={(e) => updateField('week_number', parseInt(e.target.value) || 1)}
                min="1"
                max={maxWeeks}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jour *
              </label>
              <select
                value={formData.day_of_week}
                onChange={(e) => updateField('day_of_week', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {dayOptions.map(day => (
                  <option key={day.value} value={day.value}>{day.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durée (minutes)
              </label>
              <input
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => updateField('duration_minutes', parseInt(e.target.value) || 60)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordre
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => updateField('order', parseInt(e.target.value) || 1)}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Instructions ou recommandations pour cette session..."
              />
            </div>
          </div>

          {/* Exercices */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Exercices ({formData.exercises.length})</h4>
              <button
                onClick={() => setShowExerciseModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center text-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un exercice
              </button>
            </div>

            {formData.exercises.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-600">Aucun exercice ajouté</p>
              </div>
            ) : (
              <div className="space-y-3">
                {formData.exercises.map((ex, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h5 className="font-semibold text-gray-900">{ex.exercise_name}</h5>
                        <p className="text-sm text-gray-600">{ex.exercise_category}</p>
                      </div>
                      <button
                        onClick={() => removeExercise(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Séries</label>
                        <input
                          type="number"
                          value={ex.sets}
                          onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Reps</label>
                        <input
                          type="text"
                          value={ex.reps}
                          onChange={(e) => updateExercise(index, 'reps', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          placeholder="10-12"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Poids</label>
                        <input
                          type="text"
                          value={ex.weight}
                          onChange={(e) => updateExercise(index, 'weight', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          placeholder="20kg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Repos (s)</label>
                        <input
                          type="number"
                          value={ex.rest_seconds}
                          onChange={(e) => updateExercise(index, 'rest_seconds', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {session ? 'Mettre à jour' : 'Créer la session'}
          </button>
        </div>

        {/* Modal de sélection d'exercice */}
        {showExerciseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden mx-4">
              <div className="p-4 border-b border-gray-200">
                <h4 className="font-semibold text-gray-900">Sélectionner un exercice</h4>
              </div>
              
              <div className="p-4 space-y-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher un exercice..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Toutes les catégories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {filteredExercises.map(ex => (
                    <div
                      key={ex.id}
                      onClick={() => addExercise(ex)}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer"
                    >
                      <h5 className="font-semibold text-gray-900">{ex.name}</h5>
                      <p className="text-sm text-gray-600">{ex.category_name}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={() => setShowExerciseModal(false)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step4Sessions;