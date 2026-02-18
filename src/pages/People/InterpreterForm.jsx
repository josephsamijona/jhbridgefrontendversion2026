import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    User,
    Mail,
    Phone,
    Languages,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { peopleService } from '../../services/peopleService';
import { toast } from 'react-hot-toast';

function InterpreterForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        status: 'active',
    });

    useEffect(() => {
        if (isEdit) {
            loadInterpreter();
        }
    }, [id]);

    async function loadInterpreter() {
        try {
            setFetching(true);
            const response = await peopleService.getInterpreterById(id);
            const data = response.data;
            setFormData({
                first_name: data.first_name || '',
                last_name: data.last_name || '',
                email: data.email || '',
                phone: data.phone || '',
                status: data.status || 'active',
            });
        } catch (error) {
            console.error('Failed to load interpreter:', error);
            toast.error('Failed to load interpreter for editing');
            navigate('/people/interpreters');
        } finally {
            setFetching(false);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (isEdit) {
                await peopleService.updateInterpreter(id, formData);
                toast.success('Interpreter updated successfully');
            } else {
                await peopleService.createInterpreter(formData);
                toast.success('Interpreter created successfully');
            }
            navigate('/people/interpreters');
        } catch (error) {
            console.error('Save error:', error);
            toast.error(error.response?.data?.error || 'Failed to save interpreter');
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
        <div className="p-8 max-w-2xl mx-auto">
            <div className="flex items-center mb-8 gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/people/interpreters')}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <h1 className="text-3xl font-bold text-gray-900">{isEdit ? 'Edit' : 'New'} Interpreter</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <User className="w-5 h-5" /> Identity Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="first_name">First Name</Label>
                                <Input
                                    id="first_name"
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last_name">Last Name</Label>
                                <Input
                                    id="last_name"
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                disabled={isEdit} // Email often locked for identity
                            />
                            {isEdit && <p className="text-[10px] text-gray-400">Email cannot be changed after registration.</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5" /> Account Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Select
                            value={formData.status}
                            onValueChange={(val) => setFormData({ ...formData, status: val })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="pending">Pending Verification</SelectItem>
                                <SelectItem value="blocked">Blocked</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                {!isEdit && (
                    <div className="flex bg-blue-50 p-4 rounded-lg border border-blue-100 gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
                        <p className="text-sm text-blue-800">
                            New interpreters will receive an invitation email to set their password and complete their profile.
                        </p>
                    </div>
                )}

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => navigate('/people/interpreters')}>
                        Cancel
                    </Button>
                    <Button type="submit" className="bg-[#1e3a5f] hover:bg-[#2d4d75] h-11 px-8" disabled={loading}>
                        <Save className="w-4 h-4 mr-2" /> {loading ? 'Saving...' : 'Save Profile'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default InterpreterForm;
