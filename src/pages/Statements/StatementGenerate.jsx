import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Layers,
    User,
    Calendar,
    AlertCircle,
    FileCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { statementService } from '../../services/statementService';
import { peopleService } from '../../services/peopleService';
import { toast } from 'react-hot-toast';

function StatementGenerate() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [interpreters, setInterpreters] = useState([]);

    const [formData, setFormData] = useState({
        workerId: '',
        workerType: 'contractor',
        type: 'monthly',
        year: new Date().getFullYear().toString(),
        month: (new Date().getMonth() + 1).toString(),
    });

    const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());
    const months = [
        { value: '1', label: 'January' }, { value: '2', label: 'February' },
        { value: '3', label: 'March' }, { value: '4', label: 'April' },
        { value: '5', label: 'May' }, { value: '6', label: 'June' },
        { value: '7', label: 'July' }, { value: '8', label: 'August' },
        { value: '9', label: 'September' }, { value: '10', label: 'October' },
        { value: '11', label: 'November' }, { value: '12', label: 'December' },
    ];

    useEffect(() => {
        loadInterpreters();
    }, []);

    async function loadInterpreters() {
        try {
            setFetchingData(true);
            const response = await peopleService.getInterpreters();
            setInterpreters(Array.isArray(response.data) ? response.data : (response.data.interpreters || []));
        } catch (error) {
            console.error('Failed to load interpreters:', error);
            toast.error('Could not load interpreter list');
        } finally {
            setFetchingData(false);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.workerId) {
            toast.error('Please select an interpreter');
            return;
        }

        try {
            setLoading(true);
            toast.loading('Aggregating data and generating statement...', { id: 'stmt' });

            const payload = {
                ...formData,
                workerId: parseInt(formData.workerId),
                year: parseInt(formData.year),
                month: formData.type === 'monthly' ? parseInt(formData.month) : undefined
            };

            const response = await statementService.generate(payload);
            toast.success('Statement generated successfully', { id: 'stmt' });
            navigate(`/statements/${response.data.statementId}`);
        } catch (error) {
            console.error('Generation error:', error);
            toast.error(error.response?.data?.error || 'Failed to generate statement', { id: 'stmt' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <div className="flex items-center mb-8 gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/statements')}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <h1 className="text-3xl font-bold text-gray-900">Generate Statement</h1>
            </div>

            <AlertCircle className="w-12 h-12 text-blue-500 mb-4 mx-auto" />
            <div className="text-center mb-8">
                <p className="text-gray-600">
                    Statements aggregate all pay stubs for a specific period into a single document.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <User className="w-5 h-5" /> Target Worker
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Interpreter</Label>
                            <Select
                                value={formData.workerId}
                                onValueChange={(val) => setFormData({ ...formData, workerId: val })}
                                disabled={fetchingData}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={fetchingData ? "Loading interpreters..." : "Select an interpreter"} />
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
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Calendar className="w-5 h-5" /> Timeframe & Type
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Statement Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(val) => setFormData({ ...formData, type: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="annual">Annual</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Year</Label>
                                <Select
                                    value={formData.year}
                                    onValueChange={(val) => setFormData({ ...formData, year: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {formData.type === 'monthly' && (
                            <div className="space-y-2 pt-2">
                                <Label>Month</Label>
                                <Select
                                    value={formData.month}
                                    onValueChange={(val) => setFormData({ ...formData, month: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Button type="submit" className="w-full bg-[#1e3a5f] hover:bg-[#2d4d75] h-12" disabled={loading}>
                    <FileCheck className="w-5 h-5 mr-2" /> {loading ? 'Generating...' : 'Generate New Statement'}
                </Button>
            </form>
        </div>
    );
}

export default StatementGenerate;
