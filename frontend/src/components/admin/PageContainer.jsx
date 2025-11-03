// Fichier: frontend/src/components/admin/PageContainer.jsx

import React from 'react';
import { Typography } from '@material-tailwind/react';

const PageContainer = ({ 
    title, 
    subtitle, 
    actions, 
    children,
    noPadding = false 
}) => {
    return (
        <div className="space-y-6 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {/* Page Header */}
            {(title || actions) && (
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        {title && (
                            <Typography variant="h3" color="blue-gray" className="font-bold">
                                {title}
                            </Typography>
                        )}
                        {subtitle && (
                            <Typography variant="small" className="text-gray-600 mt-1">
                                {subtitle}
                            </Typography>
                        )}
                    </div>
                    {actions && (
                        <div className="flex items-center gap-3 flex-wrap">
                            {actions}
                        </div>
                    )}
                </div>
            )}

            {/* Page Content */}
            <div className={noPadding ? '' : 'p-6'}>
                {children}
            </div>
        </div>
    );
};

export default PageContainer;