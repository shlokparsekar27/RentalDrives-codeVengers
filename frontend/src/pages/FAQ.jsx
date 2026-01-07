// src/pages/FAQ.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronDown, FaSearch, FaComments, FaPhoneAlt, FaEnvelopeOpen } from 'react-icons/fa';
import Button from '../Components/ui/Button';
import Card from '../Components/ui/Card';
import Badge from '../Components/ui/Badge';

const faqData = [
    {
        category: "Booking",
        question: "How do I book a vehicle?",
        answer: "Simply browse our selection of cars, bikes, or scooters, select your desired dates on the vehicle's detail page, and click 'Review Booking'. From there, you'll be taken to a summary page to confirm and finalize your booking."
    },
    {
        category: "Requirements",
        question: "What documents do I need to rent a vehicle?",
        answer: "You will need a valid driver's license. Some hosts may also require an additional form of ID, like an Aadhar card or passport. Please be prepared to present these when you pick up the vehicle."
    },
    {
        category: "Cancellation",
        question: "What is your cancellation policy?",
        answer: "You can cancel your booking from your Profile page 24 hours prior to the trip for a full refund. Cancellations made within 24 hours may incur a fee. We recommend cancelling as early as possible."
    },
    {
        category: "Hosting",
        question: "How do I become a host?",
        answer: "To list your vehicle, you need to sign up for a 'Host' account. Once registered, you can go to your Host Dashboard to add your vehicle's details and upload the required documents for verification."
    },
    {
        category: "Payment",
        question: "Is there a security deposit?",
        answer: "Security deposit policies are set by individual hosts. Please check the details on the vehicle's page or contact the host directly for information regarding security deposits."
    },
    {
        category: "Insurance",
        question: "Does the rental include insurance?",
        answer: "Yes, all our rentals come with basic comprehensive insurance. However, in the event of major damage due to negligence, you may be liable for fees as determined by the insurance claim process."
    },
    {
        category: "Fuel",
        question: "What is the fuel policy?",
        answer: "Vehicles are provided with a certain level of fuel and must be returned with the same amount. If returned with less fuel, refueling charges may apply. We recommend taking a photo of the fuel gauge during pickup."
    },
    {
        category: "Usage",
        question: "Can I take the vehicle outside Goa?",
        answer: "Most vehicles are restricted to use within state limits (Goa) unless explicitly authorized by the host. Taking the vehicle outside designated boundaries without permission may result in fines or account suspension."
    },
    {
        category: "Returns",
        question: "What happens if I return the vehicle late?",
        answer: "Late returns can disrupt other bookings. Returns that are less than 1 hour late may have a grace period, but significant delays will incur additional hourly or daily charges."
    }
];

// Reusable Accordion Item Component
function AccordionItem({ item, isOpen, onClick }) {
    return (
        <div className={`border border-border/60 rounded-xl mb-3 overflow-hidden transition-all duration-300 ${isOpen ? 'bg-card shadow-lg ring-1 ring-primary/20' : 'bg-card/50 hover:bg-card hover:border-border'}`}>
            <button
                onClick={onClick}
                className="w-full flex justify-between items-center text-left py-4 px-6 focus:outline-none group"
            >
                <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80 mb-1 block">{item.category}</span>
                    <h3 className={`text-base font-bold transition-colors ${isOpen ? 'text-foreground' : 'text-foreground/80 group-hover:text-foreground'}`}>
                        {item.question}
                    </h3>
                </div>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center bg-secondary transition-transform duration-300 ${isOpen ? 'rotate-180 bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
                    <FaChevronDown size={12} />
                </span>
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="p-6 pt-0 text-muted-foreground leading-relaxed text-sm">
                    <p className="border-t border-border/50 pt-4">{item.answer}</p>
                </div>
            </div>
        </div>
    );
}

function FAQ() {
    const [openIndex, setOpenIndex] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    const handleToggle = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const filteredFaq = faqData.filter(item =>
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-background min-h-[100dvh] pt-24 pb-24 font-sans relative overflow-hidden">

            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/4"></div>

            <div className="container mx-auto px-4 max-w-5xl relative z-10">

                <div className="text-center mb-16 animate-fade-in-up">
                    <Badge variant="outline" className="mb-4 bg-background/50 backdrop-blur-sm border-primary/20 text-primary">Support Center</Badge>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6">
                        How can we help you?
                    </h1>

                    {/* Search Bar */}
                    <div className="max-w-md mx-auto relative group">
                        <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                        <div className="relative">
                            <FaSearch className="absolute left-4 top-3.5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search for answers..."
                                className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl shadow-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/60"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* FAQ List */}
                    <div className="lg:col-span-8 space-y-2 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        {filteredFaq.length > 0 ? (
                            filteredFaq.map((item, index) => (
                                <AccordionItem
                                    key={index}
                                    item={item}
                                    isOpen={openIndex === index}
                                    onClick={() => handleToggle(index)}
                                />
                            ))
                        ) : (
                            <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
                                <p className="text-muted-foreground font-medium">No results found for "{searchTerm}"</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar / Contact Cards */}
                    <div className="lg:col-span-4 space-y-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                        <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm sticky top-24">
                            <h3 className="font-bold text-lg mb-4">Contact Support</h3>
                            <div className="space-y-4">
                                <a href="mailto:support@rentaldrives.com" className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary transition-colors group">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                        <FaEnvelopeOpen size={14} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase text-muted-foreground">Email Us</p>
                                        <p className="text-sm font-semibold text-foreground">support@rentaldrives.com</p>
                                    </div>
                                </a>
                                <a href="tel:+919876543210" className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary transition-colors group">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                        <FaPhoneAlt size={14} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase text-muted-foreground">Call Us</p>
                                        <p className="text-sm font-semibold text-foreground">+91 98765 43210</p>
                                    </div>
                                </a>
                                <Link to="/contact" className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary transition-colors group cursor-pointer">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                        <FaComments size={14} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase text-muted-foreground">Help Center</p>
                                        <p className="text-sm font-semibold text-foreground">View More</p>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default FAQ;