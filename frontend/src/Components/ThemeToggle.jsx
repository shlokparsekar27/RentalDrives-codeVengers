// src/Components/ThemeToggle.jsx
import { useTheme } from '../context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeToggle = ({ className = "" }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-slate-500 ${className} ${theme === 'dark'
                    ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-orange-500'
                }`}
            aria-label="Toggle Dark Mode"
        >
            {theme === 'dark' ? <FaSun size={18} /> : <FaMoon size={18} />}
        </button>
    );
};

export default ThemeToggle;
