import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet, ArrowUpCircle, ArrowDownCircle, Printer, Search, FileText } from 'lucide-react';

const MyLedger = () => {
  const [ledgerData, setLedgerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem("pos-token")}` };
        const resUser = await axios.get('http://localhost:3000/api/users/profile', { headers });
        const myId = resUser.data.user._id;
        setUser(resUser.data.user);

        // ১. প্রফিট এবং শেয়ার কেনা (Sales) উভয় ডাটা আনা
        const [resPayouts, resSales] = await Promise.all([
          axios.get(`http://localhost:3000/api/payouts`, { headers }),
          axios.get(`http://localhost:3000/api/share-sales`, { headers })
        ]);

        // ২. ডাটা ফরম্যাট করা (Ledger Entry তৈরি করা)
        let entries = [];

        // ইনভেস্টমেন্ট এন্ট্রি (Share Sales)
        if (resSales.data.success) {
          const mySales = resSales.data.shareSales.filter(s => (s.userId?._id || s.userId) === myId);
          mySales.forEach(sale => {
            entries.push({
              date: sale.createdAt,
              description: `Purchased ${sale.totalShares} shares - ${sale.projectId?.projectName}`,
              type: 'Investment',
              debit: sale.totalAmount, // টাকা খরচ হয়েছে
              credit: 0,
              balanceEffect: -sale.totalAmount
            });
          });
        }

        // প্রফিট এন্ট্রি (Payouts)
        if (resPayouts.data.success) {
          const myPayouts = resPayouts.data.data.filter(p => (p.memberId?._id || p.memberId) === myId);
          myPayouts.forEach(payout => {
            entries.push({
              date: payout.createdAt,
              description: `Profit Distribution: ${payout.month}/${payout.year} - ${payout.projectId?.projectName}`,
              type: 'Profit',
              debit: 0,
              credit: payout.totalProfitAmount, // টাকা ঢুকেছে
              balanceEffect: payout.totalProfitAmount
            });
          });
        }

        // ৩. তারিখ অনুযায়ী সাজানো
        entries.sort((a, b) => new Date(a.date) - new Date(b.date));

        // ৪. রানিং ব্যালেন্স ক্যালকুলেট করা
        let currentBal = 0;
        const finalizedLedger = entries.map(entry => {
          currentBal += entry.balanceEffect;
          return { ...entry, runningBalance: currentBal };
        });

        setLedgerData(finalizedLedger.reverse()); // নতুনগুলো উপরে দেখাবে
      } catch (error) {
        console.error("Ledger fetch error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalInvestment = ledgerData.reduce((sum, item) => sum + item.debit, 0);
  const totalProfit = ledgerData.reduce((sum, item) => sum + item.credit, 0);

  if (loading) return <div className="p-10 text-center font-bold text-indigo-600">Generating Ledger...</div>;

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans">
      
      {/* Screen View (Print Hidden) */}
      <div className="print:hidden">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-black text-gray-800 uppercase tracking-widest border-l-4 border-indigo-500 pl-4">
            My Account Ledger
          </h1>
          <button onClick={() => window.print()} className="bg-gray-800 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg">
            <Printer size={18} /> Print Ledger
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <LedgerStat title="Total Investment" value={`৳ ${totalInvestment.toLocaleString()}`} icon={<ArrowUpCircle className="text-red-500" />} />
          <LedgerStat title="Total Profit" value={`৳ ${totalProfit.toLocaleString()}`} icon={<ArrowDownCircle className="text-emerald-500" />} />
          <LedgerStat title="Net Balance" value={`৳ ${(totalProfit - totalInvestment).toLocaleString()}`} icon={<Wallet className="text-indigo-500" />} />
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                  <th className="p-4">Date</th>
                  <th className="p-4">Description</th>
                  <th className="p-4 text-right">Debit (Out)</th>
                  <th className="p-4 text-right">Credit (In)</th>
                  <th className="p-4 text-right">Running Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ledgerData.map((item, index) => (
                  <tr key={index} className="text-sm hover:bg-gray-50/50">
                    <td className="p-4 text-gray-500">{new Date(item.date).toLocaleDateString()}</td>
                    <td className="p-4 font-medium text-gray-700">{item.description}</td>
                    <td className="p-4 text-right text-red-600 font-bold">{item.debit > 0 ? `-৳ ${item.debit.toLocaleString()}` : '--'}</td>
                    <td className="p-4 text-right text-emerald-600 font-bold">{item.credit > 0 ? `+৳ ${item.credit.toLocaleString()}` : '--'}</td>
                    <td className="p-4 text-right font-black text-gray-800">৳ {item.runningBalance.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ---------------- PRINT TEMPLATE (Absolute positioned to avoid 2-page issue) ---------------- */}
      <div className="hidden print:block absolute top-0 left-0 w-full p-4 bg-white text-black">
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-2xl font-black uppercase">Member Ledger Statement</h1>
          <p className="text-sm font-bold">{user?.fullName} | {user?.memberCode}</p>
          <p className="text-[10px]">Report Generated: {new Date().toLocaleString()}</p>
        </div>

        <table className="w-full text-[12px] border-collapse">
          <thead>
            <tr className="border-b-2 border-black font-black uppercase">
              <th className="py-2 text-left">Date</th>
              <th className="py-2 text-left">Transaction Details</th>
              <th className="py-2 text-right">Debit</th>
              <th className="py-2 text-right">Credit</th>
              <th className="py-2 text-right">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {ledgerData.map((item, index) => (
              <tr key={index}>
                <td className="py-2">{new Date(item.date).toLocaleDateString()}</td>
                <td className="py-2">{item.description}</td>
                <td className="py-2 text-right">{item.debit > 0 ? item.debit.toLocaleString() : '-'}</td>
                <td className="py-2 text-right">{item.credit > 0 ? item.credit.toLocaleString() : '-'}</td>
                <td className="py-2 text-right font-bold">{item.runningBalance.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="mt-20 flex justify-between px-10 text-[10px] font-bold uppercase">
          <div className="border-t border-black w-32 text-center pt-1">Member Signature</div>
          <div className="border-t border-black w-32 text-center pt-1">Accounts Dept</div>
        </div>
      </div>
    </div>
  );
};

const LedgerStat = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
    <div className="bg-gray-50 p-3 rounded-2xl">{icon}</div>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</p>
      <h3 className="text-xl font-black text-gray-800">{value}</h3>
    </div>
  </div>
);

export default MyLedger;
