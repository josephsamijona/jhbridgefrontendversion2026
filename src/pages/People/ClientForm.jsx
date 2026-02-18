import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Building,
    Mail,
    Phone,
    MapPin,
    User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { peopleService } from '../../services/peopleService';
import { toast } from 'react-hot-toast';

function ClientForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    const [formData, setFormData] = useState({
        company_name: '',
        contact_name: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
    });

    useEffect(() => {
        if (isEdit) {
            loadClient();
        }
    }, [id]);

    async function loadClient() {
        try {
            setFetching(true);
            const response = await peopleService.getClientById(id);
            const data = response.data;
            setFormData({
                company_name: data.company_name || '',
                contact_name: data.contact_name || '',
                email: data.email || '',
                phone: data.phone || '',
                address: data.address || '',
                notes: data.notes || '',
            });
        } catch (error) {
            console.error('Failed to load client:', error);
            toast.error('Failed to load client for editing');
            navigate('/people/clients');
        } finally {
            setFetching(false);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (isEdit) {
                await peopleService.updateClient(id, formData);
                toast.success('Client updated successfully');
            } else {
                await peopleService.createClient(formData);
                toast.success('Client created successfully');
            }
            navigate('/people/clients');
        } catch (error) {
            console.error('Save error:', error);
            toast.error(error.response?.data?.error || 'Failed to save client');
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
                <Button variant="ghost" size="sm" onClick={() => navigate('/people/clients')}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <h1 className="text-3xl font-bold text-gray-900">{isEdit ? 'Edit' : 'New'} Client</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Building className="w-5 h-5" /> Company Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="company_name">Company Name</Label>
                            <Input
                                id="company_name"
                                placeholder="ACME Corporation"
                                value={formData.company_name}
                                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                            />
                            <p className="text-xs text-gray-500">Leave blank for individual clients</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contact_name">Primary Contact Name *</Label>
                            <Input
                                id="contact_name"
                                placeholder="John Doe"
                                value={formData.contact_name}
                                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                                required
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <User className="w-5 h-5" /> Contact Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="contact@company.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                placeholder="+1 (555) 123-4567"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Billing Address</Label>
                            <Textarea
                                id="address"
                                placeholder="123 Main St, City, State ZIP"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                rows={3}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Internal Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            placeholder="Special billing instructions, preferences, etc."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={4}
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => navigate('/people/clients')}>
                        Cancel
                    </Button>
                    <Button type="submit" className="bg-[#1e3a5f] hover:bg-[#2d4d75] h-11 px-8" disabled={loading}>
                        <Save className="w-4 h-4 mr-2" /> {loading ? 'Saving...' : 'Save Client'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default ClientForm;
