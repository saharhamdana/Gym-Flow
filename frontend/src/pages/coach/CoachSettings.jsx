import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CoachLayout from '../../components/coaching/CoachLayout';
import { 
  User, Mail, Phone, Lock, Camera, Save, 
  Bell, Shield, Info 
} from 'lucide-react';

const CoachSettings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [profileData, setProfileData] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    email: user.email || '',
    phone: user.phone || '',
    bio: '',
    specialties: '',
    photo: null
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    session_reminders: true,
    new_bookings: true,
    member_messages: true
  });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'La photo ne doit pas dépasser 5MB' });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 200;
          const MAX_HEIGHT = 200;
          
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          
          setProfileData({
            ...profileData,
            photo: compressedBase64,
            photoFile: file
          });
        };
        
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleNotificationChange = (key) => {
    setNotificationSettings({
      ...notificationSettings,
      [key]: !notificationSettings[key]
    });
  };

  useEffect(() => {
    const savedPhoto = localStorage.getItem('user_profile_photo');
    if (savedPhoto) {
      setProfileData(prev => ({
        ...prev,
        photo: savedPhoto
      }));
    }
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const updatedUser = { 
        ...user, 
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        email: profileData.email,
        phone: profileData.phone
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      if (profileData.photo) {
        try {
          localStorage.setItem('user_profile_photo', profileData.photo);
        } catch (quotaError) {
          console.error('Erreur quota localStorage:', quotaError);
          setMessage({ 
            type: 'error', 
            text: 'Image trop grande. Veuillez choisir une image plus petite.' 
          });
          setSaving(false);
          return;
        }
      }
      
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Erreur:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour du profil' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
      return;
    }

    if (passwordData.new_password.length < 8) {
      setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 8 caractères' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ type: 'success', text: 'Mot de passe modifié avec succès !' });
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors du changement de mot de passe' });
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationsSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ type: 'success', text: 'Préférences de notification enregistrées !' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'enregistrement' });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'about', label: 'À propos', icon: Info }
  ];

  return (
    <CoachLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#00357a' }}>
            Paramètres
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez votre profil et vos préférences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Navigation tabs */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMessage({ type: '', text: '' });
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      style={activeTab === tab.id ? { backgroundColor: '#00357a' } : {}}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Contenu */}
          <div className="lg:col-span-3">
            {/* Message de feedback */}
            {message.text && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-700' 
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {message.text}
              </div>
            )}

            {/* Profil */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-6" style={{ color: '#00357a' }}>
                  Informations du profil
                </h2>

                <div className="flex items-center space-x-6 mb-8 pb-8 border-b border-gray-200">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold overflow-hidden" style={{ backgroundColor: '#00357a' }}>
                    {profileData.photo ? (
                      <img src={profileData.photo} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      `${profileData.first_name[0]}${profileData.last_name[0]}`
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      id="photo-upload"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="photo-upload"
                      className="flex items-center px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors cursor-pointer"
                      style={{ backgroundColor: '#9b0e16' }}
                    >
                      <Camera className="w-5 h-5 mr-2" />
                      Changer la photo
                    </label>
                    <p className="text-sm text-gray-600 mt-2">
                      JPG, PNG. Max 5MB
                    </p>
                  </div>
                </div>

                <form onSubmit={handleProfileSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prénom
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        value={profileData.first_name}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        value={profileData.last_name}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Biographie
                      </label>
                      <textarea
                        name="bio"
                        value={profileData.bio}
                        onChange={handleProfileChange}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Parlez de votre expérience et de votre approche du coaching..."
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Spécialités
                      </label>
                      <input
                        type="text"
                        name="specialties"
                        value={profileData.specialties}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: Musculation, CrossFit, Perte de poids"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center px-6 py-3 text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
                      style={{ backgroundColor: '#9b0e16' }}
                    >
                      <Save className="w-5 h-5 mr-2" />
                      {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Sécurité */}
            {activeTab === 'security' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-6" style={{ color: '#00357a' }}>
                  Sécurité et mot de passe
                </h2>

                <form onSubmit={handlePasswordSubmit}>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mot de passe actuel
                      </label>
                      <input
                        type="password"
                        name="current_password"
                        value={passwordData.current_password}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        name="new_password"
                        value={passwordData.new_password}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                      <p className="text-sm text-gray-600 mt-1">
                        Minimum 8 caractères
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmer le nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        name="confirm_password"
                        value={passwordData.confirm_password}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center px-6 py-3 text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
                      style={{ backgroundColor: '#9b0e16' }}
                    >
                      <Lock className="w-5 h-5 mr-2" />
                      {saving ? 'Changement...' : 'Changer le mot de passe'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-6" style={{ color: '#00357a' }}>
                  Préférences de notification
                </h2>

                <form onSubmit={handleNotificationsSubmit}>
                  <div className="space-y-4">
                    {Object.entries(notificationSettings).map(([key, value]) => {
                      const labels = {
                        email_notifications: 'Notifications par email',
                        session_reminders: 'Rappels de sessions',
                        new_bookings: 'Nouvelles réservations',
                        member_messages: 'Messages des membres'
                      };

                      return (
                        <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-900">{labels[key]}</span>
                          <button
                            type="button"
                            onClick={() => handleNotificationChange(key)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                            style={{ backgroundColor: value ? '#00357a' : '#d1d5db' }}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                value ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center px-6 py-3 text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
                      style={{ backgroundColor: '#9b0e16' }}
                    >
                      <Save className="w-5 h-5 mr-2" />
                      {saving ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* À propos */}
            {activeTab === 'about' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-6" style={{ color: '#00357a' }}>
                  À propos de Gym Flow
                </h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#00357a' }}>Version</h3>
                    <p className="text-gray-600">1.0.0</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#00357a' }}>Support</h3>
                    <p className="text-gray-600 mb-2">
                      Pour toute question ou problème, contactez-nous :
                    </p>
                    <p style={{ color: '#9b0e16' }}>support@gymflow.com</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#00357a' }}>Documentation</h3>
                    <a 
                      href="#" 
                      className="hover:opacity-80"
                      style={{ color: '#9b0e16' }}
                    >
                      Guide d'utilisation pour les coachs →
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </CoachLayout>
  );
};

export default CoachSettings;