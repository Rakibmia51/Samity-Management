import React from 'react';
import Sidebar from '../components/Sidebar'; // আপনার সাইডবার পাথ
import { Outlet } from 'react-router-dom'; // এটি অবশ্যই ইমপোর্ট করতে হবে

const Dashboard = () => {
    return (
        <div className="min-h-screen bg-slate-100">
            {/* আপনার তৈরি করা রেসপনসিভ সাইডবার */}
            <Sidebar />
            
            {/* মেইন কন্টেন্ট এরিয়া */}
            <main className="lg:pl-72 pt-16 p-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm min-h-[80vh]">
                    {/* চাইল্ড রাউটগুলো (Summary, Profile) এখানে রেন্ডার হবে */}
                    <Outlet /> 
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
