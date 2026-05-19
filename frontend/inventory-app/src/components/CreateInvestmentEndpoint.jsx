import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, TrendingUp, TrendingDown, Wallet, Calendar, Plus, X, Save, Briefcase, Tag, DollarSign } from 'lucide-react';

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
    projectId: '', endpointName: '', type: 'Income', amount: '', date: new Date().toISOString().split('T')[0]
  });

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/endpoints');
      if (response.data.success) {
        setAllData(response.data.data);
        setOverallTotals(response.data.overallTotals);
      }
      // প্রজেক্ট লিস্ট লোড করা
      const projRes = await axios.get('http://localhost:3000/api/projects');
      setProjects(projRes.data.data);
    } catch (error) {
      console.error("Data load error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/endpoints', formData);
      setIsModalOpen(false); // ফর্ম বন্ধ করা
      fetchData(); // টেবিল ডাটা রিফ্রেশ করা
      setFormData({ projectId: '', endpointName: '', type: 'Income', amount: '', date: new Date().toISOString().split('T')[0] });
    } catch (error) {
      alert("Error saving data!");
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  const filteredData = allData.filter(item => {
    const matchesType = filterType === 'All' || item.type === filterType;
    const matchesSearch = item.endpointName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.projectId?.projectName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="p-4 md:p-8 bg-[#f8fafc] min-h-screen relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Header with Add Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800">Finance Dashboard</h1>
            <p className="text-sm text-slate-500 font-medium">Manage your global investments & expenses</p>
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
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase">Income</span>
              <TrendingUp size={18} className="text-emerald-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-800">{overallTotals.totalIncome.toLocaleString()} TK</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-1 rounded-full uppercase">Expense</span>
              <TrendingDown size={18} className="text-rose-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-800">{overallTotals.totalExpense.toLocaleString()} TK</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100 ring-1 ring-indigo-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full uppercase">Profit</span>
              <Wallet size={18} className="text-indigo-500" />
            </div>
            <h3 className="text-2xl font-black text-indigo-600">{overallTotals.totalProfit.toLocaleString()} TK</h3>
          </div>
        </div>

        {/* 2. Filter & Table (Your existing design) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
           <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 justify-between">
              <input 
                type="text" placeholder="Search..." 
                className="px-4 py-2 text-sm border border-slate-200 rounded-lg outline-none w-full md:w-64 focus:border-indigo-500"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select className="px-4 py-2 text-sm border border-slate-200 rounded-lg outline-none" onChange={(e) => setFilterType(e.target.value)}>
                <option value="All">All Types</option>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>
           </div>
           {/* Table Content... (Same as before) */}
           <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                   <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Project</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Type</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Amount</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Date</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredData.map(item => (
                    <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-sm text-slate-700">{item.projectId?.projectName}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase ${item.type === 'Income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{item.type}</span>
                      </td>
                      <td className={`px-6 py-4 font-black text-sm ${item.type === 'Income' ? 'text-emerald-600' : 'text-rose-500'}`}>{item.amount.toLocaleString()} TK</td>
                      <td className="px-6 py-4 text-xs text-slate-400">{new Date(item.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
             </table>
           </div>
        </div>
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
                  {projects.map(p => <option key={p._id} value={p._id}>{p.projectName}</option>)}
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
                  type="text" required placeholder="Description..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                  value={formData.endpointName} onChange={(e) => setFormData({...formData, endpointName: e.target.value})}
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
