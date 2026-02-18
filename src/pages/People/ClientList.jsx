import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus,
    Search,
    Building,
    MoreHorizontal,
    FileText,
    Mail,
    Phone,
    Briefcase
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
import { peopleService } from '../../services/peopleService';
import StatusBadge from '../../components/Common/StatusBadge';
import { toast } from 'react-hot-toast';

function ClientList() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadClients();
    }, []);

    async function loadClients() {
        try {
            setLoading(true);
            const response = await peopleService.getClients();
            setClients(Array.isArray(response.data) ? response.data : (response.data.clients || []));
        } catch (error) {
            console.error('Failed to load clients:', error);
            toast.error('Failed to load clients');
        } finally {
            setLoading(false);
        }
    }

    const filteredClients = clients.filter(client =>
        client.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
                    <p className="text-gray-600 mt-2">Manage customer relationships and billing accounts.</p>
                </div>
                <Link to="/people/clients/new">
                    <Button className="bg-[#1e3a5f] hover:bg-[#2d4d75]">
                        <Plus className="w-4 h-4 mr-2" /> Add Client
                    </Button>
                </Link>
            </div>

            <Card className="mb-8">
                <CardContent className="pt-6">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search by company or contact..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e3a5f]"></div>
                        </div>
                    ) : filteredClients.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            No clients found.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Company</TableHead>
                                    <TableHead>Primary Contact</TableHead>
                                    <TableHead>Billing Email</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-16"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredClients.map((client) => (
                                    <TableRow key={client.id}>
                                        <TableCell className="font-bold text-[#1e3a5f]">
                                            <Link to={`/people/clients/${client.id}`}>{client.company_name || 'Individual'}</Link>
                                        </TableCell>
                                        <TableCell>{client.contact_name}</TableCell>
                                        <TableCell className="text-sm">
                                            <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-gray-400" /> {client.email}</span>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-gray-400" /> {client.phone}</span>
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={client.status || 'ACTIVE'} />
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
                                                        <Link to={`/people/clients/${client.id}`}>
                                                            <FileText className="w-4 h-4 mr-2" /> View Account
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link to={`/invoices/new?clientId=${client.id}`}>
                                                            <Briefcase className="w-4 h-4 mr-2" /> New Invoice
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-600">
                                                        Deactivate
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

export default ClientList;
