import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Plus,
    Trash2,
    Save,
    Calculator,
    Calendar,
    User,
    Clock
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
import { paystubService } from '../../services/paystubService';
import { peopleService } from '../../services/peopleService';
import { toast } from 'react-hot-toast';

function PayStubForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [interpreters, setInterpreters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingInterpreters, setFetchingInterpreters] = useState(true);

    const [formData, setFormData] = useState({
        interpreterId: '',
        periodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        periodEnd: new Date().toISOString().split('T')[0],
        totalHours: 0,
        rate: 0,
        totalAmount: 0,
        status: 'GENERATED',
    });

    useEffect(() => {
        loadInterpreters();
        if (isEdit) {
            loadStub();
        }
    }, [id]);

    useEffect(() => {
        const total = (parseFloat(formData.totalHours) || 0) * (parseFloat(formData.rate) || 0);
        setFormData(prev => ({ ...prev, totalAmount: total }));
    }, [formData.totalHours, formData.rate]);

    async function loadInterpreters() {
        try {
            setFetchingInterpreters(true);
            const response = await peopleService.getInterpreters();
            setInterpreters(Array.isArray(response.data) ? response.data : (response.data.interpreters || []));
        } catch (error) {
            console.error('Failed to load interpreters:', error);
            toast.error('Could not load interpreter list');
        } finally {
            setFetchingInterpreters(false);
        }
    }

    async function loadStub() {
        try {
            setLoading(true);
            const response = await paystubService.getById(id);
            const data = response.data;
            setFormData({
                interpreterId: data.interpreterId?.toString() || '',
                periodStart: data.periodStart?.split('T')[0] || '',
                periodEnd: data.periodEnd?.split('T')[0] || '',
                totalHours: data.totalHours || 0,
                rate: data.rate || 0,
                totalAmount: data.totalAmount || 0,
                status: data.status || 'GENERATED',
            });
        } catch (error) {
            console.error('Failed to load pay stub:', error);
            toast.error('Failed to load pay stub for editing');
            navigate('/pay-stubs');
        } finally {
            setLoading(false);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.interpreterId) {
            toast.error('Please select an interpreter');
            return;
        }

        try {
            setLoading(true);
            if (isEdit) {
                await paystubService.update(id, formData);
                toast.success('Pay stub updated successfully');
            } else {
                await paystubService.create(formData);
                toast.success('Pay stub created successfully');
            }
            navigate('/pay-stubs');
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Failed to save pay stub');
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEdit) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a5f]"></div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex items-center mb-8 gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/pay-stubs')}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <h1 className="text-3xl font-bold text-gray-900">{isEdit ? 'Edit' : 'New'} Pay Stub</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User className="w-5 h-5" /> Interpreter & Period
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="interpreter">Interpreter</Label>
                                <Select
                                    value={formData.interpreterId}
                                    onValueChange={(val) => setFormData({ ...formData, interpreterId: val })}
                                    disabled={fetchingInterpreters}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={fetchingInterpreters ? "Loading interpreters..." : "Select an interpreter"} />
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

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="periodStart">Period Start</Label>
                                    <Input
                                        type="date"
                                        id="periodStart"
                                        value={formData.periodStart}
                                        onChange={(e) => setFormData({ ...formData, periodStart: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="periodEnd">Period End</Label>
                                    <Input
                                        type="date"
                                        id="periodEnd"
                                        value={formData.periodEnd}
                                        onChange={(e) => setFormData({ ...formData, periodEnd: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Calculator className="w-5 h-5" /> Payment Calculation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="totalHours">Total Hours</Label>
                                    <Input
                                        type="number"
                                        id="totalHours"
                                        step="0.1"
                                        value={formData.totalHours}
                                        onChange={(e) => setFormData({ ...formData, totalHours: parseFloat(e.target.value) || 0 })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="rate">Rate ($/hr)</Label>
                                    <Input
                                        type="number"
                                        id="rate"
                                        step="0.01"
                                        value={formData.rate}
                                        onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) || 0 })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="pt-6 border-t">
                                <div className="flex justify-between items-center text-xl text-blue-900 font-bold">
                                    <span>Total Amount:</span>
                                    <span>${formData.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => navigate('/pay-stubs')}>
                        Cancel
                    </Button>
                    <Button type="submit" className="bg-[#1e3a5f] hover:bg-[#2d4d75]" disabled={loading}>
                        <Save className="w-4 h-4 mr-2" /> {loading ? 'Saving...' : 'Save Pay Stub'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default PayStubForm;
