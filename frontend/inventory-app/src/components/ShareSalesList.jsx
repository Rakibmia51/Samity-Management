import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { 
  ShoppingCart, Search, Plus, X, BadgeDollarSign, Wallet, Layers, TrendingUp, 
  UserCheck, Briefcase, Eye, FileText, Download, Landmark, Smartphone, Banknote, ChevronDown 
} from 'lucide-react';
import InvoicePage from './InvoicePage';
import html2pdf from 'html2pdf.js';

const ShareSales = () => {
  const [sales, setSales] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSale, setSelectedSale] = useState(null); // ইনভয়েসের জন্য ডেটা হোল্ড করবে
   

  const [formData, setFormData] = useState({
    projectId: '', issueId: '', memberId: '', buyerName: '',
    userId: '', quantity: '', availableShares: 0, pricePerShare: 0, totalAmount: 0,
    paymentMethod: 'Cash' // ডিফল্ট পেমেন্ট মেথড
  });

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` } };
      const [salesRes, projRes] = await Promise.all([
        axios.get('http://localhost:3000/api/share-sales', config),
        axios.get('http://localhost:3000/api/projects', config) 
      ]);
      setSales(salesRes.data.shareSales || []);
      setProjects(projRes.data.projects || []);
      setLoading(false);
    } catch (err) { 
      console.error(err);
      setLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleMemberSearch = async (code) => {
    const upperCode = code.toUpperCase();
    setFormData(prev => ({ ...prev, memberId: upperCode }));
    if (upperCode.length >= 5) {
      try {
        const res = await axios.get(`http://localhost:3000/api/users/member-search/${upperCode}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` }
        });
        if (res.data.success) {
          setFormData(prev => ({ ...prev, buyerName: res.data.member.fullName, userId: res.data.member._id }));
        }
      } catch (err) { setFormData(prev => ({ ...prev, buyerName: '', userId: '' })); }
    }
  };

  const handleProjectChange = async (projId) => {
  setFormData(prev => ({ ...prev, projectId: projId }));
  
  if (projId) {
    try {
      const res = await axios.get(`http://localhost:3000/api/shares/latest-price/${projId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` }
      });
      
      if (res.data.success) {
        setFormData(prev => ({ 
          ...prev, 
          pricePerShare: res.data.price, 
          issueId: res.data.issueId,
          // ব্যাকএন্ড থেকে আসা availableShares এখানে সেট করুন
          availableShares: res.data.availableShares || 0, 
          totalAmount: (Number(prev.quantity) || 0) * res.data.price 
        }));
      }
    } catch (err) { 
      setFormData(prev => ({ ...prev, pricePerShare: 0, availableShares: 0 })); 
    }
  }
};


 const handleQtyChange = (qty) => {
  if (Number(qty) > formData.availableShares) {
    alert("Quantity cannot exceed available shares!");
    return;
  }
  setFormData(prev => ({ 
    ...prev, 
    quantity: qty, 
    totalAmount: (Number(qty) || 0) * prev.pricePerShare 
  }));
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!formData.userId) return Swal.fire('Error', 'মেম্বার আইডি সঠিক নয়!', 'error');
    try {
      const res = await axios.post('http://localhost:3000/api/share-sales/create', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` }
      });
      if (res.data.success) {
        Swal.fire('Success', 'বিক্রি সম্পন্ন হয়েছে', 'success');
        setIsModalOpen(false);
        setFormData({ projectId: '', issueId: '', memberId: '', buyerName: '', userId: '', quantity: '', pricePerShare: 0, totalAmount: 0, availableShares: 0, paymentMethod: 'Cash' });
        fetchData();
      }
    } catch (err) { Swal.fire('Error', 'সার্ভারে সমস্যা হয়েছে', 'error'); }
  };

  
  // For Invoice Print
  if (selectedSale) {
    return <InvoicePage sale={selectedSale} onBack={() => setSelectedSale(null)} />;
  }

  // ডাউনলোড ফাংশন 
  const handleDownloadPDF = (sale) => {
    // ১. একটি টেমপ্লেট তৈরি করা (যা স্ক্রিনে দেখা যাবে না)
    const element = document.createElement('div');
    element.innerHTML = `
      <div style="width: 210mm; padding: 40px; font-family: sans-serif; color: #333;">
        <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #065f46; padding-bottom: 20px; margin-bottom: 30px;">
          <div>
            <h1 style="color: #10b981; margin: 0; font-size: 24px;">INVESTMENT RECEIPT</h1>
            <p style="color: #666; margin: 5px 0;">Voucher: <b>${sale.saleNumber}</b></p>
          </div>
          <div style="text-align: right;">
            <h2 style="margin: 0; font-size: 20px;">Your Company Ltd.</h2>
            <p style="color: #666; font-size: 12px;">Motijheel, Dhaka-1000</p>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
          <div>
            <p style="font-size: 10px; color: #10b981; font-weight: bold; text-transform: uppercase;">Investor Details</p>
            <h3 style="margin: 5px 0;">${sale.userId?.fullName}</h3>
            <p style="margin: 0; color: #666; font-size: 13px;">ID: ${sale.userId?.memberCode}</p>
            <p style="margin: 0; color: #666; font-size: 13px;">Date: ${new Date(sale.saleDate).toLocaleDateString('en-GB')}</p>
          </div>
          <div style="text-align: right;">
            <p style="font-size: 10px; color: #10b981; font-weight: bold; text-transform: uppercase;">Payment Details</p>
            <p style="margin: 5px 0; font-weight: bold;">Method: ${sale.paymentMethod}</p>
            <p style="margin: 0; color: #666; font-size: 13px;">Project: ${sale.projectId?.projectName}</p>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 50px;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 2px solid #0f172a;">
              <th style="padding: 12px; text-align: left; font-size: 12px;">Description</th>
              <th style="padding: 12px; text-align: center; font-size: 12px;">Qty</th>
              <th style="padding: 12px; text-align: right; font-size: 12px;">Price</th>
              <th style="padding: 12px; text-align: right; font-size: 12px;">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 20px 12px; border-bottom: 1px solid #f1f5f9;">
                <b>Project Share Purchase</b><br/>
                <small style="color: #666;">${sale.projectId?.projectName}</small>
              </td>
              <td style="padding: 20px 12px; text-align: center; border-bottom: 1px solid #f1f5f9;">${sale.quantity}</td>
              <td style="padding: 20px 12px; text-align: right; border-bottom: 1px solid #f1f5f9;">৳${(sale.totalAmount / sale.quantity).toLocaleString()}</td>
              <td style="padding: 20px 12px; text-align: right; border-bottom: 1px solid #f1f5f9; font-weight: bold;">৳${sale.totalAmount?.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 50px;">
          <div>
            <div style="width: 150px; border-top: 1px solid #000; margin-bottom: 5px;"></div>
            <p style="font-size: 10px; text-transform: uppercase; font-weight: bold; color: #999;">Authorized Signature</p>
          </div>
          <div style="background: #f8fafc; padding: 20px; border-radius: 10px; width: 200px;">
            <p style="margin: 0; font-size: 12px; color: #666;">Total Amount</p>
            <h2 style="margin: 5px 0; color: #10b981;">৳${sale.totalAmount?.toLocaleString()}</h2>
          </div>
        </div>
      </div>
    `;

    // ২. PDF কনফিগারেশন
    const opt = {
      margin: 0,
      filename: `Invoice_${sale.saleNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // ৩. ডাউনলোড রান করা
    html2pdf().set(opt).from(element).save();
  };
// end  ডাউনলোড ফাংশন 


  if (loading) return <div className="h-screen flex items-center justify-center font-black text-emerald-600 animate-pulse text-xl">Loading Data...</div>;

  return (
    <div className="p-4 md:p-8 bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Share Sales</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Transaction Ledger & Registry</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-emerald-100 transition-all active:scale-95">
          <Plus size={20} strokeWidth={3}/> New Sale
        </button>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard title="Total Revenue" value={`৳${sales.reduce((s, i) => s + (i.totalAmount || 0), 0).toLocaleString()}`} icon={<Wallet />} color="bg-emerald-600" />
        <StatCard title="Shares Sold" value={sales.reduce((s, i) => s + (i.quantity || 0), 0).toLocaleString()} icon={<Layers />} color="bg-blue-600" />
        <StatCard title="Total Deals" value={sales.length} icon={<TrendingUp />} color="bg-violet-600" />
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <div className="relative w-full max-w-md group">
            <Search className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
            <input 
              type="text" placeholder="Search by name, voucher or ID..." 
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 font-bold text-slate-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-400">
                <th className="px-8 py-5">Voucher & Date</th>
                <th className="px-4 py-5">Project & Member</th>
                <th className="px-4 py-5">Payment</th>
                <th className="px-4 py-5 text-right">Amount</th>
                <th className="px-4 py-5 text-center">Sold By</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium">
              {sales.filter(s => (s.userId?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) || (s.saleNumber || '').toLowerCase().includes(searchQuery.toLowerCase())).map((sale) => (
                <tr key={sale._id} className="hover:bg-slate-50 transition-all group">
                  <td className="px-8 py-6">
                     <div className="text-[10px] font-bold text-slate-400">{new Date(sale.saleDate).toLocaleDateString('en-GB')}</div>
                     <div className="font-black text-emerald-600 text-sm">{sale.saleNumber}</div>
                  </td>
                  <td className="px-4 py-6">
                    <div className="font-bold text-slate-700 text-sm">{sale.projectId?.projectName}</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase">{sale.userId?.fullName} (ID: {sale.userId?.memberCode})</div>
                  </td>
                  <td className="px-4 py-6">
                    <div className="flex items-center gap-2">
                      {sale.paymentMethod === 'Cash' && <><Banknote size={14} className="text-green-500" /> <span className="text-xs font-bold">Cash</span></>}
                      {sale.paymentMethod === 'Bank' && <><Landmark size={14} className="text-blue-500" /> <span className="text-xs font-bold">Bank</span></>}
                      {sale.paymentMethod === 'Mobile Bank' && <><Smartphone size={14} className="text-pink-500" /> <span className="text-xs font-bold">Mobile</span></>}
                    </div>
                  </td>
                  <td className="px-4 py-6 text-right font-black text-slate-900">
                    <div>৳{sale.totalAmount?.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400">{sale.quantity} Shares</div>
                  </td>
                  <td className="px-4 py-6 text-center">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                      {sale.soldBy?.fullName || 'Admin'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 transition-all">
                      <button className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                         onClick={() => setSelectedSale(sale)} 
                      ><Eye size={16}/></button>
                      <button className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"><FileText size={16}
                        onClick={()  => setSelectedSale(sale)}
                      /></button>
                      <button className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-900 hover:text-white transition-all"
                        onClick={() => handleDownloadPDF(sale)} // এই ফাংশনটি কল হবে
                        title="Download Invoice"
                      ><Download size={16}/></button>
                    
                    
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

        {/* Create Sale Modal */}
        {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-60 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] w-full max-w-2xl overflow-hidden border border-slate-100">
            
            {/* Header */}
            <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center gap-5">
                <div className="bg-emerald-500 p-3.5 rounded-2xl text-white shadow-lg shadow-emerald-200 ring-4 ring-emerald-50">
                    <ShoppingCart size={24} strokeWidth={2.5} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Finalize Sale</h2>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Share Issue Management</p>
                </div>
                </div>
                <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all active:scale-90"
                >
                <X size={24} />
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-7">
                {/* Row 1 */}
                <div className="grid grid-cols-2 gap-8">
                    <div className="group">
                        <label className="text-[11px] font-black text-slate-500 uppercase ml-1 tracking-wider mb-2 block">Member Search</label>
                        <input 
                        required 
                        placeholder="MEM-XXXX" 
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl p-4 outline-none font-bold text-slate-700 transition-all shadow-sm" 
                        value={formData.memberId} 
                        onChange={(e) => handleMemberSearch(e.target.value)} 
                        />
                    </div>
                <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase ml-1 tracking-wider mb-2 block">Buyer Name (Auto)</label>
                    <input 
                    readOnly 
                    placeholder="Waiting for ID..."
                    className="w-full bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-2xl p-4 outline-none font-bold text-slate-500 cursor-not-allowed" 
                    value={formData.buyerName} 
                    />
                </div>
                </div>
                <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-500 uppercase ml-1 tracking-wider mb-2 block">Select Project</label>
                    <div className="relative">
                    <select 
                        required 
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl p-4 outline-none font-bold text-slate-700 transition-all appearance-none cursor-pointer" 
                        value={formData.projectId} 
                        onChange={(e) => handleProjectChange(e.target.value)}
                    >
                        <option value="">Choose Project...</option>
                        {projects.map(p => <option key={p._id} value={p._id}>{p.projectName}</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronDown size={20} />
                    </div>
                    </div>
                </div>
                
                <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-500 uppercase ml-1 tracking-wider mb-2 block">Payment Method</label>
                    <select 
                    required 
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl p-4 outline-none font-bold text-blue-600 transition-all cursor-pointer" 
                    value={formData.paymentMethod} 
                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                    >
                    <option value="Cash">Cash Payment</option>
                    <option value="Bank">Bank Transfer</option>
                    <option value="Mobile Bank">Mobile Banking</option>
                    </select>
                </div>
                </div>

                {/* New Row: Available Shares & Price Per Share */}
                <div className="grid grid-cols-3 gap-6"> {/* ৩ কলামের গ্রিড ব্যবহার করেছি */}
                <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-emerald-600 uppercase ml-1 tracking-wider mb-2 block">Available Shares</label>
                    <div className="relative">
                    <input 
                        readOnly 
                        className="w-full bg-emerald-50 border-2 border-emerald-100 rounded-2xl p-4 outline-none font-black text-emerald-700 cursor-not-allowed" 
                        value={formData.availableShares || 0} 
                    />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-500 uppercase ml-1 tracking-wider mb-2 block">Price Per Share</label>
                    <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">৳</span>
                    <input 
                        readOnly 
                        className="w-full bg-blue-50/30 border-2 border-blue-100 rounded-2xl p-4 pl-9 outline-none font-black text-blue-700" 
                        value={formData.pricePerShare} 
                    />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-500 uppercase ml-1 tracking-wider mb-2 block">Quantity</label>
                    <input 
                        required 
                        type="number" 
                        placeholder={formData.availableShares <= 0 ? "No Stock" : "00"}
                        className={`w-full border-2 rounded-2xl p-4 outline-none font-bold transition-all ${
                            formData.availableShares <= 0 
                            ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60" 
                            : "bg-slate-50 border-transparent focus:border-emerald-500 focus:bg-white text-slate-700 shadow-sm"
                        }`} 
                        value={formData.quantity} 
                        onChange={(e) => handleQtyChange(e.target.value)} 
                        max={formData.availableShares} 
                        disabled={formData.availableShares <= 0} 
                        />

                </div>
                </div>
               



                {/* Total Card */}
                <div className="bg-slate-900 rounded-[2rem] p-8 mt-4 relative overflow-hidden group shadow-2xl shadow-slate-200">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-emerald-500/20 transition-all duration-700"></div>
                <div className="relative flex justify-between items-center">
                    <div>
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">Total Collection</p>
                    <p className="text-4xl font-black text-white tracking-tight">
                        <span className="text-emerald-500 mr-2">৳</span>
                        {Number(formData.totalAmount).toLocaleString()}
                    </p>
                    </div>
                    <div className="text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</p>
                    <p className="text-white font-bold flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Ready to Sync
                    </p>
                    </div>
                </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-5 pt-4">
                <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="px-8 py-4 font-extrabold text-slate-400 hover:text-slate-600 transition-colors"
                >
                    Discard
                </button>
                <button 
                    type="submit" 
                    className="px-14 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[1.5rem] font-black shadow-[0_15px_30px_-10px_rgba(16,185,129,0.5)] transition-all active:scale-95 flex items-center gap-3"
                >
                    Complete Sale
                </button>
                </div>
            </form>
            </div>
        </div>
        )}
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-6 relative overflow-hidden group">
    <div className={`p-4 rounded-2xl text-white ${color} z-10 transition-transform group-hover:scale-110`}>{icon}</div>
    <div className="z-10">
      <p className="text-slate-400 text-xs font-black uppercase tracking-widest">{title}</p>
      <h3 className="text-3xl font-black text-slate-800 mt-1">{value}</h3>
    </div>
    <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full ${color} opacity-[0.05] group-hover:scale-150 transition-all duration-700`}></div>
  </div>
);

export default ShareSales;
