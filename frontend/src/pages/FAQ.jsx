// src/pages/FAQ.jsx
import { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

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
        <div className="border-b border-gray-200">
            <button
                onClick={onClick}
                className="w-full flex justify-between items-center text-left py-5 px-4 focus:outline-none"
            >
                <h3 className="text-lg font-semibold text-gray-800">{item.question}</h3>
                <span className="text-blue-600">
                    {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                </span>
            </button>
            {isOpen && (
                <div className="p-4 bg-gray-50 text-gray-700">
                    <p>{item.answer}</p>
                </div>
            )}
        </div>
    );
}


function FAQ() {
    const [openIndex, setOpenIndex] = useState(null);

    const handleToggle = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
                        Frequently Asked Questions
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                        Have questions? We've got answers. If you can't find what you're looking for, feel free to contact us.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                    {faqData.map((item, index) => (
                        <AccordionItem
                            key={index}
                            item={item}
                            isOpen={openIndex === index}
                            onClick={() => handleToggle(index)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default FAQ;