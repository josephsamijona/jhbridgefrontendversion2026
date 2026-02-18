import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Search,
    FileSignature,
    Calendar,
    User,
    Download,
    AlertTriangle,
    MoreHorizontal,
    Plus,
    CheckCircle,
    Clock,
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
import { Badge } from '@/components/ui/badge';
import StatusBadge from '../../components/Common/StatusBadge';
import { documentService } from '../../services/documentService';
import { toast } from 'react-hot-toast';

function ContractsPage() {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        loadContracts();
    }, [statusFilter]);

    async function loadContracts() {
        try {
            setLoading(true);
            const params = { document_type: 'Contract' };
            if (statusFilter !== 'ALL') params.status = statusFilter;
            const response = await documentService.getAll(params);
            setContracts(Array.isArray(response.data) ? response.data : (response.data.documents || []));
        } catch (error) {
            console.error('Failed to load contracts:', error);
            toast.error('Failed to load contracts');
        } finally {
            setLoading(false);
        }
    }

    const handleArchive = async (id) => {
        if (!window.confirm('Archive this contract?')) return;
        try {
            await documentService.delete(id);
            toast.success('Contract archived');
            loadContracts();
        } catch (error) {
            toast.error('Failed to archive contract');
        }
    };

    const isExpiringSoon = (date) => {
        if (!date) return false;
        const expDate = new Date(date);
        const now = new Date();
        const diffDays = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 30;
    };

    const isExpired = (date) => {
        if (!date) return false;
        return new Date(date) < new Date();
    };

    const filteredContracts = contracts.filter(doc => {
        const searchLower = searchTerm.toLowerCase();
        return (
            doc.title?.toLowerCase().includes(searchLower) ||
            doc.description?.toLowerCase().includes(searchLower) ||
            doc.interpreter?.first_name?.toLowerCase().includes(searchLower) ||
            doc.interpreter?.last_name?.toLowerCase().includes(searchLower) ||
            doc.client?.company_name?.toLowerCase().includes(searchLower) ||
            doc.client?.contact_name?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Contracts</h1>
                    <p className="text-gray-600 mt-2">Manage interpreter and client contracts.</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-100">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Active</p>
                                <p className="text-2xl font-bold">{contracts.filter(c => c.status === 'ACTIVE').length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-yellow-100">
                                <Clock className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Expiring Soon</p>
                                <p className="text-2xl font-bold">{contracts.filter(c => isExpiringSoon(c.expiration_date) && !isExpired(c.expiration_date)).length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-100">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Expired</p>
                                <p className="text-2xl font-bold">{contracts.filter(c => isExpired(c.expiration_date)).length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="mb-8">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search contracts by name or company..."
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
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="ARCHIVED">Archived</SelectItem>
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
                    ) : filteredContracts.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            <FileSignature className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>No contracts found.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Contract</TableHead>
                                    <TableHead>Related To</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead>Expires</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-16"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredContracts.map((contract) => (
                                    <TableRow key={contract.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <FileSignature className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <p className="font-medium">{contract.title}</p>
                                                    {contract.description && (
                                                        <p className="text-xs text-gray-500 truncate max-w-sm">{contract.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {contract.interpreter ? (
                                                <Link
                                                    to={`/people/interpreters/${contract.interpreter.id}`}
                                                    className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                                                >
                                                    <User className="w-3 h-3" />
                                                    {contract.interpreter.first_name} {contract.interpreter.last_name}
                                                </Link>
                                            ) : contract.client ? (
                                                <Link
                                                    to={`/people/clients/${contract.client.id}`}
                                                    className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                                                >
                                                    <User className="w-3 h-3" />
                                                    {contract.client.company_name || contract.client.contact_name}
                                                </Link>
                                            ) : (
                                                <span className="text-gray-400 text-sm">General</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(contract.created_at).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {contract.expiration_date ? (
                                                <div className={`flex items-center gap-1 text-sm ${isExpired(contract.expiration_date)
                                                        ? 'text-red-600 font-semibold'
                                                        : isExpiringSoon(contract.expiration_date)
                                                            ? 'text-yellow-600 font-semibold'
                                                            : 'text-gray-600'
                                                    }`}>
                                                    {isExpired(contract.expiration_date) && <AlertTriangle className="w-3 h-3" />}
                                                    {isExpiringSoon(contract.expiration_date) && !isExpired(contract.expiration_date) && <Clock className="w-3 h-3" />}
                                                    {new Date(contract.expiration_date).toLocaleDateString()}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-sm">No expiry</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={contract.status || 'ACTIVE'} />
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
                                                    {contract.file_url && (
                                                        <DropdownMenuItem onClick={() => window.open(contract.file_url, '_blank')}>
                                                            <Download className="w-4 h-4 mr-2" /> Download
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => handleArchive(contract.id)}
                                                    >
                                                        Archive Contract
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

export default ContractsPage;
