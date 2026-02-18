import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const MainLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

    // Map paths to friendly titles
    const getPageTitle = (path) => {
        if (path === '/') return 'Dashboard';
        if (path.startsWith('/invoices')) return 'Invoices';
        if (path.startsWith('/pay-stubs')) return 'Pay Stubs';
        if (path.startsWith('/statements')) return 'Statements';
        if (path.startsWith('/contractors')) return 'Contractors';
        if (path.startsWith('/settings')) return 'Settings';
        return 'Dashboard';
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <TopBar title={getPageTitle(location.pathname)} />

                <main className="flex-1 overflow-y-auto p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
