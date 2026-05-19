import { FolderTree, HandCoins } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { 
  FaHome, FaSignOutAlt, FaUserCircle, FaUsers, FaBook, FaChevronDown, FaChevronRight, 
  FaProjectDiagram, FaChartPie, FaCogs, FaHistory, FaTools, FaFileAlt, FaBars, FaTimes, FaCoins
} from "react-icons/fa";
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const [openMenus, setOpenMenus] = useState({});
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const location = useLocation();
    const { user, logout } = useAuth(); // AuthContext থেকে logout ফাংশন নিয়ে আসা

    const toggleMenu = (name) => {
        setOpenMenus(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const isActive = (path) => location.pathname === path;

    // Admin এবং Member মেনু আইটেমগুলো মেমোরিতে সেভ করে রাখা (Performance এর জন্য)
    const adminMenuItems = useMemo(() => [
        { name: "Dashboard", path: "/admin-dashboard", icon: <FaHome /> },
        { name: "My Account", path: "/admin-dashboard/profile", icon: <FaUserCircle /> },
        {
            name: "Management",
            icon: <FaTools />,
            children: [
                { name: "Members", path: "/admin-dashboard/members", icon: <FaUsers /> },
                { name: "Ledger", path: "/admin-dashboard/ledger", icon: <FaBook /> },
                { name: "Projects", path: "/admin-dashboard/projects", icon: <FaProjectDiagram /> },
                { name: "Shares", path: "/admin-dashboard/shares", icon: <FaChartPie /> },
                { name: "Share Sales", path: "/admin-dashboard/share-sales", icon: <HandCoins size={15}/> },
                { name: "EndPoint", path: "/admin-dashboard/endpoints", icon: <FolderTree  size={15}/> },
                { name: "Profit Management", path: "/admin-dashboard/profit", icon: <FaCoins/> },
                { name: "Reports", path: "/admin-dashboard/reports", icon: <FaFileAlt /> },
            ],
        },
          {
            name: "Settings",
            icon: <FaCogs />,
            children: [
                { name: "System Settings", path: "/admin-dashboard/system-settings", icon: <FaTools /> }
            ],
        },
        {
            name: "System",
            icon: <FaHistory />,
            children: [{ name: "Activities", path: "/admin-dashboard/activities", icon: <FaHistory /> }],
        },
    ], []);

    const memberMenuItems = useMemo(() => [
        { name: "Dashboard", path: "/member-dashboard", icon: <FaHome /> },
        { name: "My Account", path: "/member-dashboard/profile", icon: <FaUserCircle /> },
        {
            name: "Member Panel",
            icon: <FaTools />,
            children: [
                { name: "My Ledger", path: "/member-dashboard/ledger", icon: <FaBook /> },
                { name: "Projects", path: "/member-dashboard/projects", icon: <FaProjectDiagram /> },
                { name: "My Shares", path: "/member-dashboard/shares", icon: <FaChartPie /> },
                { name: "My Profit", path: "/member-dashboard/profit", icon: <FaCoins/> },
            ],
        },
    ], []);

    // ইউজারের রোলের ওপর ভিত্তি করে মেনু ঠিক করা
    const menuLinks = user?.role === 'admin' ? adminMenuItems : memberMenuItems;

    return (
        <>
            {/* --- TOP HEADER --- */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-white/10 z-[60] flex items-center justify-between px-6 print:hidden">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-1.5 rounded-lg">
                        <span className="text-white font-bold text-lg italic px-1">NB</span>
                    </div>
                    <h1 className="text-white font-bold tracking-widest text-lg lg:text-xl uppercase">NextBarta</h1>
                </div>

                <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="lg:hidden text-white text-2xl">
                    {isMobileOpen ? <FaTimes /> : <FaBars />}
                </button>
            </header>

            {/* --- SIDEBAR --- */}
            <aside className={`
                fixed top-16 left-0 z-50 w-72 h-[calc(100vh-64px)] bg-slate-900 border-r border-white/10 shadow-2xl overflow-y-auto
                transform transition-transform duration-300 ease-in-out print:hidden
                ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            `}>
                <nav className="p-4 space-y-2 mt-4">
                    {menuLinks.map((item, index) => {
                        const isChildActive = item.children?.some(c => isActive(c.path));
                        const parentActive = isActive(item.path) || isChildActive;

                        return (
                            <div key={index} className="space-y-1">
                                <div 
                                    className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all 
                                        ${parentActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                                    onClick={() => item.children ? toggleMenu(item.name) : setIsMobileOpen(false)}
                                >
                                    <div className="flex items-center gap-3 w-full font-medium">
                                        {item.path ? <Link to={item.path} className="flex items-center gap-3 w-full">{item.icon} {item.name}</Link> : <span className="flex items-center gap-3">{item.icon} {item.name}</span>}
                                    </div>
                                    {item.children && (
                                        <span className="text-[10px]">
                                            {openMenus[item.name] || isChildActive ? <FaChevronDown /> : <FaChevronRight />}
                                        </span>
                                    )}
                                </div>

                                {item.children && (openMenus[item.name] || isChildActive) && (
                                    <div className="ml-6 pl-4 border-l border-slate-700 space-y-1 mt-1">
                                        {item.children.map((child, idx) => (
                                            <Link
                                                key={idx}
                                                to={child.path}
                                                onClick={() => setIsMobileOpen(false)}
                                                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all
                                                    ${isActive(child.path) ? 'text-blue-400 font-bold bg-blue-400/10' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
                                            >
                                                <span className="text-xs">{child.icon}</span> 
                                                <span>{child.name}</span>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* --- LOGOUT BUTTON --- */}
                    <div className="pt-10">
                        <button 
                            onClick={logout}
                            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-medium border border-red-500/20"
                        >
                            <FaSignOutAlt />
                            <span>Logout</span>
                        </button>
                    </div>
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
