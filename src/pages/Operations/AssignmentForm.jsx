import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Calendar,
    User,
    Building,
    MapPin,
    DollarSign,
    Clock,
    FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { operationsService } from '../../services/operationsService';
import { peopleService } from '../../services/peopleService';
import { toast } from 'react-hot-toast';

function AssignmentForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    const [interpreters, setInterpreters] = useState([]);
    const [clients, setClients] = useState([]);
    const [serviceTypes, setServiceTypes] = useState([]);

    const [formData, setFormData] = useState({
        interpreter_id: '',
        client_id: '',
        service_type_id: '',
        start_time: '',
        end_time: '',
        location: '',
        address: '',
        interpreter_rate: '',
        client_rate: '',
        notes: '',
    });

    useEffect(() => {
        loadSelections();
        if (isEdit) {
            loadAssignment();
        }
    }, [id]);

    async function loadSelections() {
        try {
            const [interpRes, clientRes, serviceRes] = await Promise.all([
                peopleService.getInterpreters(),
                peopleService.getClients(),
                operationsService.getServiceTypes(),
            ]);

            setInterpreters(Array.isArray(interpRes.data) ? interpRes.data : (interpRes.data.interpreters || []));
            setClients(Array.isArray(clientRes.data) ? clientRes.data : (clientRes.data.clients || []));
            setServiceTypes(Array.isArray(serviceRes.data) ? serviceRes.data : []);
        } catch (error) {
            console.error('Failed to load selections:', error);
            toast.error('Failed to load form data');
        }
    }

    async function loadAssignment() {
        try {
            setFetching(true);
            const response = await operationsService.getAssignmentById(id);
            const data = response.data;

            setFormData({
                interpreter_id: data.interpreter_id || '',
                client_id: data.client_id || '',
                service_type_id: data.service_type_id || '',
                start_time: data.start_time ? new Date(data.start_time).toISOString().slice(0, 16) : '',
                end_time: data.end_time ? new Date(data.end_time).toISOString().slice(0, 16) : '',
                location: data.location || '',
                address: data.address || '',
                interpreter_rate: data.interpreter_rate || '',
                client_rate: data.client_rate || '',
                notes: data.notes || '',
            });
        } catch (error) {
            console.error('Failed to load assignment:', error);
            toast.error('Failed to load assignment for editing');
            navigate('/operations/assignments');
        } finally {
            setFetching(false);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            const payload = {
                ...formData,
                interpreter_id: formData.interpreter_id ? parseInt(formData.interpreter_id) : null,
                client_id: formData.client_id ? parseInt(formData.client_id) : null,
                service_type_id: formData.service_type_id ? parseInt(formData.service_type_id) : null,
                interpreter_rate: formData.interpreter_rate ? parseFloat(formData.interpreter_rate) : null,
                client_rate: formData.client_rate ? parseFloat(formData.client_rate) : null,
            };

            if (isEdit) {
                await operationsService.updateAssignment(id, payload);
                toast.success('Assignment updated successfully');
            } else {
                await operationsService.createAssignment(payload);
                toast.success('Assignment created successfully');
            }
            navigate('/operations/assignments');
        } catch (error) {
            console.error('Save error:', error);
            toast.error(error.response?.data?.error || 'Failed to save assignment');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a5f]"></div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <div className="flex items-center mb-8 gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/operations/assignments')}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <h1 className="text-3xl font-bold text-gray-900">{isEdit ? 'Edit' : 'New'} Assignment</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <User className="w-5 h-5" /> Participants
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="interpreter_id">Interpreter *</Label>
                            <Select
                                value={formData.interpreter_id.toString()}
                                onValueChange={(val) => setFormData({ ...formData, interpreter_id: val })}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select interpreter..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {interpreters.map(interp => (
                                        <SelectItem key={interp.id} value={interp.id.toString()}>
                                            {interp.first_name} {interp.last_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="client_id">Client *</Label>
                            <Select
                                value={formData.client_id.toString()}
                                onValueChange={(val) => setFormData({ ...formData, client_id: val })}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select client..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.map(client => (
                                        <SelectItem key={client.id} value={client.id.toString()}>
                                            {client.company_name || client.contact_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Calendar className="w-5 h-5" /> Schedule & Service
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="start_time">Start Date & Time *</Label>
                                <Input
                                    id="start_time"
                                    type="datetime-local"
                                    value={formData.start_time}
                                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end_time">End Date & Time</Label>
                                <Input
                                    id="end_time"
                                    type="datetime-local"
                                    value={formData.end_time}
                                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="service_type_id">Service Type</Label>
                            <Select
                                value={formData.service_type_id.toString()}
                                onValueChange={(val) => setFormData({ ...formData, service_type_id: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select service type..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {serviceTypes.map(st => (
                                        <SelectItem key={st.id} value={st.id.toString()}>
                                            {st.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <MapPin className="w-5 h-5" /> Location
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="location">Location Name</Label>
                            <Input
                                id="location"
                                placeholder="e.g., Hospital, Court, Remote"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Full Address</Label>
                            <Textarea
                                id="address"
                                placeholder="123 Main St, City, State ZIP"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                rows={2}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <DollarSign className="w-5 h-5" /> Rates
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="interpreter_rate">Interpreter Rate ($/hr)</Label>
                                <Input
                                    id="interpreter_rate"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.interpreter_rate}
                                    onChange={(e) => setFormData({ ...formData, interpreter_rate: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="client_rate">Client Rate ($/hr)</Label>
                                <Input
                                    id="client_rate"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.client_rate}
                                    onChange={(e) => setFormData({ ...formData, client_rate: e.target.value })}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="w-5 h-5" /> Notes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            placeholder="Special instructions, requirements, or additional details..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={4}
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => navigate('/operations/assignments')}>
                        Cancel
                    </Button>
                    <Button type="submit" className="bg-[#1e3a5f] hover:bg-[#2d4d75] h-11 px-8" disabled={loading}>
                        <Save className="w-4 h-4 mr-2" /> {loading ? 'Saving...' : 'Save Assignment'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default AssignmentForm;
