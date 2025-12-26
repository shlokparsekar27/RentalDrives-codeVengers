// src/pages/FAQ.jsx
import { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaQuestionCircle } from 'react-icons/fa';

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

function AccordionItem({ item, isOpen, onClick }) {
    return (
        <div className="border-b border-slate-200 dark:border-slate-800 last:border-none group">
            <button
                onClick={onClick}
                className="w-full flex justify-between items-center text-left py-6 px-6 focus:outline-none bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/30 transition-colors"
            >
                <h3 className={`text-lg font-bold transition-colors ${isOpen ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                    {item.question}
                </h3>
                <span className={`text-slate-400 dark:text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500' : ''}`}>
                    <FaChevronDown />
                </span>
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="p-6 pt-0 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 leading-relaxed">
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
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300 font-sans pb-24">

            {/* Header */}
            <div className="bg-slate-900 dark:bg-black pt-20 pb-28 border-b border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-10 -mr-20 -mt-20"></div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-400">
                        <FaQuestionCircle size={32} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight mb-4">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Everything you need to know about renting or hosting on RentalDrives.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
                <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {faqData.map((item, index) => (
                        <AccordionItem
                            key={index}
                            item={item}
                            isOpen={openIndex === index}
                            onClick={() => handleToggle(index)}
                        />
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-slate-600 dark:text-slate-400 mb-4">Still have questions?</p>
                    <a href="/contact" className="inline-flex items-center justify-center px-6 py-3 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-bold hover:bg-white dark:hover:bg-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all">
                        Contact Support
                    </a>
                </div>
            </div>
        </div>
    );
}

export default FAQ;