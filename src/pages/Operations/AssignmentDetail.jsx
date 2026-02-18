import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Calendar,
    User,
    Building,
    MapPin,
    Clock,
    DollarSign,
    FileText,
    Edit,
    Trash2,
    CheckCircle,
    Languages
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { operationsService } from '../../services/operationsService';
import StatusBadge from '../../components/Common/StatusBadge';
import { toast } from 'react-hot-toast';

function AssignmentDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [assignment, setAssignment] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAssignment();
    }, [id]);

    async function loadAssignment() {
        try {
            setLoading(true);
            const response = await operationsService.getAssignmentById(id);
            setAssignment(response.data);
        } catch (error) {
            console.error('Failed to load assignment:', error);
            toast.error('Failed to load assignment');
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this assignment?')) return;

        try {
            toast.loading('Deleting...', { id: 'delete' });
            await operationsService.deleteAssignment(id);
            toast.success('Assignment deleted', { id: 'delete' });
            navigate('/operations/assignments');
        } catch (error) {
            toast.error('Failed to delete assignment', { id: 'delete' });
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (!window.confirm(`Change assignment status to ${newStatus}?`)) return;

        try {
            toast.loading('Updating...', { id: 'status' });
            await operationsService.updateAssignmentStatus(id, { status: newStatus });
            toast.success('Status updated', { id: 'status' });
            loadAssignment();
        } catch (error) {
            toast.error('Failed to update status', { id: 'status' });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a5f]"></div>
            </div>
        );
    }

    if (!assignment) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-800">Assignment not found</h2>
                <Button onClick={() => navigate('/operations/assignments')} className="mt-4">
                    Back to list
                </Button>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex items-center mb-8 gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/operations/assignments')}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900">Assignment #{assignment.id}</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Created on {new Date(assignment.createdAt).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link to={`/operations/assignments/${id}/edit`}>
                            <Edit className="w-4 h-4 mr-2" /> Edit
                        </Link>
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="border-b pb-4">
                            <CardTitle className="flex items-center justify-between">
                                <span>Assignment Details</span>
                                <StatusBadge status={assignment.status} />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 uppercase flex items-center gap-2 mb-2">
                                        <Calendar className="w-4 h-4" /> Schedule
                                    </h3>
                                    <p className="font-bold text-lg">{new Date(assignment.scheduled_date).toLocaleDateString()}</p>
                                    {assignment.scheduled_time && <p className="text-gray-600">{assignment.scheduled_time}</p>}
                                    {assignment.duration && <p className="text-sm text-gray-500 mt-1">{assignment.duration} hours</p>}
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 uppercase flex items-center gap-2 mb-2">
                                        <MapPin className="w-4 h-4" /> Location
                                    </h3>
                                    <p className="font-medium">{assignment.location || 'Remote'}</p>
                                    {assignment.address && <p className="text-sm text-gray-500 mt-1">{assignment.address}</p>}
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t">
                                <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">Service Details</h3>
                                <div className="flex items-center gap-4">
                                    <Badge variant="secondary" className="px-3 py-1">
                                        {assignment.service_type?.name || 'General Service'}
                                    </Badge>
                                    {assignment.language && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Languages className="w-4 h-4" />
                                            {assignment.language}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {assignment.notes && (
                                <div className="mt-6 pt-6 border-t">
                                    <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Notes</h3>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{assignment.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                            {assignment.status === 'SCHEDULED' && (
                                <Button size="sm" onClick={() => handleStatusChange('IN_PROGRESS')}>
                                    <Clock className="w-4 h-4 mr-2" /> Start Assignment
                                </Button>
                            )}
                            {assignment.status === 'IN_PROGRESS' && (
                                <Button size="sm" onClick={() => handleStatusChange('COMPLETED')} className="bg-green-600 hover:bg-green-700">
                                    <CheckCircle className="w-4 h-4 mr-2" /> Mark Complete
                                </Button>
                            )}
                            {assignment.status !== 'CANCELLED' && (
                                <Button size="sm" variant="outline" onClick={() => handleStatusChange('CANCELLED')}>
                                    Cancel Assignment
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User className="w-5 h-5" /> Interpreter
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {assignment.interpreter ? (
                                <div>
                                    <p className="font-bold text-lg mb-2">
                                        {assignment.interpreter.first_name} {assignment.interpreter.last_name}
                                    </p>
                                    <p className="text-sm text-gray-600">{assignment.interpreter.email}</p>
                                    <p className="text-sm text-gray-600">{assignment.interpreter.phone}</p>
                                    <Button variant="link" className="px-0 mt-2" asChild>
                                        <Link to={`/people/interpreters/${assignment.interpreter_id}`}>
                                            View Profile →
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <p className="text-gray-400 italic">No interpreter assigned</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Building className="w-5 h-5" /> Client
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {assignment.client ? (
                                <div>
                                    <p className="font-bold text-lg mb-2">{assignment.client.company_name || assignment.client.contact_name}</p>
                                    <p className="text-sm text-gray-600">{assignment.client.email}</p>
                                    <p className="text-sm text-gray-600">{assignment.client.phone}</p>
                                    <Button variant="link" className="px-0 mt-2" asChild>
                                        <Link to={`/people/clients/${assignment.client_id}`}>
                                            View Account →
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <p className="text-gray-400 italic">No client assigned</p>
                            )}
                        </CardContent>
                    </Card>

                    {assignment.rate && (
                        <Card className="bg-blue-50 border-blue-100">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <DollarSign className="w-5 h-5 text-blue-700" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-blue-600 font-bold uppercase">Rate</p>
                                        <p className="text-xl font-bold text-blue-900">${assignment.rate}/hr</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AssignmentDetail;
