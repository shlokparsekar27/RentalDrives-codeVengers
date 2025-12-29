import { NavLink } from 'react-router-dom';
import { FaHome, FaCar, FaMotorcycle, FaUser } from 'react-icons/fa';

const MobileBottomNav = () => {
    const navItems = [
        { name: 'Home', path: '/', icon: FaHome },
        { name: 'Cars', path: '/cars', icon: FaCar },
        { name: 'Bikes', path: '/bikes', icon: FaMotorcycle },
        { name: 'Profile', path: '/profile', icon: FaUser },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border md:hidden safe-area-pb">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) => `
                            flex flex-col items-center justify-center w-full h-full space-y-1
                            transition-colors duration-200
                            ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}
                        `}
                    >
                        <item.icon className="text-xl" />
                        <span className="text-[10px] font-medium tracking-wide">{item.name}</span>
                    </NavLink>
                ))}
            </div>
        </div>
    );
};

export default MobileBottomNav;
