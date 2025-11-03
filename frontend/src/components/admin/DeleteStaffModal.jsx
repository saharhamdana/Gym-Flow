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

export function DeleteStaffModal({ open, handleOpen, staff, onDelete }) {
  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`auth/users/${staff.id}/`);
      onDelete(staff.id);
      handleOpen(); // Close modal
    } catch (error) {
      console.error("Error deleting staff:", error.response?.data);
      alert(
        error.response?.data?.detail ||
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
            {staff?.first_name} {staff?.last_name}
          </span>
          ? Cette action est irréversible.
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
          tabIndex={0}
        >
          Confirmer la suppression
        </Button>
      </DialogFooter>
    </Dialog>
  );
}