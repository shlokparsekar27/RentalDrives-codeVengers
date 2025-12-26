// src/pages/TermsOfService.jsx
import React from 'react';
import { FaBalanceScale, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function TermsOfService() {
    return (
        <div className="bg-slate-50 dark:bg-[#020617] min-h-screen font-sans transition-colors duration-500 pb-24">

            {/* Header */}
            <div className="bg-slate-900 dark:bg-black pt-24 pb-32 border-b border-slate-800 relative">
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[bottom_1px_center]"></div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl relative z-10 animate-fade-in-up">
                    <div className="w-16 h-16 bg-slate-800 dark:bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-8 text-white border border-slate-700 shadow-xl">
                        <FaBalanceScale size={24} />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-display font-bold text-white tracking-tight mb-6">Terms of Service</h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
                        Please read these terms carefully before using our platform. Your agreement sets the rules for a fair and safe marketplace.
                    </p>
                    <div className="mt-8 inline-block px-4 py-1.5 rounded-full bg-slate-800 dark:bg-slate-900 border border-slate-700 text-xs font-bold uppercase tracking-widest text-slate-400">
                        Last Updated: September 16, 2025
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
                <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 md:p-16 animate-fade-in-up stagger-1">

                    <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-display prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-li:text-slate-600 dark:prose-li:text-slate-400 prose-strong:text-slate-900 dark:prose-strong:text-white prose-a:text-blue-600 dark:prose-a:text-blue-400">

                        <p className="lead text-xl md:text-2xl text-slate-500 dark:text-slate-300 font-light border-b border-slate-100 dark:border-slate-800 pb-8 mb-8">
                            Welcome to <strong className="font-display text-slate-900 dark:text-white">RentalDrives</strong>! By accessing or using our application ("the Platform"), you agree to be bound by these Terms of Service.
                        </p>

                        <div className="grid grid-cols-1 gap-16">

                            <section>
                                <h2 className="flex items-center gap-4 text-3xl mb-6">
                                    <span className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm flex items-center justify-center font-mono font-bold">01</span>
                                    Description of Service
                                </h2>
                                <p>
                                    RentalDrives is a peer-to-peer marketplace that connects vehicle owners ("Hosts") with individuals seeking to rent vehicles ("Tourists"). RentalDrives is not a rental company. We are a neutral platform that facilitates the rental transaction between the Host and the Tourist. The actual rental agreement is a direct contract between the Host and the Tourist.
                                </p>
                            </section>

                            <section>
                                <h2 className="flex items-center gap-4 text-3xl mb-6">
                                    <span className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm flex items-center justify-center font-mono font-bold">02</span>
                                    User Responsibilities
                                </h2>
                                <ul className="marker:text-blue-500 marker:font-bold space-y-2">
                                    <li><strong>Accurate Information:</strong> You agree to provide true, accurate, and complete information during registration and to keep this information updated.</li>
                                    <li><strong>Compliance with Laws:</strong> All users must comply with all applicable local, state, and national laws, including traffic laws and vehicle regulations in Goa, India.</li>
                                    <li><strong>Tourists:</strong> You must possess a valid and current driver's license to book and operate any vehicle.</li>
                                    <li><strong>Hosts:</strong> You must ensure your vehicle is legally registered, insured, safe, and in good mechanical condition. You are responsible for ensuring your vehicle meets all legal standards for rental.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="flex items-center gap-4 text-3xl mb-6">
                                    <span className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm flex items-center justify-center font-mono font-bold">03</span>
                                    Verification and Identity
                                </h2>
                                <p>
                                    While RentalDrives has an admin approval process for Hosts and vehicles, we do not and cannot guarantee the identity of any user, the accuracy of any information provided, or the roadworthiness, safety, or legality of any vehicle listed on the Platform. Users are encouraged to exercise their own judgment and due diligence before entering into a rental agreement.
                                </p>
                            </section>

                            <section className="bg-red-50 dark:bg-red-900/10 p-10 rounded-3xl border border-red-100 dark:border-red-900/30">
                                <h2 className="flex items-center gap-4 text-3xl !mt-0 text-red-700 dark:text-red-400 mb-6">
                                    <span className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm flex items-center justify-center font-mono font-bold">04</span>
                                    Limitation of Liability
                                </h2>
                                <p className="text-red-900/80 dark:text-red-200/80 text-lg">
                                    <strong>RentalDrives is only a platform. We are not responsible and expressly disclaim any liability for:</strong>
                                </p>
                                <ul className="marker:text-red-400 text-red-900/80 dark:text-red-200/80 space-y-2">
                                    <li><strong>Accidents and Injuries:</strong> Any accidents, personal injuries, property damage, or death that may occur during a rental period. All liability rests with the Host and/or the Tourist involved.</li>
                                    <li><strong>User Conduct:</strong> The conduct of any Host or Tourist. This includes, but is not limited to, traffic violations, illegal activities, reckless driving, or any form of misconduct.</li>
                                    <li><strong>Fake or Fraudulent Users:</strong> Any loss or damage arising from interactions with users who may have provided false, misleading, or fraudulent information.</li>
                                    <li><strong>Vehicle Condition:</strong> The condition, performance, or safety of any vehicle. Hosts are solely responsible for the maintenance and safety of their vehicles.</li>
                                    <li><strong>Disputes:</strong> Any and all disputes arising between a Host and a Tourist. RentalDrives has no obligation to mediate or resolve disputes between its users.</li>
                                </ul>
                                <p className="font-bold text-red-800 dark:text-red-400 mt-6 border-t border-red-200 dark:border-red-900/30 pt-6">
                                    By using this service, you agree that you are doing so at your own risk.
                                </p>
                            </section>

                            <section>
                                <h2 className="flex items-center gap-4 text-3xl mb-6">
                                    <span className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm flex items-center justify-center font-mono font-bold">05</span>
                                    Indemnification
                                </h2>
                                <p>
                                    You agree to indemnify and hold harmless RentalDrives, its owners, and employees from any claim or demand, including reasonable attorneys' fees, made by any third party due to or arising out of your use of the service, your violation of these Terms of Service, or your violation of any rights of another.
                                </p>
                            </section>

                        </div>
                    </div>

                    <div className="mt-16 pt-10 border-t border-slate-100 dark:border-slate-800 text-center">
                        <Link to="/" className="inline-flex items-center text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors hover:underline underline-offset-4">
                            <FaArrowLeft className="mr-2" /> Return to Homepage
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default TermsOfService;