const Badge = ({ children, variant = "default", className = "" }) => {

    // Financial/Status indicators
    const variants = {
        default: "bg-primary/10 text-primary border-primary/20",
        secondary: "bg-secondary text-secondary-foreground border-secondary",
        outline: "text-foreground border-border",
        destructive: "bg-destructive/10 text-destructive border-destructive/20",
        success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        neutral: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700",
    };

    return (
        <span
            className={`
                inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
                ${variants[variant]} 
                ${className}
            `}
        >
            {children}
        </span>
    );
};

export default Badge;
