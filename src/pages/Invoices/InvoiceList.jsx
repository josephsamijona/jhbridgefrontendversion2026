import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    FileText,
    Mail,
    CheckCircle,
    Download,
    Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { invoiceService } from '../../services/invoiceService';
import { pdfService } from '../../services/pdfService';
import StatusBadge from '../../components/Common/StatusBadge';
import { toast } from 'react-hot-toast';

function InvoiceList() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    useEffect(() => {
        loadInvoices();
    }, [filterStatus]);

    async function loadInvoices() {
        try {
            setLoading(true);
            const params = {};
            if (filterStatus) params.status = filterStatus;

            const response = await invoiceService.getAll(params);
            setInvoices(response.data.invoices || []);
        } catch (error) {
            console.error('Failed to load invoices:', error);
            toast.error('Failed to load invoices');
        } finally {
            setLoading(false);
        }
    }

    const handleDownloadPDF = async (id) => {
        try {
            toast.loading('Generating PDF URL...', { id: 'pdf' });
            const response = await pdfService.getDownloadUrl('invoices', id);
            window.open(response.data.url, '_blank');
            toast.success('Ready for download', { id: 'pdf' });
        } catch (error) {
            console.error('PDF error:', error);
            toast.error('Failed to get PDF URL', { id: 'pdf' });
        }
    };

    const filteredInvoices = invoices.filter(inv =>
        inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.client?.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
                    <p className="text-gray-600 mt-2">Manage your client invoices and payments.</p>
                </div>
                <Link to="/invoices/new">
                    <Button className="bg-[#1e3a5f] hover:bg-[#2d4d75]">
                        <Plus className="w-4 h-4 mr-2" /> New Invoice
                    </Button>
                </Link>
            </div>

            <Card className="mb-8">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search invoice # or client..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setFilterStatus('')} className={!filterStatus ? 'bg-slate-100' : ''}>
                                All
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setFilterStatus('PENDING')} className={filterStatus === 'PENDING' ? 'bg-slate-100' : ''}>
                                Pending
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setFilterStatus('PAID')} className={filterStatus === 'PAID' ? 'bg-slate-100' : ''}>
                                Paid
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e3a5f]"></div>
                        </div>
                    ) : filteredInvoices.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            No invoices found.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice #</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-16"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredInvoices.map((invoice) => (
                                    <TableRow key={invoice.id}>
                                        <TableCell className="font-bold text-[#1e3a5f]">
                                            <Link to={`/invoices/${invoice.id}`}>{invoice.invoiceNumber}</Link>
                                        </TableCell>
                                        <TableCell>{invoice.client?.company_name || 'N/A'}</TableCell>
                                        <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right font-semibold">
                                            ${parseFloat(invoice.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={invoice.status} />
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
                                                        <Link to={`/invoices/${invoice.id}`}>
                                                            <FileText className="w-4 h-4 mr-2" /> View Details
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDownloadPDF(invoice.id)}>
                                                        <Download className="w-4 h-4 mr-2" /> Download PDF
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-600">
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

export default InvoiceList;
