import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus,
    Search,
    MoreHorizontal,
    FileText,
    Download,
    Trash2,
    Calendar,
    Layers
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
import { statementService } from '../../services/statementService';
import { pdfService } from '../../services/pdfService';
import StatusBadge from '../../components/Common/StatusBadge';
import { toast } from 'react-hot-toast';

function StatementList() {
    const [statements, setStatements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadStatements();
    }, []);

    async function loadStatements() {
        try {
            setLoading(true);
            const response = await statementService.getAll();
            setStatements(Array.isArray(response.data) ? response.data : (response.data.statements || []));
        } catch (error) {
            console.error('Failed to load statements:', error);
            toast.error('Failed to load statements');
        } finally {
            setLoading(false);
        }
    }

    const handleDownloadPDF = async (id) => {
        try {
            toast.loading('Generating PDF URL...', { id: 'pdf' });
            const response = await pdfService.getDownloadUrl('statements', id);
            window.open(response.data.url, '_blank');
            toast.success('Ready for download', { id: 'pdf' });
        } catch (error) {
            console.error('PDF error:', error);
            toast.error('Failed to get PDF URL', { id: 'pdf' });
        }
    };

    const filteredStatements = statements.filter(stmt =>
        stmt.statementId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stmt.workerName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Statements</h1>
                    <p className="text-gray-600 mt-2">Annual and monthly earning summaries for tax and records.</p>
                </div>
                <Link to="/statements/generate">
                    <Button className="bg-[#1e3a5f] hover:bg-[#2d4d75]">
                        <Layers className="w-4 h-4 mr-2" /> Generate Statement
                    </Button>
                </Link>
            </div>

            <Card className="mb-8">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search statement # or name..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 text-sm text-gray-500 items-center">
                            <Calendar className="w-4 h-4" /> Comprehensive repository
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
                    ) : filteredStatements.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            No statements found.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Statement #</TableHead>
                                    <TableHead>Worker</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Period</TableHead>
                                    <TableHead className="text-right">Gross Earnings</TableHead>
                                    <TableHead className="w-16"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStatements.map((stmt) => (
                                    <TableRow key={stmt.id}>
                                        <TableCell className="font-bold text-[#1e3a5f]">
                                            <Link to={`/statements/${stmt.statementId}`}>{stmt.statementId}</Link>
                                        </TableCell>
                                        <TableCell>{stmt.workerName}</TableCell>
                                        <TableCell className="capitalize">{stmt.type}</TableCell>
                                        <TableCell>
                                            {stmt.year} {stmt.month ? `/ ${stmt.month}` : '(Full Year)'}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                            ${parseFloat(stmt.totalGross || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
                                                        <Link to={`/statements/${stmt.statementId}`}>
                                                            <FileText className="w-4 h-4 mr-2" /> View Details
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDownloadPDF(stmt.statementId)}>
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

export default StatementList;
