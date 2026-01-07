// src/pages/Auth.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import {
    FaEnvelope, FaShieldAlt, FaUser, FaLock,
    FaCar, FaWalking, FaArrowRight, FaCheck
} from 'react-icons/fa';
import Button from '../Components/ui/Button';
import Card from '../Components/ui/Card';
import Badge from '../Components/ui/Badge';

const Auth = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [mode, setMode] = useState(location.pathname === '/signup' ? 'signup' : 'login');

    // Form Data
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        role: 'tourist'
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    // Sync route
    useEffect(() => {
        if (location.pathname === '/signup') setMode('signup');
        else if (location.pathname === '/login') setMode('login');
    }, [location.pathname]);

    // Reset on switch
    useEffect(() => {
        setError('');
    }, [mode]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // --- Handlers ---
    const handleEmailAuth = async (e) => {
        e.preventDefault();
        if (mode === 'signup' && !agreedToTerms) return setError("Please agree to the Terms of Service.");

        setIsLoading(true);
        setError('');
        try {
            if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: { data: { full_name: formData.fullName, role: formData.role } },
                });
                if (error) throw error;
                alert("Registration successful! Please sign in.");
                setMode('login');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password,
                });
                if (error) throw error;
                navigate('/');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 py-24 relative overflow-hidden bg-background">

            {/* Abstract Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-[100px] pointer-events-none animate-pulse-slow"></div>

            <div className="w-full max-w-md relative z-10 mx-auto">

                {/* Header Section */}
                <div className="text-center mb-8">
                    <Badge variant="outline" className="mb-4 backdrop-blur-md bg-background/50">
                        {mode === 'login' ? 'Welcome Back' : 'Join RentalDrives'}
                    </Badge>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">
                        {mode === 'login' ? 'Access Your Account' : 'Start Your Journey'}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        {mode === 'login'
                            ? 'Manage your bookings and vehicles with ease.'
                            : 'Create an account to verify your identity and start booking.'}
                    </p>
                </div>

                <Card className="shadow-2xl border-none ring-1 ring-border bg-card/80 backdrop-blur-xl">

                    {/* Main Tabs */}
                    <div className="flex border-b border-border">
                        <button
                            onClick={() => { setMode('login'); navigate('/login'); }}
                            className={`flex-1 py-4 text-sm font-semibold text-center transition-all relative ${mode === 'login' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Sign In
                            {mode === 'login' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full"></div>}
                        </button>
                        <button
                            onClick={() => { setMode('signup'); navigate('/signup'); }}
                            className={`flex-1 py-4 text-sm font-semibold text-center transition-all relative ${mode === 'signup' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Register
                            {mode === 'signup' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full"></div>}
                        </button>
                    </div>

                    <div className="p-6 sm:p-8 space-y-6">

                        {/* Error Display */}
                        {error && (
                            <div className="flex items-start gap-3 p-3 text-sm text-destructive bg-destructive/10 rounded-lg animate-fade-in">
                                <FaShieldAlt className="mt-0.5 shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleEmailAuth} className="space-y-5 animate-fade-in">

                            {/* --- Role Selection (Signup) --- */}
                            {mode === 'signup' && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div
                                        onClick={() => setFormData({ ...formData, role: 'tourist' })}
                                        className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all hover:bg-secondary/50 ${formData.role === 'tourist'
                                            ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary/20'
                                            : 'border-border text-muted-foreground'
                                            }`}
                                    >
                                        <FaWalking size={20} />
                                        <span className="text-xs font-bold uppercase">Tourist</span>
                                        {formData.role === 'tourist' && <FaCheck className="absolute top-2 right-2 text-xs" />}
                                    </div>
                                    <div
                                        onClick={() => setFormData({ ...formData, role: 'host' })}
                                        className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all hover:bg-secondary/50 ${formData.role === 'host'
                                            ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary/20'
                                            : 'border-border text-muted-foreground'
                                            }`}
                                    >
                                        <FaCar size={20} />
                                        <span className="text-xs font-bold uppercase">Host</span>
                                    </div>
                                </div>
                            )}

                            {/* --- Common Inputs --- */}
                            {mode === 'signup' && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Full Name</label>
                                    <div className="relative">
                                        <FaUser className="absolute left-3.5 top-3.5 text-muted-foreground" />
                                        <input
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            placeholder="e.g. Rahul Sharma"
                                            required
                                            className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-transparent rounded-xl focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* EMAIL INPUTS */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Email Address</label>
                                <div className="relative">
                                    <FaEnvelope className="absolute left-3.5 top-3.5 text-muted-foreground" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="name@example.com"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-transparent rounded-xl focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Password</label>
                                <div className="relative">
                                    <FaLock className="absolute left-3.5 top-3.5 text-muted-foreground" />
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-transparent rounded-xl focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm"
                                    />
                                </div>
                            </div>

                            {/* Terms Checkbox & Privacy Policy Checkbox */}
                            {mode === 'signup' && (
                                <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg border border-border/50">
                                    <input
                                        id="terms"
                                        type="checkbox"
                                        checked={agreedToTerms}
                                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                                        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer select-none">
                                        <p className="text-[10px] text-center text-muted-foreground px-4 leading-normal">I agree to the <Link to="/terms" className="font-bold text-foreground hover:underline">Terms of Service</Link> & <Link to="/privacy" className="font-bold text-foreground hover:underline">Privacy Policy</Link>.
                                        </p>
                                    </label>
                                </div>
                            )}

                            <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                size="lg"
                                disabled={isLoading}
                                className="font-bold shadow-lg shadow-primary/20 h-12 text-base group mt-2"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        {mode === 'login' ? 'Sign In' : 'Create Account'}
                                        <FaArrowRight className="group-hover:translate-x-1 transition-transform opacity-70" size={14} />
                                    </span>
                                )}
                            </Button>

                            {/* Login Terms Disclaimer */}
                            {mode === 'login' && (
                                <p className="text-[10px] text-center text-muted-foreground px-4 leading-normal">
                                    By signing in you accept our <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> & <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                                </p>
                            )}

                            {/* Mode Toggle Links */}
                            <div className="text-center pt-2">
                                {mode === 'login' ? (
                                    <p className="text-sm text-muted-foreground">
                                        Do not have an account?{' '}
                                        <button
                                            type="button"
                                            onClick={() => { setMode('signup'); navigate('/signup'); }}
                                            className="text-primary font-bold hover:underline ml-1"
                                        >
                                            SIGN UP
                                        </button>
                                    </p>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Already have an account?{' '}
                                        <button
                                            type="button"
                                            onClick={() => { setMode('login'); navigate('/login'); }}
                                            className="text-primary font-bold hover:underline ml-1"
                                        >
                                            SIGN IN
                                        </button>
                                    </p>
                                )}
                            </div>

                        </form>
                    </div>

                    {/* Footer Security Note */}
                    <div className="p-4 border-t border-border bg-muted/30 text-center">
                        <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1.5 uppercase tracking-wider font-semibold">
                            <FaShieldAlt className="text-emerald-500" /> Secure 256-Bit SSL Encrypted
                        </p>
                    </div>

                </Card>
            </div>
        </div>
    );
};

export default Auth;
