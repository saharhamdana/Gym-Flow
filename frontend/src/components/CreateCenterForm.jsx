// Fichier: frontend/src/components/CreateCenterForm.jsx

import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Typography,
  Input,
  Textarea,
  Button,
  Alert,
} from "@material-tailwind/react";
import { CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import SubdomainChecker from "./SubdomainChecker";
import gymCenterService from "@/services/gymCenterService";

/**
 * Formulaire de création d'un centre de sport
 */
export function CreateCenterForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    subdomain: "",
    email: "",
    phone: "",
    address: "",
    description: "",
  });

  const [isSubdomainAvailable, setIsSubdomainAvailable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  // Gérer les changements des champs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Gérer le changement du sous-domaine
  const handleSubdomainChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      subdomain: value,
    }));
  };

  // Valider le formulaire
  const validateForm = () => {
    if (!formData.name.trim()) {
      setAlert({
        show: true,
        type: "error",
        message: "Le nom du centre est requis",
      });
      return false;
    }

    if (!formData.subdomain.trim()) {
      setAlert({
        show: true,
        type: "error",
        message: "Le sous-domaine est requis",
      });
      return false;
    }

    if (!isSubdomainAvailable) {
      setAlert({
        show: true,
        type: "error",
        message: "Le sous-domaine n'est pas disponible",
      });
      return false;
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      setAlert({
        show: true,
        type: "error",
        message: "Veuillez entrer une adresse email valide",
      });
      return false;
    }

    if (!formData.phone.trim()) {
      setAlert({
        show: true,
        type: "error",
        message: "Le numéro de téléphone est requis",
      });
      return false;
    }

    if (!formData.address.trim()) {
      setAlert({
        show: true,
        type: "error",
        message: "L'adresse est requise",
      });
      return false;
    }

    return true;
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Réinitialiser l'alerte
    setAlert({ show: false, type: "", message: "" });

    // Valider le formulaire
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Créer le centre
      const result = await gymCenterService.createCenter(formData);

      // Afficher un message de succès
      setAlert({
        show: true,
        type: "success",
        message: `Centre "${result.name}" créé avec succès ! URL: ${result.full_url}`,
      });

      // Appeler le callback de succès si fourni
      if (onSuccess) {
        setTimeout(() => {
          onSuccess(result);
        }, 2000);
      }
    } catch (error) {
      console.error("Erreur lors de la création du centre:", error);

      let errorMessage = "Erreur lors de la création du centre";

      if (error.response?.data) {
        // Formater les erreurs du backend
        const errors = error.response.data;
        if (typeof errors === "object") {
          errorMessage = Object.entries(errors)
            .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
            .join("; ");
        } else if (typeof errors === "string") {
          errorMessage = errors;
        }
      }

      setAlert({
        show: true,
        type: "error",
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-[48rem]">
      <CardHeader
        color="gray"
        floated={false}
        shadow={false}
        className="m-0 grid place-items-center px-4 py-8 text-center"
      >
        <div className="mb-4 h-20 w-20 rounded-full border border-white/10 bg-white/10 p-6 text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
            <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
          </svg>
        </div>
        <Typography variant="h4" color="white">
          Créer un centre de sport
        </Typography>
      </CardHeader>

      <CardBody>
        {/* Alerte */}
        {alert.show && (
          <Alert
            color={alert.type === "success" ? "green" : "red"}
            icon={
              alert.type === "success" ? (
                <CheckCircleIcon className="h-6 w-6" />
              ) : (
                <ExclamationTriangleIcon className="h-6 w-6" />
              )
            }
            className="mb-4"
            onClose={() => setAlert({ show: false, type: "", message: "" })}
          >
            {alert.message}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Nom du centre */}
          <div>
            <Input
              size="lg"
              label="Nom du centre"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Sous-domaine */}
          <div>
            <SubdomainChecker
              value={formData.subdomain}
              onChange={handleSubdomainChange}
              onAvailabilityChange={setIsSubdomainAvailable}
            />
          </div>

          {/* Email */}
          <div>
            <Input
              type="email"
              size="lg"
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Téléphone */}
          <div>
            <Input
              size="lg"
              label="Téléphone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          {/* Adresse */}
          <div>
            <Input
              size="lg"
              label="Adresse"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          {/* Description */}
          <div>
            <Textarea
              size="lg"
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
            />
          </div>

          {/* Boutons */}
          <div className="flex gap-4">
            <Button
              type="submit"
              color="gray"
              size="lg"
              fullWidth
              disabled={isSubmitting || !isSubdomainAvailable}
              loading={isSubmitting}
            >
              {isSubmitting ? "Création..." : "Créer le centre"}
            </Button>

            {onCancel && (
              <Button
                type="button"
                variant="outlined"
                color="gray"
                size="lg"
                fullWidth
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
            )}
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

export default CreateCenterForm;