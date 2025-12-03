import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CoachLayout from '../../components/coaching/CoachLayout';
import coachingService from '../../services/coachingService';
import { 
  Dumbbell, Search, Grid, List, Tag, Eye, Plus, Edit, Trash2,
  X, Save, AlertCircle, Upload
} from 'lucide-react';

const CoachExercises = () => {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  
  // États pour le modal de création/édition
  const [showModal, setShowModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    equipment_needed: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [exercisesData, categoriesData] = await Promise.all([
        coachingService.getExercises(),
        coachingService.getExerciseCategories()
      ]);
      setExercises(exercisesData.data || exercisesData);
      setCategories(categoriesData.data || categoriesData);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      alert('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || exercise.category === parseInt(filterCategory);
    const matchesDifficulty = !filterDifficulty || exercise.difficulty === filterDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getDifficultyBadge = (difficulty) => {
    const styles = {
      beginner: 'bg-green-100 text-green-700',
      intermediate: 'bg-yellow-100 text-yellow-700',
      advanced: 'bg-red-100 text-red-700'
    };
    
    const labels = {
      beginner: 'Débutant',
      intermediate: 'Intermédiaire',
      advanced: 'Avancé'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[difficulty]}`}>
        {labels[difficulty]}
      </span>
    );
  };

  // Fonctions pour le CRUD
  const handleCreate = () => {
    setEditingExercise(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      difficulty: 'beginner',
      equipment_needed: '',
      image: null
    });
    setImagePreview(null);
    setFormErrors({});
    setShowModal(true);
  };

  const handleEdit = (exercise) => {
    setEditingExercise(exercise);
    setFormData({
      name: exercise.name,
      description: exercise.description,
      category: exercise.category,
      difficulty: exercise.difficulty,
      equipment_needed: exercise.equipment_needed || '',
      image: null
    });
    setImagePreview(exercise.image || null);
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = async (exerciseId) => {
    try {
      await coachingService.deleteExercise(exerciseId);
      setExercises(exercises.filter(ex => ex.id !== exerciseId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors({});

    try {
      const submitData = new FormData();
      
      // Ajouter tous les champs au FormData
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('difficulty', formData.difficulty);
      submitData.append('equipment_needed', formData.equipment_needed);
      
      // Ajouter l'image seulement si elle a été modifiée
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      if (editingExercise) {
        await coachingService.updateExercise(editingExercise.id, submitData);
      } else {
        await coachingService.createExercise(submitData);
      }

      setShowModal(false);
      loadData(); // Recharger les données
    } catch (error) {
      if (error.response?.data) {
        setFormErrors(error.response.data);
      } else {
        alert('Erreur lors de la sauvegarde');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur du champ quand l'utilisateur tape
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      // Créer une preview de l'image
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null
    }));
    setImagePreview(null);
  };

  if (loading) {
    return (
      <CoachLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </CoachLayout>
    );
  }

  return (
    <CoachLayout>
      <div className="space-y-6">
        {/* Header avec bouton d'ajout */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#00357a' }}>
              Bibliothèque d'Exercices
            </h1>
            <p className="text-gray-600 mt-1">
              Gérez votre collection d'exercices
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors font-medium"
              style={{ backgroundColor: '#00357a' }}
            >
              <Plus className="w-5 h-5" />
              Nouvel exercice
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un exercice..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Toutes les catégories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Toutes les difficultés</option>
              <option value="beginner">Débutant</option>
              <option value="intermediate">Intermédiaire</option>
              <option value="advanced">Avancé</option>
            </select>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-600">
              {filteredExercises.length} exercice(s) trouvé(s)
            </p>
          </div>
        </div>

        {/* Liste des exercices */}
        {filteredExercises.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Dumbbell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#00357a' }}>
              Aucun exercice trouvé
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterCategory || filterDifficulty
                ? 'Essayez de modifier vos critères de recherche'
                : 'Commencez par créer votre premier exercice'}
            </p>
            {!searchTerm && !filterCategory && !filterDifficulty && (
              <button
                onClick={handleCreate}
                className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-colors font-medium"
                style={{ backgroundColor: '#00357a' }}
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Créer un exercice
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExercises.map((exercise) => (
              <div
                key={exercise.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {exercise.image ? (
                  <img
                    src={exercise.image}
                    alt={exercise.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <Dumbbell className="w-16 h-16 text-blue-400" />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    {getDifficultyBadge(exercise.difficulty)}
                    {exercise.category_name && (
                      <span className="flex items-center text-xs text-gray-600">
                        <Tag className="w-3 h-3 mr-1" />
                        {exercise.category_name}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#00357a' }}>
                    {exercise.name}
                  </h3>

                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                    {exercise.description}
                  </p>

                  {exercise.equipment_needed && (
                    <p className="text-xs text-gray-500 mb-4">
                      <strong>Équipement:</strong> {exercise.equipment_needed}
                    </p>
                  )}

                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleEdit(exercise)}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-sm font-medium"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(exercise)}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Vue liste */
          <div className="space-y-4">
            {filteredExercises.map((exercise) => (
              <div
                key={exercise.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-6">
                  {exercise.image ? (
                    <img
                      src={exercise.image}
                      alt={exercise.name}
                      className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Dumbbell className="w-8 h-8 text-blue-400" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold" style={{ color: '#00357a' }}>
                        {exercise.name}
                      </h3>
                      {getDifficultyBadge(exercise.difficulty)}
                      {exercise.category_name && (
                        <span className="flex items-center text-sm text-gray-600">
                          <Tag className="w-4 h-4 mr-1" />
                          {exercise.category_name}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {exercise.description}
                    </p>

                    {exercise.equipment_needed && (
                      <p className="text-sm text-gray-500">
                        <strong>Équipement:</strong> {exercise.equipment_needed}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => handleEdit(exercise)}
                      className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                      title="Modifier"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setDeleteConfirm(exercise)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de création/édition */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold" style={{ color: '#00357a' }}>
                  {editingExercise ? 'Modifier l\'exercice' : 'Nouvel exercice'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de l'exercice *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ex: Développé couché"
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Décrivez l'exercice..."
                  />
                  {formErrors.description && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Catégorie *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.category ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Sélectionnez une catégorie</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    {formErrors.category && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Difficulté *
                    </label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="beginner">Débutant</option>
                      <option value="intermediate">Intermédiaire</option>
                      <option value="advanced">Avancé</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Équipement nécessaire
                  </label>
                  <input
                    type="text"
                    name="equipment_needed"
                    value={formData.equipment_needed}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Haltères, barre, banc..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image de l'exercice
                  </label>
                  <div className="space-y-2">
                    {(imagePreview || (editingExercise && editingExercise.image)) && (
                      <div className="relative inline-block">
                        <img
                          src={imagePreview || editingExercise.image}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <Upload className="w-4 h-4" />
                        Choisir une image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      {formData.image && (
                        <span className="text-sm text-gray-600">
                          {formData.image.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors font-medium disabled:opacity-50"
                    style={{ backgroundColor: '#00357a' }}
                  >
                    <Save className="w-4 h-4" />
                    {submitting ? 'Sauvegarde...' : (editingExercise ? 'Modifier' : 'Créer')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de confirmation de suppression */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-red-500" />
                <h3 className="text-lg font-semibold">Confirmer la suppression</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer l'exercice <strong>"{deleteConfirm.name}"</strong> ? 
                Cette action est irréversible.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats catégories */}
        {filteredExercises.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#00357a' }}>
              Répartition par catégorie
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map(category => {
                const count = filteredExercises.filter(e => e.category === category.id).length;
                return (
                  <div key={category.id} className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold" style={{ color: '#00357a' }}>{count}</p>
                    <p className="text-sm text-gray-600 mt-1">{category.name}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </CoachLayout>
  );
};

export default CoachExercises;