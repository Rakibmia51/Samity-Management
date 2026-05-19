import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { User, Calendar, Phone, Hash, TrendingUp, PieChart, Briefcase, Tag, LayoutGrid } from 'lucide-react';

const MemberShares = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [sales, setSales] = useState(null);
  const [projectShares, setProjectShares] = useState({});


  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/memberSide/my-stats`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` }
        });
        if (res.data.success) {
          setData(res.data.data);
        }

        const token = localStorage.getItem('pos-token');
        const resUser = await axios.get('http://localhost:3000/api/users/profile', {
            headers: { Authorization: `Bearer ${token}` }
        });
        setUser(resUser.data.user);
        // console.log(resUser.data.user)

        const resShareSales = await axios.get(`http://localhost:3000/api/share-sales`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` }
        });
        if (resShareSales.data.success) {
          setSales(resShareSales.data.shareSales);
          console.log(resShareSales.data.shareSales)
        }
         // ২. নতুন: প্রোজেক্টের টোটাল শেয়ার ডাটা ফেচ করা
        const resTotalShares = await axios.get(`http://localhost:3000/api/shares`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` }
        });
        // প্রজেক্ট আইডি অনুযায়ী টোটাল শেয়ার ম্যাপ করা
        const shareMap = {};
        resTotalShares.data.shares.forEach(item => {
          shareMap[item.projectId?._id] = item.totalQuantity;
        });
         setProjectShares(shareMap);

      } catch (error) {
        console.error("Portfolio fetch error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, []);

  // ৩. প্রোজেক্ট অনুযায়ী ডাটা গ্রুপিং (টেবিলের জন্য)
const projectWiseData = sales?.reduce((acc, curr) => {
    // শুধুমাত্র যদি এই সেলের userId এবং আমাদের লগইন করা ইউজার আইডি মিলে যায়
    const currentUserId = user?._id;
    const saleUserId = curr.userId?._id || curr.userId;

    if (saleUserId === currentUserId) {
        const pId = curr.projectId?._id;
        if (pId) {
            if (!acc[pId]) {
                acc[pId] = {
                    projectName: curr.projectId?.projectName || "Unknown",
                    projectCode: curr.projectId?.projectCode || "N/A",
                    totalShares: 0,
                    totalInvestment: 0,
                    projectTotalQty: projectShares[pId] || 0 
                };
            }
            acc[pId].totalShares += curr.quantity || 0;
            acc[pId].totalInvestment += curr.totalAmount || 0;
        }
    }
    return acc;
}, {});

const projectList = Object.values(projectWiseData || {}).map(item => ({
  ...item,
  // ওনারশিপ ক্যালকুলেশন: (আমার শেয়ার / প্রজেক্টের মোট শেয়ার) * ১০০
  ownership: item.projectTotalQty > 0 
    ? ((item.totalShares / item.projectTotalQty) * 100).toFixed(0) 
    : "0.00"
}));
  

  if (loading) return <div className="p-10 text-center font-bold">Loading Portfolio...</div>;

  // Average Price Calculation: Total Investment / Total Shares
  const avgPrice = data?.totalShares > 0 ? (data.totalInvestment / data.totalShares) : 0;

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <h1 className="text-2xl font-black text-gray-800 mb-8 uppercase tracking-widest border-l-4 border-indigo-600 pl-4">
        My Share Portfolio
      </h1>

      {/* 1st Row: Member Information */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8">
        <div className="flex items-center gap-2 mb-6 text-indigo-600">
           <User size={20} strokeWidth={3} />
           <span className="font-black uppercase tracking-tighter">Member Information</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <InfoItem icon={<Hash size={18}/>} label="Member Code" value={user?.memberCode || "N/A"} />
          <InfoItem icon={<User size={18}/>} label="Full Name" value={user?.fullName || "N/A"} />
          <InfoItem icon={<Phone size={18}/>} label="Mobile" value={user?.mobile || "N/A"} />
          <InfoItem icon={<Calendar size={18}/>} label="Admission Date" value={new Date(user?.admissionDate).toLocaleDateString() || "N/A"} />
        </div>
      </div>

      {/* 2nd Row: Investment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Investment" 
          value={`৳ ${data?.totalInvestment?.toLocaleString()}`} 
          icon={<TrendingUp className="text-blue-600" />} 
          bg="bg-blue-50"
        />
        <StatCard 
          title="Total Shares" 
          value={`${data?.totalShares || 0} Units`} 
          icon={<PieChart className="text-emerald-600" />} 
          bg="bg-emerald-50"
        />
        <StatCard 
          title="Projects Invested" 
          value={data?.projectsInvested || 0} 
          icon={<Briefcase className="text-purple-600" />} 
          bg="bg-purple-50"
        />
        <StatCard 
          title="Average Share Price" 
          value={`৳ ${avgPrice.toFixed(2)}`} 
          icon={<Tag className="text-orange-600" />} 
          bg="bg-orange-50"
        />
      </div>

      {/* Row 3: Investment by Project Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center gap-2 text-indigo-600">
          <LayoutGrid size={20} strokeWidth={3} />
          <span className="font-black uppercase tracking-tighter text-sm">Investment by Project</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                <th className="p-4">Project Name</th>
                <th className="p-4">Project Code</th>
                <th className="p-4 text-center">Total Shares</th>
                 <th className="p-4 text-center">Ownership %</th> 
                <th className="p-4 text-right">Investment Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {projectList.length > 0 ? projectList.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-bold text-gray-800">{item.projectName}</td>
                  <td className="p-4 font-medium text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold">{item.projectCode}</span>
                  </td>
                  <td className="p-4 font-black text-center text-indigo-600">{item.totalShares}</td>
                   <td className="p-4 text-center font-black text-orange-600">{item.ownership}%</td>
                  <td className="p-4 font-black text-right text-emerald-600">৳ {item.totalInvestment.toLocaleString()}</td>
                </tr>
              )) : (
                <tr><td colSpan="4" className="p-10 text-center text-gray-300 font-bold">No project investments found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>


    </div>
  );
};

// মেম্বার ইনফরমেশন আইটেম কম্পোনেন্ট
const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="text-gray-400 mt-1">{icon}</div>
    <div>
      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider leading-none mb-1">{label}</p>
      <p className="text-gray-800 font-bold">{value}</p>
    </div>
  </div>
);

// স্ট্যাটাস কার্ড কম্পোনেন্ট
const StatCard = ({ title, value, icon, bg }) => (
  <div className={`${bg} rounded-2xl p-6 border border-white shadow-sm transition-all hover:shadow-md`}>
    <div className="bg-white w-10 h-10 rounded-xl flex items-center justify-center mb-4 shadow-sm">
      {icon}
    </div>
    <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1">{title}</p>
    <h3 className="text-2xl font-black text-gray-800">{value}</h3>
  </div>
);

export default MemberShares;
