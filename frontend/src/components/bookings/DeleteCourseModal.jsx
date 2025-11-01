// Fichier: frontend/src/components/bookings/DeleteCourseModal.jsx

import React from 'react';
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Typography,
} from '@material-tailwind/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const DeleteCourseModal = ({ open, onClose, onConfirm, courseTitle, loading }) => {
    return (
        <Dialog open={open} handler={onClose} size="sm">
            <DialogHeader className="flex items-center gap-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
                <Typography variant="h5">
                    Confirmer la Suppression
                </Typography>
            </DialogHeader>
            <DialogBody divider>
                <Typography variant="paragraph" className="font-normal">
                    Êtes-vous sûr de vouloir supprimer le cours{' '}
                    <span className="font-bold text-red-500">{courseTitle}</span> ?
                </Typography>
                <Typography variant="small" className="mt-2 text-gray-600">
                    Cette action supprimera également toutes les réservations associées. Cette action est irréversible.
                </Typography>
            </DialogBody>
            <DialogFooter className="gap-2">
                <Button
                    variant="text"
                    color="gray"
                    onClick={onClose}
                    disabled={loading}
                >
                    Annuler
                </Button>
                <Button
                    variant="filled"
                    color="red"
                    onClick={onConfirm}
                    disabled={loading}
                >
                    {loading ? 'Suppression...' : 'Supprimer'}
                </Button>
            </DialogFooter>
        </Dialog>
    );
};

export default DeleteCourseModal;