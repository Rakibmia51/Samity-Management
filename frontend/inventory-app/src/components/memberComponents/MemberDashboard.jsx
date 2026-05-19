import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { Users, Briefcase, Wallet, PieChart, TrendingUp } from 'lucide-react';

const MainDashboard = () => {
    const [data, setData] = useState(null);

    const fetchData = async () => {
            try {
            // মেম্বার নিজের ডাটা লোড করছে
            const res = await axios.get(`http://localhost:3000/api/memberSide/my-stats`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` }
            });
            
            if (res.data.success) {
                // ডাটা সেট করা
                const stats = res.data.data;
                setData(stats); // আপনার আগের useState অনুযায়ী
            }
        } catch (error) {
            console.error('Error Fetching My Stats', error);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    const cardItems = [
        {
            title: "My Total Investment",
            value: `৳ ${(data?.totalInvestment || 0).toLocaleString()}`,
            icon: <TrendingUp size={26} />,
            color: "from-blue-600 via-blue-500 to-indigo-600",
            shadow: "shadow-blue-500/40"
        },
        {
            title: "My Total Shares",
            value: `${data?.totalShares || 0} Units`,
            icon: <PieChart size={26} />,
            color: "from-emerald-600 via-emerald-500 to-teal-600",
            shadow: "shadow-emerald-500/40"
        },
        {
            title: "Projects Invested",
            value: data?.projectsInvested || 0,
            icon: <Briefcase size={26} />,
            color: "from-violet-600 via-purple-500 to-fuchsia-600",
            shadow: "shadow-purple-500/40"
        },
        {
            title: "Ledger Balance",
            value: `৳ ${(data?.ledgerBalance || 0).toLocaleString()}`,
            icon: <Wallet size={26} />,
            color: "from-orange-600 via-orange-500 to-amber-500",
            shadow: "shadow-orange-500/40"
        }
    ];

    return (
        <div className="bg-gray-50 min-h-screen p-8">
            <h1 className="text-2xl font-black text-gray-800 mb-8 uppercase tracking-widest">My Portfolio</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {cardItems.map((item, index) => (
                    <div 
                        key={index} 
                        className={`relative group overflow-hidden bg-gradient-to-br ${item.color} ${item.shadow} shadow-2xl rounded-[2rem] p-7 text-white transition-all duration-500 hover:-translate-y-2`}
                    >
                        {/* Decorative background circle */}
                        <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
                        
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <div className="flex justify-between items-center mb-6">
                                <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/30">
                                    {item.icon}
                                </div>
                                <div className="h-1 w-12 bg-white/30 rounded-full"></div>
                            </div>

                            <div>
                                <p className="text-white/80 text-[10px] font-black uppercase tracking-[2px] mb-1">
                                    {item.title}
                                </p>
                                <h2 className="text-3xl font-black tracking-tight drop-shadow-md">
                                    {item.value}
                                </h2>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default MainDashboard;
