import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus,
    Search,
    DollarSign,
    Calendar,
    User,
    CheckCircle,
    Clock,
    MoreHorizontal,
    Download
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { financeService } from '../../services/financeService';
import StatusBadge from '../../components/Common/StatusBadge';
import { toast } from 'react-hot-toast';

function InterpreterPaymentList() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        loadPayments();
    }, [statusFilter]);

    async function loadPayments() {
        try {
            setLoading(true);
            const params = statusFilter !== 'ALL' ? { status: statusFilter } : {};
            const response = await financeService.getInterpreterPayments(params);
            setPayments(Array.isArray(response.data) ? response.data : (response.data.payments || []));
        } catch (error) {
            console.error('Failed to load interpreter payments:', error);
            toast.error('Failed to load payments');
        } finally {
            setLoading(false);
        }
    }

    const handleMarkPaid = async (id) => {
        if (!window.confirm('Mark this payment as sent/completed?')) return;

        try {
            toast.loading('Processing...', { id: 'pay' });
            await financeService.processInterpreterPayment(id, { status: 'PAID', paid_at: new Date() });
            toast.success('Payment marked as completed', { id: 'pay' });
            loadPayments();
        } catch (error) {
            toast.error('Failed to process payment', { id: 'pay' });
        }
    };

    const filteredPayments = payments.filter(payment => {
        const searchLower = searchTerm.toLowerCase();
        return (
            payment.interpreter?.first_name?.toLowerCase().includes(searchLower) ||
            payment.interpreter?.last_name?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Interpreter Payments</h1>
                    <p className="text-gray-600 mt-2">Track outgoing payments to interpreters.</p>
                </div>
                <Link to="/finance/interpreter-payments/new">
                    <Button className="bg-[#1e3a5f] hover:bg-[#2d4d75]">
                        <Plus className="w-4 h-4 mr-2" /> Record Payment
                    </Button>
                </Link>
            </div>

            <Card className="mb-8">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search by interpreter name..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Statuses</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="PROCESSED">Processed</SelectItem>
                                <SelectItem value="PAID">Paid</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e3a5f]"></div>
                        </div>
                    ) : filteredPayments.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>No payments found.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Payment Date</TableHead>
                                    <TableHead>Interpreter</TableHead>
                                    <TableHead>Pay Stub</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-16"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPayments.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <span>{new Date(payment.payment_date || payment.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <Link
                                                    to={`/people/interpreters/${payment.interpreter_id}`}
                                                    className="font-medium hover:text-blue-600"
                                                >
                                                    {payment.interpreter?.first_name} {payment.interpreter?.last_name}
                                                </Link>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {payment.paystub_id ? (
                                                <Link to={`/pay-stubs/${payment.paystub_id}`} className="text-blue-600 hover:underline">
                                                    #{payment.paystub_id}
                                                </Link>
                                            ) : (
                                                <span className="text-gray-400">N/A</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-bold text-blue-600">
                                            ${parseFloat(payment.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-gray-600">{payment.payment_method || 'Direct Deposit'}</span>
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={payment.status} />
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    {payment.status === 'PENDING' && (
                                                        <DropdownMenuItem onClick={() => handleMarkPaid(payment.id)}>
                                                            <CheckCircle className="w-4 h-4 mr-2 text-green-600" /> Mark as Paid
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem>
                                                        <Download className="w-4 h-4 mr-2" /> Download Record
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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

export default InterpreterPaymentList;
