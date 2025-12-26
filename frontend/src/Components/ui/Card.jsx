import React from 'react';

const Card = ({ children, className = '', padding = 'p-6', variant = 'default', hover = false, ...props }) => {

    const variants = {
        default: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm",
        glass: "bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-white/50 dark:border-white/5 shadow-lg",
        outline: "bg-transparent border border-slate-200 dark:border-slate-800",
        flat: "bg-slate-50 dark:bg-slate-800/50 border-none"
    };

    return (
        <div
            className={`
        rounded-2xl 
        overflow-hidden
        transition-all duration-300 ease-out
        ${variants[variant]}
        ${hover ? 'hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-1' : ''}
        ${className}
      `}
            {...props}
        >
            <div className={padding}>
                {children}
            </div>
        </div>
    );
};

export default Card;
