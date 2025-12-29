import { Link } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';

/**
 * Enterprise Grade Button Component
 * Supports: variants, sizes, loading state, asLink, icon slots
 */
const Button = ({
    children,
    variant = 'primary',
    size = 'default',
    className = '',
    isLoading = false,
    disabled = false,
    to,
    type = 'button',
    fullWidth = false,
    onClick,
    ...props
}) => {

    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

    const variants = {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-transparent",
        outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        link: "text-primary underline-offset-4 hover:underline",
    };

    const sizes = {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
    };

    const widthClass = fullWidth ? 'w-full' : '';

    const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`;

    // Render as Link if 'to' prop exists
    if (to) {
        return (
            <Link to={to} className={classes} {...props}>
                {isLoading && <FaSpinner className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </Link>
        );
    }

    // Render as Button
    return (
        <button
            type={type}
            className={classes}
            disabled={disabled || isLoading}
            onClick={onClick}
            {...props}
        >
            {isLoading && <FaSpinner className="mr-2 h-4 w-4 animate-spin" />}
            {!isLoading && children}
        </button>
    );
};

export default Button;
