import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Search,
    FileText,
    Calendar,
    User,
    Building,
    DollarSign,
    Plus,
    MoreHorizontal,
    ArrowRight,
    Send,
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
import StatusBadge from '../../components/Common/StatusBadge';
import { invoiceService } from '../../services/invoiceService';
import { toast } from 'react-hot-toast';

function QuotesPage() {
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const navigate = useNavigate();

    useEffect(() => {
        loadQuotes();
    }, [statusFilter]);

    async function loadQuotes() {
        try {
            setLoading(true);
            const params = { type: 'QUOTE' };
            if (statusFilter !== 'ALL') params.status = statusFilter;
            const response = await invoiceService.getAll(params);
            const allInvoices = Array.isArray(response.data)
                ? response.data
                : (response.data.invoices || []);
            // Filter for quotes (invoices with status QUOTE or DRAFT used as quotes)
            const filtered = allInvoices.filter(inv =>
                inv.status === 'QUOTE' || inv.status === 'DRAFT'
            );
            setQuotes(filtered);
        } catch (error) {
            console.error('Failed to load quotes:', error);
            toast.error('Failed to load quotes');
        } finally {
            setLoading(false);
        }
    }

    const handleConvertToInvoice = async (quote) => {
        if (!window.confirm('Convert this quote to an invoice?')) return;
        try {
            await invoiceService.update(quote.id, { status: 'UNPAID' });
            toast.success('Quote converted to invoice');
            navigate(`/invoices/${quote.id}`);
        } catch (error) {
            toast.error('Failed to convert quote');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
    };

    const filteredQuotes = quotes.filter(quote => {
        const searchLower = searchTerm.toLowerCase();
        const clientName = typeof quote.client === 'object'
            ? (quote.client?.name || quote.client?.company_name || '')
            : (quote.client || '');
        return (
            clientName.toLowerCase().includes(searchLower) ||
            quote.invoiceNumber?.toLowerCase().includes(searchLower) ||
            quote.id?.toString().includes(searchLower)
        );
    });

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Quotes</h1>
                    <p className="text-gray-600 mt-2">Create and manage quotes before converting to invoices.</p>
                </div>
                <Link to="/invoices/new?type=quote">
                    <Button className="bg-[#1e3a5f] hover:bg-[#2d4d75]">
                        <Plus className="w-4 h-4 mr-2" /> New Quote
                    </Button>
                </Link>
            </div>

            <Card className="mb-8">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search quotes by client or number..."
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
                                <SelectItem value="ALL">All Quotes</SelectItem>
                                <SelectItem value="QUOTE">Quote</SelectItem>
                                <SelectItem value="DRAFT">Draft</SelectItem>
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
                    ) : filteredQuotes.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>No quotes found.</p>
                            <Link to="/invoices/new?type=quote">
                                <Button variant="outline" className="mt-4">
                                    Create Your First Quote
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Quote #</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-16"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredQuotes.map((quote) => {
                                    const clientName = typeof quote.client === 'object'
                                        ? (quote.client?.name || quote.client?.company_name || 'Unknown')
                                        : (quote.client || 'Unknown');
                                    return (
                                        <TableRow key={quote.id}>
                                            <TableCell>
                                                <Link
                                                    to={`/invoices/${quote.id}`}
                                                    className="font-medium text-blue-600 hover:underline"
                                                >
                                                    {quote.invoiceNumber || `Q-${quote.id}`}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Building className="w-4 h-4 text-gray-400" />
                                                    <span>{clientName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(quote.date || quote.createdAt).toLocaleDateString()}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-semibold">{formatCurrency(quote.total)}</span>
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge status={quote.status} />
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
                                                            <Link to={`/invoices/${quote.id}`}>
                                                                <FileText className="w-4 h-4 mr-2" /> View Details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link to={`/invoices/${quote.id}/edit`}>
                                                                <FileText className="w-4 h-4 mr-2" /> Edit Quote
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleConvertToInvoice(quote)}>
                                                            <ArrowRight className="w-4 h-4 mr-2" /> Convert to Invoice
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default QuotesPage;
