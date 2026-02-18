import { useState, useEffect } from 'react';
import {
    MessageSquare,
    Mail,
    Calendar,
    User,
    Eye,
    Trash2,
    Reply,
    MoreHorizontal
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import StatusBadge from '../../components/Common/StatusBadge';
import { commsService } from '../../services/commsService';
import { toast } from 'react-hot-toast';

function ContactMessageList() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMessages();
    }, []);

    async function loadMessages() {
        try {
            setLoading(true);
            const response = await commsService.getContactMessages();
            setMessages(Array.isArray(response.data) ? response.data : (response.data.messages || []));
        } catch (error) {
            console.error('Failed to load messages:', error);
            toast.error('Failed to load contact messages');
        } finally {
            setLoading(false);
        }
    }

    const handleMarkAsRead = async (id) => {
        try {
            await commsService.updateMessageStatus(id, { status: 'READ' });
            toast.success('Marked as read');
            loadMessages();
        } catch (error) {
            toast.error('Failed to update message');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Archive this message?')) return;

        try {
            await commsService.updateMessageStatus(id, { status: 'ARCHIVED' });
            toast.success('Message archived');
            loadMessages();
        } catch (error) {
            toast.error('Failed to archive message');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a5f]"></div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
                    <p className="text-gray-600 mt-2">Messages from the public contact form.</p>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    {messages.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>No contact messages yet.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-16"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {messages.map((message) => (
                                    <TableRow key={message.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="w-3 h-3 text-gray-400" />
                                                {new Date(message.createdAt).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span className="font-medium">{message.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-3 h-3 text-gray-400" />
                                                <a href={`mailto:${message.email}`} className="text-blue-600 hover:underline text-sm">
                                                    {message.email}
                                                </a>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="font-medium">{message.subject}</p>
                                            <p className="text-xs text-gray-500 truncate max-w-md">{message.message}</p>
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={message.status || 'NEW'} />
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => window.location.href = `mailto:${message.email}`}>
                                                        <Reply className="w-4 h-4 mr-2" /> Reply via Email
                                                    </DropdownMenuItem>
                                                    {message.status !== 'READ' && (
                                                        <DropdownMenuItem onClick={() => handleMarkAsRead(message.id)}>
                                                            <Eye className="w-4 h-4 mr-2" /> Mark as Read
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => handleDelete(message.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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

export default ContactMessageList;
