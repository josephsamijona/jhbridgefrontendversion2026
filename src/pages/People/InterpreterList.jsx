import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus,
    Search,
    UserPlus,
    MoreHorizontal,
    FileText,
    ShieldAlert,
    Languages,
    Mail,
    Phone
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

function InterpreterList() {
    const [interpreters, setInterpreters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadInterpreters();
    }, []);

    async function loadInterpreters() {
        try {
            setLoading(true);
            const response = await peopleService.getInterpreters();
            setInterpreters(Array.isArray(response.data) ? response.data : (response.data.interpreters || []));
        } catch (error) {
            console.error('Failed to load interpreters:', error);
            toast.error('Failed to load interpreters');
        } finally {
            setLoading(false);
        }
    }

    const handleBlock = async (id, currentStatus) => {
        const action = currentStatus === 'blocked' ? 'unblock' : 'block';
        if (!window.confirm(`Are you sure you want to ${action} this interpreter?`)) return;

        try {
            toast.loading(`${action === 'block' ? 'Blocking' : 'Unblocking'}...`, { id: 'block' });
            await peopleService.blockInterpreter(id, {
                status: action === 'block' ? 'blocked' : 'active',
                reason: 'Manual admin action'
            });
            toast.success(`Interpreter ${action}ed`, { id: 'block' });
            loadInterpreters();
        } catch (error) {
            toast.error(`Failed to ${action} interpreter`, { id: 'block' });
        }
    };

    const filteredInterpreters = interpreters.filter(interp =>
        `${interp.first_name} ${interp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interp.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Interpreters</h1>
                    <p className="text-gray-600 mt-2">Manage your interpreter database and compliance.</p>
                </div>
                <Link to="/people/interpreters/new">
                    <Button className="bg-[#1e3a5f] hover:bg-[#2d4d75]">
                        <UserPlus className="w-4 h-4 mr-2" /> Add Interpreter
                    </Button>
                </Link>
            </div>

            <Card className="mb-8">
                <CardContent className="pt-6">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search by name or email..."
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
                    ) : filteredInterpreters.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            No interpreters found.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Languages</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-16"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredInterpreters.map((interp) => (
                                    <TableRow key={interp.id}>
                                        <TableCell className="font-bold text-[#1e3a5f]">
                                            <Link to={`/people/interpreters/${interp.id}`}>{interp.first_name} {interp.last_name}</Link>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-xs text-gray-500">
                                                <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {interp.email}</span>
                                                <span className="flex items-center gap-1 mt-1"><Phone className="w-3 h-3" /> {interp.phone}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {interp.languages?.slice(0, 3).map((l, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-medium uppercase">
                                                        {l.language?.name || l}
                                                    </span>
                                                ))}
                                                {interp.languages?.length > 3 && (
                                                    <span className="text-[10px] text-gray-400">+{interp.languages.length - 3}</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={interp.status} />
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
                                                        <Link to={`/people/interpreters/${interp.id}`}>
                                                            <FileText className="w-4 h-4 mr-2" /> View Profile
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link to={`/people/interpreters/${interp.id}/edit`}>
                                                            <Languages className="w-4 h-4 mr-2" /> Edit Skills
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className={interp.status === 'blocked' ? 'text-green-600' : 'text-red-600'}
                                                        onClick={() => handleBlock(interp.id, interp.status)}
                                                    >
                                                        <ShieldAlert className="w-4 h-4 mr-2" />
                                                        {interp.status === 'blocked' ? 'Activate Account' : 'Block Interpreter'}
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

export default InterpreterList;
