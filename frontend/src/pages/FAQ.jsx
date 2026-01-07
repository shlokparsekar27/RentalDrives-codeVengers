// src/pages/FAQ.jsx
import { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaQuestionCircle } from 'react-icons/fa';
import Button from '../Components/ui/Button';
import Card from '../Components/ui/Card';
import Badge from '../Components/ui/Badge';

const faqData = [
    {
        question: "How do I book a vehicle?",
        answer: "Simply browse our selection of cars, bikes, or scooters, select your desired dates on the vehicle's detail page, and click 'Review Booking'. From there, you'll be taken to a summary page to confirm and finalize your booking."
    },
    {
        question: "What documents do I need to rent a vehicle?",
        answer: "You will need a valid driver's license. Some hosts may also require an additional form of ID, like an Aadhar card or passport. Please be prepared to present these when you pick up the vehicle."
    },
    {
        question: "What is your cancellation policy?",
        answer: "You can cancel your booking from your Profile page. Please note that cancellation policies and potential refunds may vary depending on how far in advance you cancel. We recommend cancelling as early as possible."
    },
    {
        question: "How do I become a host?",
        answer: "To list your vehicle, you need to sign up for a 'Host' account. Once registered, you can go to your Host Dashboard to add your vehicle's details and upload the required documents for verification."
    },
    {
        question: "Is there a security deposit?",
        answer: "Security deposit policies are set by individual hosts. Please check the details on the vehicle's page or contact the host directly for information regarding security deposits."
    }
];

// Reusable Accordion Item Component
function AccordionItem({ item, isOpen, onClick }) {
    return (
        <div className={`border-b border-border transition-colors ${isOpen ? 'bg-secondary/20' : ''}`}>
            <button
                onClick={onClick}
                className="w-full flex justify-between items-center text-left py-5 px-6 focus:outline-none group"
            >
                <h3 className={`text-base font-bold transition-colors ${isOpen ? 'text-primary' : 'text-foreground group-hover:text-primary'}`}>
                    {item.question}
                </h3>
                <span className={`text-sm transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : 'text-muted-foreground'}`}>
                    <FaChevronDown />
                </span>
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="p-6 pt-0 text-muted-foreground leading-relaxed text-sm">
                    {item.answer}
                </div>
            </div>
        </div>
    );
}


function FAQ() {
    const [openIndex, setOpenIndex] = useState(0);

    const handleToggle = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="bg-background min-h-screen pt-24 pb-20 font-sans">
            <div className="container mx-auto px-4 max-w-4xl">

                <div className="text-center mb-12">
                    <Badge variant="outline" className="mb-4">Support Center</Badge>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
                        Frequently Asked Questions
                    </h1>
                    <p className="max-w-xl mx-auto text-lg text-muted-foreground">
                        Everything you need to know about booking, hosting, and riding with RentalDrives.
                    </p>
                </div>

                <Card className="overflow-hidden shadow-xl border-primary/10">
                    {faqData.map((item, index) => (
                        <AccordionItem
                            key={index}
                            item={item}
                            isOpen={openIndex === index}
                            onClick={() => handleToggle(index)}
                        />
                    ))}
                </Card>

                <div className="mt-12 text-center bg-secondary/30 p-8 rounded-2xl border border-dashed border-border">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-background mb-4 shadow-sm text-primary">
                        <FaQuestionCircle size={24} />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Still have questions?</h3>
                    <p className="text-muted-foreground mb-6">Can't find the answer you're looking for? Please chat to our friendly team.</p>
                    <Button to="/contact" variant="primary">Get in Touch</Button>
                </div>

            </div>
        </div>
    );
}

export default FAQ;