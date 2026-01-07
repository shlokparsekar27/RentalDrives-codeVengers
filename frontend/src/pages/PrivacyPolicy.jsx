// src/pages/PrivacyPolicy.jsx
import { FaShieldAlt, FaUserSecret, FaLock, FaDatabase, FaCookieBite, FaServer } from "react-icons/fa";
import Card from "../Components/ui/Card";
import Badge from "../Components/ui/Badge";

const PrivacyPolicy = () => {
    return (
        <div className="bg-background min-h-screen pt-24 pb-12 font-sans text-foreground">
            <div className="container mx-auto px-4 md:px-8 max-w-5xl">

                {/* Header */}
                <div className="text-center mb-12 animate-fade-in-up">
                    <Badge variant="primary" className="mb-4">Legal & Trust</Badge>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                        Privacy Policy
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Your privacy is our priority. We are transparent about how we collect, use, and protect your data.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                    {/* Navigation / Sidebar (Desktop) */}
                    <div className="md:col-span-4 lg:col-span-3 space-y-4 hidden md:block sticky top-24 self-start">
                        <div className="bg-secondary/30 rounded-xl p-4 border border-border">
                            <h3 className="font-bold mb-4 px-2">On this page</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="hover:text-primary hover:bg-primary/5 p-2 rounded transition-colors cursor-pointer">1. Data Collection</li>
                                <li className="hover:text-primary hover:bg-primary/5 p-2 rounded transition-colors cursor-pointer">2. Data Usage</li>
                                <li className="hover:text-primary hover:bg-primary/5 p-2 rounded transition-colors cursor-pointer">3. Security Measures</li>
                                <li className="hover:text-primary hover:bg-primary/5 p-2 rounded transition-colors cursor-pointer">4. Cookies & Tracking</li>
                                <li className="hover:text-primary hover:bg-primary/5 p-2 rounded transition-colors cursor-pointer">5. Your Rights</li>
                            </ul>
                        </div>
                        <div className="bg-primary/5 border border-primary/10 rounded-xl p-6 text-center">
                            <FaShieldAlt className="text-4xl text-primary mx-auto mb-3" />
                            <p className="text-sm font-semibold">Questions about data?</p>
                            <a href="mailto:privacy@rentaldrives.com" className="text-xs text-primary hover:underline mt-1 block">privacy@rentaldrives.com</a>
                        </div>
                    </div>

                    {/* Content Content */}
                    <div className="md:col-span-8 lg:col-span-9 space-y-8 animate-fade-in">

                        {/* Introduction */}
                        <Card className="p-8 border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-4">
                                <FaUserSecret className="text-2xl text-primary" />
                                <h2 className="text-2xl font-bold">1. Information We Collect</h2>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                We collect information you provide directly to us when you create an account, verify your identity, list a vehicle, or make a booking. This includes:
                            </p>
                            <ul className="list-disc list-inside mt-4 space-y-2 text-muted-foreground pl-4 marker:text-primary">
                                <li><strong>Personal Identity:</strong> Name, Email, Phone Number, Government ID (for KYC).</li>
                                <li><strong>Vehicle Data:</strong> Registration numbers, insurance details (for Hosts).</li>
                                <li><strong>Transaction Data:</strong> Payment history (we do not store raw credit card numbers).</li>
                            </ul>
                        </Card>

                        <Card className="p-8 border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-4">
                                <FaDatabase className="text-2xl text-blue-500" />
                                <h2 className="text-2xl font-bold">2. How We Use Your Data</h2>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                Your data powers the RentalDrives marketplace experience. We use it to:
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                                <div className="bg-secondary/50 p-4 rounded-lg">
                                    <h4 className="font-bold text-sm mb-2">Service Delivery</h4>
                                    <p className="text-xs text-muted-foreground">Facilitating bookings and connecting Hosts with Guests.</p>
                                </div>
                                <div className="bg-secondary/50 p-4 rounded-lg">
                                    <h4 className="font-bold text-sm mb-2">Safety & Verification</h4>
                                    <p className="text-xs text-muted-foreground">Verifying licenses and preventing fraud on the platform.</p>
                                </div>
                                <div className="bg-secondary/50 p-4 rounded-lg">
                                    <h4 className="font-bold text-sm mb-2">Communication</h4>
                                    <p className="text-xs text-muted-foreground">Sending booking updates, OTPs, and support messages.</p>
                                </div>
                                <div className="bg-secondary/50 p-4 rounded-lg">
                                    <h4 className="font-bold text-sm mb-2">Legal Compliance</h4>
                                    <p className="text-xs text-muted-foreground">Complying with local transport and tax regulations.</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-8 border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-4">
                                <FaLock className="text-2xl text-emerald-500" />
                                <h2 className="text-2xl font-bold">3. Data Security</h2>
                            </div>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                We employ industry-standard security measures to protect your information from unauthorized access.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" className="border-emerald-500/20 text-emerald-600 bg-emerald-500/5"><FaLock className="mr-1" /> TLS 1.3 Encryption</Badge>
                                <Badge variant="outline" className="border-emerald-500/20 text-emerald-600 bg-emerald-500/5"><FaServer className="mr-1" /> Secure Database Storage</Badge>
                                <Badge variant="outline" className="border-emerald-500/20 text-emerald-600 bg-emerald-500/5"><FaShieldAlt className="mr-1" /> Periodic Audits</Badge>
                            </div>
                        </Card>

                        <Card className="p-8 border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-4">
                                <FaCookieBite className="text-2xl text-amber-500" />
                                <h2 className="text-2xl font-bold">4. Cookies & Tracking</h2>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                We use essential cookies to maintain your session (e.g., keeping you logged in) and analytical cookies to understand how users interact with our platform to improve performance. You can control cookie preferences in your browser settings.
                            </p>
                        </Card>

                        <div className="bg-secondary/30 p-6 rounded-xl text-center text-sm text-muted-foreground">
                            <p>Last Updated: December 2025</p>
                            <p className="mt-2">RentalDrives Inc. Goa, India.</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
