import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Search,
    FileText,
    Calendar,
    User,
    Download,
    DollarSign,
    MoreHorizontal,
    Filter
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
import StatusBadge from '../../components/Common/StatusBadge';
import { financeService } from '../../services/financeService';
import { pdfService } from '../../services/pdfService';
import { toast } from 'react-hot-toast';

function PayrollDocsList() {
    const [payrollDocs, setPayrollDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        loadPayrollDocs();
    }, [statusFilter]);

    async function loadPayrollDocs() {
        try {
            setLoading(true);
            const params = {};
            if (statusFilter !== 'ALL') params.status = statusFilter;
            const response = await financeService.getPayrollDocuments(params);
            setPayrollDocs(Array.isArray(response.data) ? response.data : (response.data.payrollDocs || []));
        } catch (error) {
            console.error('Failed to load payroll documents:', error);
            toast.error('Failed to load payroll documents');
        } finally {
            setLoading(false);
        }
    }

    const handleDownloadPdf = async (doc) => {
        try {
            toast.loading('Preparing PDF...', { id: 'pdf-download' });
            if (doc.pdf_file) {
                window.open(doc.pdf_file, '_blank');
            } else {
                const response = await pdfService.getDownloadUrl('payroll', doc.id);
                if (response.data?.url) {
                    window.open(response.data.url, '_blank');
                } else {
                    toast.error('PDF not available');
                }
            }
            toast.dismiss('pdf-download');
        } catch (error) {
            toast.error('Failed to download PDF', { id: 'pdf-download' });
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
    };

    const formatPeriod = (start, end) => {
        const s = new Date(start);
        const e = new Date(end);
        return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${e.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    };

    const filteredDocs = payrollDocs.filter(doc => {
        const searchLower = searchTerm.toLowerCase();
        const interpreterName = doc.interpreter
            ? `${doc.interpreter.first_name} ${doc.interpreter.last_name}`.toLowerCase()
            : '';
        return (
            interpreterName.includes(searchLower) ||
            doc.id?.toString().includes(searchLower)
        );
    });

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Payroll Documents</h1>
                    <p className="text-gray-600 mt-2">Period summaries and payroll records for interpreters.</p>
                </div>
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
                                <SelectItem value="DRAFT">Draft</SelectItem>
                                <SelectItem value="FINALIZED">Finalized</SelectItem>
                                <SelectItem value="SENT">Sent</SelectItem>
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
                    ) : filteredDocs.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>No payroll documents found.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Interpreter</TableHead>
                                    <TableHead>Period</TableHead>
                                    <TableHead>Gross Amount</TableHead>
                                    <TableHead>Net Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-16"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredDocs.map((doc) => (
                                    <TableRow key={doc.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                {doc.interpreter ? (
                                                    <Link
                                                        to={`/people/interpreters/${doc.interpreter.id}`}
                                                        className="font-medium text-blue-600 hover:underline"
                                                    >
                                                        {doc.interpreter.first_name} {doc.interpreter.last_name}
                                                    </Link>
                                                ) : (
                                                    <span className="text-gray-400">Unknown</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="w-3 h-3 text-gray-400" />
                                                {doc.period_start && doc.period_end
                                                    ? formatPeriod(doc.period_start, doc.period_end)
                                                    : 'N/A'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium">{formatCurrency(doc.gross_amount)}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-semibold text-green-700">{formatCurrency(doc.net_amount)}</span>
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={doc.status || 'DRAFT'} />
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
                                                    {doc.interpreter && (
                                                        <DropdownMenuItem asChild>
                                                            <Link to={`/people/interpreters/${doc.interpreter.id}`}>
                                                                <User className="w-4 h-4 mr-2" /> View Interpreter
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem onClick={() => handleDownloadPdf(doc)}>
                                                        <Download className="w-4 h-4 mr-2" /> Download PDF
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

export default PayrollDocsList;
