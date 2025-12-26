// src/Components/MobileBottomNav.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaCar, FaMotorcycle, FaSearch, FaUser } from 'react-icons/fa';
import { GiScooter } from 'react-icons/gi';

const MobileBottomNav = () => {
    return (
        <div className="md:hidden fixed bottom-6 left-0 w-full z-50 px-4 bg-transparent pointer-events-none">
            {/* Floating Island Navigation */}
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-black/50 rounded-2xl flex justify-between items-center h-[4.5rem] px-2 pointer-events-auto transition-all duration-300 max-w-lg mx-auto">

                <NavLink
                    to="/"
                    className={({ isActive }) =>
                        `flex flex-col items-center justify-center w-full h-full text-[10px] font-medium transition-all duration-300 rounded-xl ${isActive
                            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 translate-y-0'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`
                    }
                >
                    <FaHome size={20} className="mb-1" />
                    <span>Home</span>
                </NavLink>

                <NavLink
                    to="/cars"
                    className={({ isActive }) =>
                        `flex flex-col items-center justify-center w-full h-full text-[10px] font-medium transition-all duration-300 rounded-xl ${isActive
                            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 translate-y-0'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`
                    }
                >
                    <FaCar size={20} className="mb-1" />
                    <span>Cars</span>
                </NavLink>

                <NavLink
                    to="/bikes"
                    className={({ isActive }) =>
                        `flex flex-col items-center justify-center w-full h-full text-[10px] font-medium transition-all duration-300 rounded-xl ${isActive
                            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 translate-y-0'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`
                    }
                >
                    <FaMotorcycle size={20} className="mb-1" />
                    <span>Bikes</span>
                </NavLink>

                <NavLink
                    to="/scooters"
                    className={({ isActive }) =>
                        `flex flex-col items-center justify-center w-full h-full text-[10px] font-medium transition-all duration-300 rounded-xl ${isActive
                            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 translate-y-0'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`
                    }
                >
                    <GiScooter size={22} className="mb-1" />
                    <span>Scooters</span>
                </NavLink>

                <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                        `flex flex-col items-center justify-center w-full h-full text-[10px] font-medium transition-all duration-300 rounded-xl ${isActive
                            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 translate-y-0'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`
                    }
                >
                    <FaUser size={20} className="mb-1" />
                    <span>Profile</span>
                </NavLink>
            </div>
        </div>
    );
};

export default MobileBottomNav;
