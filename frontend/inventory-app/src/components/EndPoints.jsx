import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {Eye, Search, Filter,Trash2, TrendingUp, TrendingDown, Wallet, Calendar, Plus, X, Save, Briefcase, Tag, DollarSign, Banknote, Landmark, Smartphone } from 'lucide-react'; // আইকন ব্যবহারের জন্য (ঐচ্ছিক)
import Swal from 'sweetalert2';
import EndPointViewDetails from './EndPointViewDetails';


const GlobalInvestmentTable = () => {
  const [allData, setAllData] = useState([]);
  const [overallTotals, setOverallTotals] = useState({ totalIncome: 0, totalExpense: 0, totalProfit: 0 });
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

 // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    projectId: '', endpointName: '', type: 'Income',paymentMethod: 'Cash', amount: '', description: '' ,date: new Date().toISOString().split('T')[0]
  });
// Viwe Details
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewEndPoint, setViewEndPoint] = useState(null);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/endpoints');
      if (response.data.success) {
        setAllData(response.data.data);
        setOverallTotals(response.data.overallTotals);
      }

    // প্রজেক্ট লিস্ট লোড করা
    const projRes = await axios.get('http://localhost:3000/api/projects');
    setProjects(projRes.data.projects);
   
    } catch (error) {
      console.error("Data load error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
        const res = await axios.post('http://localhost:3000/api/endpoints/add', formData, {
             headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` }
        });
        if(res.data.success){
           Swal.fire('Success', 'EndPoint Entry Success', 'success'); 
            setIsModalOpen(false); // ফর্ম বন্ধ করা
            fetchData(); // টেবিল ডাটা রিফ্রেশ করা
            setFormData({ projectId: '', endpointName: '', type: 'Income', paymentMethod:'Cash', amount: '', description: '',date: new Date().toISOString().split('T')[0] });
        }
    } catch (error) {
        Swal.fire('Error', 'Error saving data!', 'error');
    }
  };

  const handleDelete = async (id) =>{
    const result = await Swal.fire({
        title: 'Are you sure?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!'
    });
    if(result.isConfirmed){
            try {
            const res = await axios.delete(`http://localhost:3000/api/endpoints/delete/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` }
            });
            if(res.data.success){
                Swal.fire('Deleted!', 'EndPoint has been deleted.', 'success');
            
                fetchData(); // টেবিল ডাটা রিফ্রেশ করা
            
            }
        } catch (error) {
            Swal.fire('Error', 'Delete failed', 'error');
        }
    }
  }

  const handleView = (item) =>{
    setViewEndPoint(item)
    setIsDetailsOpen(true)
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
    </div>
  );

  const filteredData = allData.filter(item => {
    const matchesType = filterType === 'All' || item.type === filterType;
    const matchesSearch = item.endpointName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.projectId?.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="p-4 md:p-8 bg-[#f8fafc] min-h-screen font-sans">
        <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
                <h1 className="text-2xl font-extrabold text-slate-800">Global Investment Dashboard</h1>
                <p className="text-sm text-slate-500">Track and manage your global project finances in one place.</p>
            </div>
            <button 
                onClick={() => setIsModalOpen(true)}
                 className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 active:scale-95"
                >
                <Plus size={18} /> Add Transaction
            </button>
        </div>

        {/* 1. Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Income Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><TrendingUp size={20} /></div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">TOTAL REVENUE</span>
            </div>
            <h3 className="text-2xl font-black text-slate-800">{overallTotals.totalIncome.toLocaleString()} <span className="text-sm font-medium">TK</span></h3>
            <p className="text-xs text-slate-400 mt-1">Total lifetime income</p>
            </div>

            {/* Expense Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-rose-50 rounded-lg text-rose-600"><TrendingDown size={20} /></div>
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-full">TOTAL SPEND</span>
            </div>
            <h3 className="text-2xl font-black text-slate-800">{overallTotals.totalExpense.toLocaleString()} <span className="text-sm font-medium">TK</span></h3>
            <p className="text-xs text-slate-400 mt-1">Total lifetime expense</p>
            </div>

            {/* Profit Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100 hover:shadow-md transition-shadow ring-1 ring-indigo-50">
            <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Wallet size={20} /></div>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">NET PROFIT</span>
            </div>
            <h3 className="text-2xl font-black text-indigo-600">{overallTotals.totalProfit.toLocaleString()} <span className="text-sm font-medium">TK</span></h3>
            <p className="text-xs text-slate-400 mt-1">Overall balance</p>
            </div>
        </div>

        {/* 2. Filter Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
                type="text"
                placeholder="Search by project or endpoint..."
                className="pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none w-full focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
            <Filter size={16} className="text-slate-400" />
            <select
                className="px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none bg-white cursor-pointer focus:ring-2 focus:ring-indigo-500/20 w-full"
                onChange={(e) => setFilterType(e.target.value)}
            >
                <option value="All">All Transactions</option>
                <option value="Income">Income Only</option>
                <option value="Expense">Expense Only</option>
            </select>
            </div>
        </div>

        {/* 3. Main Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Project Details</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Endpoint</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                {filteredData.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                            {/* প্রজেক্টের নাম - বোল্ড এবং বড় */}
                            <span className="text-sm font-black text-slate-800 tracking-tight leading-none">
                            {item.projectId?.projectName}
                            </span>
                            {/* আইডি নাম্বার - ছোট এবং সাবলীল */}
                            <span className="text-[10px] font-bold text-indigo-500/80 uppercase tracking-widest">
                            {item.endNumber}
                            </span>
                        </div>
                 </td>
                    <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">{item.endpointName}</span>
                    </td>
                    <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                        item.type === 'Income' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-rose-100 text-rose-700'
                        }`}>
                        {item.type}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                            {item.paymentMethod === 'Cash' && <><Banknote size={14} className="text-green-500"/> <span className="text-xs font-bold">Cash</span></>}
                            {item.paymentMethod === 'Bank' && <><Landmark size={14} className="text-blue-500"/> <span className="text-xs font-bold">Bank</span></>}
                            {item.paymentMethod === 'Mobile Bank' && <><Smartphone size={14} className="text-pink-500"/> <span className="text-xs font-bold">Mobile Bank</span></>}
                       </div>
                    </td>
                    <td className={`px-6 py-4 text-sm font-bold text-right ${
                        item.type === 'Income' ? 'text-emerald-600' : 'text-rose-500'
                    }`}>
                        {item.type === 'Income' ? '+' : '-'}{item.amount.toLocaleString()} <span className="text-[10px]">TK</span>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-500 text-xs">
                        <Calendar size={14} />
                        {new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                    </td>
                     <td className="px-6 py-4">
                        <button className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                            onClick={() => handleView(item)}
                            ><Eye size={16}/>
                        </button>

                         <button 
                                onClick={() => handleDelete(item._id)}
                                className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                            >
                                <Trash2 size={16}/>
                            </button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
             {/* View Modal Component */}
                <EndPointViewDetails
                    isOpen = {isDetailsOpen}
                    onClose={() => setIsDetailsOpen(false)}
                    endPoint = {viewEndPoint}
                />
            </div>

            {filteredData.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                <div className="bg-slate-100 p-4 rounded-full mb-4">
                <Search size={32} />
                </div>
                <p className="text-sm font-bold uppercase tracking-widest">No matching records found</p>
                <p className="text-xs mt-1">Try adjusting your filters or search term</p>
            </div>
            )}
        </div>

        {/* Footer info */}
        <p className="mt-6 text-center text-xs text-slate-400 italic">
            * Showing {filteredData.length} total transactions from the global database.
        </p>
        </div>

       {/* --- MODAL FORM --- */}
        {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
        
        {/* Form Content */}
        <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
            <h2 className="text-lg font-black uppercase tracking-tight">New Transaction</h2>
            <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-1 rounded-lg transition-colors"><X size={20}/></button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
            <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1"><Briefcase size={12}/> Project</label>
                <select 
                required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                value={formData.projectId} onChange={(e) => setFormData({...formData, projectId: e.target.value})}
                >
                <option value="">Select Project</option>
                {projects?.map(p => <option key={p._id} value={p._id}>{p.projectName}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1"><Tag size={12}/> Type</label>
                <select 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                    value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1"><Banknote  size={12}/> Payment</label>
                    <select 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                        value={formData.paymentMethod} onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                    >
                        <option value="Cash">Cash</option>
                        <option value="Bank">Bank</option>
                        <option value="Mobile Bank">Mobile Bank</option>
                    </select>
                </div>
                <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1"><DollarSign size={12}/> Amount</label>
                <input 
                    type="number" required placeholder="0.00"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none font-bold"
                    value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})}
                />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">Endpoint Name</label>
                <input 
                type="text" required placeholder="EndpointName..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                value={formData.endpointName} onChange={(e) => setFormData({...formData, endpointName: e.target.value})}
                />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">Description</label>
                <input 
                type="text" required placeholder="Description..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
            </div>

            <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all flex items-center justify-center gap-2">
                <Save size={16} /> Save Record
            </button>
            </form>
        </div>
        </div>
        )}
    </div>
  );
};

export default GlobalInvestmentTable;
