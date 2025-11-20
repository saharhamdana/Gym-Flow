import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CoachLayout from '../../components/coaching/CoachLayout';
import coachingService from '../../services/coachingService';
import { Save, Loader } from 'lucide-react';

const EditProgramForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal: '',
    status: 'draft',
    start_date: '',
    end_date: '',
    duration_weeks: 0,
    target_weight: '',
    target_body_fat: '',
    notes: '',
    member: null
  });

  useEffect(() => {
    loadProgram();
  }, [id]);

  const loadProgram = async () => {
    try {
      setLoading(true);
      const response = await coachingService.getProgram(id);
      const program = response.data;
      
      setFormData({
        title: program.title || '',
        description: program.description || '',
        goal: program.goal || '',
        status: program.status || 'draft',
        start_date: program.start_date || '',
        end_date: program.end_date || '',
        duration_weeks: program.duration_weeks || 0,
        target_weight: program.target_weight || '',
        target_body_fat: program.target_body_fat || '',
        notes: program.notes || '',
        member: program.member
      });
    } catch (err) {
      console.error('Erreur chargement programme:', err);
      setError('Impossible de charger le programme');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const updateData = {
        title: formData.title,
        description: formData.description,
        goal: formData.goal,
        member: formData.member,
        status: formData.status,
        start_date: formData.start_date,
        end_date: formData.end_date,
        duration_weeks: parseInt(formData.duration_weeks),
        target_weight: formData.target_weight ? parseFloat(formData.target_weight) : null,
        target_body_fat: formData.target_body_fat ? parseFloat(formData.target_body_fat) : null,
        notes: formData.notes
      };

      await coachingService.updateProgram(id, updateData);
      alert('Programme modifié avec succès !');
      navigate('/coaching/programs');
    } catch (err) {
      console.error('Erreur modification:', err);
      setError(
        JSON.stringify(err.response?.data) ||
        err.response?.data?.message || 
        'Erreur lors de la modification'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <CoachLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Loader className="animate-spin h-12 w-12 text-blue-600" />
        </div>
      </CoachLayout>
    );
  }

  return (
    <CoachLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#00357a' }}>
            Modifier le programme
          </h1>
          <p className="text-gray-600 mt-2">
            Mettez à jour les informations du programme
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre du programme *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Objectif *
            </label>
            <textarea
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="draft">Brouillon</option>
              <option value="active">Actif</option>
              <option value="completed">Terminé</option>
              <option value="archived">Archivé</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début *
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin *
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durée (semaines) *
            </label>
            <input
              type="number"
              name="duration_weeks"
              value={formData.duration_weeks}
              onChange={handleChange}
              required
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Poids cible (kg)
              </label>
              <input
                type="number"
                name="target_weight"
                value={formData.target_weight}
                onChange={handleChange}
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Masse grasse cible (%)
              </label>
              <input
                type="number"
                name="target_body_fat"
                value={formData.target_body_fat}
                onChange={handleChange}
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/coaching/programs')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
              style={{ backgroundColor: '#9b0e16' }}
            >
              {saving ? (
                <>
                  <Loader className="animate-spin w-4 h-4" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </CoachLayout>
  );
};

export default EditProgramForm;