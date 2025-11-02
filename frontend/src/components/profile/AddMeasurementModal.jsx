{/* Move the existing AddMeasurementModal content here */}
import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
} from "@material-tailwind/react";
import axiosInstance from "../../api/axiosInstance";

export function AddMeasurementModal({ open, handleOpen, memberId, onSuccess }) {
  const [formData, setFormData] = useState({
    weight: "",
    height: "",
    chest: "",
    waist: "",
    hip: "",
    arm: "",
    thigh: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post(`members/${memberId}/measurements/`, formData);
      if (response.status === 201) {
        onSuccess(response.data);
        handleOpen();
      }
    } catch (error) {
      console.error("Error adding measurement:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Dialog open={open} handler={handleOpen}>
      <DialogHeader>Ajouter des mesures</DialogHeader>
      <form onSubmit={handleSubmit}>
        <DialogBody divider className="overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="number"
              label="Poids (kg)"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
            />
            <Input
              type="number"
              label="Taille (cm)"
              name="height"
              value={formData.height}
              onChange={handleChange}
            />
            <Input
              type="number"
              label="Tour de poitrine (cm)"
              name="chest"
              value={formData.chest}
              onChange={handleChange}
            />
            <Input
              type="number"
              label="Tour de taille (cm)"
              name="waist"
              value={formData.waist}
              onChange={handleChange}
            />
            <Input
              type="number"
              label="Tour de hanches (cm)"
              name="hip"
              value={formData.hip}
              onChange={handleChange}
            />
            <Input
              type="number"
              label="Tour de bras (cm)"
              name="arm"
              value={formData.arm}
              onChange={handleChange}
            />
            <Input
              type="number"
              label="Tour de cuisse (cm)"
              name="thigh"
              value={formData.thigh}
              onChange={handleChange}
            />
          </div>
        </DialogBody>
        <DialogFooter className="space-x-2">
          <Button variant="text" color="red" onClick={handleOpen}>
            Annuler
          </Button>
          <Button variant="gradient" color="green" type="submit">
            Enregistrer
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}