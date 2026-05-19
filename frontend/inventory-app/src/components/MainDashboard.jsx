import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { Users, Briefcase, Wallet } from 'lucide-react';


const MainDashboard = () => {
    const [member, setMember] = useState([])
    const [project, setProject] = useState([])

    const fetchData = async () =>{
        try {
            // Memebr Details Load
            const memberRes = await axios.get(`http://localhost:3000/api/users`,{
                 headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` }
            })
            if(memberRes.data.success){
                // console.log(memberRes.data)
                setMember(memberRes.data)
            }

            // Project Data Load
            const projectRes = await axios.get(`http://localhost:3000/api/projects`,{
                 headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` }
            })
            if(projectRes.data.success){
                console.log(projectRes.data)
                setProject(projectRes.data)
            }
        } catch (error) {
            console.error('Error Fetching Members Data', error)
        }
    }

    useEffect(()=>{
        fetchData()
    },[])


// কার্ডের ডাটা এরে
const cardItems = [
    {
        title: "Total Member",
        value: member?.totalMember || 0,
        extra: (
            <div className="flex gap-2 mt-2 text-[10px] font-bold uppercase">
                <span className="bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-300 rounded-full"></span>
                    Active: {member?.activeMember || 0}
                </span>
                <span className="bg-black/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-red-300 rounded-full"></span>
                    Inactive: {(member?.totalMember || 0) - (member?.activeMember || 0)}
                </span>
            </div>
        ),
        icon: <Users size={24} />,
        color: "from-blue-600 to-blue-500"
    },
    {
        title: "Active Projects",
        value: project?.activeProject || 0,
        icon: <Briefcase size={24} />,
        color: "from-emerald-600 to-emerald-500"
    },
    {
        title: "Total Member Balance",
        value: `৳ ${(project?.overallTotals?.totalShareSales || 0).toLocaleString()}`,
        icon: <Wallet size={24} />,
        color: "from-orange-600 to-orange-500"
    },
    {
        title: "Cash-in-hand",
        value: `৳ ${(project?.cashInHand || 0).toLocaleString()}`,
        icon: <Wallet size={24} />,
        color: "from-cyan-600 to-cyan-500"
    },
    {
        title: "Bank Balance",
        value: `৳ ${(project?.bankBalance || 0).toLocaleString()}`,
        icon: <Wallet size={24} />,
        color: "from-indigo-600 to-indigo-500"
    },
    {
        title: "Total General Income",
        value: `৳ ${(project?.totalIncome || 0).toLocaleString()}`,
        icon: <Wallet size={24} />,
        color: "from-teal-600 to-teal-500"
    },
    {
        title: "Total General Expense",
        value: `৳ ${(project?.totalExpense || 0).toLocaleString()}`,
        icon: <Wallet size={24} />,
        color: "from-rose-600 to-rose-500"
    },
    {
        title: "Net Profit",
        // Net Profit = (Income - Expense)
        value: `৳ ${((project?.totalIncome || 0) - (project?.totalExpense || 0)).toLocaleString()}`,
        icon: <Wallet size={24} />,
        color: "from-purple-700 to-purple-500"
    }
];

  return (
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
        {cardItems.map((item, index) => (
            <div key={index} className={`bg-gradient-to-br ${item.color} p-5 rounded-2xl shadow-lg text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}>
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-[11px] opacity-90 uppercase font-bold tracking-wider mb-1">{item.title}</p>
                        <h2 className="text-2xl font-bold">{item.value}</h2>
                        {item.extra && item.extra}
                    </div>
                    <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
                        {item.icon}
                    </div>
                </div>
            </div>
        ))}
    </div>
  )
}

export default MainDashboard