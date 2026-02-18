import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus,
    Search,
    Calendar,
    User,
    Building,
    MapPin,
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
    CheckCircle,
    Clock
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
import { operationsService } from '../../services/operationsService';
import StatusBadge from '../../components/Common/StatusBadge';
import { toast } from 'react-hot-toast';

function AssignmentList() {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        loadAssignments();
    }, [statusFilter]);

    async function loadAssignments() {
        try {
            setLoading(true);
            const params = statusFilter !== 'ALL' ? { status: statusFilter } : {};
            const response = await operationsService.getAssignments(params);
            setAssignments(Array.isArray(response.data) ? response.data : (response.data.assignments || []));
        } catch (error) {
            console.error('Failed to load assignments:', error);
            toast.error('Failed to load assignments');
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this assignment?')) return;

        try {
            toast.loading('Deleting...', { id: 'delete' });
            await operationsService.deleteAssignment(id);
            toast.success('Assignment deleted', { id: 'delete' });
            loadAssignments();
        } catch (error) {
            toast.error('Failed to delete assignment', { id: 'delete' });
        }
    };

    const filteredAssignments = assignments.filter(assignment => {
        const searchLower = searchTerm.toLowerCase();
        return (
            assignment.interpreter?.first_name?.toLowerCase().includes(searchLower) ||
            assignment.interpreter?.last_name?.toLowerCase().includes(searchLower) ||
            assignment.client?.company_name?.toLowerCase().includes(searchLower) ||
            assignment.location?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
                    <p className="text-gray-600 mt-2">Manage interpreter missions and scheduling.</p>
                </div>
                <Link to="/operations/assignments/new">
                    <Button className="bg-[#1e3a5f] hover:bg-[#2d4d75]">
                        <Plus className="w-4 h-4 mr-2" /> New Assignment
                    </Button>
                </Link>
            </div>

            <Card className="mb-8">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search by interpreter, client, or location..."
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
                                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
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
                    ) : filteredAssignments.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>No assignments found.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Interpreter</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Service Type</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-16"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAssignments.map((assignment) => (
                                    <TableRow key={assignment.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <p className="font-medium">{new Date(assignment.scheduled_date).toLocaleDateString()}</p>
                                                    <p className="text-xs text-gray-500">{assignment.scheduled_time || 'TBD'}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span className="font-medium">
                                                    {assignment.interpreter?.first_name} {assignment.interpreter?.last_name}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Building className="w-4 h-4 text-gray-400" />
                                                <span>{assignment.client?.company_name || assignment.client?.contact_name || 'N/A'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">{assignment.service_type?.name || 'General'}</span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <MapPin className="w-3 h-3" />
                                                {assignment.location || 'Remote'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={assignment.status} />
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
                                                        <Link to={`/operations/assignments/${assignment.id}`}>
                                                            <Eye className="w-4 h-4 mr-2" /> View Details
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link to={`/operations/assignments/${assignment.id}/edit`}>
                                                            <Edit className="w-4 h-4 mr-2" /> Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => handleDelete(assignment.id)}
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

export default AssignmentList;
