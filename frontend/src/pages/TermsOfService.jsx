// src/pages/TermsofService.jsx
import React from 'react';
import { FaBalanceScale, FaArrowLeft, FaFileAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function TermsOfService() {
    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen font-sans transition-colors duration-300 pb-24">

            {/* Header */}
            <div className="bg-white dark:bg-black pt-20 pb-24 border-b border-slate-200 dark:border-slate-800">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center mx-auto mb-6 text-slate-900 dark:text-white">
                        <FaBalanceScale size={20} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white tracking-tight mb-4">Terms of Service</h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400">
                        Please read these terms carefully before using our platform. Your agreement sets the rules for a fair and safe marketplace.
                    </p>
                    <p className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-400">Last Updated: September 16, 2025</p>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
                <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 md:p-12">

                    <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-display prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-li:text-slate-600 dark:prose-li:text-slate-400 prose-strong:text-slate-900 dark:prose-strong:text-white prose-a:text-blue-600 dark:prose-a:text-blue-400">

                        <p className="lead">
                            Welcome to <strong>RentalDrives</strong>! By accessing or using our application ("the Platform"), you agree to be bound by these Terms of Service.
                        </p>

                        <hr className="border-slate-200 dark:border-slate-800 my-8" />

                        <div className="grid grid-cols-1 gap-12">

                            <section>
                                <h2 className="flex items-center gap-3 text-2xl">
                                    <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm flex items-center justify-center font-mono">01</span>
                                    Description of Service
                                </h2>
                                <p>
                                    RentalDrives is a peer-to-peer marketplace that connects vehicle owners ("Hosts") with individuals seeking to rent vehicles ("Tourists"). RentalDrives is not a rental company. We are a neutral platform that facilitates the rental transaction between the Host and the Tourist. The actual rental agreement is a direct contract between the Host and the Tourist.
                                </p>
                            </section>

                            <section>
                                <h2 className="flex items-center gap-3 text-2xl">
                                    <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm flex items-center justify-center font-mono">02</span>
                                    User Responsibilities
                                </h2>
                                <ul className="marker:text-blue-500">
                                    <li><strong>Accurate Information:</strong> You agree to provide true, accurate, and complete information during registration and to keep this information updated.</li>
                                    <li><strong>Compliance with Laws:</strong> All users must comply with all applicable local, state, and national laws, including traffic laws and vehicle regulations in Goa, India.</li>
                                    <li><strong>Tourists:</strong> You must possess a valid and current driver's license to book and operate any vehicle.</li>
                                    <li><strong>Hosts:</strong> You must ensure your vehicle is legally registered, insured, safe, and in good mechanical condition. You are responsible for ensuring your vehicle meets all legal standards for rental.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="flex items-center gap-3 text-2xl">
                                    <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm flex items-center justify-center font-mono">03</span>
                                    Verification and Identity
                                </h2>
                                <p>
                                    While RentalDrives has an admin approval process for Hosts and vehicles, we do not and cannot guarantee the identity of any user, the accuracy of any information provided, or the roadworthiness, safety, or legality of any vehicle listed on the Platform. Users are encouraged to exercise their own judgment and due diligence before entering into a rental agreement.
                                </p>
                            </section>

                            <section className="bg-red-50 dark:bg-red-900/10 p-8 rounded-xl border border-red-100 dark:border-red-900/30">
                                <h2 className="flex items-center gap-3 text-2xl !mt-0 text-red-700 dark:text-red-400">
                                    <span className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm flex items-center justify-center font-mono">04</span>
                                    Limitation of Liability
                                </h2>
                                <p className="text-red-900/80 dark:text-red-200/80">
                                    <strong>RentalDrives is only a platform. We are not responsible and expressly disclaim any liability for:</strong>
                                </p>
                                <ul className="marker:text-red-400 text-red-900/80 dark:text-red-200/80">
                                    <li><strong>Accidents and Injuries:</strong> Any accidents, personal injuries, property damage, or death that may occur during a rental period. All liability rests with the Host and/or the Tourist involved.</li>
                                    <li><strong>User Conduct:</strong> The conduct of any Host or Tourist. This includes, but is not limited to, traffic violations, illegal activities, reckless driving, or any form of misconduct.</li>
                                    <li><strong>Fake or Fraudulent Users:</strong> Any loss or damage arising from interactions with users who may have provided false, misleading, or fraudulent information.</li>
                                    <li><strong>Vehicle Condition:</strong> The condition, performance, or safety of any vehicle. Hosts are solely responsible for the maintenance and safety of their vehicles.</li>
                                    <li><strong>Disputes:</strong> Any and all disputes arising between a Host and a Tourist. RentalDrives has no obligation to mediate or resolve disputes between its users.</li>
                                </ul>
                                <p className="font-bold text-red-800 dark:text-red-400 mt-4">
                                    By using this service, you agree that you are doing so at your own risk.
                                </p>
                            </section>

                            <section>
                                <h2 className="flex items-center gap-3 text-2xl">
                                    <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm flex items-center justify-center font-mono">05</span>
                                    Indemnification
                                </h2>
                                <p>
                                    You agree to indemnify and hold harmless RentalDrives, its owners, and employees from any claim or demand, including reasonable attorneys' fees, made by any third party due to or arising out of your use of the service, your violation of these Terms of Service, or your violation of any rights of another.
                                </p>
                            </section>

                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
                        <Link to="/" className="inline-flex items-center text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                            <FaArrowLeft className="mr-2" /> Return to Homepage
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default TermsOfService;