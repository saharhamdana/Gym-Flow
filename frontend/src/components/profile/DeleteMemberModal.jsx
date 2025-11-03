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

export function DeleteMemberModal({ open, handleOpen, member, onDelete }) {
  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`members/${member.id}/`);
      onDelete(member.id);
      handleOpen();
    } catch (error) {
      console.error("Error deleting member:", error);
    }
  };

  return (
    <Dialog open={open} handler={handleOpen}>
      <DialogHeader>Confirmer la Suppression</DialogHeader>
      <DialogBody divider>
        <Typography color="blue-gray" className="font-normal">
          Êtes-vous sûr de vouloir supprimer le membre{" "}
          <span className="font-medium">
            {member?.first_name} {member?.last_name}
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
        >
          Annuler
        </Button>
        <Button variant="gradient" color="red" onClick={handleDelete}>
          Confirmer la suppression
        </Button>
      </DialogFooter>
    </Dialog>
  );
}