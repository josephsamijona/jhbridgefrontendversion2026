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
    ShoppingBag
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
import { invoiceService } from '../../services/invoiceService';
import { peopleService } from '../../services/peopleService';
import { toast } from 'react-hot-toast';

function InvoiceForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingClients, setFetchingClients] = useState(true);

    const [formData, setFormData] = useState({
        clientId: '',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: [{ description: '', amount: 0 }],
        taxRate: 0,
        notes: '',
    });

    const [totals, setTotals] = useState({
        subtotal: 0,
        tax: 0,
        total: 0
    });

    useEffect(() => {
        loadClients();
        if (isEdit) {
            loadInvoice();
        }
    }, [id]);

    useEffect(() => {
        calculateTotals();
    }, [formData.items, formData.taxRate]);

    async function loadClients() {
        try {
            setFetchingClients(true);
            const response = await peopleService.getClients();
            // Handle different response formats
            setClients(Array.isArray(response.data) ? response.data : (response.data.clients || []));
        } catch (error) {
            console.error('Failed to load clients:', error);
            toast.error('Could not load client list');
        } finally {
            setFetchingClients(false);
        }
    }

    async function loadInvoice() {
        try {
            setLoading(true);
            const response = await invoiceService.getById(id);
            const data = response.data;
            setFormData({
                clientId: data.clientId?.toString() || '',
                date: data.date?.split('T')[0] || '',
                dueDate: data.dueDate?.split('T')[0] || '',
                items: data.items || [{ description: '', amount: 0 }],
                taxRate: data.taxRate || 0,
                notes: data.notes || '',
            });
        } catch (error) {
            console.error('Failed to load invoice:', error);
            toast.error('Failed to load invoice for editing');
            navigate('/invoices');
        } finally {
            setLoading(false);
        }
    }

    const calculateTotals = () => {
        const subtotal = formData.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        const tax = subtotal * (formData.taxRate / 100);
        const total = subtotal + tax;
        setTotals({ subtotal, tax, total });
    };

    const handleAddItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { description: '', amount: 0 }]
        });
    };

    const handleRemoveItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        setFormData({ ...formData, items: newItems });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.clientId) {
            toast.error('Please select a client');
            return;
        }

        try {
            setLoading(true);
            const payload = {
                ...formData,
                subtotal: totals.subtotal,
                totalAmount: totals.total,
            };

            if (isEdit) {
                await invoiceService.update(id, payload);
                toast.success('Invoice updated successfully');
            } else {
                await invoiceService.create(payload);
                toast.success('Invoice created successfully');
            }
            navigate('/invoices');
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Failed to save invoice');
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
                <Button variant="ghost" size="sm" onClick={() => navigate('/invoices')}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <h1 className="text-3xl font-bold text-gray-900">{isEdit ? 'Edit' : 'New'} Invoice</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User className="w-5 h-5" /> Basic Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="client">Client</Label>
                                <Select
                                    value={formData.clientId}
                                    onValueChange={(val) => setFormData({ ...formData, clientId: val })}
                                    disabled={fetchingClients}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={fetchingClients ? "Loading clients..." : "Select a client"} />
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

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="date">Invoice Date</Label>
                                    <Input
                                        type="date"
                                        id="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dueDate">Due Date</Label>
                                    <Input
                                        type="date"
                                        id="dueDate"
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Calculator className="w-5 h-5" /> Financial Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                                <Input
                                    type="number"
                                    id="taxRate"
                                    step="0.01"
                                    value={formData.taxRate}
                                    onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="pt-4 border-t space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal:</span>
                                    <span className="font-bold">${totals.subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Tax ({formData.taxRate}%):</span>
                                    <span>${totals.tax.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-lg text-[#1e3a5f] font-bold pt-2 border-t">
                                    <span>Grand Total:</span>
                                    <span>${totals.total.toLocaleString()}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5" /> Line Items
                        </CardTitle>
                        <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                            <Plus className="w-4 h-4 mr-2" /> Add Item
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {formData.items.map((item, index) => (
                                <div key={index} className="flex gap-4 items-end pb-4 border-b last:border-0 last:pb-0">
                                    <div className="flex-1 space-y-2">
                                        <Label className="text-xs">Description</Label>
                                        <Input
                                            placeholder="Service description..."
                                            value={item.description}
                                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="w-32 space-y-2">
                                        <Label className="text-xs">Amount ($)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={item.amount}
                                            onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:text-red-700"
                                        onClick={() => handleRemoveItem(index)}
                                        disabled={formData.items.length === 1}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Additional Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <textarea
                            className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background"
                            placeholder="Internal or external notes..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => navigate('/invoices')}>
                        Cancel
                    </Button>
                    <Button type="submit" className="bg-[#1e3a5f] hover:bg-[#2d4d75]" disabled={loading}>
                        <Save className="w-4 h-4 mr-2" /> {loading ? 'Saving...' : 'Save Invoice'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default InvoiceForm;
