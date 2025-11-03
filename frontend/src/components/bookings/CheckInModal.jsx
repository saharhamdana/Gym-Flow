// Fichier: frontend/src/components/bookings/CheckInModal.jsx

import React from 'react';
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Typography,
} from '@material-tailwind/react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

const CheckInModal = ({ open, onClose, onConfirm, bookingInfo, loading }) => {
    return (
        <Dialog open={open} handler={onClose} size="sm">
            <DialogHeader className="flex items-center gap-3">
                <CheckCircleIcon className="h-6 w-6 text-green-500" />
                <Typography variant="h5">
                    Confirmer le Check-in
                </Typography>
            </DialogHeader>
            <DialogBody divider>
                <Typography variant="paragraph" className="font-normal">
                    Confirmez-vous la présence du membre à ce cours ?
                </Typography>
                {bookingInfo && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <Typography variant="small" className="text-gray-700">
                            <strong>Membre:</strong> {bookingInfo.member_name || bookingInfo.member_details?.full_name}
                        </Typography>
                        <Typography variant="small" className="text-gray-700">
                            <strong>Cours:</strong> {bookingInfo.course_title || bookingInfo.course_details?.title}
                        </Typography>
                    </div>
                )}
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
                    color="green"
                    onClick={onConfirm}
                    disabled={loading}
                >
                    {loading ? 'Check-in...' : 'Confirmer'}
                </Button>
            </DialogFooter>
        </Dialog>
    );
};

export default CheckInModal;