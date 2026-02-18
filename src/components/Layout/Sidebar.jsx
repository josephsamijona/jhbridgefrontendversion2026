import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    Users,
    Receipt,
    ClipboardList,
    Settings,
    CreditCard,
    MessageSquare,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Calendar,
    FileSignature,
    DollarSign,
    UserCheck,
    Building,
    Bell,
    Mail,
    FolderOpen,
    Briefcase,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const Sidebar = ({ collapsed, setCollapsed }) => {
    const location = useLocation();
    const [expandedSections, setExpandedSections] = useState({});

    const toggleSection = (name) => {
        setExpandedSections(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
        {
            name: 'Operations', icon: Briefcase, path: '/operations',
            children: [
                { name: 'Assignments', path: '/operations/assignments' },
                { name: 'Calendar', path: '/operations/assignments/calendar' },
                { name: 'Quotes', path: '/operations/quotes' },
            ],
        },
        {
            name: 'People', icon: Users, path: '/people',
            children: [
                { name: 'Interpreters', path: '/people/interpreters' },
                { name: 'Clients', path: '/people/clients' },
                { name: 'Contracts', path: '/people/contracts' },
            ],
        },
        {
            name: 'Finance', icon: CreditCard, path: '/finance',
            children: [
                { name: 'Client Payments', path: '/finance/client-payments' },
                { name: 'Interpreter Payments', path: '/finance/interpreter-payments' },
                { name: 'Expenses', path: '/finance/expenses' },
                { name: 'Payroll Documents', path: '/finance/payroll' },
            ],
        },
        { name: 'Invoices', icon: Receipt, path: '/invoices' },
        { name: 'Pay Stubs', icon: FileText, path: '/pay-stubs' },
        { name: 'Statements', icon: ClipboardList, path: '/statements' },
        { name: 'Documents', icon: FolderOpen, path: '/documents' },
        {
            name: 'Communications', icon: MessageSquare, path: '/comms',
            children: [
                { name: 'Notifications', path: '/comms/notifications' },
                { name: 'Messages', path: '/comms/messages' },
            ],
        },
        { name: 'Settings', icon: Settings, path: '/settings' },
    ];

    const isActiveSection = (item) => {
        if (item.path === '/') return location.pathname === '/';
        return location.pathname.startsWith(item.path);
    };

    return (
        <div
            className={cn(
                "bg-[#1e3a5f] text-white flex flex-col transition-all duration-300 relative",
                collapsed ? "w-20" : "w-64"
            )}
        >
            <div className="p-6 flex items-center justify-center border-b border-[#2d4d75]">
                {collapsed ? (
                    <span className="text-xl font-bold">JH</span>
                ) : (
                    <img
                        src="https://jhbridgetranslation.com/images/logo-white.png"
                        alt="JH Bridge"
                        className="h-10"
                    />
                )}
            </div>

            <nav className="flex-1 mt-6 px-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const hasChildren = item.children && !collapsed;
                    const isActive = isActiveSection(item);
                    const isExpanded = expandedSections[item.name] ?? isActive;

                    return (
                        <div key={item.name}>
                            {hasChildren ? (
                                <button
                                    onClick={() => toggleSection(item.name)}
                                    className={cn(
                                        "w-full flex items-center p-3 rounded-lg transition-colors",
                                        "hover:bg-[#2d4d75] group",
                                        isActive ? "bg-[#2d4d75] text-white" : "text-slate-300",
                                    )}
                                >
                                    <item.icon className="w-5 h-5 shrink-0" />
                                    <span className="font-medium text-sm ml-4 flex-1 text-left">{item.name}</span>
                                    <ChevronDown className={cn(
                                        "w-4 h-4 transition-transform",
                                        isExpanded ? "rotate-0" : "-rotate-90"
                                    )} />
                                </button>
                            ) : (
                                <NavLink
                                    to={item.path}
                                    end={item.path === '/'}
                                    className={({ isActive: navActive }) => cn(
                                        "flex items-center p-3 rounded-lg transition-colors",
                                        "hover:bg-[#2d4d75] group",
                                        navActive ? "bg-[#2d4d75] text-white" : "text-slate-300",
                                        collapsed ? "justify-center" : "space-x-4"
                                    )}
                                >
                                    <item.icon className={cn("w-5 h-5", !collapsed && "shrink-0")} />
                                    {!collapsed && <span className="font-medium text-sm">{item.name}</span>}

                                    {collapsed && (
                                        <div className="absolute left-full ml-2 px-2 py-1 bg-[#1e3a5f] text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none transition-opacity">
                                            {item.name}
                                        </div>
                                    )}
                                </NavLink>
                            )}

                            {/* Children */}
                            {hasChildren && isExpanded && (
                                <div className="ml-5 mt-1 space-y-1 border-l border-[#2d4d75] pl-4">
                                    {item.children.map((child) => (
                                        <NavLink
                                            key={child.path}
                                            to={child.path}
                                            className={({ isActive: childActive }) => cn(
                                                "flex items-center p-2 rounded-md transition-colors text-sm",
                                                "hover:bg-[#2d4d75]",
                                                childActive ? "text-white font-medium bg-[#2d4d75]/60" : "text-slate-400"
                                            )}
                                        >
                                            {child.name}
                                        </NavLink>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-[#2d4d75]">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-full text-slate-300 hover:text-white hover:bg-[#2d4d75] justify-center"
                >
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    {!collapsed && <span className="ml-2">Collapse Sidebar</span>}
                </Button>
            </div>
        </div>
    );
};

export default Sidebar;
