import { Badge } from "@/components/ui/badge";

const StatusBadge = ({ status }) => {
    const getVariant = (status) => {
        switch (status?.toUpperCase()) {
            case 'PAID':
            case 'PROCESSED':
            case 'APPROVED':
            case 'COMPLETED':
            case 'ACTIVE':
                return 'default'; // Success (default badge is usually primary color, let's assume it's used for success)
            case 'PENDING':
            case 'SCHEDULED':
            case 'NEW':
            case 'VIEWED':
                return 'secondary'; // Warning/Pending
            case 'REJECTED':
            case 'EXPIRED':
            case 'ARCHIVED':
            case 'CANCELLED':
                return 'destructive'; // Error
            default:
                return 'outline';
        }
    };

    return (
        <Badge variant={getVariant(status)}>
            {status?.replace('_', ' ')}
        </Badge>
    );
};

export default StatusBadge;
