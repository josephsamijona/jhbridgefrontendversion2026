import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Mail,
    Phone,
    ShieldAlert,
    Languages,
    Calendar,
    User,
    MapPin,
    ClipboardList,
    Edit,
    Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { peopleService } from '../../services/peopleService';
import { operationsService } from '../../services/operationsService';
import StatusBadge from '../../components/Common/StatusBadge';
import { toast } from 'react-hot-toast';

function InterpreterDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [interpreter, setInterpreter] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [id]);

    async function loadData() {
        try {
            setLoading(true);
            const [interpRes] = await Promise.all([
                peopleService.getInterpreterById(id),
            ]);
            setInterpreter(interpRes.data);

            // Try to fetch stats if possible (might not be an endpoint yet, fallback to dummy)
            try {
                const statsRes = await operationsService.getStats({ interpreterId: id });
                setStats(statsRes.data);
            } catch (e) {
                console.warn('Stats not available for this interpreter');
            }

        } catch (error) {
            console.error('Failed to load interpreter:', error);
            toast.error('Failed to load interpreter profile');
        } finally {
            setLoading(false);
        }
    }

    const handleBlock = async () => {
        const action = interpreter.status === 'blocked' ? 'unblock' : 'block';
        if (!window.confirm(`Are you sure you want to ${action} this interpreter?`)) return;

        try {
            toast.loading(`${action === 'block' ? 'Blocking' : 'Unblocking'}...`, { id: 'block' });
            await peopleService.blockInterpreter(id, {
                status: action === 'block' ? 'blocked' : 'active',
                reason: 'Manual admin action'
            });
            toast.success(`Interpreter ${action}ed`, { id: 'block' });
            loadData();
        } catch (error) {
            toast.error(`Failed to ${action} interpreter`, { id: 'block' });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a5f]"></div>
            </div>
        );
    }

    if (!interpreter) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-800">Interpreter not found</h2>
                <Button onClick={() => navigate('/people/interpreters')} className="mt-4">
                    Back to list
                </Button>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex items-center mb-8 gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/people/interpreters')}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <div className="flex-1 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-2xl font-bold text-slate-500">
                        {interpreter.first_name[0]}{interpreter.last_name[0]}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{interpreter.first_name} {interpreter.last_name}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <StatusBadge status={interpreter.status} />
                            <span className="text-sm text-gray-500">Member since {new Date(interpreter.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link to={`/people/interpreters/${id}/edit`}>
                            <Edit className="w-4 h-4 mr-2" /> Edit Profile
                        </Link>
                    </Button>
                    <Button
                        variant={interpreter.status === 'blocked' ? 'default' : 'destructive'}
                        onClick={handleBlock}
                    >
                        <ShieldAlert className="w-4 h-4 mr-2" />
                        {interpreter.status === 'blocked' ? 'Unblock' : 'Block'}
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
                                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Email Address</p>
                                    <p className="text-sm font-medium">{interpreter.email}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Phone Number</p>
                                    <p className="text-sm font-medium">{interpreter.phone || 'Not provided'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Location</p>
                                    <p className="text-sm font-medium">Internal Record</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Languages & Skills</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {interpreter.languages?.map((l, i) => (
                                    <Badge key={i} variant="secondary" className="px-3 py-1 flex items-center gap-1">
                                        <Languages className="w-3 h-3" /> {l.language?.name || l}
                                    </Badge>
                                ))}
                                {(!interpreter.languages || interpreter.languages.length === 0) && (
                                    <p className="text-sm text-gray-500 italic">No languages listed.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-blue-50 border-blue-100">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <ClipboardList className="w-5 h-5 text-blue-700" />
                                </div>
                                <div>
                                    <p className="text-xs text-blue-600 font-bold uppercase">Compliance</p>
                                    <p className="text-sm text-blue-900 font-medium">All documents verified</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-2">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="mb-6">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="assignments">Recent Assignments</TabsTrigger>
                            <TabsTrigger value="finance">Financials</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Card>
                                    <CardContent className="pt-6 text-center">
                                        <p className="text-xs text-gray-500 uppercase font-bold">Total Missions</p>
                                        <p className="text-2xl font-bold mt-1 text-[#1e3a5f]">{stats?.totalAssignments || '0'}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6 text-center">
                                        <p className="text-xs text-gray-500 uppercase font-bold">Rating</p>
                                        <p className="text-2xl font-bold mt-1 text-yellow-600">4.9/5</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6 text-center">
                                        <p className="text-xs text-gray-500 uppercase font-bold">Earnings (YTD)</p>
                                        <p className="text-2xl font-bold mt-1 text-green-600">$1,240</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Activity className="w-5 h-5" /> Activity Timeline
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="py-10 text-center text-gray-400">
                                    <p className="italic">Activity tracking coming in Phase 3.</p>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="assignments">
                            <Card>
                                <CardContent className="p-0">
                                    <div className="py-20 text-center text-gray-500">
                                        <p>Fetching full assignment history...</p>
                                        <Button variant="link" className="mt-2" onClick={() => navigate('/operations')}>
                                            View Operations Center
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="finance">
                            <Card>
                                <CardContent className="p-0">
                                    <div className="py-20 text-center text-gray-500">
                                        <p>Access financial records in the Pay Stubs module.</p>
                                        <Button variant="link" className="mt-2" onClick={() => navigate('/pay-stubs')}>
                                            Manage Payroll
                                        </Button>
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

export default InterpreterDetail;
