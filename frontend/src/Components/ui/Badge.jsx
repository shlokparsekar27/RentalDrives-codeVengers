import React from 'react';

const Badge = ({ children, variant = 'neutral', className = '' }) => {
    const variants = {
        neutral: "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
        success: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
        warning: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
        error: "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800",
        info: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
        brand: "bg-slate-900 text-white border border-slate-900 dark:bg-white dark:text-slate-900",
        outline: "bg-transparent border border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-400",
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};

export default Badge;
