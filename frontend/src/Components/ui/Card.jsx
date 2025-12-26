import React from 'react';

const Card = ({ children, className = '', padding = 'p-6', hover = false, ...props }) => {
    return (
        <div
            className={`
        bg-white dark:bg-slate-900 
        rounded-2xl 
        border border-slate-100 dark:border-slate-800 
        shadow-sm dark:shadow-none
        overflow-hidden
        transition-all duration-300
        ${hover ? 'hover:shadow-lg hover:-translate-y-1 dark:hover:border-slate-700 dark:hover:bg-slate-800' : ''}
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
