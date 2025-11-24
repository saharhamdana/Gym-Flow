import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CoachLayout from '../../components/coaching/CoachLayout';
import { 
  ArrowRight, 
  Check, 
  User, 
  Calendar, 
  Dumbbell, 
  FileText 
} from 'lucide-react';
import coachingService from '../../services/coachingService';
import Step1BasicInfo from './Step1BasicInfo';
import Step2SelectMember from './Step2SelectMember';
import Step3Configuration from './Step3Configuration';
import Step4Sessions from './Step4Sessions';
import Step5Summary from './Step5Summary';
import api from '../../api/axiosInstance';

const STEPS = [
  { id: 1, title: 'Informations', icon: FileText },
  { id: 2, title: 'Membre', icon: User },
  { id: 3, title: 'Configuration', icon: Calendar },
  { id: 4, title: 'Sessions', icon: Dumbbell },
  { id: 5, title: 'Récapitulatif', icon: Check }
];

const CreateProgramForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal: '',
    member: null,
    start_date: new Date().toISOString().split('T')[0],
    duration_weeks: 8,
    target_weight: '',
    target_body_fat: '',
    notes: '',
    status: 'draft',
    workout_sessions: []
  });

  const calculateEndDate = (startDate, weeks) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + (weeks * 7));
    return date.toISOString().split('T')[0];
  };

  const updateFormData = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      if (field === 'start_date' || field === 'duration_weeks') {
        updated.end_date = calculateEndDate(
          field === 'start_date' ? value : prev.start_date,
          field === 'duration_weeks' ? value : prev.duration_weeks
        );
      }
      
      return updated;
    });
  };

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

 const handleSubmit = async () => {
  setLoading(true);
  setError('');

  try {
    const programData = {
      title: formData.title,
      description: formData.description,
      goal: formData.goal,
      member: formData.member.id,
      status: formData.status,
      start_date: formData.start_date,
      end_date: calculateEndDate(formData.start_date, formData.duration_weeks),
      duration_weeks: formData.duration_weeks,
      target_weight: formData.target_weight || null,
      target_body_fat: formData.target_body_fat || null,
      notes: formData.notes,
      tenant_id: 1 // Add tenant_id to program as well if needed
    };

    const programResponse = await coachingService.createProgram(programData);
    const programId = programResponse.data.id;

    for (const session of formData.workout_sessions) {
      const sessionData = {
        program: programId,
        title: session.title,
        day_of_week: session.day_of_week,
        week_number: session.week_number,
        duration_minutes: session.duration_minutes,
        notes: session.notes || '',
        order: session.order,
        tenant_id: 1 // ADD THIS LINE - FIXES THE ERROR
      };

      const sessionResponse = await coachingService.createWorkoutSession(sessionData);
      const sessionId = sessionResponse.data.id;

      for (const ex of session.exercises) {
        const exerciseData = {
          workout_session: sessionId,
          exercise: typeof ex.exercise === 'object' ? ex.exercise.id : ex.exercise,
          sets: parseInt(ex.sets) || 0,
          reps: String(ex.reps || ''),
          rest_seconds: parseInt(ex.rest_seconds) || 0,
          weight: String(ex.weight || ''),
          notes: ex.notes || '',
          order: ex.order || 0
        };
        
        await api.post('coaching/workout-exercises/', exerciseData);
      }
    }

    alert(`Programme "${formData.title}" créé avec succès !`);
    navigate('/coaching/programs');
  } catch (err) {
    console.error('Erreur:', err);
    setError(
      err.response?.data?.detail || 
      err.response?.data?.message ||
      JSON.stringify(err.response?.data) ||
      'Une erreur est survenue lors de la création du programme'
    );
  } finally {
    setLoading(false);
  }
};


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
    <CoachLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* En-tête */}
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#00357a' }}>
            Créer un nouveau programme
          </h1>
          <p className="text-gray-600 mt-2">
            Suivez les étapes pour créer un programme personnalisé
          </p>
        </div>

        {/* Indicateur de progression */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-200 ${
                        isActive ? 'text-white' : ''
                      } ${isCompleted ? 'bg-green-600 text-white' : ''} ${!isActive && !isCompleted ? 'bg-gray-200 text-gray-400' : ''}`}
                      style={isActive ? { backgroundColor: '#00357a' } : {}}
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
                    <div className={`flex-1 h-1 mx-4 ${currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Contenu de l'étape */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {renderStepContent()}
        </div>

        {/* Boutons de navigation */}
        <div className="flex justify-between">
          <button
            onClick={goToPreviousStep}
            disabled={currentStep === 1}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>

          {currentStep < STEPS.length ? (
            <button
              onClick={goToNextStep}
              disabled={!validateStep(currentStep)}
              className="px-6 py-3 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              style={{ backgroundColor: '#00357a' }}
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
    </CoachLayout>
  );
};

export default CreateProgramForm;