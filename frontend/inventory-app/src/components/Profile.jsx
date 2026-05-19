import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaUserCircle, FaKey, FaEnvelope, FaIdBadge, FaPhoneAlt, FaLock, FaCalendar } from 'react-icons/fa';

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' });
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch Profile Data
     const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('pos-token');
                const res = await axios.get('http://localhost:3000/api/users/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(res.data.user);
            } catch (err) {
                console.error("Profile load failed", err);
            }
        };

    useEffect(() => {
        fetchProfile();
    }, []);

    // Handle Password Change
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            const token = localStorage.getItem('pos-token');
            const res = await axios.put('http://localhost:3000/api/users/change-password', passwords, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ type: 'success', text: res.data.message });
            setPasswords({ oldPassword: '', newPassword: '' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || "Failed to update password" });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return (
        <div className="flex justify-center items-center h-screen text-xl font-semibold text-blue-600 animate-pulse">
            Loading Profile...
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Left Side: Profile Card */}
                <div className="md:col-span-1 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center h-fit">
                    <div className="relative">
                        <div className="w-28 h-28 bg-blue-50 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-md">
                            <FaUserCircle className="text-7xl text-blue-500" />
                        </div>
                        <div className="absolute bottom-6 right-0 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-800">{user.fullName}</h2>
                   <div className="flex gap-2 mt-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                            {user.role || 'Member'}
                        </span>
                        {/* Status Badge */}
                        <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${user.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {user.status || 'Unknown'}
                        </span>
                    </div>

                    <div className="w-full mt-8 space-y-4 text-left border-t pt-6">
                        <div className="flex items-center text-gray-600 gap-3">
                            <FaIdBadge className="text-blue-500 shrink-0" /> 
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase text-gray-400 font-bold">Member Code</span>
                                <span className="text-sm font-semibold">{user.memberCode}</span>
                            </div>
                        </div>
                        <div className="flex items-center text-gray-600 gap-3">
                            <FaEnvelope className="text-blue-500 shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase text-gray-400 font-bold">Email Address</span>
                                <span className="text-sm font-semibold truncate w-50">{user.email}</span>
                            </div>
                        </div>
                        <div className="flex items-center text-gray-600 gap-3">
                            <FaPhoneAlt className="text-blue-500 shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase text-gray-400 font-bold">Phone Number</span>
                                <span className="text-sm font-semibold">{user.mobile || 'N/A'}</span>
                            </div>
                        </div>
                         <div className="flex items-center text-gray-600 gap-3">
                            <FaCalendar className="text-blue-500 shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase text-gray-400 font-bold">Admission Date</span>
                                <span className="text-sm font-semibold">{new Date(user.admissionDate).toLocaleDateString('en-GB')  || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Security Settings */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        <div className="flex items-center gap-3 mb-8 border-b pb-5">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <FaLock className="text-white text-lg" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Security Settings</h3>
                                <p className="text-sm text-gray-500">Update your account password</p>
                            </div>
                        </div>

                        <form onSubmit={handlePasswordChange} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Current Password</label>
                                <input 
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
                                    type="password" 
                                    placeholder="Enter current password" 
                                    value={passwords.oldPassword}
                                    onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})}
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">New Password</label>
                                <input 
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
                                    type="password" 
                                    placeholder="Enter new password" 
                                    value={passwords.newPassword}
                                    onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                                    required 
                                />
                            </div>
                            
                            <button 
                                type="submit" 
                                disabled={loading}
                                className={`w-full py-4 rounded-xl font-bold text-white transition-all transform shadow-lg shadow-blue-200 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-1 active:scale-95'}`}
                            >
                                {loading ? 'Processing...' : 'Update Password'}
                            </button>
                        </form>

                        {message && (
                            <div className={`mt-6 p-4 text-center rounded-xl font-semibold border animate-fade-in ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                {message.text}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProfilePage;
