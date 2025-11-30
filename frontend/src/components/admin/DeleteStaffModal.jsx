// Fichier: frontend/src/components/admin/DeleteStaffModal.jsx

import React from "react";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Typography,
} from "@material-tailwind/react";
import axiosInstance from "../../api/axiosInstance";

// ✅ CORRECTION : Renommer en DeleteStaffModal
export function DeleteStaffModal({ open, handleOpen, staff, onDelete }) {
  const handleDelete = async () => {
    // ✅ Vérifier que staff existe avant de supprimer
    if (!staff || !staff.id) {
      console.error("Erreur: staff n'est pas défini", staff);
      alert("Erreur: Impossible de supprimer - utilisateur non trouvé");
      handleOpen(); // Fermer le modal
      return;
    }

    try {
      console.log("🗑️ Tentative de suppression de l'utilisateur:", staff.id);
      await axiosInstance.delete(`auth/users/${staff.id}/`);
      console.log("✅ Utilisateur supprimé avec succès");
      
      onDelete(staff.id);
      handleOpen(); // Fermer le modal
    } catch (error) {
      console.error("❌ Error deleting staff:", error.response?.data);
      alert(
        error.response?.data?.detail ||
        error.response?.data?.error ||
        "Une erreur est survenue lors de la suppression"
      );
    }
  };

  return (
    <Dialog 
      open={open} 
      handler={handleOpen}
      className="focus-visible:outline-none"
      animate={{
        mount: { scale: 1, y: 0 },
        unmount: { scale: 0.9, y: -100 },
      }}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      lockScroll={true}
    >
      <DialogHeader>Confirmer la Suppression</DialogHeader>
      <DialogBody divider>
        <Typography color="blue-gray" className="font-normal">
          Êtes-vous sûr de vouloir supprimer le profil de{" "}
          <span className="font-medium">
            {staff?.first_name || 'Prénom'} {staff?.last_name || 'Nom'}
          </span>
          ? Cette action est irréversible.
        </Typography>
        <Typography color="red" className="font-normal mt-2">
          ⚠️ Cette action supprimera définitivement cet utilisateur du système.
        </Typography>
      </DialogBody>
      <DialogFooter>
        <Button
          variant="text"
          color="blue-gray"
          onClick={handleOpen}
          className="mr-1"
          tabIndex={0}
        >
          Annuler
        </Button>
        <Button 
          variant="gradient" 
          color="red" 
          onClick={handleDelete}
          disabled={!staff || !staff.id} // ✅ Désactiver si staff est undefined
          tabIndex={0}
        >
          Confirmer la suppression
        </Button>
      </DialogFooter>
    </Dialog>
  );
}