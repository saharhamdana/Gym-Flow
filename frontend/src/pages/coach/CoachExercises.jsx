import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CoachLayout from '../../components/coaching/CoachLayout';
import coachingService from '../../services/coachingService';
import { 
  Dumbbell, Search, Grid, List, Tag, Eye
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#00357a' }}>
              Bibliothèque d'Exercices
            </h1>
            <p className="text-gray-600 mt-1">
              Gérez votre collection d'exercices
            </p>
          </div>
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
            <p className="text-gray-600">
              {searchTerm || filterCategory || filterDifficulty
                ? 'Essayez de modifier vos critères de recherche'
                : 'Commencez par créer votre premier exercice'}
            </p>
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
                      className="flex-1 text-white px-3 py-2 rounded-lg hover:opacity-90 transition-colors flex items-center justify-center text-sm font-medium"
                      style={{ backgroundColor: '#00357a' }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Détails
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
                    <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors" style={{ color: '#00357a' }}>
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
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