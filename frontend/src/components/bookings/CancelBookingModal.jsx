// Fichier: frontend/src/components/bookings/CancelBookingModal.jsx

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

const CancelBookingModal = ({ open, onClose, onConfirm, bookingInfo, loading }) => {
    return (
        <Dialog open={open} handler={onClose} size="sm">
            <DialogHeader className="flex items-center gap-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-orange-500" />
                <Typography variant="h5">
                    Annuler la Réservation
                </Typography>
            </DialogHeader>
            <DialogBody divider>
                <Typography variant="paragraph" className="font-normal">
                    Êtes-vous sûr de vouloir annuler cette réservation ?
                </Typography>
                {bookingInfo && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <Typography variant="small" className="text-gray-700">
                            <strong>Membre:</strong> {bookingInfo.member_name || bookingInfo.member_details?.full_name}
                        </Typography>
                        <Typography variant="small" className="text-gray-700">
                            <strong>Cours:</strong> {bookingInfo.course_title || bookingInfo.course_details?.title}
                        </Typography>
                    </div>
                )}
                <Typography variant="small" className="mt-2 text-gray-600">
                    Le membre pourra réserver à nouveau si des places sont disponibles.
                </Typography>
            </DialogBody>
            <DialogFooter className="gap-2">
                <Button
                    variant="text"
                    color="gray"
                    onClick={onClose}
                    disabled={loading}
                >
                    Non, garder
                </Button>
                <Button
                    variant="filled"
                    color="orange"
                    onClick={onConfirm}
                    disabled={loading}
                >
                    {loading ? 'Annulation...' : 'Oui, annuler'}
                </Button>
            </DialogFooter>
        </Dialog>
    );
};

export default CancelBookingModal;