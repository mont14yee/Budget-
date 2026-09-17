import React from 'react';

interface EmptyStateProps {
    icon: string;
    title: string;
    message: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message }) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 shadow-sm border border-gray-200/50 dark:border-gray-700/50">
                <i className={`${icon} text-2xl text-gray-400 dark:text-gray-500`}></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[250px] leading-relaxed">
                {message}
            </p>
        </div>
    );
};

export default EmptyState;
