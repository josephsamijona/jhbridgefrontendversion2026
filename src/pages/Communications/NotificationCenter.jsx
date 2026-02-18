import { useState, useEffect } from 'react';
import {
    Bell,
    CheckCircle,
    Info,
    AlertCircle,
    Calendar,
    Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { commsService } from '../../services/commsService';
import { toast } from 'react-hot-toast';

function NotificationCenter() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    async function loadNotifications() {
        try {
            setLoading(true);
            const response = await commsService.getNotifications();
            setNotifications(Array.isArray(response.data) ? response.data : (response.data.notifications || []));
        } catch (error) {
            console.error('Failed to load notifications:', error);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    }

    const handleMarkAsRead = async (id) => {
        try {
            await commsService.markNotificationRead(id);
            loadNotifications();
        } catch (error) {
            toast.error('Failed to mark as read');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this notification?')) return;

        try {
            await commsService.deleteNotification(id);
            toast.success('Notification deleted');
            loadNotifications();
        } catch (error) {
            toast.error('Failed to delete notification');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            toast.loading('Marking all as read...', { id: 'mark-all' });
            await commsService.markAllNotificationsRead();
            toast.success('All marked as read', { id: 'mark-all' });
            loadNotifications();
        } catch (error) {
            toast.error('Failed to mark all as read', { id: 'mark-all' });
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'SUCCESS': return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'WARNING': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
            case 'ERROR': return <AlertCircle className="w-5 h-5 text-red-600" />;
            default: return <Info className="w-5 h-5 text-blue-600" />;
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a5f]"></div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Bell className="w-8 h-8" />
                        Notifications
                        {unreadCount > 0 && (
                            <Badge className="bg-red-600">{unreadCount} New</Badge>
                        )}
                    </h1>
                    <p className="text-gray-600 mt-2">Stay updated with system alerts and messages.</p>
                </div>
                {unreadCount > 0 && (
                    <Button variant="outline" onClick={handleMarkAllAsRead}>
                        <CheckCircle className="w-4 h-4 mr-2" /> Mark All as Read
                    </Button>
                )}
            </div>

            {notifications.length === 0 ? (
                <Card>
                    <CardContent className="py-20 text-center text-gray-500">
                        <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg">No notifications yet</p>
                        <p className="text-sm mt-2">You're all caught up!</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {notifications.map((notification) => (
                        <Card
                            key={notification.id}
                            className={`transition-all ${notification.is_read ? 'bg-white' : 'bg-blue-50 border-blue-200'}`}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1">{getIcon(notification.notification_type)}</div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                                                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(notification.createdAt).toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                {!notification.is_read && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleMarkAsRead(notification.id)}
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(notification.id)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

export default NotificationCenter;
