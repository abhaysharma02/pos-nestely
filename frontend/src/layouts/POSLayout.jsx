import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import { LogOut, Home, FileText, Settings, Users, MonitorSmartphone, Sun, Moon, ChevronLeft, ChevronRight, LayoutGrid, ClipboardList, UtensilsCrossed } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const POSLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') !== 'light'; // Default to dark mode
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.remove('light');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.add('light');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const navigation = [
        { name: 'Terminal', href: '/', icon: MonitorSmartphone },
        { name: 'Kitchen', href: '/kitchen', icon: UtensilsCrossed },
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Orders', href: '/orders', icon: ClipboardList },
        { name: 'Menu', href: '/menu', icon: LayoutGrid },
        { name: 'Staff', href: '/staff', icon: Users },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-[#0a0a0a] light:bg-[#f3f4f6] text-white light:text-gray-900 overflow-hidden font-sans selection:bg-orange-500/30">
            {/* Sidebar */}
            <div
                className={`${isCollapsed ? 'w-20 lg:w-20' : 'w-64'} 
                bg-[#111111] light:bg-white flex flex-col justify-between border-r border-[#1f1f1f] light:border-gray-200 transition-all duration-300 ease-in-out relative z-30 shadow-[4px_0_24px_rgba(0,0,0,0.4)] light:shadow-sm shrink-0`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="h-[72px] flex items-center justify-between px-5 border-b border-[#1f1f1f] light:border-gray-200">
                        {!isCollapsed && (
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
                                    <MonitorSmartphone className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent whitespace-nowrap">
                                    Nestely POS
                                </span>
                            </div>
                        )}
                        {isCollapsed && (
                            <div className="w-8 h-8 mx-auto rounded-lg bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
                                <span className="text-white font-bold text-[15px]">N</span>
                            </div>
                        )}

                        {/* Collapse Toggle */}
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="absolute -right-3 top-[26px] bg-[#1a1a1a] light:bg-white border border-[#2a2a2a] light:border-gray-200 rounded-full p-1 text-neutral-400 hover:text-white light:hover:text-gray-800 transition-colors shadow-md z-50 hidden lg:block"
                        >
                            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 mt-6 px-3 space-y-1.5 overflow-y-auto custom-scrollbar pb-6">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    title={isCollapsed ? item.name : ""}
                                    className={`flex items-center group px-3 py-3 rounded-xl transition-all duration-200 relative overflow-hidden
                                        ${isActive
                                            ? 'bg-gradient-to-r from-orange-500/10 to-rose-500/5 light:from-orange-50 light:to-orange-50 text-orange-400 font-semibold'
                                            : 'text-neutral-400 light:text-gray-500 hover:bg-[#1a1a1a] light:hover:bg-gray-100 hover:text-neutral-200 light:hover:text-gray-900 font-medium'
                                        }`}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-orange-500 rounded-r-md" />
                                    )}
                                    <item.icon className={`h-[22px] w-[22px] shrink-0 ${isCollapsed ? 'mx-auto' : 'mr-3'} ${isActive ? 'text-orange-500' : 'group-hover:text-neutral-300 light:group-hover:text-gray-700 transition-colors'}`} />
                                    {!isCollapsed && <span className="truncate tracking-wide text-[15px]">{item.name}</span>}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-[#1f1f1f] light:border-gray-200 flex flex-col gap-2 shrink-0">
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            title={isCollapsed ? "Toggle Theme" : ""}
                            className={`flex items-center ${isCollapsed ? 'justify-center' : 'w-full'} px-3 py-3 text-neutral-400 light:text-gray-500 hover:bg-[#1a1a1a] light:hover:bg-gray-100 hover:text-orange-400 rounded-xl transition-all duration-200 font-medium`}
                        >
                            {isDarkMode ? <Sun className="h-[22px] w-[22px] shrink-0" /> : <Moon className="h-[22px] w-[22px] shrink-0" />}
                            {!isCollapsed && (
                                <span className="ml-3 truncate text-[15px]">
                                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={logout}
                            title={isCollapsed ? "Logout" : ""}
                            className={`flex items-center ${isCollapsed ? 'justify-center' : 'w-full'} px-3 py-3 text-neutral-400 light:text-gray-500 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl transition-all duration-200 font-medium`}
                        >
                            <LogOut className="h-[22px] w-[22px] shrink-0" />
                            {!isCollapsed && <span className="ml-3 truncate text-[15px]">Logout</span>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Pane */}
            <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0a] light:bg-[#f3f4f6] relative z-10 w-full h-full">
                <main className="flex-1 overflow-x-hidden overflow-y-auto h-full">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default POSLayout;
