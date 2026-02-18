import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Download,
    Trash2,
    Calendar,
    User,
    Activity,
    DollarSign,
    FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { statementService } from '../../services/statementService';
import { pdfService } from '../../services/pdfService';
import { toast } from 'react-hot-toast';

function StatementDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [statement, setStatement] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStatement();
    }, [id]);

    async function loadStatement() {
        try {
            setLoading(true);
            const response = await statementService.getById(id);
            setStatement(response.data);
        } catch (error) {
            console.error('Failed to load statement:', error);
            toast.error('Failed to load statement details');
        } finally {
            setLoading(false);
        }
    }

    const handleDownloadPDF = async () => {
        try {
            toast.loading('Getting PDF URL...', { id: 'pdf' });
            const response = await pdfService.getDownloadUrl('statements', id);
            window.open(response.data.url, '_blank');
            toast.success('Ready', { id: 'pdf' });
        } catch (error) {
            console.error('PDF error:', error);
            toast.error('Failed to get PDF URL', { id: 'pdf' });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a5f]"></div>
            </div>
        );
    }

    if (!statement) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-800">Statement not found</h2>
                <Button onClick={() => navigate('/statements')} className="mt-4">
                    Back to list
                </Button>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex items-center mb-8 gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/statements')}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900">Statement {statement.statementId}</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Generated on {new Date(statement.createdAt).toLocaleString()}
                    </p>
                </div>
                <Button variant="outline" onClick={handleDownloadPDF}>
                    <Download className="w-4 h-4 mr-2" /> Download PDF
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="border-b pb-4">
                            <CardTitle>Worker Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-2 gap-8 mb-8">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 uppercase flex items-center gap-2">
                                        <User className="w-4 h-4" /> Personnel
                                    </h3>
                                    <div className="mt-2">
                                        <p className="font-bold text-lg">{statement.workerName}</p>
                                        <p className="text-gray-600 capitalize">{statement.workerType}</p>
                                        <p className="text-xs text-gray-400 mt-1">ID: {statement.workerId}</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 uppercase flex items-center gap-2">
                                        <Calendar className="w-4 h-4" /> Period
                                    </h3>
                                    <div className="mt-2">
                                        <p className="font-bold text-lg capitalize">{statement.type} Statement</p>
                                        <p className="text-gray-600">Year: {statement.year}</p>
                                        {statement.month && <p className="text-gray-600">Month: {statement.month}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-slate-50 p-6 rounded-lg border">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Pay Stubs Count</p>
                                    <p className="text-3xl font-bold text-[#1e3a5f]">{statement.summary?.payStubCount || 0}</p>
                                </div>
                                <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                                    <p className="text-xs text-blue-600 uppercase font-bold mb-1">Total Earnings (Gross)</p>
                                    <p className="text-3xl font-bold text-blue-900">
                                        ${parseFloat(statement.totalGross || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>

                            {statement.missions && statement.missions.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="font-bold border-b pb-2 flex items-center gap-2">
                                        <Activity className="w-4 h-4" /> Activity Breakdown
                                    </h3>
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left">Mission/Assignment</th>
                                                    <th className="px-4 py-2 text-left">Date</th>
                                                    <th className="px-4 py-2 text-right">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {statement.missions.map((m, index) => (
                                                    <tr key={index}>
                                                        <td className="px-4 py-2">{m.description || m.assignmentId || 'N/A'}</td>
                                                        <td className="px-4 py-2">{m.date ? new Date(m.date).toLocaleDateString() : 'N/A'}</td>
                                                        <td className="px-4 py-2 text-right">${parseFloat(m.amount || 0).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="bg-[#1e3a5f] text-white">
                        <CardHeader>
                            <CardTitle className="text-lg">Tax Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-blue-100 text-sm">
                                This document serves as your official record of earnings for the specified period. Re-generate this statement if any underlying pay stubs were modified.
                            </p>
                            <div className="mt-4 p-3 bg-white/10 rounded-lg text-xs space-y-2">
                                <div className="flex justify-between">
                                    <span>Net Pay Total:</span>
                                    <span className="font-bold">${parseFloat(statement.totalNet || 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <FileText className="w-5 h-5" />
                                <span>PDF Document {statement.pdfS3Key ? 'Stored on S3' : 'Not yet generated'}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default StatementDetail;
