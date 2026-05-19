import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calculator, TrendingUp, TrendingDown, DollarSign, Users, Calendar, Save, History, Banknote, Eye, CheckCircle, ShieldCheck, Send, X, Printer } from 'lucide-react';
import { toast } from 'react-hot-toast'; // অপশনাল: নোটিফিকেশনের জন্য
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';



const ProfitManagement = () => {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [summary, setSummary] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [investors, setInvestors] = useState([]);
    const navigate = useNavigate();


    // ১. ইনিশিয়াল ডেটা লোড (Projects & History)
    useEffect(() => {
        fetchProjects();
        fetchHistory();
    }, []);

  const fetchProjects = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/projects');
            // যদি রেসপন্স সরাসরি অ্যারে না হয়ে অবজেক্ট হয়, তবে res.data.data অথবা res.data চেক করবে
            const projectData = Array.isArray(res.data.projects) ? res.data.projects : res.data.data;
            setProjects(projectData || []); 
            // console.log(projectData)
        } catch (err) {
            console.error("Project fetch error:", err);
            setProjects([]);
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/profit/history');
            // আপনার ব্যাকএন্ড অনুযায়ী res.data.data চেক করা হচ্ছে
            const historyData = res.data.data || res.data;
            setHistory(Array.isArray(historyData) ? historyData : []);
            console.log(res.data.data)
        } catch (err) {
            console.error("History fetch error:", err);
            setHistory([]);
        }
    };

    // ২. প্রোজেক্ট বা ডেট চেঞ্জ হলে সামারি ক্যালকুলেট করা
    const handleCalculate = async () => {
        if (!selectedProject) return toast.error("Please select a project");
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:3000/api/profit/project-summary/${selectedProject}?date=${selectedDate}`);
            setSummary(res.data.data);
            // console.log(res.data.data)
        } catch (err) {
            console.error(err);
            toast.error("Calculation failed!");
        } finally {
            setLoading(false);
        }
    };

    // ৩. ক্যালকুলেশন সেভ করা
    const handleSaveProfit = async () => {
        try {
             // প্রথমে date অবজেক্টটি তৈরি করে নিতে হবে
            const calcDate = new Date(selectedDate);

            const payload = {
                projectId: selectedProject,
                calculationDate: selectedDate,
                 // এখানে calcDate ব্যবহার করুন
                month: calcDate.getMonth() + 1,
                year: calcDate.getFullYear(),
                totalIncome: summary.totalIncome,
                totalExpenses: summary.totalExpenses,
                netProfit: summary.netProfit,
                totalShares: summary.totalActiveShares,
                profitPerShare: summary.profitPerShare,
                notes: "Monthly calculation"
            };
           // ব্যাকএন্ডে রিকোয়েস্ট পাঠানো
            const res = await axios.post('http://localhost:3000/api/profit/save', payload);
        
            if (res.data.success) {
                // সফল হলে সুন্দর অ্যালার্ট
                Swal.fire({
                    title: 'Success!',
                    text: 'Profit record saved successfully!',
                    icon: 'success',
                    confirmButtonColor: '#2563eb', // Blue-600
                    timer: 2000
                });
                fetchHistory(); // টেবিল আপডেট করা
                setSummary(null); // সামারি কার্ড হাইড করা
            }
        } catch (err) {
           // এরর ডিটেইলস কনসোলে দেখা ভালো
            console.error("Save Error:", err.response?.data);
            
            const backendMessage = err.response?.data?.message || "Failed to save record";
             // এরর হলে লাল অ্যালার্ট
            Swal.fire({
                title: 'Wait a second!',
                text: backendMessage,
                icon: 'warning',
                confirmButtonColor: '#ef4444', // Red-500
            });
        }
    };

    // Status Update korar jonno
    const handleUpdateStatus = async (id, currentStatus) => {
    let nextStatus = currentStatus === 'Calculated' ? 'Approved' : 'Distributed';
    
    const result = await Swal.fire({
        title: `Change status to ${nextStatus}?`,
        text: "You can manage member-wise profits in the details page after approval.",
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#2563eb'
    });

    if (result.isConfirmed) {
        try {
            const response = await axios.put(`http://localhost:3000/api/profit/status/${id}`, {
                status: nextStatus
            });
            if (response.data.success) {
                // স্টেট আপডেট করুন যাতে টেবিল রিফ্রেশ হয়
                setHistory(prev => prev.map(item => item._id === id ? { ...item, status: nextStatus } : item));
                Swal.fire('Updated!', `Status is now ${nextStatus}`, 'success');
            }
        } catch (err) {
            Swal.fire('Error', 'Failed to update status', 'error');
        }
    }
    };

    // মেম্বারদের প্রফিট ডাটা সেভ করার জন্য
    const handleDistributeProfit = async (row) => {
        const result = await Swal.fire({
            title: 'Confirm Payout Save?',
            text: `Distribute profits for ${row.projectId?.projectName}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#2563eb',
            confirmButtonText: 'Yes, Save Records'
        });

        if (result.isConfirmed) {
            try {
                // ১. এই প্রজেক্টের সব শেয়ার হোল্ডারদের ডাটা নিয়ে আসা
                const invRes = await axios.get(`http://localhost:3000/api/shares/project/${row.projectId?._id}`);
                const allInvestors = invRes.data;

                // ২. গ্রুপিং লজিক (Details Page থেকে নেওয়া)
                const groupedInvestors = allInvestors.reduce((acc, current) => {
                    const userId = current.userId?._id;
                    if (!acc[userId]) {
                        acc[userId] = { ...current };
                    } else {
                        acc[userId].quantity += current.quantity;
                    }
                    return acc;
                }, {});

                const uniqueInvestors = Object.values(groupedInvestors);

                // ৩. ফিল্টারিং লজিক (Calculation Date এর আগের ইনভেস্টর)
                const filteredInvestors = uniqueInvestors.filter(inv => {
                    const profitDate = new Date(row.calculationDate || row.createdAt);
                    const purchaseDate = new Date(inv.createdAt);
                    return purchaseDate <= profitDate;
                });

                if (filteredInvestors.length === 0) {
                    return Swal.fire('Wait!', 'No eligible investors found for this period.', 'info');
                }

                // ৪. পেমেন্ট ডাটা তৈরি করা
                const payoutData = filteredInvestors.map(inv => ({
                    profitRecordId: row._id,
                    memberId: inv.userId?._id,
                    projectId: row.projectId?._id || row.projectId,
                    sharesOwned: inv.quantity,
                    profitPerShare: row.profitPerShare,
                    totalProfitAmount: (inv.quantity * row.profitPerShare),
                    month: row.month,
                    year: row.year
                }));

                // ৫. ব্যাকএন্ডে API Call
                const response = await axios.post('http://localhost:3000/api/payouts/distribute', {
                    profitRecordId: row._id,
                    payouts: payoutData
                });

                if (response.data.success) {
                    Swal.fire('Saved!', 'Member profits recorded successfully.', 'success');
                    // টেবিল স্টেট আপডেট
                    setHistory(prev => prev.map(item => 
                        item._id === row._id ? { ...item, status: 'Distributed' } : item
                    ));
                }
            } catch (err) {
                console.error(err);
                Swal.fire('Error!', err.response?.data?.message || 'Failed to save payouts', 'error');
            }
        }
    };



    // কার্ডের ডেটা ক্যালকুলেশন
    const totalDistributions = history?.length || 0;

     // আপনার মডেলে যদি status থাকে তবে এটি কাজ করবে, নাহলে আপাতত ০ দেখাবে
    const pendingDisbursements = history?.filter(row => row.status === 'Calculated').length || 0;

    const totalDisbursed = history
        ?.filter(row => row.status === 'Approved')
        .length || 0;
        

    const disbursedAmount = history
        ?.filter(row => row.status === 'Distributed')
        .reduce((sum, row)=> sum + (Number(row.netProfit) || 0), 0) || 0;
        
   
    // const disbursedAmount = history?.reduce((sum, row) => sum + (row.netProfit || 0), 0) || 0;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 bg-gray-50 min-h-screen">

            {/* Dashboard Stats Card Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                
                {/* Total Distributions */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 transition-transform hover:scale-105 cursor-default">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <Calculator size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">Total Distributions</p>
                        <h3 className="text-xl font-black text-gray-800">{totalDistributions}</h3>
                    </div>
                </div>

                {/* Pending Disbursements */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 transition-transform hover:scale-105 cursor-default">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                        <History size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">Calculated.</p>
                        <h3 className="text-xl font-black text-gray-800">{pendingDisbursements}</h3>
                    </div>
                </div>

                  {/* Total Disbursed */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 transition-transform hover:scale-105 cursor-default">
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">Approved</p>
                        <h3 className="text-xl font-black text-gray-800">{totalDisbursed.toLocaleString()}</h3>
                    </div>
                </div>

                {/* Disbursed Amount */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 transition-transform hover:scale-105 cursor-default">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Save size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">Disbursed Amount</p>
                        <h3 className="text-xl font-black text-gray-800">{disbursedAmount.toLocaleString()}</h3>
                    </div>
                </div>

            </div>

            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                    <Calculator className="text-blue-600" /> Profit Management
                </h1>
            </div>

            {/* Selection Form */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Project</label>
                    <select 
                        className="w-full border-2 border-gray-100 p-2.5 rounded-xl font-bold text-gray-700 focus:border-blue-500 outline-none"
                        onChange={(e) => setSelectedProject(e.target.value)}
                    >
                        <option value="">Select Project...</option>
                        {projects?.map(p => <option key={p._id} value={p._id}>{p.projectName}</option>)}
                    </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Calculation Month</label>
                    <input 
                        type="date" 
                        className="w-full border-2 border-gray-100 p-2 rounded-xl font-bold text-gray-700 outline-none focus:border-blue-500"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                </div>
                <button 
                    onClick={handleCalculate}
                    className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100"
                >
                    {loading ? 'Calculating...' : 'Preview Profit'}
                </button>
            </div>

            {/* Summary Preview Cards */}
            {summary && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <StatCard label="Total Income" value={summary.totalIncome} icon={<TrendingUp size={16}/>} color="green" />
                        <StatCard label="Total Expense" value={summary.totalExpenses} icon={<TrendingDown size={16}/>} color="red" />
                        <StatCard label="Net Profit" value={summary.netProfit} icon={<Banknote size={16}/>} color="blue" />
                        <StatCard label="Active Shares" value={summary.totalActiveShares} icon={<Users size={16}/>} color="purple" />
                    </div>

                    <div className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-2xl text-white flex justify-between items-center">
                        <div>
                            <p className="text-blue-100 text-xs font-bold uppercase tracking-widest">Calculated Profit Per Share</p>
                            <h2 className="text-4xl font-black">{summary.profitPerShare}</h2>
                        </div>
                        <button 
                            onClick={handleSaveProfit}
                            className="bg-white text-blue-600 px-6 py-3 rounded-xl font-black flex items-center gap-2 hover:bg-gray-100 transition shadow-xl"
                        >
                            <Save size={18} /> Lock & Save Record
                        </button>
                    </div>
                </div>
            )}

            {/* History Table */}
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
                    <History size={18} className="text-gray-400" />
                    <h3 className="font-bold text-gray-700 text-sm uppercase">Calculation History</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase">
                            <tr>
                                <th className="p-4">Code</th>
                                <th className="p-4">Project</th>
                                <th className="p-4">Period</th>
                                <th className="p-4">Income</th>
                                <th className="p-4">Expense</th>
                                <th className="p-4 text-blue-600">Net Profit</th>
                                <th className="p-4">PPS</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-sm">
                            {history?.map((row) => (
                                <tr key={row._id} className="hover:bg-gray-50 transition">
                                    <td className="p-4 font-bold text-gray-800">{row.profitCode}</td>
                                    <td className="p-4 font-bold text-gray-800">{row.projectId?.projectName}</td>
                                    <td className="p-4 font-medium text-gray-500">{row.month}/{row.year}</td>
                                    <td className="p-4 text-green-600 font-bold">{row.totalIncome}</td>
                                    <td className="p-4 text-red-500 font-bold">{row.totalExpenses}</td>
                                    <td className="p-4 text-blue-700 font-black">{row.netProfit}</td>
                                    <td className="p-4"><span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-bold">{row.profitPerShare}</span></td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                            row.status === 'Distributed' || row.status === 'Distributed' ? 'bg-green-100 text-green-700' :
                                            row.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                                            'bg-amber-100 text-amber-700'
                                        }`}>
                                            {row.status}
                                        </span>
                                    </td>
                                  <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        {/* Status Update & Save Button */}
                                        {row.status !== 'Distributed' ? (
                                            <button 
                                                onClick={() => {
                                                    // যদি স্ট্যাটাস Calculated হয় তবে শুধু Approve হবে
                                                    if (row.status === 'Calculated') {
                                                        handleUpdateStatus(row._id, row.status);
                                                    } else {
                                                        // যদি স্ট্যাটাস Approved হয় তবে Distributed বাটনে ক্লিক করলে সেভ হবে
                                                        handleDistributeProfit(row); 
                                                    }
                                                }}
                                                className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg transition shadow-sm flex items-center gap-1.5 ${
                                                    row.status === 'Calculated' 
                                                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                                    : 'bg-green-600 text-white hover:bg-green-700'
                                                }`}
                                            >
                                                {row.status === 'Calculated' ? (
                                                    <><ShieldCheck size={12} /> Approve</>
                                                ) : (
                                                    <><Send size={12} /> Distributed & Save</>
                                                )}
                                            </button>
                                        ) : (
                                            <span className="flex items-center gap-1 text-green-600 font-bold text-[10px] uppercase bg-green-50 px-2 py-1.5 rounded-lg">
                                                <CheckCircle size={12} /> Finalized
                                            </span>
                                        )}

                                        {/* View Details Button (Calculated ছাড়া সব স্ট্যাটাসে দেখাবে) */}
                                        {row.status !== 'Calculated' && (
                                            <button 
                                                onClick={() => navigate(`/admin-dashboard/profit/details/${row._id}`)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition duration-200"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        )}
                                    </div>
                                  </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

const StatCard = ({ label, value, icon, color }) => {
    const colors = {
        green: "text-green-600 border-green-100 bg-green-50/30",
        red: "text-red-600 border-red-100 bg-red-50/30",
        blue: "text-blue-600 border-blue-100 bg-blue-50/30",
        purple: "text-purple-600 border-purple-100 bg-purple-50/30"
    };
    return (
        <div className={`p-4 rounded-2xl border ${colors[color]}`}>
            <p className="text-[10px] font-black uppercase opacity-60 flex items-center gap-1 mb-1">{icon} {label}</p>
            <p className="text-xl font-black">{value?.toLocaleString()}</p>
        </div>
    );
};

const DetailItem = ({ label, value, color = "text-gray-800" }) => (
    <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">{label}</p>
        <p className={`text-sm font-bold ${color}`}>{value || '---'}</p>
    </div>
);


export default ProfitManagement;
