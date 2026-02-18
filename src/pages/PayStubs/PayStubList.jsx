import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus,
    Search,
    MoreHorizontal,
    FileText,
    Download,
    Trash2,
    Calendar
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
import { paystubService } from '../../services/paystubService';
import { pdfService } from '../../services/pdfService';
import StatusBadge from '../../components/Common/StatusBadge';
import { toast } from 'react-hot-toast';

function PayStubList() {
    const [payStubs, setPayStubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadPayStubs();
    }, []);

    async function loadPayStubs() {
        try {
            setLoading(true);
            const response = await paystubService.getAll();
            setPayStubs(Array.isArray(response.data) ? response.data : (response.data.payStubs || []));
        } catch (error) {
            console.error('Failed to load pay stubs:', error);
            toast.error('Failed to load pay stubs');
        } finally {
            setLoading(false);
        }
    }

    const handleDownloadPDF = async (id) => {
        try {
            toast.loading('Generating PDF URL...', { id: 'pdf' });
            const response = await pdfService.getDownloadUrl('paystubs', id);
            window.open(response.data.url, '_blank');
            toast.success('Ready for download', { id: 'pdf' });
        } catch (error) {
            console.error('PDF error:', error);
            toast.error('Failed to get PDF URL', { id: 'pdf' });
        }
    };

    const filteredStubs = payStubs.filter(stub =>
        stub.payStubId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stub.interpreter?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stub.interpreter?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Pay Stubs</h1>
                    <p className="text-gray-600 mt-2">Manage interpreter payments and payroll history.</p>
                </div>
                <Link to="/pay-stubs/new">
                    <Button className="bg-[#1e3a5f] hover:bg-[#2d4d75]">
                        <Plus className="w-4 h-4 mr-2" /> New Pay Stub
                    </Button>
                </Link>
            </div>

            <Card className="mb-8">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search stub # or interpreter..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 text-sm text-gray-500 items-center">
                            <Calendar className="w-4 h-4" /> Last 30 days
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
                    ) : filteredStubs.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            No pay stubs found.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Stub #</TableHead>
                                    <TableHead>Interpreter</TableHead>
                                    <TableHead>Period</TableHead>
                                    <TableHead className="text-right">Total Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-16"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStubs.map((stub) => (
                                    <TableRow key={stub.id}>
                                        <TableCell className="font-bold text-[#1e3a5f]">
                                            <Link to={`/pay-stubs/${stub.payStubId}`}>{stub.payStubId}</Link>
                                        </TableCell>
                                        <TableCell>
                                            {stub.interpreter ? `${stub.interpreter.first_name} ${stub.interpreter.last_name}` : 'N/A'}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {stub.periodStart && stub.periodEnd ?
                                                `${new Date(stub.periodStart).toLocaleDateString()} - ${new Date(stub.periodEnd).toLocaleDateString()}` :
                                                new Date(stub.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                            ${parseFloat(stub.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={stub.status || 'NEW'} />
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
                                                        <Link to={`/pay-stubs/${stub.payStubId}`}>
                                                            <FileText className="w-4 h-4 mr-2" /> View Details
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDownloadPDF(stub.payStubId)}>
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

export default PayStubList;
