import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus,
    Search,
    FileText,
    Calendar,
    Download,
    Eye,
    Tag,
    User,
    MoreHorizontal
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { documentService } from '../../services/documentService';
import { toast } from 'react-hot-toast';

function DocumentCenter() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');

    useEffect(() => {
        loadDocuments();
    }, [typeFilter]);

    async function loadDocuments() {
        try {
            setLoading(true);
            const params = typeFilter !== 'ALL' ? { document_type: typeFilter } : {};
            const response = await documentService.getAll(params);
            setDocuments(Array.isArray(response.data) ? response.data : (response.data.documents || []));
        } catch (error) {
            console.error('Failed to load documents:', error);
            toast.error('Failed to load documents');
        } finally {
            setLoading(false);
        }
    }

    const handleDownload = async (doc) => {
        if (doc.file_url) {
            // Direct S3 URL
            window.open(doc.file_url, '_blank');
        } else {
            toast.error('Document file not available');
        }
    };

    const filteredDocuments = documents.filter(doc => {
        const searchLower = searchTerm.toLowerCase();
        return (
            doc.title?.toLowerCase().includes(searchLower) ||
            doc.description?.toLowerCase().includes(searchLower) ||
            doc.doc_type?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Document Center</h1>
                    <p className="text-gray-600 mt-2">Centralized document management and storage.</p>
                </div>
                <Link to="/documents/upload">
                    <Button className="bg-[#1e3a5f] hover:bg-[#2d4d75]">
                        <Plus className="w-4 h-4 mr-2" /> Upload Document
                    </Button>
                </Link>
            </div>

            <Card className="mb-8">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search documents..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Types</SelectItem>
                                <SelectItem value="CONTRACT">Contracts</SelectItem>
                                <SelectItem value="INVOICE">Invoices</SelectItem>
                                <SelectItem value="STATEMENT">Statements</SelectItem>
                                <SelectItem value="AGREEMENT">Agreements</SelectItem>
                                <SelectItem value="CERTIFICATION">Certifications</SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e3a5f]"></div>
                        </div>
                    ) : filteredDocuments.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>No documents found.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Related To</TableHead>
                                    <TableHead>Uploaded</TableHead>
                                    <TableHead>Size</TableHead>
                                    <TableHead className="w-32"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredDocuments.map((doc) => (
                                    <TableRow key={doc.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <p className="font-medium">{doc.title}</p>
                                                    {doc.description && (
                                                        <p className="text-xs text-gray-500 truncate max-w-md">{doc.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="capitalize">
                                                {doc.doc_type || 'Other'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {doc.related_interpreter_id && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <User className="w-3 h-3 text-gray-400" />
                                                    <Link
                                                        to={`/people/interpreters/${doc.related_interpreter_id}`}
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        Interpreter #{doc.related_interpreter_id}
                                                    </Link>
                                                </div>
                                            )}
                                            {doc.related_client_id && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <User className="w-3 h-3 text-gray-400" />
                                                    <Link
                                                        to={`/people/clients/${doc.related_client_id}`}
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        Client #{doc.related_client_id}
                                                    </Link>
                                                </div>
                                            )}
                                            {!doc.related_interpreter_id && !doc.related_client_id && (
                                                <span className="text-gray-400 text-sm">General</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(doc.createdAt).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-500">
                                            {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDownload(doc)}
                                                >
                                                    <Download className="w-3 h-3 mr-1" /> Download
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default DocumentCenter;
