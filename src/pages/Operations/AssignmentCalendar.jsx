import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    List,
    MapPin,
    User,
    Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { operationsService } from '../../services/operationsService';
import { toast } from 'react-hot-toast';

function AssignmentCalendar() {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        loadAssignments();
    }, [currentDate]);

    async function loadAssignments() {
        try {
            setLoading(true);
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const startDate = new Date(year, month, 1).toISOString().split('T')[0];
            const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

            const response = await operationsService.getAssignments({
                start_date: startDate,
                end_date: endDate,
                limit: 200,
            });
            const data = response.data;
            setAssignments(Array.isArray(data) ? data : (data.assignments || []));
        } catch (error) {
            console.error('Failed to load assignments:', error);
            toast.error('Failed to load assignments');
        } finally {
            setLoading(false);
        }
    }

    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const goToPrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const getAssignmentsForDay = (day) => {
        return assignments.filter(a => {
            const assignmentDate = new Date(a.scheduled_start || a.date);
            return (
                assignmentDate.getDate() === day &&
                assignmentDate.getMonth() === currentDate.getMonth() &&
                assignmentDate.getFullYear() === currentDate.getFullYear()
            );
        });
    };

    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'SCHEDULED': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
            case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const today = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push(i);
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Assignment Calendar</h1>
                    <p className="text-gray-600 mt-2">Visual overview of scheduled missions.</p>
                </div>
                <div className="flex gap-2">
                    <Link to="/operations/assignments">
                        <Button variant="outline">
                            <List className="w-4 h-4 mr-2" /> List View
                        </Button>
                    </Link>
                    <Link to="/operations/assignments/new">
                        <Button className="bg-[#1e3a5f] hover:bg-[#2d4d75]">
                            + New Assignment
                        </Button>
                    </Link>
                </div>
            </div>

            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="sm" onClick={goToPrevMonth}>
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <h2 className="text-xl font-semibold min-w-[200px] text-center">{monthName}</h2>
                            <Button variant="outline" size="sm" onClick={goToNextMonth}>
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                        <Button variant="outline" size="sm" onClick={goToToday}>
                            Today
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a5f]"></div>
                </div>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <div className="grid grid-cols-7">
                            {dayNames.map((day) => (
                                <div key={day} className="p-3 text-center text-sm font-semibold text-gray-600 border-b bg-gray-50">
                                    {day}
                                </div>
                            ))}
                            {calendarDays.map((day, index) => {
                                const dayAssignments = day ? getAssignmentsForDay(day) : [];
                                const isToday = day === today.getDate() &&
                                    currentDate.getMonth() === today.getMonth() &&
                                    currentDate.getFullYear() === today.getFullYear();

                                return (
                                    <div
                                        key={index}
                                        className={`min-h-[120px] border-b border-r p-2 ${day ? 'bg-white' : 'bg-gray-50'
                                            } ${isToday ? 'ring-2 ring-inset ring-blue-400 bg-blue-50/30' : ''}`}
                                    >
                                        {day && (
                                            <>
                                                <div className={`text-sm mb-1 ${isToday ? 'font-bold text-blue-600' : 'text-gray-500'}`}>
                                                    {day}
                                                </div>
                                                <div className="space-y-1">
                                                    {dayAssignments.slice(0, 3).map((assignment) => (
                                                        <Link
                                                            key={assignment.id}
                                                            to={`/operations/assignments/${assignment.id}`}
                                                            className={`block p-1 rounded text-xs border cursor-pointer hover:shadow transition-shadow ${getStatusColor(assignment.status)}`}
                                                        >
                                                            <div className="font-medium truncate">
                                                                {assignment.interpreter
                                                                    ? `${assignment.interpreter.first_name} ${assignment.interpreter.last_name?.charAt(0)}.`
                                                                    : `#${assignment.id}`}
                                                            </div>
                                                            {assignment.location && (
                                                                <div className="truncate flex items-center gap-1 mt-0.5">
                                                                    <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                                                                    {assignment.location}
                                                                </div>
                                                            )}
                                                        </Link>
                                                    ))}
                                                    {dayAssignments.length > 3 && (
                                                        <div className="text-xs text-gray-500 pl-1">
                                                            +{dayAssignments.length - 3} more
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Legend */}
            <div className="mt-4 flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-blue-200 border border-blue-300"></div>
                    <span>Scheduled</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-yellow-200 border border-yellow-300"></div>
                    <span>In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-green-200 border border-green-300"></div>
                    <span>Completed</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-red-200 border border-red-300"></div>
                    <span>Cancelled</span>
                </div>
            </div>
        </div>
    );
}

export default AssignmentCalendar;
