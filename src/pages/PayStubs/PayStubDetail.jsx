import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Download,
    Mail,
    Trash2,
    Calendar,
    User,
    Clock,
    Briefcase
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { paystubService } from '../../services/paystubService';
import { pdfService } from '../../services/pdfService';
import { emailService } from '../../services/emailService';
import StatusBadge from '../../components/Common/StatusBadge';
import { toast } from 'react-hot-toast';

function PayStubDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [stub, setStub] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStub();
    }, [id]);

    async function loadStub() {
        try {
            setLoading(true);
            const response = await paystubService.getById(id);
            setStub(response.data);
        } catch (error) {
            console.error('Failed to load pay stub:', error);
            toast.error('Failed to load pay stub details');
        } finally {
            setLoading(false);
        }
    }

    const handleDownloadPDF = async () => {
        try {
            toast.loading('Generating PDF...', { id: 'pdf' });
            await pdfService.generatePDF('paystubs', id);
            const response = await pdfService.getDownloadUrl('paystubs', id);
            window.open(response.data.url, '_blank');
            toast.success('PDF Generated', { id: 'pdf' });
        } catch (error) {
            console.error('PDF error:', error);
            toast.error('Failed to generate PDF', { id: 'pdf' });
        }
    };

    const handleSendEmail = async () => {
        try {
            const email = prompt("Enter recipient email:", stub.interpreter?.email || "");
            if (!email) return;

            toast.loading('Sending email...', { id: 'email' });
            await emailService.sendWithAttachment('paystubs', id, { to: email });
            toast.success('Email sent successfully', { id: 'email' });
        } catch (error) {
            console.error('Email error:', error);
            toast.error('Failed to send email', { id: 'email' });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a5f]"></div>
            </div>
        );
    }

    if (!stub) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-800">Pay stub not found</h2>
                <Button onClick={() => navigate('/pay-stubs')} className="mt-4">
                    Back to list
                </Button>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex items-center mb-8 gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/pay-stubs')}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900">Pay Stub {stub.payStubId}</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <StatusBadge status={stub.status || 'GENERATED'} />
                        <span className="text-sm text-gray-500">• Created on {new Date(stub.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleDownloadPDF}>
                        <Download className="w-4 h-4 mr-2" /> PDF
                    </Button>
                    <Button variant="outline" onClick={handleSendEmail}>
                        <Mail className="w-4 h-4 mr-2" /> Email
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="border-b pb-4">
                            <CardTitle>Earnings Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-2 gap-8 mb-8">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 uppercase flex items-center gap-2">
                                        <User className="w-4 h-4" /> Interpreter Information
                                    </h3>
                                    <div className="mt-2">
                                        <p className="font-bold text-lg">{stub.interpreter ? `${stub.interpreter.first_name} ${stub.interpreter.last_name}` : 'N/A'}</p>
                                        <p className="text-gray-600">{stub.interpreter?.email}</p>
                                        <p className="text-gray-600">{stub.interpreter?.phone}</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 uppercase flex items-center gap-2">
                                        <Calendar className="w-4 h-4" /> Period
                                    </h3>
                                    <div className="mt-2">
                                        <p className="text-gray-600">Start: {stub.periodStart ? new Date(stub.periodStart).toLocaleDateString() : 'N/A'}</p>
                                        <p className="text-gray-600">End: {stub.periodEnd ? new Date(stub.periodEnd).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="bg-slate-50 p-4 rounded-lg text-center">
                                    <p className="text-xs text-gray-500 uppercase font-bold">Total Hours</p>
                                    <p className="text-2xl font-bold text-[#1e3a5f]">{stub.totalHours || 0}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-lg text-center">
                                    <p className="text-xs text-gray-500 uppercase font-bold">Rate</p>
                                    <p className="text-2xl font-bold text-[#1e3a5f]">${parseFloat(stub.rate || 0).toLocaleString()}/hr</p>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-lg text-center">
                                    <p className="text-xs text-blue-600 uppercase font-bold">Total Pay</p>
                                    <p className="text-2xl font-bold text-blue-900">${parseFloat(stub.totalAmount || 0).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-bold border-b pb-2 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4" /> Included Assignments
                                </h3>
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left">Assignment #</th>
                                                <th className="px-4 py-2 text-left">Date</th>
                                                <th className="px-4 py-2 text-right">Hours</th>
                                                <th className="px-4 py-2 text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {stub.assignments?.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-2">{item.assignmentId}</td>
                                                    <td className="px-4 py-2">{new Date(item.date).toLocaleDateString()}</td>
                                                    <td className="px-4 py-2 text-right">{item.hours}</td>
                                                    <td className="px-4 py-2 text-right">${parseFloat(item.amount).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                            {!stub.assignments && (
                                                <tr>
                                                    <td className="px-4 py-4 text-center text-gray-500" colSpan="4">
                                                        No individual assignments listed.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Quick Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="p-2 bg-purple-50 rounded-full text-purple-600">
                                    <Clock className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="font-medium">Processing Time</p>
                                    <p className="text-gray-500">Scheduled for Friday</p>
                                </div>
                            </div>
                            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                                <p className="text-xs text-yellow-800 font-bold mb-1 uppercase">Note</p>
                                <p className="text-xs text-yellow-700 italic">
                                    Earnings are calculated based on verified assignment hours.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default PayStubDetail;
