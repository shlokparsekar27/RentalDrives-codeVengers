import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Button Component
 * 
 * A versatile button component that supports variants, sizes, and loading states.
 * 
 * Props:
 * - variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
 * - size: 'sm' | 'md' | 'lg'
 * - isLoading: boolean
 * - rounded: 'default' | 'full'
 * - to: string (if provided, renders as Link)
 */
const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    className = '',
    to,
    rounded = 'default',
    ...props
}) => {

    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]";

    const variants = {
        primary: "bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-900 shadow-sm border border-transparent dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200",
        secondary: "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm focus:ring-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700 dark:focus:ring-slate-700",
        outline: "bg-transparent text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-300 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-800 dark:focus:ring-slate-600",
        ghost: "bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-200 dark:text-slate-300 dark:hover:bg-slate-800 dark:focus:ring-slate-700",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600 shadow-sm dark:bg-red-700 dark:hover:bg-red-600",
        accent: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-600 shadow-sm dark:bg-blue-600 dark:hover:bg-blue-500",
    };

    const sizes = {
        sm: "text-xs px-3 py-1.5",
        md: "text-sm px-4 py-2",
        lg: "text-base px-6 py-3",
    };

    const roundedStyles = rounded === 'full' ? 'rounded-full' : 'rounded-lg';

    const classes = `
    ${baseStyles} 
    ${variants[variant]} 
    ${sizes[size]} 
    ${roundedStyles}
    ${className}
  `;

    const content = (
        <>
            {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {children}
        </>
    );

    if (to) {
        return (
            <Link to={to} className={classes} {...props}>
                {content}
            </Link>
        );
    }

    return (
        <button className={classes} disabled={isLoading || props.disabled} {...props}>
            {content}
        </button>
    );
};

export default Button;
