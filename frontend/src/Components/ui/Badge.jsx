import React from 'react';

const Badge = ({ children, variant = 'neutral', className = '' }) => {
    const variants = {
        neutral: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
        success: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        error: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        brand: "bg-slate-900 text-white dark:bg-white dark:text-slate-900",
        outline: "bg-transparent border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400",
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};

export default Badge;
