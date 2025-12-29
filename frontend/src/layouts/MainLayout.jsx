import { useLocation } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import MobileBottomNav from "../Components/MobileBottomNav";

const MainLayout = ({ children }) => {
    const location = useLocation();

    // Pages where we might want to hide the footer or navbar if needed
    // For now, we apply global structure

    // Routes where specific layout adjustments might be needed (e.g., auth pages)
    const isAuthPage = ['/login', '/signup', '/PhoneAuth', '/VerifyOtp'].includes(location.pathname);

    return (
        <div className="flex flex-col min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] transition-colors duration-500">

            {/* Navbar: Sticky, handled by its internal class, but we provide context */}
            <Navbar />

            {/* Main Content Area */}
            {/* 
        padding-top: Adjusted to match Navbar height (~70px-80px) 
        padding-bottom: Adjusted for Mobile Bottom Nav (~70px) on mobile only
      */}
            <main className={`flex-grow pt-20 pb-24 md:pb-0 w-full`}>
                <div className="animate-enter w-full">
                    {children}
                </div>
            </main>

            {/* Footer: Hidden on mobile if bottom nav consumes space? Usually keep it at bottom. */}
            {/* Financial apps usually keep a clean footer. */}
            {!isAuthPage && (
                <div className="hidden md:block">
                    <Footer />
                </div>
            )}

            {/* Mobile Footer (Simplified or just copyright) could go here if needed */}
            <div className="md:hidden pb-24">
                {/* Mobile spacing for content above bottom nav */}
                {!isAuthPage && <Footer />}
            </div>

            {/* Mobile Navigation */}
            <MobileBottomNav />
        </div>
    );
};

export default MainLayout;
