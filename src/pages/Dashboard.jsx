import { useEffect, useState } from 'react';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Users,
    Briefcase,
    FileText,
    CreditCard,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { financeService } from '../services/financeService';
import { operationsService } from '../services/operationsService';

function Dashboard() {
    const [financialOverview, setFinancialOverview] = useState(null);
    const [operationalStats, setOperationalStats] = useState(null);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadDashboardData() {
            try {
                setLoading(true);
                const [financeRes, operationsRes, transactionsRes] = await Promise.all([
                    financeService.getOverview(),
                    operationsService.getStats(),
                    financeService.getTransactions({ limit: 10 }),
                ]);

                setFinancialOverview(financeRes.data);
                setOperationalStats(operationsRes.data);
                setRecentTransactions(transactionsRes.data.transactions || []);
            } catch (err) {
                console.error('Dashboard load error:', err);
                setError(err.message || 'Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        }

        loadDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <p className="text-red-600 font-semibold">Error loading dashboard</p>
                    <p className="text-gray-600 mt-2">{error}</p>
                </div>
            </div>
        );
    }

    const kpiCards = [
        {
            label: 'Revenue (Processed)',
            value: `$${(financialOverview?.revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: DollarSign,
            trend: '+12.5%',
            trendUp: true,
            bgColor: 'bg-green-50',
            iconColor: 'text-green-600',
        },
        {
            label: 'Payouts',
            value: `$${(financialOverview?.payouts || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: CreditCard,
            trend: '-3.2%',
            trendUp: false,
            bgColor: 'bg-orange-50',
            iconColor: 'text-orange-600',
        },
        {
            label: 'Net Profit',
            value: `$${(financialOverview?.profit || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: TrendingUp,
            trend: '+18.7%',
            trendUp: true,
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600',
        },
        {
            label: 'Active Assignments',
            value: operationalStats?.assignmentsByStatus?.SCHEDULED || 0,
            icon: Briefcase,
            bgColor: 'bg-purple-50',
            iconColor: 'text-purple-600',
        },
    ];

    const pendingCards = [
        {
            label: 'Pending Client Payments',
            value: financialOverview?.pendingClientPayments || 0,
            icon: FileText,
            bgColor: 'bg-yellow-50',
            iconColor: 'text-yellow-600',
        },
        {
            label: 'Pending Interpreter Payments',
            value: financialOverview?.pendingInterpreterPayments || 0,
            icon: Users,
            bgColor: 'bg-indigo-50',
            iconColor: 'text-indigo-600',
        },
    ];

    const getTransactionBadgeVariant = (type) => {
        switch (type) {
            case 'CLIENT_PAYMENT':
                return 'default';
            case 'INTERPRETER_PAYMENT':
                return 'secondary';
            case 'EXPENSE':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'PROCESSED':
            case 'APPROVED':
                return 'default';
            case 'PENDING':
                return 'secondary';
            case 'REJECTED':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Welcome back!</h1>
                <p className="text-slate-500">Here's your operations overview.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiCards.map((stat, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                                    {stat.trend && (
                                        <div className={`flex items-center mt-2 text-sm ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                                            {stat.trendUp ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                                            {stat.trend}
                                        </div>
                                    )}
                                </div>
                                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Pending Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pendingCards.map((stat, index) => (
                    <Card key={index}>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                                </div>
                                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Transactions */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    {recentTransactions.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No transactions yet</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentTransactions.map((txn, index) => (
                                    <TableRow key={`${txn.type}-${txn.id}-${index}`}>
                                        <TableCell>
                                            <Badge variant={getTransactionBadgeVariant(txn.type)}>
                                                {txn.type.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-medium">{txn.description}</TableCell>
                                        <TableCell className="text-right font-semibold">
                                            ${parseFloat(txn.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(txn.date).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusBadgeVariant(txn.status)}>
                                                {txn.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default Dashboard;
