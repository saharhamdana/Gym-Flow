// Fichier: frontend/src/pages/admin/bookings/courses/CourseCalendar.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardBody,
    Typography,
    Button,
    Chip,
    Spinner,
    Alert,
    IconButton,
} from '@material-tailwind/react';
import { 
    ArrowLeftIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    PlusIcon,
    ListBulletIcon,
} from '@heroicons/react/24/solid';
import { courseService } from '@/services/bookingService';

const CourseCalendar = () => {
    const navigate = useNavigate();
    const pageActions = (
        <div className="flex items-center gap-2">
            <Button
                variant="outlined"
                color="blue"
                className="flex items-center gap-2"
                onClick={() => navigate('/admin/courses')}
            >
                <ListBulletIcon className="h-5 w-5" />
                Liste
            </Button>
            <Button
                className="flex items-center gap-2"
                color="blue"
                onClick={() => navigate('/admin/courses/create')}
            >
                <PlusIcon className="h-5 w-5" />
                Nouveau Cours
            </Button>
        </div>
    );
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    
    useEffect(() => {
        fetchCourses();
    }, [currentDate]);

    const fetchCourses = async () => {
        try {
            // Récupérer les cours du mois en cours
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            
            const data = await courseService.getAll({
                date_from: startOfMonth.toISOString().split('T')[0],
                date_to: endOfMonth.toISOString().split('T')[0],
            });
            
            const courseData = Array.isArray(data) ? data : (data.results || []);
            setCourses(courseData);
            setError(null);
        } catch (err) {
            console.error('Erreur:', err);
            setError('Impossible de charger le calendrier');
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        return { daysInMonth, startingDayOfWeek };
    };

    const getCoursesForDay = (day) => {
        const dateStr = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            day
        ).toISOString().split('T')[0];
        
        return courses.filter(course => course.date === dateStr);
    };

    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const getStatusColor = (status) => {
        const colors = {
            'SCHEDULED': 'blue',
            'ONGOING': 'green',
            'COMPLETED': 'gray',
            'CANCELLED': 'red',
        };
        return colors[status] || 'gray';
    };

    const monthNames = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
    const today = new Date();
    const isCurrentMonth = 
        today.getMonth() === currentDate.getMonth() &&
        today.getFullYear() === currentDate.getFullYear();

    if (loading) {
        return (
            <div className="p-4 md:p-10 min-h-screen bg-gray-50">
                <div className="flex justify-center items-center h-96">
                    <Spinner color="blue" className="h-12 w-12" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 md:p-10 min-h-screen bg-gray-50">
                <Alert color="red">{error}</Alert>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-10 min-h-screen bg-gray-50">
            {/* En-tête */}
            <div className="flex items-center justify-between mb-6">
                <Button
                    variant="text"
                    className="flex items-center gap-2"
                    onClick={() => navigate('/admin/bookings/courses')}
                >
                    <ListBulletIcon className="h-5 w-5" /> Vue Liste
                </Button>

                <div className="flex items-center gap-4">
                    <Button
                        color="blue"
                        className="flex items-center gap-2"
                        onClick={() => navigate('/admin/bookings/courses/create')}
                    >
                        <PlusIcon className="h-5 w-5" />
                        Nouveau Cours
                    </Button>
                </div>
            </div>

            <Card className="shadow-lg">
                <CardBody>
                    {/* Navigation du Calendrier */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <IconButton
                                variant="text"
                                color="blue-gray"
                                onClick={previousMonth}
                            >
                                <ChevronLeftIcon className="h-5 w-5" />
                            </IconButton>
                            
                            <Typography variant="h5" color="blue-gray" className="min-w-[200px] text-center">
                                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </Typography>
                            
                            <IconButton
                                variant="text"
                                color="blue-gray"
                                onClick={nextMonth}
                            >
                                <ChevronRightIcon className="h-5 w-5" />
                            </IconButton>
                        </div>

                        <Button
                            size="sm"
                            variant="outlined"
                            onClick={goToToday}
                        >
                            Aujourd'hui
                        </Button>
                    </div>

                    {/* Grille du Calendrier */}
                    <div className="grid grid-cols-7 gap-2">
                        {/* Jours de la semaine */}
                        {dayNames.map((day) => (
                            <div
                                key={day}
                                className="text-center p-2 font-bold text-gray-700 bg-gray-100 rounded"
                            >
                                {day}
                            </div>
                        ))}

                        {/* Espaces vides avant le premier jour */}
                        {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                            <div key={`empty-${index}`} className="min-h-[120px] bg-gray-50 rounded" />
                        ))}

                        {/* Jours du mois */}
                        {Array.from({ length: daysInMonth }).map((_, index) => {
                            const day = index + 1;
                            const coursesForDay = getCoursesForDay(day);
                            const isToday = isCurrentMonth && today.getDate() === day;

                            return (
                                <div
                                    key={day}
                                    className={`min-h-[120px] border rounded-lg p-2 ${
                                        isToday 
                                            ? 'bg-blue-50 border-blue-500 border-2' 
                                            : 'bg-white border-gray-200'
                                    } hover:shadow-md transition-shadow`}
                                >
                                    <div className={`text-sm font-semibold mb-2 ${
                                        isToday ? 'text-blue-600' : 'text-gray-700'
                                    }`}>
                                        {day}
                                    </div>

                                    <div className="space-y-1">
                                        {coursesForDay.slice(0, 3).map((course) => (
                                            <div
                                                key={course.id}
                                                className="cursor-pointer"
                                                onClick={() => navigate(`/admin/bookings/courses/${course.id}`)}
                                            >
                                                <div className={`text-xs p-1 rounded bg-${getStatusColor(course.status)}-100 text-${getStatusColor(course.status)}-700 hover:bg-${getStatusColor(course.status)}-200 transition-colors`}>
                                                    <div className="font-semibold truncate">
                                                        {course.start_time}
                                                    </div>
                                                    <div className="truncate">
                                                        {course.title}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        {coursesForDay.length > 3 && (
                                            <div className="text-xs text-gray-600 text-center">
                                                +{coursesForDay.length - 3} cours
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Légende */}
                    <div className="mt-6 flex flex-wrap gap-4 justify-center border-t pt-4">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-200 rounded"></div>
                            <Typography variant="small">Planifié</Typography>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-200 rounded"></div>
                            <Typography variant="small">En cours</Typography>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gray-200 rounded"></div>
                            <Typography variant="small">Terminé</Typography>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-200 rounded"></div>
                            <Typography variant="small">Annulé</Typography>
                        </div>
                    </div>

                    {/* Statistiques du mois */}
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 border-t pt-4">
                        <div className="text-center">
                            <Typography variant="h4" color="blue">
                                {courses.length}
                            </Typography>
                            <Typography variant="small" className="text-gray-600">
                                Total Cours
                            </Typography>
                        </div>
                        <div className="text-center">
                            <Typography variant="h4" color="green">
                                {courses.filter(c => c.status === 'SCHEDULED').length}
                            </Typography>
                            <Typography variant="small" className="text-gray-600">
                                Planifiés
                            </Typography>
                        </div>
                        <div className="text-center">
                            <Typography variant="h4" color="gray">
                                {courses.filter(c => c.status === 'COMPLETED').length}
                            </Typography>
                            <Typography variant="small" className="text-gray-600">
                                Terminés
                            </Typography>
                        </div>
                        <div className="text-center">
                            <Typography variant="h4" color="red">
                                {courses.filter(c => c.status === 'CANCELLED').length}
                            </Typography>
                            <Typography variant="small" className="text-gray-600">
                                Annulés
                            </Typography>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default CourseCalendar;