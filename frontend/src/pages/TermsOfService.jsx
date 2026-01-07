// src/pages/TermsOfService.jsx
import React from 'react';
import { FaShieldAlt, FaBalanceScale, FaHandshake, FaGavel, FaExclamationTriangle } from 'react-icons/fa';
import Card from '../Components/ui/Card';
import Badge from '../Components/ui/Badge';

const LastUpdated = "December 30, 2025";

function TermsOfService() {
    return (
        <div className="bg-background min-h-screen py-24 font-sans text-foreground">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">

                {/* Header */}
                <div className="text-center mb-16">
                    <Badge variant="outline" className="mb-4">Legal Agreement</Badge>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Terms of Service</h1>
                    <p className="text-muted-foreground text-lg">
                        Please review the contract governing your use of the RentalDrives marketplace.
                    </p>
                    <p className="text-xs font-mono text-muted-foreground mt-4 uppercase tracking-wider">
                        Last Modified: {LastUpdated}
                    </p>
                </div>

                {/* Main Contract Card */}
                <Card className="p-8 md:p-12 shadow-xl border-border/80">
                    <div className="prose prose-zinc dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary">

                        <p className="lead text-xl text-muted-foreground border-b border-border pb-8 mb-8">
                            Welcome to RentalDrives. By accessing our platform, you agree to these binding terms.
                            RentalDrives acts strictly as a technology provider connecting verified Hosts with Tourists.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12 not-prose">
                            <PolicyHighlight
                                icon={FaHandshake}
                                title="Peer-to-Peer Model"
                                desc="We are not a rental agency. We facilitate secure contracts between you and vehicle owners."
                            />
                            <PolicyHighlight
                                icon={FaShieldAlt}
                                title="User Responsibility"
                                desc="You retain full liability for vehicle operation, adherence to traffic laws, and safety."
                            />
                        </div>

                        <h3>1. The Marketplace Platform</h3>
                        <p>
                            RentalDrives is a neutral venue. We verify identities via government ID and enforce chassis-level verification for vehicles, but the actual rental agreement is formed directly between the Host and the Guest.
                        </p>
                        <br />
                        <br />


                        <h3>2. Financial Obligations</h3>
                        <p>
                            All transactions are processed securely via 256-bit encrypted gateways (Razorpay).
                            Guests agree to pay the listed "Total Rate" which includes:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground font-medium">
                            <li>Base Daily Rental Rate</li>
                            <li>Platform Facilitation Fee (2%)</li>
                            <li>Applicable Taxes (GST)</li>
                        </ul>

                        <div className="my-10 p-6 bg-destructive/5 border border-destructive/20 rounded-xl not-prose">
                            <div className="flex gap-4">
                                <FaExclamationTriangle className="text-destructive text-2xl shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-bold text-destructive text-lg mb-2">3. Limitation of Liability</h4>
                                    <p className="text-sm text-foreground/80 leading-relaxed">
                                        RentalDrives expressly disclaims liability for any accidents, injuries, or third-party damages occurring during the rental period.
                                        By using the platform, you acknowledge that <strong>RentalDrives is an intermediary</strong> and not a party to the rental contract.
                                        All claims must be directed to the respective Host or Insurance Provider.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <h3>4. Cancellation & Refunds</h3>
                        <p>
                            Cancellation policies are set by Hosts but enforced by the platform:
                        </p>
                        <ul>
                            <li><strong>&gt; 24 Hours before pickup:</strong> Full Refund (minus processing fees).</li>
                            <li><strong>&lt; 24 Hours before pickup:</strong> 50% Refund of Base Rate.</li>
                            <li><strong>No-Show:</strong> No Refund.</li>
                        </ul>
                        <br />
                        <br />


                        <h3>5. Dispute Resolution</h3>
                        <p>
                            In the event of a dispute, users agree to first attempt mediation via our Support Center.
                            Unresolved matters shall be governed by the laws of the State of Goa, India.
                        </p>

                    </div>

                    <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500 font-bold text-sm">
                            <FaShieldAlt /> Legally Binding Digital Contract
                        </div>
                        <p className="text-xs text-muted-foreground text-center md:text-right">
                            RentalDrives Inc, Panaji, Goa.<br />
                            Legal Department
                        </p>
                    </div>

                </Card>
            </div>
        </div>
    );
}

// Helper Component for Visual Interest
const PolicyHighlight = ({ icon: Icon, title, desc }) => (
    <div className="flex gap-4 p-4 rounded-lg bg-secondary/50 border border-border">
        <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center shrink-0 text-primary shadow-sm border border-border/50">
            <Icon />
        </div>
        <div>
            <h4 className="font-bold text-foreground text-sm uppercase tracking-wide mb-1">{title}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
                {desc}
            </p>
        </div>
    </div>
);

export default TermsOfService;