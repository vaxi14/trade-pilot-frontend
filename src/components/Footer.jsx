import React from 'react';

export default function Footer (){
    return (
        <footer className="bg-gray-100 py-10 border-t border-gray-200">
            <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between gap-8">
                {/* Left Section: Logo and Social Icons */}
                <div className="flex-1 min-w-[250px]">
                    <h2 className="text-2xl font-bold text-blue-600 mb-4">TRADEPILOT</h2>
                    <p className="text-sm text-gray-600 mb-4">
                        © 2010 - 2025, TradePilot Pvt. Ltd. <br /> All rights reserved.
                    </p>
                    <div className="flex gap-3">
                        {/* Social Media Icons (Placeholders) */}
                        <a href="#" className="text-gray-600 hover:text-blue-600">
                            <span className="inline-block w-6 h-6">[T]</span>
                        </a>
                        <a href="#" className="text-gray-600 hover:text-blue-600">
                            <span className="inline-block w-6 h-6">[F]</span>
                        </a>
                        <a href="#" className="text-gray-600 hover:text-blue-600">
                            <span className="inline-block w-6 h-6">[I]</span>
                        </a>
                        <a href="#" className="text-gray-600 hover:text-blue-600">
                            <span className="inline-block w-6 h-6">[L]</span>
                        </a>
                        <a href="#" className="text-gray-600 hover:text-blue-600">
                            <span className="inline-block w-6 h-6">[Y]</span>
                        </a>
                        <a href="#" className="text-gray-600 hover:text-blue-600">
                            <span className="inline-block w-6 h-6">[W]</span>
                        </a>
                    </div>
                </div>

                {/* Middle Section: Navigation Links */}
                <div className="flex flex-col md:flex-row gap-8 flex-2">
                    {/* Company Column */}
                    <div className="min-w-[150px]">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Company</h3>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">About</a></li>
                            <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">Products</a></li>
                            <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">Pricing</a></li>
                            <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">Referral programme</a></li>
                            <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">Careers</a></li>
                            <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">TradePilot Tech</a></li>
                            <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">Open source</a></li>
                            <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">Press & media</a></li>
                            <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">TradePilot Cares (CSR)</a></li>
                        </ul>
                    </div>

                    {/* Support Column */}
                    <div className="min-w-[150px]">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Support</h3>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">Contact us</a></li>
                            <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">Support portal</a></li>
                            <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">T-Connect blog</a></li>
                            <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">List of charges</a></li>
                            <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">Downloads & resources</a></li>
                            <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">Videos</a></li>
                            <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">Market overview</a></li>
                            <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">How to file a complaint?</a></li>
                            <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">Status of your complaints</a></li>
                        </ul>
                    </div>

                    {/* Account Column */}
                    <div className="min-w-[150px]">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Account</h3>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">Open an account</a></li>
                            <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">Fund transfer</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Company Info and Disclaimer */}
            <div className="max-w-6xl mx-auto px-4 mt-10 text-xs text-gray-600 leading-relaxed">
                <p className="mb-2">
                    TradePilot Pvt. Ltd.: Member of NSE, BSE & MCX – SEBI Registration no.: INZ000031633 CDSL/NSDL: Depository services through TradePilot Pvt. Ltd. – SEBI Registration no.: IN-DP-431-2019 Commodity Trading through TradePilot Commodities Pvt. Ltd. MCX: 46025; NSE-50001 – SEBI Registration no.: INZ000038238 Registered Address: TradePilot Broking Ltd., #153/154, 4th Cross, Dollars Colony, Opp. Clarence Public School, J.P Nagar 4th Phase, Bengaluru - 560078, Karnataka, India. For any complaints pertaining to securities broking please write to <a href="mailto:complaints@tradepilot.com" className="text-blue-600 hover:underline">complaints@tradepilot.com</a>, for DP related to <a href="mailto:dp@tradepilot.com" className="text-blue-600 hover:underline">dp@tradepilot.com</a>. Please ensure you carefully read the Risk Disclosure Document as prescribed by SEBI | ICF
                </p>
                <p className="mb-2">
                    Procedure to file a complaint on <a href="#" className="text-blue-600 hover:underline">SEBI SCORES</a>: Register on SCORES portal. Mandatory details for filing complaints on SCORES: Name, PAN, Address, Mobile Number, E-mail ID. Benefits: Effective Communication, Speedy redressal of the grievances
                </p>
                <p className="mb-2">
                    <a href="#" className="text-blue-600 hover:underline">Smart Online Dispute Resolution</a> | <a href="#" className="text-blue-600 hover:underline">Grievances Redressal Mechanism</a>
                </p>
                <p className="mb-2">
                    Investments in securities market are subject to market risks; read all the related documents carefully before investing.
                </p>
                <p>
                    Attention Investors: 1) Stock brokers can accept securities as margins from clients only by way of pledge in the depository system w.e.f September 01, 2020. 2) Update your e-mail and phone number with your stock broker / depository participant and receive OTP directly from depository on your e-mail and/or mobile number to create pledge 3) Check your securities / MF / bonds in the consolidated account statement issued by NSDL/CDSL every month.
                </p>
            </div>
        </footer>
    );
};

