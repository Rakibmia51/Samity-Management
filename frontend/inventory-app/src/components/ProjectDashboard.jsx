import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {TrendingDown, Landmark, Wallet, Eye,LayoutGrid, Activity, DollarSign, TrendingUp, Edit, Trash2, Search, X, Briefcase, PieChart, Calendar, Currency  } from 'lucide-react';
import Swal from 'sweetalert2'; // ডিলিট কনফার্মেশনের জন্য 
import { useNavigate } from 'react-router-dom';


// --- MAIN PROJECT LIST COMPONENT ---
const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // ফিল্টার স্টেট
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // মডেল স্টেট
  const [formData, setFormData] = useState({
    projectName: '',
    initialInvestment: '0',
    reservedOwnership: '0',
    expectedStartDate: '',
    description: '',
    status: 'Pending',
    notes: ''
  });
  const [editId, setEditId] = useState(null); // Track project being edited
  const [shareSales, setShareSales] = useState([]);
  const [endPoint, setEndPoint] = useState([]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/projects', {
        headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` }
      });
      if (response.data.success) {
        console.log(response.data)
        setProjects(response.data.projects);
        setShareSales(response.data)
        setEndPoint(response.data.endPointTotal)
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Data Loading Is Problem!");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

     // --- CREATE & Update PROJECT FUNCTION ---
  const handleSubmite = async (e) => {
   
    e.preventDefault();
    try {
      const url = editId 
        ? `http://localhost:3000/api/projects/update/${editId}` 
        : 'http://localhost:3000/api/projects/create';
      
      const method = editId ? 'put' : 'post';

      const response = await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` }
      });

      if (response.data.success) {
        Swal.fire('Success!', editId ? 'Project updated.' : 'Project created.', 'success');
        closeModal();
        fetchProjects();
      }
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Action failed', 'error');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditId(null);
    setFormData({ projectName: '', initialInvestment: '', reservedOwnership: '', expectedStartDate: '', description: '', status: 'Pending', notes: '' });
  };

  // --- DELETE FUNCTION ---
  const handleDelete = async (id) => {
    // SweetAlert2 দিয়ে কনফার্মেশন বক্স (ঐচ্ছিক কিন্তু প্রফেশনাল)
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
        const response = await axios.delete(`http://localhost:3000/api/projects/delete/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` }
        });
        if (response.data.success) {
          // ডিলিট সফল হলে স্টেট থেকে ওই প্রজেক্টটি ফিল্টার করে সরিয়ে ফেলুন
          setProjects(projects.filter(p => p._id !== id));
          Swal.fire('Deleted!', 'Project has been removed.', 'success');
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

  // --- OPEN EDIT MODAL ---
  const handleEditClick = (project) => {
  setEditId(project._id);
  
  // .split('T')[0] যোগ করা হয়েছে শুধু তারিখের অংশটি নেওয়ার জন্য
  const formattedDate = project.expectedStartDate 
    ? project.expectedStartDate.split('T')[0] 
    : '';

  setFormData({
    projectName: project.projectName || '',
    initialInvestment: project.initialInvestment || '',
    reservedOwnership: project.reservedOwnership || '',
    expectedStartDate: formattedDate, 
    description: project.description || '',
    status: project.status || 'Pending',
    notes: project.notes || ''
  });
  setIsModalOpen(true);
};


 // --- সার্চ এবং ফিল্টারিং লজিক ---
  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      project.projectCode.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="text-center p-10 font-bold text-blue-600">Loading....</div>;
  if (error) return <div className="text-center p-10 text-red-500 font-semibold">{error}</div>;

  return (
    <>
      <ProjectDashboard 
        projects={filteredProjects} 
        statusFilter={statusFilter} 
        setStatusFilter={setStatusFilter} 
        searchQuery={searchQuery} // 
        setSearchQuery={setSearchQuery}
        onDelete={handleDelete} 
        setIsModalOpen={setIsModalOpen}
        onEdit={handleEditClick}
        shareSales={shareSales}
        endPoint = {endPoint}
        
     
      />
      {/* --- ADD and Update PROJECT MODAL --- */}
      {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100">
              <div className="p-6 border-b flex justify-between items-center bg-white">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Briefcase size={20}/></div>
                  <h2 className="text-xl font-bold text-slate-800">{editId ? 'Update Project' : 'New Project Setup'}</h2>
                </div>
                <button onClick={() => {closeModal(false); setIsModalOpen(false)}} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={20}/></button>
              </div>
              
              <form onSubmit={handleSubmite} className="p-8 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Project Title</label>
                    <input required placeholder="Enter project name..." className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/50" 
                      value={formData.projectName} onChange={(e) => setFormData({...formData, projectName: e.target.value})} />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Initial Investment</label>
                    <div className="relative">
                      <Currency  size={16} className="absolute left-3 top-3.5 text-slate-400" />
                      <input required type="number" placeholder="0.00" className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-slate-50/50"
                        value={formData.initialInvestment} onChange={(e) => setFormData({...formData, initialInvestment: e.target.value})} min='0' />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Reserved Ownership (%)</label>
                    <div className="relative">
                      <PieChart size={16} className="absolute left-3 top-3.5 text-slate-400" />
                      <input required type="number" max="100" placeholder="25" className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-slate-50/50"
                        value={formData.reservedOwnership} onChange={(e) => setFormData({...formData, reservedOwnership: e.target.value})}  min='0' />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Start Date</label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-3 top-3.5 text-slate-400" />
                      <input required type="date" className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-slate-50/50"
                        value={formData.expectedStartDate} onChange={(e) => setFormData({...formData, expectedStartDate: e.target.value})} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Status</label>
                    <select className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-slate-50/50"
                      value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                      <option value="Pending">Pending</option>
                      <option value="Active">Active</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Detailed Description</label>
                  <textarea required placeholder="Briefly describe the project objectives..." className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-slate-50/50" rows="3"
                    value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
                </div>

                 <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Notes</label>
                  <textarea required placeholder="Briefly Notes the project..." className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-slate-50/50" rows="2"
                    value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})}></textarea>
                </div>


                <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                  <button type="button" onClick={() => {closeModal(false); setIsModalOpen(false)}} className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-all">Discard</button>
                  <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
                  >{editId ? 'Update Changes' : 'Launch Project'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

    </>
       


  );
};

// --- DASHBOARD UI COMPONENT ---
const ProjectDashboard = ({ 
      projects = [], 
      statusFilter, 
      setStatusFilter, 
      searchQuery, 
      setSearchQuery, 
      onDelete,
      setIsModalOpen,
      onEdit,
      shareSales=[],
      endPoint = []
      // onView 
    
    }
    ) => {
        // ড্যাশবোর্ড কার্ডের জন্য ক্যালকুলেশন (ফিল্টার করা ডাটা অনুযায়ী)

        // const totalInvestment = projects.reduce((sum, p) => sum + (p.initialInvestment || 0), 0);
        const totalInvestment = shareSales.overallTotals.totalShareSales;
        // const netProfit = projects.reduce((sum, p) => sum + ((p.currentValue || 0) - (p.initialInvestment || 0)), 0);
        const netProfit = endPoint.totalProfit;

          const getProjectWiseSales = () => {
              if (!projects || projects.length === 0) return [];

              return projects.map(project => {
                // আইডি অবজেক্ট বা স্ট্রিং যাই হোক তা বের করে নেওয়া
                // এখানে আমরা আইডিটিকে স্ট্রিং বানিয়ে নিচ্ছি
                const stringId = project._id?.$oid || project._id;


                // shareSales থেকে এই প্রজেক্টের মোট শেয়ার হিসাব করা
              const totalSold = (shareSales?.shareSales || [])
                .filter(sale => (sale.projectId?.$oid || sale.projectId) === stringId)
                .reduce((sum, sale) => sum + sale.totalAmount, 0);



              // আপডেট করা লজিক (Income - Expense) Profit value
              const endPoint = (shareSales?.endPoints || [])
                .filter(end => (end.projectId?._id.$oid || end.projectId._id) === stringId)
                .reduce((acc, end) => {
                  if(end.type === "Income"){
                    return acc + end.amount;
                  }else if (end.type === "Expense"){
                    return acc - end.amount;
                  }
                  return acc;
                }, 0)

                return {
                   ...project, // প্রজেক্টের সব অরিজিনাল ডাটা রাখলাম
                  id: stringId, // ইউনিক স্ট্রিং আইডি
                  totalSold: totalSold || 0,
                  endPointTotal: (totalSold + endPoint) || 0,
                  roi : (endPoint / totalSold *100) || 0
                };
              });
          };
          const tableData = getProjectWiseSales();



         const navigate = useNavigate();
        return (
        
          <div className="p-6 bg-gray-50 min-h-screen">
            {/* --- DASHBOARD CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <StatCard title="Total Projects" value={projects.length} icon={<LayoutGrid />} color="bg-blue-600" />
              <StatCard title="Active Projects" value={projects.filter(p => p.status === 'Active').length} icon={<Activity />} color="bg-green-600" />

              <StatCard title="Total Investment" value={`${totalInvestment.toLocaleString()}`} icon={<DollarSign />} color="bg-indigo-600" />
              <StatCard title="Net Profit" value={`${netProfit.toLocaleString()}`} icon={<TrendingUp />} color="bg-emerald-600" />
            </div>

            {/* --- PROJECTS TABLE SECTION --- */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                <h2 className="text-xl font-bold text-gray-800">Project Overview</h2>
                
                <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 w-full lg:w-auto">
                      <div className="relative w-full sm:w-64 md:w-80 group">
                          {/* সার্চ ইনপুট */}
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                          </div>
                          <input 
                              type="text"
                              placeholder="Search by Name or Code..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-sm rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none"
                          />
                      </div>

                      {/* --- STATUS FILTER --- */}
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                          <select 
                              value={statusFilter}
                              onChange={(e) => setStatusFilter(e.target.value)}
                              className="flex-1 sm:w-40 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl py-2.5 px-3 outline-none cursor-pointer hover:bg-gray-100 transition-all font-medium"
                              >
                              <option value="All">All Status</option>
                              <option value="Pending">Pending</option>
                              <option value="Active">Active</option>
                              <option value="On Hold">On Hold</option>
                              <option value="Closed">Closed</option>
                          </select>
                      </div>

                      <button  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all active:scale-95 shadow-md"
                          onClick={()=> setIsModalOpen(true)}
                      >
                          <LayoutGrid size={18} className="hidden xs:block" />
                          <span className="whitespace-nowrap">+ New Project</span>
                          
                      </button>
                </div>

              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
                    <tr>
                      <th className="px-6 py-4">Code</th>
                      <th className="px-6 py-4">Project Name</th>
                      <th className="px-6 py-4 text-right">Investment</th>
                      <th className="px-6 py-4 text-right">Current Value</th>
                      <th className="px-6 py-4 text-center">ROI</th>
                      <th className="px-6 py-4">Start Date</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tableData.length > 0 ? tableData.map((project) => (
                      <tr key={project._id?.$oid || project._id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium text-blue-600">{project.projectCode}</td>
                        <td className="px-6 py-4 text-gray-800 font-semibold">{project.projectName}</td>
                        <td className="px-6 py-4 text-right text-gray-600">{project.totalSold.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right text-gray-600">{project.endPointTotal.toLocaleString() || 0}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`font-bold ${project.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {project.roi.toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-sm">
                          {new Date(project.expectedStartDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <StatusBadge status={project.status} />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center space-x-2">

                             {/* Table-er bitore View Button projectCode /admin-dashboard/projects/:id*/}
                            <button 
                               onClick={() => navigate(`/admin-dashboard/projects/${project._id}`)}  
                                className="group relative flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg hover:bg-emerald-600 hover:text-white transition-all duration-300 border border-emerald-100 hover:shadow-lg hover:shadow-emerald-100"
                                title="View Details"
                            >
                                <div className="relative">
                                    <Eye size={16} className="group-hover:scale-110 transition-transform duration-300" />
                                    {/* আইকনের উপরে একটি ছোট পালস ডট যা হোভার করলে দেখা যাবে */}
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping"></span>
                                </div>
                                
                            </button>

                            <button title="Edit" className="p-2.5 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all border border-blue-50 hover:shadow-lg hover:shadow-blue-100"
                              onClick={()=> onEdit(project)}
                            >
                              <Edit size={16}/>
                            </button>
                            <button  title="Delete" className="p-2.5 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all border border-red-50 hover:shadow-lg hover:shadow-red-100"
                              onClick={() => onDelete(project._id)}
                            >
                              <Trash2 size={16}/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="8" className="text-center py-10 text-gray-400">No projects found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
};

// --- HELPER COMPONENTS ---
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
    <div className={`${color} p-3 rounded-xl text-white`}>{icon}</div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const colors = {
    Active: "bg-green-100 text-green-700 border-green-200",
    Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Closed: "bg-gray-100 text-gray-700 border-gray-200",
    "On Hold": "bg-red-100 text-red-700 border-red-200"
  };
  return <span className={`px-3 py-1 rounded-full text-xs font-bold border ${colors[status] || colors.Pending}`}>{status}</span>;
};

const calculateROI = (p) => {
  if (!p.currentValue || p.initialInvestment === 0) return 0;
  return (((p.currentValue - p.initialInvestment) / p.initialInvestment) * 100).toFixed(1);
};

// --- DETAIL CARD COMPONENT ---
const DetailCard = ({ title, value, icon }) => (
  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
    <div className="p-3 bg-slate-50 rounded-2xl">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{title}</p>
      <p className="text-lg font-black text-slate-800">৳{value?.toLocaleString() || 0}</p>
    </div>
  </div>
);

export default ProjectList;
