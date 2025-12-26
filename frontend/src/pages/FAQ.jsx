// src/pages/FAQ.jsx
import { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaQuestionCircle, FaSearch } from 'react-icons/fa';

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
        <div className="border-b border-slate-100 dark:border-slate-800 last:border-none group">
            <button
                onClick={onClick}
                className="w-full flex justify-between items-center text-left py-8 px-8 focus:outline-none bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300"
            >
                <h3 className={`text-lg md:text-xl font-bold font-display transition-colors duration-300 ${isOpen ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                    {item.question}
                </h3>
                <span className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-500 ${isOpen ? 'bg-blue-100 text-blue-600 rotate-180 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                    <FaChevronDown size={14} />
                </span>
            </button>
            <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="p-8 pt-0 pl-8 text-base text-slate-600 dark:text-slate-400 leading-8 max-w-3xl">
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
        <div className="bg-slate-50 dark:bg-[#020617] min-h-screen transition-colors duration-500 font-sans pb-24">

            {/* Header */}
            <div className="bg-slate-900 dark:bg-black pt-24 pb-32 border-b border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -mr-20 -mt-20 pointer-events-none animate-blob"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none animate-blob animation-delay-2000"></div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center animate-fade-in-up">
                    <div className="w-20 h-20 bg-slate-800/50 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-8 text-blue-400 border border-slate-700 shadow-2xl">
                        <FaQuestionCircle size={40} />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-display font-bold text-white tracking-tight mb-6">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light">
                        Everything you need to know about renting or hosting on RentalDrives.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
                <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-fade-in-up stagger-1">
                    {faqData.map((item, index) => (
                        <AccordionItem
                            key={index}
                            item={item}
                            isOpen={openIndex === index}
                            onClick={() => handleToggle(index)}
                        />
                    ))}
                </div>

                <div className="mt-16 text-center animate-fade-in-up stagger-2">
                    <p className="text-slate-600 dark:text-slate-400 mb-6 text-lg">Still have questions?</p>
                    <a href="/contact" className="inline-flex items-center justify-center px-8 py-4 border border-slate-300 dark:border-slate-700 rounded-full text-slate-900 dark:text-white font-bold hover:bg-white dark:hover:bg-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:scale-105 duration-300 bg-white/50 backdrop-blur-sm shadow-lg">
                        Contact Support
                    </a>
                </div>
            </div>
        </div>
    );
}

export default FAQ;