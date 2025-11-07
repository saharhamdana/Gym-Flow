import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  User, 
  Calendar, 
  Dumbbell, 
  FileText 
} from 'lucide-react';
import coachingService from '../../services/coachingService';
// Importer les composants des étapes
import Step1BasicInfo from './Step1BasicInfo';
import Step2SelectMember from './Step2SelectMember';
import Step3Configuration from './Step3Configuration';
import Step4Sessions from './Step4Sessions';
import Step5Summary from './Step5Summary';

// Étapes du formulaire
const STEPS = [
  { id: 1, title: 'Informations de base', icon: FileText },
  { id: 2, title: 'Sélection du membre', icon: User },
  { id: 3, title: 'Configuration', icon: Calendar },
  { id: 4, title: 'Sessions', icon: Dumbbell },
  { id: 5, title: 'Récapitulatif', icon: Check }
];

const CreateProgramForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // État du formulaire
  const [formData, setFormData] = useState({
    // Étape 1 : Informations de base
    title: '',
    description: '',
    goal: '',
    
    // Étape 2 : Membre
    member: null,
    
    // Étape 3 : Configuration
    start_date: new Date().toISOString().split('T')[0],
    duration_weeks: 8,
    target_weight: '',
    target_body_fat: '',
    notes: '',
    status: 'draft',
    
    // Étape 4 : Sessions
    workout_sessions: []
  });

  // Calculer la date de fin automatiquement
  const calculateEndDate = (startDate, weeks) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + (weeks * 7));
    return date.toISOString().split('T')[0];
  };

  // Mettre à jour les données du formulaire
  const updateFormData = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Recalculer end_date si start_date ou duration_weeks change
      if (field === 'start_date' || field === 'duration_weeks') {
        updated.end_date = calculateEndDate(
          field === 'start_date' ? value : prev.start_date,
          field === 'duration_weeks' ? value : prev.duration_weeks
        );
      }
      
      return updated;
    });
  };

  // Validation par étape
  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.title && formData.description && formData.goal;
      case 2:
        return formData.member !== null;
      case 3:
        return formData.start_date && formData.duration_weeks > 0;
      case 4:
        return formData.workout_sessions.length > 0;
      default:
        return true;
    }
  };

  // Navigation entre les étapes
  const goToNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
      setError('');
    } else {
      setError('Veuillez remplir tous les champs obligatoires');
    }
  };

  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  // Soumettre le formulaire
  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Préparer les données pour l'API
      const programData = {
        title: formData.title,
        description: formData.description,
        goal: formData.goal,
        member: formData.member.id,
        coach: null, // Le backend utilisera l'utilisateur connecté
        status: formData.status,
        start_date: formData.start_date,
        end_date: calculateEndDate(formData.start_date, formData.duration_weeks),
        duration_weeks: formData.duration_weeks,
        target_weight: formData.target_weight || null,
        target_body_fat: formData.target_body_fat || null,
        notes: formData.notes,
        workout_sessions: formData.workout_sessions.map(session => ({
          title: session.title,
          day_of_week: session.day_of_week,
          week_number: session.week_number,
          duration_minutes: session.duration_minutes,
          notes: session.notes,
          order: session.order,
          exercises: session.exercises.map(ex => ({
            exercise: ex.exercise,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
            rest_seconds: ex.rest_seconds,
            notes: ex.notes,
            order: ex.order
          }))
        }))
      };

      // Créer le programme
      const response = await api.post('/coaching/programs/', programData);
      
      // Rediriger vers la page de détails du programme
      navigate(`/coaching/programs/${response.data.id}`);
    } catch (err) {
      console.error('Erreur lors de la création du programme:', err);
      setError(
        err.response?.data?.message || 
        err.response?.data?.detail ||
        'Une erreur est survenue lors de la création du programme'
      );
    } finally {
      setLoading(false);
    }
  };

  // Rendu des étapes
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1BasicInfo formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <Step2SelectMember formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <Step3Configuration formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <Step4Sessions formData={formData} updateFormData={updateFormData} />;
      case 5:
        return <Step5Summary formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-w-100xl mx-auto px-80 py-20 ">
      {/* En-tête */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/coaching/programs')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className=" w-4 h-4 mr-2" />
          Retour aux programmes
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900">
          Créer un nouveau programme d'entraînement
        </h1>
        <p className="text-gray-600 mt-2">
          Suivez les étapes pour créer un programme personnalisé
        </p>
      </div>

      {/* Indicateur de progression */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center
                      transition-colors duration-200
                      ${isActive ? 'bg-blue-600 text-white' : ''}
                      ${isCompleted ? 'bg-green-600 text-white' : ''}
                      ${!isActive && !isCompleted ? 'bg-gray-200 text-gray-400' : ''}
                    `}
                  >
                    {isCompleted ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  <span className={`text-sm mt-2 ${isActive ? 'font-semibold' : ''}`}>
                    {step.title}
                  </span>
                </div>

                {index < STEPS.length - 1 && (
                  <div
                    className={`
                      flex-1 h-1 mx-4
                      ${currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'}
                    `}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Contenu de l'étape */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-6">
        {renderStepContent()}
      </div>

      {/* Boutons de navigation */}
      <div className="flex justify-between">
        <button
          onClick={goToPreviousStep}
          disabled={currentStep === 1}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Précédent
        </button>

        {currentStep < STEPS.length ? (
          <button
            onClick={goToNextStep}
            disabled={!validateStep(currentStep)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            Suivant
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
          >
            {loading ? 'Création...' : 'Créer le programme'}
            <Check className="w-5 h-5 ml-2" />
          </button>
        )}
      </div>
    </div>
  );
};

export default CreateProgramForm;