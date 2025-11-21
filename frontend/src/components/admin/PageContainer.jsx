// Fichier: frontend/src/components/admin/PageContainer.jsx

import React from 'react';
import { Typography, Breadcrumbs } from '@material-tailwind/react';
import { HomeIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { Link, useLocation } from 'react-router-dom';

const PageContainer = ({ 
    title, 
    subtitle, 
    actions, 
    children,
    noPadding = false,
    breadcrumbs = true,
}) => {
    const location = useLocation();

    // Générer les breadcrumbs automatiquement
    const generateBreadcrumbs = () => {
        const paths = location.pathname.split('/').filter(Boolean);
        const breadcrumbItems = [
            { label: 'Accueil', path: '/admin/dashboard', icon: HomeIcon }
        ];

        let currentPath = '';
        paths.forEach((path, index) => {
            if (path === 'admin') return;
            
            currentPath += `/${path}`;
            const isLast = index === paths.length - 1;
            
            // Formatage du label
            let label = path.charAt(0).toUpperCase() + path.slice(1);
            label = label.replace(/-/g, ' ');
            
            breadcrumbItems.push({
                label,
                path: isLast ? null : `/admin${currentPath}`,
                icon: null
            });
        });

        return breadcrumbItems;
    };

    const breadcrumbItems = generateBreadcrumbs();

    return (
        <div className="space-y-6">
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbItems.length > 1 && (
                <Breadcrumbs 
                    separator={<ChevronRightIcon className="h-4 w-4 text-gray-400" />}
                    className="bg-white px-4 py-3 rounded-lg shadow-sm"
                >
                    {breadcrumbItems.map((item, index) => {
                        const isLast = index === breadcrumbItems.length - 1;
                        const Icon = item.icon;

                        if (isLast || !item.path) {
                            return (
                                <span 
                                    key={index}
                                    className="flex items-center gap-2 text-gray-600 font-medium"
                                >
                                    {Icon && <Icon className="h-4 w-4" />}
                                    {item.label}
                                </span>
                            );
                        }

                        return (
                            <Link
                                key={index}
                                to={item.path}
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                {Icon && <Icon className="h-4 w-4" />}
                                {item.label}
                            </Link>
                        );
                    })}
                </Breadcrumbs>
            )}

            {/* Page Header */}
            {(title || actions) && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                            {title && (
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-1 bg-gradient-to-b from-blue-500 to-blue-700 rounded-full" />
                                    <div>
                                        <Typography 
                                            variant="h3" 
                                            color="blue-gray" 
                                            className="font-bold"
                                        >
                                            {title}
                                        </Typography>
                                        {subtitle && (
                                            <Typography 
                                                variant="small" 
                                                className="text-gray-600 mt-1"
                                            >
                                                {subtitle}
                                            </Typography>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        {actions && (
                            <div className="flex items-center gap-3 flex-wrap">
                                {actions}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Page Content */}
            <div className={noPadding ? '' : ''}>
                {children}
            </div>
        </div>
    );
};

export default PageContainer;