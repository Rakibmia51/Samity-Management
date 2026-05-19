import React, { useRef } from 'react';
import { X, Printer, Phone, Users, MapPin, Briefcase, Mail, ShieldCheck } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

const MemberDetailsModal = ({ isOpen, onClose, member }) => {
    const componentRef = useRef();

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `${member?.fullName || 'Member'}_Profile`,
    });

    if (!isOpen || !member) return null;

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
                
                {/* Modal Header (Non-Printable) */}
                <div className="p-4 border-b flex justify-between items-center bg-white print:hidden">
                    <h2 className="text-lg font-bold text-gray-800">Member Details</h2>
                    <div className="flex gap-2">
                        <button onClick={() => handlePrint()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-bold text-sm">
                            <Printer size={16} /> Print
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Printable Body */}
                <div className="overflow-y-auto p-6 bg-white" ref={componentRef}>
                    <style dangerouslySetInnerHTML={{ __html: `
                        @media print {
                            @page { size: A4; margin: 10mm; }
                            body { -webkit-print-color-adjust: exact; font-size: 12px; }
                        }
                    `}} />

                    {/* Compact Profile Header */}
                    <div className="flex items-center gap-4 border-b-2 border-blue-600 pb-4 mb-6">
                        <div className="w-20 h-20 rounded-xl bg-blue-600 flex items-center justify-center text-white text-2xl font-black shadow-md">
                            {member.fullName?.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-black text-gray-900 leading-none">{member.fullName}</h1>
                            <div className="flex gap-2 mt-2">
                                <span className="text-[10px] font-black uppercase tracking-widest bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                    {member.role}
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                                    Status: {member.status || 'Active'}
                                </span>
                            </div>
                        </div>
                        <div className="text-right hidden print:block">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Member ID</p>
                            <p className="text-sm font-black text-gray-800">#{member._id?.substring(18).toUpperCase()}</p>
                        </div>
                    </div>

                    {/* Information Grid (2 Columns) */}
                    <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                        
                        {/* Column 1: Identity & Contact */}
                        <section className="space-y-4">
                            <h3 className="text-blue-600 font-black text-[11px] uppercase tracking-widest border-b pb-1 flex items-center gap-2">
                                <Phone size={12}/> Identity & Contact
                            </h3>
                            
                            <div className="grid grid-cols-1 gap-3">
                                <DataRow label="Member Code" value={member.memberCode} />
                                <DataRow label="Full Name" value={member.fullName} />
                                <DataRow label="Phone Number" value={member.mobile} />
                                <DataRow label="Email Address" value={member.email} />
                                <DataRow label="NID Number" value={member.nid} />
                                <DataRow label="Date of Birth" value={new Date(member.dateOfBirth).toLocaleDateString('en-GB')} />
                            </div>
                        </section>

                        {/* Column 2: Family Information */}
                        <section className="space-y-4">
                            <h3 className="text-blue-600 font-black text-[11px] uppercase tracking-widest border-b pb-1 flex items-center gap-2">
                                <Users size={12}/> Family Details
                            </h3>
                            <div className="grid grid-cols-1 gap-3">
                                <DataRow label="Father's Name" value={member.fatherName} />
                                <DataRow label="Mother's Name" value={member.motherName} />
                                <DataRow label="Spouse Name" value={member.spouseName || 'N/A'} />
                                <DataRow label="Occupation" value={member.occupation} />
                                <DataRow label="Monthly Income" value={`${member.monthlyIncome?.toLocaleString()} BDT`} />
                            </div>
                        </section>

                        {/* Nominee (Full Width) */}
                        <section className="col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <h3 className="text-blue-600 font-black text-[11px] uppercase tracking-widest mb-3">Nominee Information</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <DataRow label="Nominee Name" value={member.nomineeName} />
                                <DataRow label="Relationship" value={member.relation} />
                                <DataRow label="Contact Number" value={member.nomineeMobile} />
                            </div>
                        </section>

                        {/* Addresses (Full Width) */}
                        <section className="col-span-2 space-y-4">
                            <h3 className="text-blue-600 font-black text-[11px] uppercase tracking-widest border-b pb-1 flex items-center gap-2">
                                <MapPin size={12}/> Address Details
                            </h3>
                            <div className="grid grid-cols-2 gap-6">
                                <DataRow label="Present Address" value={member.presentAddress} />
                                <DataRow label="Permanent Address" value={member.permanentAddress} />
                            </div>
                        </section>
                    </div>
                       <br></br>
                       <br></br>
                       <br></br>
                       <br></br>
                        <br></br>
                    {/* Print Footer (Signatures) */}
                    <div className="hidden print:flex justify-between items-end mt-16 px-6">
                        <div className="text-center">
                            <div className="w-32 border-b border-gray-900 mb-1"></div>
                            <p className="text-[9px] font-bold uppercase text-gray-500">Member Signature</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[8px] text-gray-400 mb-10 italic">Printed on: {new Date().toLocaleDateString()}</p>
                            <div className="w-32 border-b border-blue-600 mb-1"></div>
                            <p className="text-[9px] font-bold uppercase text-blue-600">Authorized Signature</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DataRow = ({ label, value }) => (
    <div className="flex flex-col">
        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mb-0.5">{label}</span>
        <span className="text-[13px] font-bold text-gray-800 leading-tight">{value || '---'}</span>
    </div>
);

export default MemberDetailsModal;
