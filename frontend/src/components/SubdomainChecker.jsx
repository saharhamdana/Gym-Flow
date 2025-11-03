// Fichier: frontend/src/components/SubdomainChecker.jsx

import React, { useState, useEffect } from "react";
import { Input, Typography, Spinner } from "@material-tailwind/react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import gymCenterService from "@/services/gymCenterService";

/**
 * Composant pour vérifier la disponibilité d'un sous-domaine
 */
export function SubdomainChecker({ value, onChange, onAvailabilityChange }) {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);
  const [message, setMessage] = useState("");
  const [fullUrl, setFullUrl] = useState("");
  const [debounceTimer, setDebounceTimer] = useState(null);

  // Nettoyer le timer au démontage
  useEffect(() => {
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [debounceTimer]);

  // Vérifier la disponibilité avec debounce
  const checkAvailability = async (subdomain) => {
    // Nettoyer le subdomain
    const cleanSubdomain = subdomain.toLowerCase().trim();

    // Validation basique
    if (cleanSubdomain.length < 3) {
      setMessage("Le sous-domaine doit contenir au moins 3 caractères");
      setIsAvailable(false);
      setFullUrl("");
      if (onAvailabilityChange) onAvailabilityChange(false);
      return;
    }

    // Vérifier le format
    const regex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
    if (!regex.test(cleanSubdomain)) {
      setMessage("Format invalide : uniquement lettres minuscules, chiffres et tirets");
      setIsAvailable(false);
      setFullUrl("");
      if (onAvailabilityChange) onAvailabilityChange(false);
      return;
    }

    setIsChecking(true);

    try {
      const result = await gymCenterService.checkSubdomainAvailability(cleanSubdomain);
      
      setIsAvailable(result.available);
      setMessage(result.message);
      setFullUrl(result.full_url || `https://${cleanSubdomain}.gymflow.com`);
      
      if (onAvailabilityChange) {
        onAvailabilityChange(result.available);
      }
    } catch (error) {
      setMessage("Erreur lors de la vérification");
      setIsAvailable(false);
      setFullUrl("");
      if (onAvailabilityChange) onAvailabilityChange(false);
    } finally {
      setIsChecking(false);
    }
  };

  // Gérer les changements avec debounce
  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Réinitialiser l'état
    setIsAvailable(null);
    setMessage("");
    setFullUrl("");

    // Clear le timer précédent
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Créer un nouveau timer
    if (newValue.length >= 3) {
      const timer = setTimeout(() => {
        checkAvailability(newValue);
      }, 500);
      setDebounceTimer(timer);
    }
  };

  // Déterminer l'icône à afficher
  const getIcon = () => {
    if (isChecking) {
      return <Spinner className="h-4 w-4" />;
    }
    if (isAvailable === true) {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    }
    if (isAvailable === false && value.length >= 3) {
      return <XCircleIcon className="h-5 w-5 text-red-500" />;
    }
    return null;
  };

  // Déterminer la couleur du message
  const getMessageColor = () => {
    if (isAvailable === true) return "green";
    if (isAvailable === false) return "red";
    return "gray";
  };

  return (
    <div className="w-full">
      <div className="relative">
        <Input
          size="lg"
          label="Sous-domaine"
          value={value}
          onChange={handleChange}
          placeholder="powerfit"
          className="pr-10"
          error={isAvailable === false && value.length >= 3}
          success={isAvailable === true}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {getIcon()}
        </div>
      </div>

      {/* Message de statut */}
      {message && (
        <Typography
          variant="small"
          color={getMessageColor()}
          className="mt-2 flex items-center gap-1 font-normal"
        >
          {message}
        </Typography>
      )}

      {/* Aperçu de l'URL */}
      {isAvailable && fullUrl && (
        <Typography
          variant="small"
          color="blue-gray"
          className="mt-2 font-normal"
        >
          Votre URL sera :{" "}
          <span className="font-bold text-blue-500">{fullUrl}</span>
        </Typography>
      )}
    </div>
  );
}

export default SubdomainChecker;