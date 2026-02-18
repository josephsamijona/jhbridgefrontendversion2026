import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Download,
    Mail,
    CheckCircle,
    Trash2,
    Printer,
    Calendar,
    User,
    DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { invoiceService } from '../../services/invoiceService';
import { pdfService } from '../../services/pdfService';
import { emailService } from '../../services/emailService';
import StatusBadge from '../../components/Common/StatusBadge';
import { toast } from 'react-hot-toast';

function InvoiceDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInvoice();
    }, [id]);

    async function loadInvoice() {
        try {
            setLoading(true);
            const response = await invoiceService.getById(id);
            setInvoice(response.data);
        } catch (error) {
            console.error('Failed to load invoice:', error);
            toast.error('Failed to load invoice details');
        } finally {
            setLoading(false);
        }
    }

    const handleDownloadPDF = async () => {
        try {
            toast.loading('Generating PDF...', { id: 'pdf' });
            // First ensure PDF exists on S3
            await pdfService.generatePDF('invoices', id);
            // Then get the download URL
            const response = await pdfService.getDownloadUrl('invoices', id);
            window.open(response.data.url, '_blank');
            toast.success('PDF Generated', { id: 'pdf' });
        } catch (error) {
            console.error('PDF error:', error);
            toast.error('Failed to generate PDF', { id: 'pdf' });
        }
    };

    const handleSendEmail = async () => {
        try {
            const email = prompt("Enter recipient email:", invoice.client?.email || "");
            if (!email) return;

            toast.loading('Sending email...', { id: 'email' });
            await emailService.sendWithAttachment('invoices', id, { to: email });
            toast.success('Email sent successfully', { id: 'email' });
        } catch (error) {
            console.error('Email error:', error);
            toast.error('Failed to send email', { id: 'email' });
        }
    };

    const handleMarkPaid = async () => {
        if (!window.confirm('Mark this invoice as paid?')) return;
        try {
            toast.loading('Updating status...', { id: 'status' });
            await invoiceService.markPaid(id, { method: 'Zelle' }); // Default method
            toast.success('Invoice marked as paid', { id: 'status' });
            loadInvoice(); // Reload
        } catch (error) {
            console.error('Update error:', error);
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

    if (!invoice) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-800">Invoice not found</h2>
                <Button onClick={() => navigate('/invoices')} className="mt-4">
                    Back to list
                </Button>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex items-center mb-8 gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/invoices')}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900">Invoice {invoice.invoiceNumber}</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <StatusBadge status={invoice.status} />
                        <span className="text-sm text-gray-500">• Created on {new Date(invoice.date).toLocaleDateString()}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleDownloadPDF}>
                        <Download className="w-4 h-4 mr-2" /> PDF
                    </Button>
                    <Button variant="outline" onClick={handleSendEmail}>
                        <Mail className="w-4 h-4 mr-2" /> Email
                    </Button>
                    {invoice.status !== 'paid' && (
                        <Button className="bg-green-600 hover:bg-green-700" onClick={handleMarkPaid}>
                            <CheckCircle className="w-4 h-4 mr-2" /> Mark Paid
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="border-b pb-4">
                            <CardTitle>Invoice Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-2 gap-8 mb-8">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 uppercase flex items-center gap-2">
                                        <User className="w-4 h-4" /> Client Information
                                    </h3>
                                    <div className="mt-2">
                                        <p className="font-bold text-lg">{invoice.client?.company_name || 'Individual'}</p>
                                        <p className="text-gray-600">{invoice.client?.contact_name}</p>
                                        <p className="text-gray-600">{invoice.client?.email}</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 uppercase flex items-center gap-2">
                                        <Calendar className="w-4 h-4" /> Payment Details
                                    </h3>
                                    <div className="mt-2">
                                        <p className="text-gray-600">Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                                        {invoice.paidAt && <p className="text-green-600 font-medium">Paid on: {new Date(invoice.paidAt).toLocaleDateString()}</p>}
                                        <p className="text-gray-600">Method: {invoice.paymentMethod || 'None specified'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium text-gray-700">Description</th>
                                            <th className="px-4 py-3 text-right font-medium text-gray-700">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {invoice.items?.map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-3">{item.description}</td>
                                                <td className="px-4 py-3 text-right">${parseFloat(item.amount).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                        {!invoice.items && (
                                            <tr>
                                                <td className="px-4 py-8 text-center text-gray-500" colSpan="2">
                                                    No specific items listed.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                    <tfoot className="bg-gray-50 font-bold border-t">
                                        <tr>
                                            <td className="px-4 py-3 text-right">Subtotal</td>
                                            <td className="px-4 py-3 text-right">${parseFloat(invoice.subtotal || 0).toLocaleString()}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3 text-right">Tax (%)</td>
                                            <td className="px-4 py-3 text-right">{invoice.taxRate || 0}%</td>
                                        </tr>
                                        <tr className="text-lg bg-blue-50 text-[#1e3a5f]">
                                            <td className="px-4 py-4 text-right">Total Amount</td>
                                            <td className="px-4 py-4 text-right">${parseFloat(invoice.totalAmount).toLocaleString()}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {invoice.notes && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 bg-gray-50 p-4 rounded-lg italic font-serif">
                                    "{invoice.notes}"
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Status Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
                                <div className="relative">
                                    <div className="absolute -left-5 top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white ring-4 ring-blue-50"></div>
                                    <p className="font-medium text-sm">Invoice Created</p>
                                    <p className="text-xs text-gray-500">{new Date(invoice.createdAt).toLocaleString()}</p>
                                </div>
                                {invoice.status === 'paid' && (
                                    <div className="relative">
                                        <div className="absolute -left-5 top-1 w-3 h-3 rounded-full bg-green-500 border-2 border-white ring-4 ring-green-50"></div>
                                        <p className="font-medium text-sm">Marked as Paid</p>
                                        <p className="text-xs text-gray-500">{new Date(invoice.paidAt).toLocaleString()}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-blue-900 text-white">
                        <CardContent className="pt-6">
                            <h3 className="font-bold mb-2 flex items-center gap-2">
                                <DollarSign className="w-5 h-5" /> Quick Payment Info
                            </h3>
                            <p className="text-blue-100 text-sm">
                                This invoice can be paid via Zelle or CashApp. Once paid, remember to mark it as processed here.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default InvoiceDetail;
