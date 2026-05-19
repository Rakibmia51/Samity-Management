import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutGrid, Plus, Search, Calendar, BadgeDollarSign, 
  Layers, Hash, X, Briefcase, Info, Edit, Trash2  
} from 'lucide-react';
import Swal from 'sweetalert2';

const ShareIssueList = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState([]); // প্রজেক্ট ড্রপডাউনের জন্য
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    projectId: '', issueDate: new Date().toISOString().split('T')[0],
    totalQuantity: '', pricePerShare: '', totalValue: 0, notes: ''
  });
  const [editId, setEditId] = useState(null);


  const fetchIssues = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/shares', {
        headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` }
      });
      if (res.data.success) setIssues(res.data.shares); // আপনার API রেসপন্স অনুযায়ী
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };


 //  প্রজেক্ট লিস্ট ফেচ করা (ড্রপডাউনের জন্য)
  const fetchProjects = async () => {
    const res = await axios.get('http://localhost:3000/api/projects', {
      headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` }
    });
    if (res.data.success) setProjects(res.data.projects);
  };

    useEffect(() => { 
        fetchIssues(); 
        fetchProjects();
    }, []);

    // ইনপুট হ্যান্ডেলার (অটো ক্যালকুলেশন সহ)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let updatedData = { ...formData, [name]: value };

    if (name === 'totalQuantity' || name === 'pricePerShare') {
      updatedData.totalValue = (Number(updatedData.totalQuantity) || 0) * (Number(updatedData.pricePerShare) || 0);
    }
    setFormData(updatedData);
  };

  // সাবমিট হ্যান্ডেলার (Create & Update একসাথ করা)
const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const url = editId 
            ? `http://localhost:3000/api/shares/update/${editId}` 
            : 'http://localhost:3000/api/shares/create';
        
        const response = await axios[editId ? 'put' : 'post'](url, formData, {
            headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` }
        });

        if (response.data.success) {
            Swal.fire('Success!', editId ? 'Updated' : 'Created', 'success');
            closeModal();
            fetchIssues();
        }
    } catch (err) {
        Swal.fire('Error', 'Action failed', 'error');
    }
};

  // এডিট বাটনে ক্লিক করলে ডাটা লোড হবে
    const handleEditClick = (issue) => {
        setEditId(issue._id);
        setFormData({
            projectId: issue.projectId?._id || issue.projectId,
            issueDate: issue.issueDate.split('T')[0],
            totalQuantity: issue.totalQuantity,
            pricePerShare: issue.pricePerShare,
            totalValue: issue.totalValue,
            notes: issue.notes || ''
        });
        setIsModalOpen(true);
    };
  

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
            });
            if (result.isConfirmed) {
                try {
                    const response = await axios.delete(`http://localhost:3000/api/shares/delete/${id}`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` }
                    });
                   if (response.data.success) {
                    setIssues(issues.filter(i => i._id !== id));
                    Swal.fire('Deleted!', response.data.message || 'ShareIssue has been removed.', 'success');
                }
                } catch (err) {
                     const errorMessage = err.response?.data?.message || 'Something went wrong!';
                    Swal.fire({
                      title: 'Access Denied!',
                      text: errorMessage,
                      icon: 'error',
                      confirmButtonColor: '#2563eb'
                    });
                }
            }
    };

    const closeModal = () => {
        setIsModalOpen(false); // মডাল বন্ধ হবে
        setEditId(null);       // এডিট আইডি মুছে যাবে (যাতে ক্রিয়েট মোড ফিরে আসে)
        setFormData({          // ফরম একদম খালি হয়ে যাবে
            projectId: '',
            issueDate: new Date().toISOString().split('T')[0],
            totalQuantity: '',
            pricePerShare: '',
            totalValue: 0,
            notes: ''
        });
    }

  // ড্যাশবোর্ড ক্যালকুলেশন
  const totalSharesIssued = issues.reduce((sum, i) => sum + (i.totalQuantity || 0), 0);
  const totalMarketValue = issues.reduce((sum, i) => sum + (i.totalValue || 0), 0);

  const filteredIssues = issues.filter(i => 
    i.issueNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
    i.projectId?.projectName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="p-10 text-center font-bold text-blue-600">Loading Share Data...</div>;

  return (
    <div className="p-6 md:p-10 bg-[#f9fafb] min-h-screen">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Share Issuance</h1>
          <p className="text-slate-500 font-medium">Manage and track project share distributions</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95"
            onClick={()=> setIsModalOpen(true)}
        >
          <Plus size={20}/> Issue New Shares
        </button>
      </div>

      

      {/* --- STAT CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard title="Total Issues" value={issues.length} icon={<Hash size={24}/>} color="bg-blue-500" />
        <StatCard title="Total Quantity" value={totalSharesIssued.toLocaleString()} icon={<Layers size={24}/>} color="bg-indigo-500" />
        <StatCard title="Total Issued Value" value={`৳${totalMarketValue.toLocaleString()}`} icon={<BadgeDollarSign size={24}/>} color="bg-emerald-500" />
      </div>

      {/* --- TABLE SECTION --- */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-white flex justify-between items-center">
          <div className="relative w-full max-w-md group">
            <Search className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by Issue No or Project..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-[0.15em] font-black">
                <th className="px-8 py-5">Issue Info</th>
                <th className="px-4 py-5">Related Project</th>
                <th className="px-4 py-5 text-right">Quantity</th>
                <th className="px-4 py-5 text-right">Price/Share</th>
                <th className="px-4 py-5 text-right">Total Value</th>
                <th className="px-8 py-5 text-center">Date</th>
                <th className="px-8 py-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredIssues.map((issue) => (
                <tr key={issue._id} className="hover:bg-blue-50/30 transition-all group">
                  <td className="px-8 py-6">
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border border-blue-100">
                      {issue.issueNumber}
                    </span>
                  </td>
                  <td className="px-4 py-6 font-bold text-slate-700">
                    {issue.projectId?.projectName || 'N/A'}
                  </td>
                  <td className="px-4 py-6 text-right font-bold text-slate-600">
                    {issue.totalQuantity.toLocaleString()}
                  </td>
                  <td className="px-4 py-6 text-right font-medium text-slate-500">
                    ৳{issue.pricePerShare.toLocaleString()}
                  </td>
                  <td className="px-4 py-6 text-right">
                    <span className="font-black text-indigo-600 text-sm">
                      ৳{issue.totalValue.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center text-xs font-bold text-slate-400 flex items-center justify-center gap-2">
                    <Calendar size={14}/>
                    {new Date(issue.issueDate).toLocaleDateString('en-GB')}
                  </td>

                    <td className="px-8 py-6 text-center">
                        <div className="flex justify-center gap-2">
                            <button 
                                onClick={() => handleEditClick(issue)}
                                className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                            >
                                <Edit size={16}/>
                            </button>
                            <button 
                                onClick={() => handleDelete(issue._id)}
                                className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                            >
                                <Trash2 size={16}/>
                            </button>
                        </div>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
        {/* --- NEW ISSUE MODAL --- */}
        {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden border border-slate-100 animate-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-2">
                <Briefcase className="text-blue-600" size={22} /> 
                <h2 className="text-xl font-black text-slate-800">{editId ? 'Update Project Share Issue' : 'Issue Project Shares'}</h2>
                </div>
                <button onClick={closeModal} className="p-2 hover:bg-white rounded-full transition-colors">
                <X size={20}/>
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
                {/* Project Selection */}
                <div>
                <label className="text-xs font-black text-slate-400 uppercase mb-2 block tracking-widest">Select Project</label>
                <select 
                    required 
                    name="projectId" 
                    className="w-full bg-slate-50 rounded-xl p-3 outline-none border-none font-bold text-slate-600 focus:ring-2 focus:ring-blue-500/20" 
                    value={formData.projectId} 
                    onChange={handleInputChange}
                >
                    <option value="">Choose a project...</option>
                    {projects.map(p => <option key={p._id} value={p._id}>{p.projectName}</option>)}
                </select>
                </div>

                {/* Quantity and Price */}
                <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-black text-slate-400 uppercase mb-2 block tracking-widest">Quantity</label>
                    <input required name="totalQuantity" type="number" placeholder="500" className="w-full bg-slate-50 rounded-xl p-3 outline-none border-none focus:ring-2 focus:ring-blue-500/20" value={formData.totalQuantity} onChange={handleInputChange}/>
                </div>
                <div>
                    <label className="text-xs font-black text-slate-400 uppercase mb-2 block tracking-widest">Price Per Share</label>
                    <input required name="pricePerShare" type="number" placeholder="100" className="w-full bg-slate-50 rounded-xl p-3 outline-none border-none focus:ring-2 focus:ring-blue-500/20" value={formData.pricePerShare} onChange={handleInputChange}/>
                </div>
                </div>

                {/* Calculation Result */}
                <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 flex justify-between items-center shadow-inner">
                <div className="flex items-center gap-2">
                    <BadgeDollarSign size={18} className="text-blue-600" />
                    <span className="text-xs font-black text-blue-600 uppercase">Total Issuance Value</span>
                </div>
                <span className="text-xl font-black text-blue-700">৳{formData.totalValue.toLocaleString()}</span>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                <button type="button" onClick={closeModal} className="px-6 py-3 font-bold text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
                <button type="submit" className="px-10 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 active:scale-95 transition-all">{editId ? 'Updated Issuance' : "Confirm Issuance"}</button>
                </div>
            </form>
            </div>
        </div>
        )}
    </div>
  );
};

// --- HELPER COMPONENTS ---
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-7 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-6 relative overflow-hidden group">
    <div className={`p-4 rounded-2xl text-white ${color} shadow-lg transition-transform group-hover:scale-110 duration-300 z-10`}>
      {icon}
    </div>
    <div className="z-10">
      <p className="text-slate-400 text-xs font-black uppercase tracking-widest">{title}</p>
      <h3 className="text-2xl font-black text-slate-800 mt-1">{value}</h3>
    </div>
    <div className={`absolute -right-6 -bottom-6 w-28 h-28 rounded-full ${color} opacity-[0.03] group-hover:scale-150 transition-all duration-700`}></div>
  </div>
);

export default ShareIssueList;