// src/pages/TermsOfService.jsx
import React from 'react';

function TermsOfService() {
    return (
        <div className="bg-gray-50 py-12 sm:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <div className="bg-white p-8 sm:p-10 rounded-xl shadow-lg">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Terms of Service</h1>
                        <p className="mt-2 text-gray-500 text-sm">Last Updated: September 16, 2025</p>
                    </div>

                    {/* Use space-y utility to add vertical spacing between all direct children */}
                    <div className="prose prose-lg max-w-none space-y-8">
                        
                        <p className="lead">
                            Welcome to RentalDrives! By accessing or using our application ("the Platform"), you agree to be bound by these Terms of Service. Please read them carefully.
                        </p>

                        <hr className="my-6" />

                        {/* Section 1 */}
                        <section>
                            <h2>1. Description of Service</h2>
                            <p>
                                RentalDrives is a peer-to-peer marketplace that connects vehicle owners ("Hosts") with individuals seeking to rent vehicles ("Tourists"). RentalDrives is not a rental company. We are a neutral platform that facilitates the rental transaction between the Host and the Tourist. The actual rental agreement is a direct contract between the Host and the Tourist.
                            </p>
                        </section>

                        {/* Section 2 */}
                        <section>
                            <h2>2. User Responsibilities</h2>
                            <ul>
                                <li><strong>Accurate Information:</strong> You agree to provide true, accurate, and complete information during registration and to keep this information updated.</li>
                                <li><strong>Compliance with Laws:</strong> All users must comply with all applicable local, state, and national laws, including traffic laws and vehicle regulations in Goa, India.</li>
                                <li><strong>Tourists:</strong> You must possess a valid and current driver's license to book and operate any vehicle.</li>
                                <li><strong>Hosts:</strong> You must ensure your vehicle is legally registered, insured, safe, and in good mechanical condition. You are responsible for ensuring your vehicle meets all legal standards for rental.</li>
                            </ul>
                        </section>

                        {/* Section 3 */}
                        <section>
                            <h2>3. Verification and Identity</h2>
                            <p>
                                While RentalDrives has an admin approval process for Hosts and vehicles, we do not and cannot guarantee the identity of any user, the accuracy of any information provided, or the roadworthiness, safety, or legality of any vehicle listed on the Platform. Users are encouraged to exercise their own judgment and due diligence before entering into a rental agreement.
                            </p>
                        </section>

                        {/* Section 4 - Highlighted for emphasis */}
                        <section className="bg-gray-100 p-6 rounded-lg border border-gray-200">
                            <h2 className="!mt-0">4. Limitation of Liability and Disclaimer</h2>
                            <p>
                                <strong>RentalDrives is only a platform. We are not responsible and expressly disclaim any liability for:</strong>
                            </p>
                            <ul>
                                <li><strong>Accidents and Injuries:</strong> Any accidents, personal injuries, property damage, or death that may occur during a rental period. All liability rests with the Host and/or the Tourist involved.</li>
                                <li><strong>User Conduct:</strong> The conduct of any Host or Tourist. This includes, but is not limited to, traffic violations, illegal activities, reckless driving, or any form of misconduct.</li>
                                <li><strong>Fake or Fraudulent Users:</strong> Any loss or damage arising from interactions with users who may have provided false, misleading, or fraudulent information.</li>
                                <li><strong>Vehicle Condition:</strong> The condition, performance, or safety of any vehicle. Hosts are solely responsible for the maintenance and safety of their vehicles.</li>
                                <li><strong>Disputes:</strong> Any and all disputes arising between a Host and a Tourist. RentalDrives has no obligation to mediate or resolve disputes between its users.</li>
                            </ul>
                            <p className="font-semibold">
                                By using this service, you agree that you are doing so at your own risk.
                            </p>
                        </section>

                        {/* Section 5 */}
                        <section>
                            <h2>5. Indemnification</h2>
                            <p>
                                You agree to indemnify and hold harmless RentalDrives, its owners, and employees from any claim or demand, including reasonable attorneys' fees, made by any third party due to or arising out of your use of the service, your violation of these Terms of Service, or your violation of any rights of another.
                            </p>
                        </section>

                        {/* Section 6 */}
                        <section>
                            <h2>6. Governing Law</h2>
                            <p>
                                These Terms of Service shall be governed by the laws of the State of Goa, India, without regard to its conflict of law provisions.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TermsOfService;