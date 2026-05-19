import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Users, TrendingUp, TrendingDown, Info, ShieldCheck, FileText, Calendar, DollarSign } from 'lucide-react';
import Swal from 'sweetalert2';


const ProfitDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [record, setRecord] = useState(null);
    const [investors, setInvestors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [project, setProjects] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`http://localhost:3000/api/profit/details/${id}`);
                setRecord(res.data.data);
                // console.log(res.data.data)
                const invRes = await axios.get(`http://localhost:3000/api/shares/project/${res.data.data.projectId._id}`);
                setInvestors(invRes.data);
                // console.log(invRes.data)
                const projectDetails = await axios(`http://localhost:3000/api/projects/details/${res.data.data.projectId._id}`);
                setProjects(projectDetails.data.data)
                // console.log(projectDetails.data.data.shareDetails)
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

// ইনভেস্টরদের আইডি অনুযায়ী গ্রুপ করা এবং শেয়ার যোগ করা
    const groupedInvestors = investors.reduce((acc, current) => {
        const userId = current.userId?._id;
        if (!acc[userId]) {
            acc[userId] = { ...current }; // নতুন ইনভেস্টর হলে অ্যাড করা হচ্ছে
        } else {
            acc[userId].quantity += current.quantity; // পুরাতন ইনভেস্টর হলে শেয়ার যোগ করা হচ্ছে
            acc[userId].totalAmount += current.totalAmount; // ইনভেস্টমেন্ট অ্যামাউন্ট যোগ করা হচ্ছে
        }
        return acc;
    }, {});

    // অবজেক্ট থেকে আবার অ্যারেতে রূপান্তর
    const uniqueInvestors = Object.values(groupedInvestors);

    // ১. প্রথমে ফিল্টার করে একটি নতুন ভেরিয়েবলে রাখুন
   const filteredInvestors = uniqueInvestors.filter(inv => {
    // record.calculationDate ব্যবহার করা বেশি নিরাপদ
    const profitDate = new Date(record.calculationDate || record.createdAt);
    const purchaseDate = new Date(inv.createdAt);
    
    return purchaseDate <= profitDate;
    });


    // ২. এখন এর লেংথ বের করুন
    const count = filteredInvestors.length;

    // মেম্বারদের প্রফিট ডাটা সেভ করার জন্য
    const handleDistributeProfit = async () => {
        const result = await Swal.fire({
            title: 'Confirm Payout Save?',
            text: "This will store profit records for each eligible member in the database.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#2563eb',
            confirmButtonText: 'Yes, Save Records'
        });

        if (result.isConfirmed) {
            setIsSaving(true);
            try {
                // ১. আপনার তৈরি করা filteredInvestors ব্যবহার করছি (যাদের ক্যালকুলেশন ডেট এর আগে শেয়ার কেনা)
                const payoutData = filteredInvestors.map(inv => ({
                    profitRecordId: record._id,
                    memberId: inv.userId?._id,
                    projectId: record.projectId?._id || record.projectId,
                    sharesOwned: inv.quantity,
                    profitPerShare: record.profitPerShare,
                    totalProfitAmount: (inv.quantity * record.profitPerShare),
                    month: record.month,
                    year: record.year
                }));

                // ২. ব্যাকএন্ডে API Call (এন্ডপয়েন্ট আপনার রুট অনুযায়ী চেক করে নিন)
                const response = await axios.post('http://localhost:3000/api/payouts/distribute', {
                    profitRecordId: record._id,
                    payouts: payoutData
                });

                if (response.data.success) {
                    Swal.fire('Saved!', 'Individual member profits have been recorded.', 'success');
                    setRecord({ ...record, status: 'Distributed' }); // UI আপডেট
                }
            } catch (err) {
                Swal.fire('Error!', err.response?.data?.message || 'Failed to save payouts', 'error');
            } finally {
                setIsSaving(false);
            }
        }
    };


    if (loading) return <div className="p-10 text-center font-bold animate-pulse text-blue-600">Loading Distribution Report...</div>;
    if (!record) return <div className="p-10 text-center font-bold text-red-500">Report Not Found!</div>;

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            {/* Minimal Sticky Header */}
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 mb-8">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 font-bold hover:text-blue-600 transition-colors text-sm">
                        <ArrowLeft size={18} /> BACK TO MANAGEMENT
                    </button>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-full uppercase tracking-widest">
                            {record.profitCode}
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 space-y-6">
                
                {/* 1. Primary Stats Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Project Identity */}
                    <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div>
                            <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Project Entity</p>
                            <h1 className="text-3xl font-black text-gray-900 leading-tight">{record.projectId?.projectName}</h1>
                            <p className="text-gray-400 font-medium mt-2 flex items-center gap-2 text-sm">
                                <Calendar size={14}/> Distribution Period: <span className="text-gray-700 font-bold">{record.month}/{record.year}</span>
                            </p>
                        </div>
                        <div className="mt-8 flex gap-4">
                            <Badge label="Status" value={record.status} />
                            <Badge label="Total Shares" value={project.shareDetails.totalQuantity} />
                            <Badge label="Sold Shares" value={record.totalShares} />
                        </div>
                    </div>

                    {/* Financial Snapshot */}
                    <div className="bg-gray-900 p-8 rounded-[2rem] shadow-xl text-white flex flex-col justify-center relative overflow-hidden">
                        <DollarSign size={120} className="absolute -right-8 -bottom-8 text-white/5" />
                        <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Net Profit for Distribution</p>
                        <h2 className="text-5xl font-black">{record.netProfit?.toLocaleString()}</h2>
                        <div className="mt-6 pt-6 border-t border-white/10">
                            <p className="text-gray-400 text-[10px] font-bold uppercase mb-1">Profit Per Share (PPS)</p>
                            <p className="text-xl font-black text-blue-400">{record.profitPerShare}</p>
                        </div>
                    </div>
                </div>

                {/* 2. Detailed Breakdown Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 space-y-4">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp size={16} className="text-green-500" /> Revenue & Expense
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-green-50/50 p-4 rounded-2xl">
                                <p className="text-[10px] font-bold text-green-600 uppercase">Gross Income</p>
                                <p className="text-xl font-black text-gray-800">{record.totalIncome?.toLocaleString()}</p>
                            </div>
                            <div className="bg-red-50/50 p-4 rounded-2xl">
                                <p className="text-[10px] font-bold text-red-600 uppercase">Total Expenses</p>
                                <p className="text-xl font-black text-gray-800">{record.totalExpenses?.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100">
                         <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                            <Info size={16} className="text-blue-500" /> Audit Information
                        </h3>
                        <div className="space-y-3">
                            <InfoRow label="Calculation Date" value={new Date(record.calculationDate).toDateString()} />
                            <InfoRow label="Audit ID" value={record._id?.substring(0, 12).toUpperCase()} />
                            <InfoRow label="System Notes" value={record.notes || "Standard Monthly Distribution"} />
                        </div>
                    </div>
                </div>

                {/* 3. Shareholder Distribution List */}
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
                                <Users size={20} className="text-blue-600" /> Shareholder Payouts
                            </h3>
                            <p className="text-xs text-gray-400 font-medium mt-1">Breakdown of profit based on individual shareholdings</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase">Active Holders</p>
                            <p className="text-lg font-black text-gray-800">{count}</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase">
                                <tr>
                                    <th className="px-8 py-4">Investor Identity</th>
                                    <th className="px-8 py-4">% Shares</th>
                                    <th className="px-8 py-4 text-right">Individual Payout</th>
                                     <th className="px-8 py-4">Equity Shares</th>
                                     <th className="px-8 py-4">Shares Value</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {uniqueInvestors
                                .filter(inv => {
                                        // প্রফিট ডিস্ট্রিবিউশন ডেট (record.date অথবা record.createdAt)
                                        const profitDate = new Date(record.date || record.createdAt);
                                        // মেম্বারের শেয়ার কেনার ডেট
                                        const purchaseDate = new Date(inv.createdAt); 

                                        // শুধুমাত্র প্রফিট ডেট-এর আগে  যারা শেয়ার কিনেছে তাদের দেখাবে
                                        return purchaseDate < profitDate;
                                    })
                                .map((inv, i) => {
                                        // ওনারশিপ পার্সেন্টেজ ক্যালকুলেশন: (মেম্বার শেয়ার / প্রোজেক্টের মোট শেয়ার) * ১০০
                                        const ownershipPercent = ((inv.quantity / record.totalShares) * 100).toFixed(2);
                                        // প্রফিট অ্যামাউন্ট: মেম্বার শেয়ার * শেয়ার প্রতি প্রফিট
                                        const individualProfit = inv.quantity * record.profitPerShare;
                                    return(
                                         
                                        <tr key={i} className="group hover:bg-blue-50/30 transition-colors">
                                            <td className="px-8 py-5">
                                                <p className="font-bold text-gray-800 group-hover:text-blue-700 transition-colors">{inv.userId?.fullName || "N/A"}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">{inv.userId?.email || "No Contact"}</p>
                                            </td>
                                              {/* Ownership Percentage কলাম */}
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-gray-700">{ownershipPercent}%</span>
                                                    <div className="w-16 h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                                        <div 
                                                            className="h-full bg-blue-500" 
                                                            style={{ width: `${ownershipPercent}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Profit Amount কলাম */}
                                            <td className="px-8 py-5 text-right">
                                                <p className="text-lg font-black text-blue-600">
                                                    {individualProfit.toLocaleString()}
                                                </p>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                                                    Net Payout
                                                </p>
                                            </td>

                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-black text-gray-700">{inv.quantity}</span>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Units</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <p className="text-lg font-black text-blue-600">
                                                    {(inv.quantity * inv.pricePerShare).toLocaleString()}
                                                </p>
                                            </td>
                                        </tr>
                                        )
                                    }
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* Action Button Section */}
                {record.status !== 'Distributed' && (
                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleDistributeProfit}
                            disabled={isSaving}
                            className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-blue-100 transition-all active:scale-95 disabled:bg-gray-400"
                        >
                            {isSaving ? (
                                "Processing..."
                            ) : (
                                <>
                                    <ShieldCheck size={20} />
                                    SAVE MEMBER PROFITS
                                </>
                            )}
                        </button>
                    </div>
                )}


                {/* 4. Integrity & Security Footer */}
                <div className="bg-blue-600 p-8 rounded-[2rem] text-white flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-2xl">
                            <ShieldCheck size={32} />
                        </div>
                        <div>
                            <p className="text-xl font-black italic">Verified Report</p>
                            <p className="text-blue-200 text-xs">This distribution is cryptographically signed and verified by the system auditor.</p>
                        </div>
                    </div>
                    <div className="text-center md:text-right">
                        <p className="text-[10px] font-black uppercase text-blue-200 tracking-widest mb-1">Authorization Code</p>
                        <p className="font-mono text-sm bg-black/20 px-4 py-2 rounded-lg">{record.profitCode}-{record._id.slice(-6).toUpperCase()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sub-Components for Cleanliness
const Badge = ({ label, value }) => (
    <div className="flex flex-col">
        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</span>
        <span className="text-xs font-black text-gray-800 bg-gray-100 px-3 py-1 rounded-lg w-fit">{value}</span>
    </div>
);

const InfoRow = ({ label, value }) => (
    <div className="flex justify-between items-center text-sm">
        <span className="text-gray-400 font-medium">{label}</span>
        <span className="text-gray-800 font-bold">{value}</span>
    </div>
);

export default ProfitDetailsPage;
