// src/Components/MobileBottomNav.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaCar, FaMotorcycle, FaSearch, FaUser, FaCompass } from 'react-icons/fa';
import { GiScooter } from 'react-icons/gi';

const MobileBottomNav = () => {
    return (
        <div className="md:hidden fixed bottom-6 left-0 w-full z-50 px-4 bg-transparent pointer-events-none">
            {/* Floating Island Navigation */}
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-black/70 rounded-full flex justify-between items-center h-[4.5rem] px-4 pointer-events-auto transition-all duration-300 max-w-sm mx-auto">

                <NavLink
                    to="/"
                    className={({ isActive }) =>
                        `relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 group ${isActive
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                        }`
                    }
                >
                    {({ isActive }) => (
                        <>
                            {isActive && <span className="absolute -top-1 w-1 h-1 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>}
                            <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                                <FaCompass size={20} className={isActive ? 'transform scale-110 transition-transform' : ''} />
                            </div>
                        </>
                    )}
                </NavLink>

                <NavLink
                    to="/cars"
                    className={({ isActive }) =>
                        `relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 group ${isActive
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                        }`
                    }
                >
                    {({ isActive }) => (
                        <>
                            {isActive && <span className="absolute -top-1 w-1 h-1 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>}
                            <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                                <FaCar size={20} className={isActive ? 'transform scale-110 transition-transform' : ''} />
                            </div>
                        </>
                    )}
                </NavLink>

                <NavLink
                    to="/bikes"
                    className={({ isActive }) =>
                        `relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 group ${isActive
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                        }`
                    }
                >
                    {({ isActive }) => (
                        <>
                            {isActive && <span className="absolute -top-1 w-1 h-1 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>}
                            <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                                <FaMotorcycle size={20} className={isActive ? 'transform scale-110 transition-transform' : ''} />
                            </div>
                        </>
                    )}
                </NavLink>

                <NavLink
                    to="/scooters"
                    className={({ isActive }) =>
                        `relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 group ${isActive
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                        }`
                    }
                >
                    {({ isActive }) => (
                        <>
                            {isActive && <span className="absolute -top-1 w-1 h-1 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>}
                            <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                                <GiScooter size={22} className={isActive ? 'transform scale-110 transition-transform' : ''} />
                            </div>
                        </>
                    )}
                </NavLink>

                <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                        `relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 group ${isActive
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                        }`
                    }
                >
                    {({ isActive }) => (
                        <>
                            {isActive && <span className="absolute -top-1 w-1 h-1 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>}
                            <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                                <FaUser size={18} className={isActive ? 'transform scale-110 transition-transform' : ''} />
                            </div>
                        </>
                    )}
                </NavLink>
            </div>
        </div>
    );
};

export default MobileBottomNav;
