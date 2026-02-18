import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus,
    Search,
    DollarSign,
    Calendar,
    Tag,
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
    Receipt
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
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { financeService } from '../../services/financeService';
import StatusBadge from '../../components/Common/StatusBadge';
import { toast } from 'react-hot-toast';

function ExpenseList() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        loadExpenses();
    }, [statusFilter]);

    async function loadExpenses() {
        try {
            setLoading(true);
            const params = statusFilter !== 'ALL' ? { status: statusFilter } : {};
            const response = await financeService.getExpenses(params);
            setExpenses(Array.isArray(response.data) ? response.data : (response.data.expenses || []));
        } catch (error) {
            console.error('Failed to load expenses:', error);
            toast.error('Failed to load expenses');
        } finally {
            setLoading(false);
        }
    }

    const handleApprove = async (id) => {
        if (!window.confirm('Approve this expense?')) return;

        try {
            toast.loading('Approving...', { id: 'approve' });
            await financeService.approveExpense(id);
            toast.success('Expense approved', { id: 'approve' });
            loadExpenses();
        } catch (error) {
            toast.error('Failed to approve expense', { id: 'approve' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this expense?')) return;

        try {
            toast.loading('Deleting...', { id: 'delete' });
            await financeService.deleteExpense(id);
            toast.success('Expense deleted', { id: 'delete' });
            loadExpenses();
        } catch (error) {
            toast.error('Failed to delete expense', { id: 'delete' });
        }
    };

    const filteredExpenses = expenses.filter(expense => {
        const searchLower = searchTerm.toLowerCase();
        return (
            expense.description?.toLowerCase().includes(searchLower) ||
            expense.category?.toLowerCase().includes(searchLower) ||
            expense.vendor?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
                    <p className="text-gray-600 mt-2">Track and manage business expenses.</p>
                </div>
                <Link to="/finance/expenses/new">
                    <Button className="bg-[#1e3a5f] hover:bg-[#2d4d75]">
                        <Plus className="w-4 h-4 mr-2" /> Add Expense
                    </Button>
                </Link>
            </div>

            <Card className="mb-8">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search by description, category, or vendor..."
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
                                <SelectItem value="PENDING">Pending Approval</SelectItem>
                                <SelectItem value="APPROVED">Approved</SelectItem>
                                <SelectItem value="REJECTED">Rejected</SelectItem>
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
                    ) : filteredExpenses.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>No expenses found.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-16"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredExpenses.map((expense) => (
                                    <TableRow key={expense.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <span>{new Date(expense.expense_date || expense.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{expense.description}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Tag className="w-3 h-3 text-gray-400" />
                                                <span className="text-sm">{expense.category || 'Uncategorized'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600">{expense.vendor || 'N/A'}</TableCell>
                                        <TableCell className="font-bold text-red-600">
                                            ${parseFloat(expense.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={expense.status || 'PENDING'} />
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
                                                    <DropdownMenuItem asChild>
                                                        <Link to={`/finance/expenses/${expense.id}`}>
                                                            <Eye className="w-4 h-4 mr-2" /> View Details
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link to={`/finance/expenses/${expense.id}/edit`}>
                                                            <Edit className="w-4 h-4 mr-2" /> Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    {expense.status === 'PENDING' && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => handleApprove(expense.id)}>
                                                                <DollarSign className="w-4 h-4 mr-2 text-green-600" /> Approve
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => handleDelete(expense.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
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

export default ExpenseList;
