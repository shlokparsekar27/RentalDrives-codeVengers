import { useTheme } from "../context/ThemeContext";
import { FaSun, FaMoon } from "react-icons/fa";

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? (
                <FaSun className="h-4 w-4" />
            ) : (
                <FaMoon className="h-4 w-4" />
            )}
        </button>
    );
};

export default ThemeToggle;
