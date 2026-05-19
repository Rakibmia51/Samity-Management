import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Wallet, Clock, CalendarDays, Briefcase, 
  Search, Printer, CheckCircle2, LayoutGrid 
} from 'lucide-react';

const MyProfit = () => {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem("pos-token")}` };
        
        // ১. ইউজার প্রোফাইল আনা
        const resUser = await axios.get('http://localhost:3000/api/users/profile', { headers });
        const myId = resUser.data.user._id;
        setUser(resUser.data.user);

        // ২. পে-আউট ডাটা আনা এবং ফিল্টার করা
        const payoutRes = await axios.get(`http://localhost:3000/api/payouts`, { headers });
        if (payoutRes.data.success) {
          const myPayouts = payoutRes.data.data.filter(item => 
            (item.memberId?._id || item.memberId) === myId
          );
          setPayouts(myPayouts);
        }
      } catch (error) {
        console.error("Profit data fetch error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ড্যাশবোর্ড ক্যালকুলেশন
  const totalReceived = payouts
    .filter(p => p.status === "Paid")
    .reduce((sum, p) => sum + (p.totalProfitAmount || 0), 0);

  const totalPending = payouts
    .filter(p => p.status === "Pending")
    .reduce((sum, p) => sum + (p.totalProfitAmount || 0), 0);

  const totalProjects = new Set(payouts.map(p => p.projectId?._id)).size;

  // সার্চ লজিক
  const filteredHistory = payouts.filter(item => {
    const projectName = item.projectId?.projectName?.toLowerCase() || "";
    const monthYear = `${item.month}-${item.year}`;
    const search = searchTerm.toLowerCase();
    return projectName.includes(search) || monthYear.includes(search);
  });

  // টেবিলের টোটাল ক্যালকুলেশন
  const sumShares = filteredHistory.reduce((sum, i) => sum + (i.sharesOwned || 0), 0);
  const sumProfit = filteredHistory.reduce((sum, i) => sum + (i.totalProfitAmount || 0), 0);

  const handlePrint = () => window.print();

  if (loading) return <div className="p-10 text-center font-bold text-indigo-600">Loading Profit Details...</div>;

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans print:bg-white print:p-0">
      
      {/* ----------------- UI Header (Screen Only) ----------------- */}
      <div className="flex justify-between items-center mb-8 print:hidden">
        <h1 className="text-2xl font-black text-gray-800 uppercase tracking-widest border-l-4 border-emerald-500 pl-4">
          My Profit Overview
        </h1>
        <button onClick={handlePrint} className="flex items-center gap-2 bg-gray-800 text-white px-5 py-2 rounded-xl font-bold hover:bg-black transition-all shadow-lg">
          <Printer size={18} /> Print Statement
        </button>
      </div>

      {/* ----------------- Row 1: Stats (Screen Only) ----------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 print:hidden">
        <StatCard title="Total Received" value={`৳ ${totalReceived.toLocaleString()}`} icon={<CheckCircle2 className="text-emerald-600" />} bg="bg-emerald-50" />
        <StatCard title="Pending Profit" value={`৳ ${totalPending.toLocaleString()}`} icon={<Clock className="text-amber-600" />} bg="bg-amber-50" />
        <StatCard title="Year to Date" value={`৳ ${totalReceived.toLocaleString()}`} icon={<CalendarDays className="text-blue-600" />} bg="bg-blue-50" />
        <StatCard title="Total Projects" value={totalProjects} icon={<Briefcase className="text-purple-600" />} bg="bg-purple-50" />
      </div>

      {/* ----------------- Row 2: Member Info (Screen Only) ----------------- */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-8 print:hidden">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <InfoBox label="Member Code" value={user?.memberCode} />
          <InfoBox label="Full Name" value={user?.fullName} />
          <InfoBox label="Mobile" value={user?.mobile} />
          <div className="bg-emerald-600 p-4 rounded-2xl text-white">
            <p className="text-[10px] uppercase font-bold opacity-80 tracking-widest">Available Profit</p>
            <p className="text-xl font-black">৳ {totalReceived.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* ----------------- Row 3: Profit Table (Main View) ----------------- */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden print:hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-gray-700">
             <LayoutGrid size={20} className="text-emerald-600" />
             <span className="font-black uppercase tracking-tighter">Profit Distribution History</span>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" placeholder="Search project or date..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                <th className="p-4">Month & Year</th>
                <th className="p-4">Project</th>
                <th className="p-4 text-center">Shares</th>
                <th className="p-4 text-right">Profit Amount</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredHistory.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50/30 transition-colors text-sm">
                  <td className="p-4 font-bold text-gray-700">{`${row.month}-${row.year}`}</td>
                  <td className="p-4 font-medium text-gray-600">{row.projectId?.projectName || "N/A"}</td>
                  <td className="p-4 text-center font-bold text-indigo-600">{row.sharesOwned}</td>
                  <td className="p-4 text-right font-black text-emerald-600">৳ {row.totalProfitAmount?.toLocaleString()}</td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      row.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-100/50 font-black border-t">
              <tr>
                <td className="p-4 text-gray-800 uppercase tracking-widest text-[10px]">Grand Total</td>
                <td className="p-4"></td>
                <td className="p-4 text-center text-indigo-700">{sumShares}</td>
                <td className="p-4 text-right text-emerald-700">৳ {sumProfit.toLocaleString()}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ----------------- PRINT TEMPLATE (Hidden on Screen) ----------------- */}
      <div className="hidden print:block p-4 bg-white text-black w-full absolute top-0 left-0">
        
        <div className="flex justify-between items-center border-b-4 border-gray-900 pb-6 mb-8">
          <div className="flex items-center gap-4">
             {/* <img src="/" alt="Logo" className="h-16 w-auto" /> */}
             <div>
               <h1 className="text-3xl font-black uppercase">Profit Statement</h1>
               <p className="text-sm font-bold text-gray-500">Member: {user?.fullName} ({user?.memberCode})</p>
             </div>
          </div>
          <div className="text-right">
             <p className="text-sm font-bold italic">Statement Date: {new Date().toLocaleDateString()}</p>
             <p className="text-xs">System Generated Report</p>
          </div>
        </div>

        <table className="w-full text-left border-collapse border-b-2 border-gray-900">
          <thead>
            <tr className="border-b-2 border-gray-900 text-[11px] font-black uppercase text-black">
              <th className="py-3 pr-4">Month & Year</th>
              <th className="py-3 px-4">Project Name</th>
              <th className="py-3 px-4 text-center">Share Qty</th>
              <th className="py-3 pl-4 text-right">Profit Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {filteredHistory.map((row, index) => (
              <tr key={index} className="text-sm">
                <td className="py-4 pr-4 font-bold">{`${row.month}-${row.year}`}</td>
                <td className="py-4 px-4 font-medium">{row.projectId?.projectName}</td>
                <td className="py-4 px-4 text-center">{row.sharesOwned}</td>
                <td className="py-4 pl-4 text-right font-black">৳ {row.totalProfitAmount?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-gray-900">
            <tr className="font-black text-lg uppercase">
              <td colSpan="2" className="py-6">Total Amount</td>
              <td className="py-6 text-center">{sumShares}</td>
              <td className="py-6 text-right underline">৳ {sumProfit.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-24 flex justify-between px-10">
          <div className="border-t border-black w-40 text-center pt-2 text-[10px] font-bold uppercase">Member Signature</div>
          <div className="border-t border-black w-40 text-center pt-2 text-[10px] font-bold uppercase">Office Authority</div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const StatCard = ({ title, value, icon, bg }) => (
  <div className={`${bg} rounded-3xl p-6 border border-white shadow-sm`}>
    <div className="bg-white w-10 h-10 rounded-xl flex items-center justify-center mb-4 shadow-sm">{icon}</div>
    <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1">{title}</p>
    <h3 className="text-2xl font-black text-gray-800">{value}</h3>
  </div>
);

const InfoBox = ({ label, value }) => (
  <div>
    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">{label}</p>
    <p className="text-gray-800 font-bold">{value || 'N/A'}</p>
  </div>
);

export default MyProfit;
