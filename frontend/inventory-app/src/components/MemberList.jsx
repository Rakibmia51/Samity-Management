import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Edit, Trash2, UserPlus, Users, UserX, CheckCircle, XCircle, Search, Mail, Phone, Eye } from 'lucide-react';
import Swal from 'sweetalert2'; 
import AddMemberModal from './AddMemberModal';

import MemberDetailsModal from './MemberDetailsModal';


const MemberList = () => {
    const [members, setMembers] = useState([]);
    const [activeTab, setActiveTab] = useState('active');
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
    const [selectedMember, setSelectedMember] = useState(null); // এডিটের সময় ডাটা রাখার জন্য
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [viewMember, setViewMember] = useState(null);


  

    const fetchMembers = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/users', {
                headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` }
            });
            if (res.data.success) {
                setMembers(res.data.users);
            }
        } catch (error) {
            console.error("Error fetching members", error);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    
    const handleStatusChange = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' || !currentStatus ? 'inactive' : 'active';
        try {
            const res = await axios.patch(`http://localhost:3000/api/users/status/${id}`, 
                { status: newStatus },
                { headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` }}
            );
            if (res.data.success) {
                setMembers(prev => prev.map(m => m._id === id ? { ...m, status: newStatus } : m));
                Swal.fire({ title: 'Updated!', text: `Member is now ${newStatus}`, icon: 'success', timer: 1500, showConfirmButton: false });
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to update status', 'error');
        }
    };

    const handleDelete = async (id, name) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `You want to delete ${name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await axios.delete(`http://localhost:3000/api/users/delete/${id}`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` }
                    });
                    if (res.data.success) {
                        setMembers(members.filter(member => member._id !== id));
                        Swal.fire('Deleted!', 'Member has been deleted.', 'success');
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
        });
    };

      const handleView = (member) => {
        setViewMember(member);
        setIsDetailsOpen(true);
        };


    const filteredMembers = members.filter(member => {
    // status না থাকলে 'active' ধরে নিবে
    const status = member.status || 'active';
    const matchesTab = status.toLowerCase() === activeTab;

    // প্রতিটি ফিল্ড চেক করে দেখা হচ্ছে সেগুলো আছে কি না (Optional chaining '?.' ব্যবহার করে)
    const matchesSearch = 
        (member.memberCode?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (member.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) || 
        (member.mobile?.includes(searchTerm) || false) ||
        (member.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

    return matchesTab && matchesSearch;
});


    return (
        <div className="p-4 md:p-6 bg-gray-50 min-h-screen font-sans">
            <div className="max-w-7xl mx-auto bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-200">
                
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row justify-between lg:items-center p-6 border-b border-gray-100 gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Member Directory</h2>
                        <div className="flex bg-gray-100/80 p-1 rounded-xl mt-3 w-fit">
                            <button onClick={() => setActiveTab('active')}
                                className={`flex items-center px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'active' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                <Users size={16} className="mr-2" /> Active <span className="ml-2 opacity-60">({members.filter(m => (m.status || 'active') === 'active').length})</span>
                            </button>
                            <button onClick={() => setActiveTab('inactive')}
                                className={`flex items-center px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'inactive' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                <UserX size={16} className="mr-2" /> Inactive <span className="ml-2 opacity-60">({members.filter(m => m.status === 'inactive').length})</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input type="text" placeholder="Search name, mobile or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm w-full sm:w-80 bg-gray-50/50 transition-all" />
                        </div>
                        <button className="flex items-center justify-center bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition font-bold shadow-lg shadow-blue-200 active:scale-95"
                            onClick={() => {setSelectedMember(null); setIsModalOpen(true)}}
                        >
                            <UserPlus size={18} className="mr-2" /> Add Member
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-gray-400 uppercase text-[11px] font-bold tracking-[0.1em]">
                            <tr>
                                <th className="px-6 py-5">SL</th>
                                <th className="px-6 py-5">Member Code</th>
                                <th className="px-6 py-5">Member Identity</th>
                                <th className="px-6 py-5">Contact Details</th>
                                <th className="px-6 py-5 text-center">Status Action</th>
                                <th className="px-6 py-5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredMembers.length > 0 ? (
                                filteredMembers.map((member, index) => (
                                    <tr key={member._id} className="hover:bg-blue-50/20 transition-colors group">
                                        <td className="px-6 py-4 text-xs font-bold text-gray-500">#{index + 1}</td>
                                        <td  className="px-6 py-4 font-medium text-blue-600">{member.memberCode}</td> 
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-100 uppercase">
                                                    {member.fullName.substring(0, 2)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 text-base">{member.fullName}</div>
                                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] font-black uppercase tracking-wider border border-blue-100">
                                                        {member.role}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center text-gray-700 font-bold text-sm bg-gray-100 w-fit px-2.5 py-1 rounded-lg border border-gray-200">
                                                    <Phone size={14} className="mr-2 text-blue-500" />
                                                    {member.mobile}
                                                </div>
                                                <div className="flex items-center text-gray-500 text-xs pl-1">
                                                    <Mail size={13} className="mr-2 opacity-70" />
                                                    {member.email || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => handleStatusChange(member._id, member.status)}
                                                className={`text-[10px] font-black px-5 py-2 rounded-xl border transition-all uppercase tracking-widest shadow-sm ${
                                                    activeTab === 'active' 
                                                    ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white hover:shadow-red-200' 
                                                    : 'bg-green-50 text-green-600 border-green-100 hover:bg-green-600 hover:text-white hover:shadow-green-200'
                                                }`}>
                                                {activeTab === 'active' ? "Deactivate" : "Activate"}
                                            </button>
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                 {/* Table-er bitore View Button */}
                                                <button 
                                                    onClick={() => handleView(member)} 
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
                                                onClick={() => { setSelectedMember(member); setIsModalOpen(true); }} 
                                                ><Edit size={18} />
                                                </button>
                                                
                                                <button onClick={() => handleDelete(member._id, member.fullName)} title="Delete" className="p-2.5 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all border border-red-50 hover:shadow-lg hover:shadow-red-100"><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="text-center py-28 text-gray-400 font-medium italic">No matching members found.</td></tr>
                            )}
                        </tbody>
                    </table>
                    {/* Table এর নিচে Modal কম্পোনেন্টটি বসিয়ে দিন */}
                        <AddMemberModal 
                            isOpen={isModalOpen} 
                            onClose={() => setIsModalOpen(false)} 
                            refreshData={fetchMembers} 
                            editData={selectedMember} 
                        />
                    {/* বাকি টেবিল কোড... */}

                     {/* Modal Component */}
                    <MemberDetailsModal 
                        isOpen={isDetailsOpen} 
                        onClose={() => setIsDetailsOpen(false)} 
                        member={viewMember} 
                    />

                </div>
            </div>
        </div>
    );
};

export default MemberList;
