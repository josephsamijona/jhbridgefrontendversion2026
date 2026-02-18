import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Mail,
    Phone,
    Building,
    Calendar,
    User,
    MapPin,
    FileText,
    Edit,
    DollarSign,
    TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { peopleService } from '../../services/peopleService';
import { financeService } from '../../services/financeService';
import StatusBadge from '../../components/Common/StatusBadge';
import { toast } from 'react-hot-toast';

function ClientDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [client, setClient] = useState(null);
    const [financials, setFinancials] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [id]);

    async function loadData() {
        try {
            setLoading(true);
            const clientRes = await peopleService.getClientById(id);
            setClient(clientRes.data);

            // Try to fetch financial summary for this client
            try {
                const finRes = await financeService.getTransactions({ clientId: id, limit: 10 });
                setFinancials(finRes.data);
            } catch (e) {
                console.warn('Financial data not available');
            }

        } catch (error) {
            console.error('Failed to load client:', error);
            toast.error('Failed to load client details');
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a5f]"></div>
            </div>
        );
    }

    if (!client) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-800">Client not found</h2>
                <Button onClick={() => navigate('/people/clients')} className="mt-4">
                    Back to list
                </Button>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex items-center mb-8 gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/people/clients')}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <div className="flex-1 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-700">
                        <Building className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{client.company_name || 'Individual Client'}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <StatusBadge status={client.status || 'ACTIVE'} />
                            <span className="text-sm text-gray-500">Client since {new Date(client.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link to={`/invoices/new?clientId=${client.id}`}>
                            <FileText className="w-4 h-4 mr-2" /> New Invoice
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link to={`/people/clients/${id}/edit`}>
                            <Edit className="w-4 h-4 mr-2" /> Edit
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Primary Contact</p>
                                    <p className="text-sm font-medium">{client.contact_name}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Email Address</p>
                                    <p className="text-sm font-medium">{client.email}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Phone Number</p>
                                    <p className="text-sm font-medium">{client.phone || 'Not provided'}</p>
                                </div>
                            </div>
                            {client.address && (
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold">Address</p>
                                        <p className="text-sm font-medium">{client.address}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-green-50 border-green-100">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <DollarSign className="w-5 h-5 text-green-700" />
                                </div>
                                <div>
                                    <p className="text-xs text-green-600 font-bold uppercase">Billing Status</p>
                                    <p className="text-sm text-green-900 font-medium">All payments current</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-2">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="mb-6">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="invoices">Invoices</TabsTrigger>
                            <TabsTrigger value="activity">Activity</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Card>
                                    <CardContent className="pt-6 text-center">
                                        <p className="text-xs text-gray-500 uppercase font-bold">Total Invoiced</p>
                                        <p className="text-2xl font-bold mt-1 text-[#1e3a5f]">$12,450</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6 text-center">
                                        <p className="text-xs text-gray-500 uppercase font-bold">Outstanding</p>
                                        <p className="text-2xl font-bold mt-1 text-orange-600">$0</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6 text-center">
                                        <p className="text-xs text-gray-500 uppercase font-bold">Invoices (Total)</p>
                                        <p className="text-2xl font-bold mt-1 text-blue-600">8</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5" /> Revenue Trend
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="py-10 text-center text-gray-400">
                                    <p className="italic">Chart visualization coming soon.</p>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="invoices">
                            <Card>
                                <CardContent className="p-0">
                                    <div className="py-20 text-center text-gray-500">
                                        <p>View all invoices for this client</p>
                                        <Button variant="link" className="mt-2" onClick={() => navigate(`/invoices?clientId=${id}`)}>
                                            Go to Invoices
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="activity">
                            <Card>
                                <CardContent className="p-0">
                                    <div className="py-20 text-center text-gray-500">
                                        <p>Activity log and interaction history coming soon.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

export default ClientDetail;
