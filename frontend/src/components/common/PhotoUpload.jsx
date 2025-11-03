{/* Import existing content */}
import React, { useState, useRef } from 'react';
import { Typography, Button, Avatar } from "@material-tailwind/react";
import { CameraIcon, XMarkIcon } from "@heroicons/react/24/solid";

const PhotoUpload = ({ currentPhoto, onPhotoChange, disabled = false }) => {
    const [preview, setPreview] = useState(currentPhoto || "/img/default-avatar.png");
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Vérification du type de fichier
            if (!file.type.startsWith('image/')) {
                alert('Veuillez sélectionner une image valide');
                return;
            }

            // Vérification de la taille (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('La taille de l\'image ne doit pas dépasser 5MB');
                return;
            }

            setSelectedFile(file);
            
            // Créer un aperçu
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);

            // Notifier le parent
            if (onPhotoChange) {
                onPhotoChange(file);
            }
        }
    };

    const handleRemovePhoto = () => {
        setSelectedFile(null);
        setPreview(currentPhoto || "/img/default-avatar.png");
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (onPhotoChange) {
            onPhotoChange(null);
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <Avatar
                src={preview}
                alt="Photo de profil"
                size="xxl"
                variant="rounded"
                className="border-4 border-blue-500"
            />
            
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={disabled}
            />
            
            <div className="flex gap-2">
                <Button
                    size="sm"
                    color="blue"
                    className="flex items-center gap-2"
                    onClick={handleButtonClick}
                    disabled={disabled}
                >
                    <CameraIcon className="h-4 w-4" />
                    {selectedFile ? 'Changer' : 'Ajouter'} Photo
                </Button>
                
                {selectedFile && (
                    <Button
                        size="sm"
                        color="red"
                        variant="outlined"
                        className="flex items-center gap-2"
                        onClick={handleRemovePhoto}
                        disabled={disabled}
                    >
                        <XMarkIcon className="h-4 w-4" />
                        Supprimer
                    </Button>
                )}
            </div>
        </div>
    );
};

export default PhotoUpload;