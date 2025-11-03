// Fichier: frontend/src/components/staff/EditStaffModal.jsx

import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Select,
  Option,
  Typography,
} from "@material-tailwind/react";
import PhotoUpload from "../common/PhotoUpload";
import axiosInstance from "../../api/axiosInstance";

export function EditStaffModal({ open, handleOpen, staff, onUpdate }) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "",
    profile_picture: null,
  });
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (staff) {
      setFormData({
        first_name: staff.first_name || "",
        last_name: staff.last_name || "",
        email: staff.email || "",
        role: staff.role || "RECEPTIONIST",
        profile_picture: staff.profile_picture || null,
      });
    }
  }, [staff]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleChange = (value) => {
    setFormData(prev => ({
      ...prev,
      role: value,
    }));
  };

  const handlePhotoChange = async (file) => {
    if (!file) {
      setFormData(prev => ({
        ...prev,
        profile_picture: null
      }));
      return;
    }
    
    setUploading(true);
    setError("");
    
    const photoFormData = new FormData();
    photoFormData.append('profile_picture', file); // ✅ Changé de 'photo' à 'profile_picture'
    
    try {
      // ✅ Option 1: Upload direct dans la mise à jour de l'utilisateur
      // On stocke juste le fichier pour l'envoyer avec les autres données
      setFormData(prev => ({
        ...prev,
        profile_picture: file // Stocker le fichier temporairement
      }));
      
      setError("");
    } catch (error) {
      console.error('Error handling photo:', error);
      setError('Erreur lors de la sélection de la photo');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    setError("");
    
    try {
      // ✅ Préparer les données avec FormData pour supporter l'upload de fichier
      const submitData = new FormData();
      
      // Ajouter tous les champs
      submitData.append('first_name', formData.first_name);
      submitData.append('last_name', formData.last_name);
      submitData.append('email', formData.email);
      submitData.append('role', formData.role);
      
      // ✅ Ajouter username (requis par Django)
      // Utiliser l'email comme username ou garder l'existant
      if (staff.username) {
        submitData.append('username', staff.username);
      } else {
        submitData.append('username', formData.email);
      }
      
      // Ajouter la photo si c'est un nouveau fichier
      if (formData.profile_picture instanceof File) {
        submitData.append('profile_picture', formData.profile_picture);
      }
      
      const response = await axiosInstance.put(
        `auth/users/${staff.id}/`, 
        submitData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      
      if (response.status === 200) {
        onUpdate(response.data);
        handleOpen();
      }
    } catch (error) {
      console.error("Error updating staff:", error.response?.data);
      
      // ✅ Meilleure gestion des erreurs
      if (error.response?.data) {
        const errors = error.response.data;
        let errorMessage = "";
        
        Object.keys(errors).forEach(key => {
          const errorValue = Array.isArray(errors[key]) ? errors[key].join(', ') : errors[key];
          errorMessage += `${key}: ${errorValue}\n`;
        });
        
        setError(errorMessage || "Une erreur est survenue lors de la mise à jour");
      } else {
        setError("Une erreur est survenue lors de la mise à jour");
      }
    }
  };

  return (
    <Dialog 
      open={open} 
      handler={handleOpen}
      size="md"
      className="bg-white shadow-2xl"
    >
      <DialogHeader className="border-b border-gray-200">
        Modifier le Profil
      </DialogHeader>
      
      <DialogBody className="overflow-y-auto max-h-[500px] px-6 py-4">
        <div className="flex flex-col gap-4">
          {/* Photo Upload */}
          <div className="flex justify-center mb-4">
            <PhotoUpload
              currentPhoto={
                formData.profile_picture instanceof File 
                  ? URL.createObjectURL(formData.profile_picture)
                  : formData.profile_picture
              }
              onPhotoChange={handlePhotoChange}
              disabled={uploading}
            />
          </div>

          {/* Form Fields */}
          <Input
            label="Prénom *"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
          
          <Input
            label="Nom *"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
          
          <Input
            label="Email *"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          
          <Select
            label="Rôle *"
            value={formData.role}
            onChange={handleRoleChange}
          >
            <Option value="RECEPTIONIST">Réceptionniste</Option>
            <Option value="COACH">Coach</Option>
            <Option value="ADMIN">Administrateur</Option>
          </Select>

          {error && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
              <Typography variant="small" color="red" className="whitespace-pre-line">
                {error}
              </Typography>
            </div>
          )}
        </div>
      </DialogBody>
      
      <DialogFooter className="border-t border-gray-200 gap-2">
        <Button
          variant="text"
          color="gray"
          onClick={handleOpen}
        >
          Annuler
        </Button>
        <Button 
          color="blue"
          onClick={handleSubmit}
          disabled={uploading}
        >
          {uploading ? 'Téléchargement...' : 'Sauvegarder'}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}