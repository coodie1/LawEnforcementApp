import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search, RefreshCw, Filter } from "lucide-react";
import { activityLogsAPI } from "@/api";
import { toast } from "sonner";
import type { ActivityLog } from "@/types";
import { format } from "date-fns";

export default function ActivityLogs() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({
        entityType: "all",
        action: "all",
        userId: "all",
    });
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 1,
    });
    const [entityTypes, setEntityTypes] = useState<string[]>([]);
    const [users, setUsers] = useState<Array<{ id: string; name: string; email: string }>>([]);

    useEffect(() => {
        fetchLogs();
        fetchFilters();
    }, [pagination.page, filters]);

    const fetchLogs = async () => {
        try {
            setIsLoading(true);
            const params: any = {
                page: pagination.page,
                limit: pagination.limit,
            };

            if (filters.entityType !== "all") {
                params.entityType = filters.entityType;
            }
            if (filters.action !== "all") {
                params.action = filters.action;
            }
            if (filters.userId !== "all") {
                params.userId = filters.userId;
            }

            const response = await activityLogsAPI.getAll(params);
            setLogs(response.logs);
            setPagination(response.pagination);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to fetch activity logs");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchFilters = async () => {
        try {
            // Fetch unique entity types and users from logs
            const response = await activityLogsAPI.getAll({ limit: 1000 });
            const uniqueEntityTypes = Array.from(
                new Set(response.logs.map((log) => log.entityType))
            ).sort();
            setEntityTypes(uniqueEntityTypes);

            const uniqueUsers = Array.from(
                new Set(
                    response.logs.map((log) => ({
                        id: log.userId,
                        name: log.userName,
                        email: log.userEmail,
                    }))
                )
            ).filter((user, index, self) => 
                index === self.findIndex((u) => u.id === user.id)
            );
            setUsers(uniqueUsers);
        } catch (error) {
            console.error("Failed to fetch filter options:", error);
        }
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const handleSearch = () => {
        // Filter logs client-side based on search query
        fetchLogs();
    };

    const getActionBadgeVariant = (action: string) => {
        switch (action) {
            case "create":
                return "default";
            case "update":
                return "secondary";
            case "delete":
                return "destructive";
            default:
                return "outline";
        }
    };

    const getEntityTypeColor = (entityType: string) => {
        const colors: Record<string, string> = {
            cases: "bg-blue-100 text-blue-800",
            arrests: "bg-purple-100 text-purple-800",
            evidence: "bg-green-100 text-green-800",
            forensics: "bg-yellow-100 text-yellow-800",
            reports: "bg-pink-100 text-pink-800",
            officers: "bg-gray-100 text-gray-800",
            departments: "bg-indigo-100 text-indigo-800",
            people: "bg-teal-100 text-teal-800",
            incidents: "bg-orange-100 text-orange-800",
            locations: "bg-amber-100 text-amber-800",
            charges: "bg-rose-100 text-rose-800",
            vehicles: "bg-red-100 text-red-800",
            weapons: "bg-slate-100 text-slate-800",
        };
        return colors[entityType] || "bg-gray-100 text-gray-800";
    };

    const filteredLogs = logs.filter((log) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            log.userName?.toLowerCase().includes(query) ||
            log.userEmail?.toLowerCase().includes(query) ||
            log.entityType?.toLowerCase().includes(query) ||
            log.entityName?.toLowerCase().includes(query) ||
            log.action?.toLowerCase().includes(query)
        );
    });

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Activity Logs</h1>
                    <p className="text-muted-foreground mt-1">
                        Track all user actions and system changes
                    </p>
                </div>
                <Button onClick={fetchLogs} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-card rounded-lg border p-4 space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <Filter className="h-4 w-4" />
                    Filters
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Entity Type</label>
                        <Select
                            value={filters.entityType}
                            onValueChange={(value) => handleFilterChange("entityType", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                {entityTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Action</label>
                        <Select
                            value={filters.action}
                            onValueChange={(value) => handleFilterChange("action", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All Actions" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Actions</SelectItem>
                                <SelectItem value="create">Create</SelectItem>
                                <SelectItem value="update">Update</SelectItem>
                                <SelectItem value="delete">Delete</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">User</label>
                        <Select
                            value={filters.userId}
                            onValueChange={(value) => handleFilterChange("userId", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All Users" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Users</SelectItem>
                                {users.map((user) => (
                                    <SelectItem key={user.id} value={user.id}>
                                        {user.name} ({user.email})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Search</label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Search logs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSearch();
                                }}
                            />
                            <Button onClick={handleSearch} size="sm" variant="outline">
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-card rounded-lg border">
                {isLoading ? (
                    <div className="p-8 text-center text-muted-foreground">
                        Loading activity logs...
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        No activity logs found
                    </div>
                ) : (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Entity Type</TableHead>
                                    <TableHead>Entity</TableHead>
                                    <TableHead>Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLogs.map((log) => (
                                    <TableRow key={log._id}>
                                        <TableCell className="font-mono text-sm">
                                            {format(
                                                new Date(log.createdAt),
                                                "MMM dd, yyyy HH:mm:ss"
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{log.userName}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {log.userEmail}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getActionBadgeVariant(log.action)}>
                                                {log.action.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={getEntityTypeColor(log.entityType)}
                                            >
                                                {log.entityType}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">
                                            {log.entityName || log.entityId}
                                        </TableCell>
                                        <TableCell>
                                            {log.changes && Object.keys(log.changes).length > 0 ? (
                                                <div className="text-xs text-muted-foreground max-w-xs truncate">
                                                    {Object.keys(log.changes).length} field(s) changed
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="flex items-center justify-between p-4 border-t">
                                <div className="text-sm text-muted-foreground">
                                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                                    {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                                    of {pagination.total} logs
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setPagination((prev) => ({
                                                ...prev,
                                                page: Math.max(1, prev.page - 1),
                                            }))
                                        }
                                        disabled={pagination.page === 1}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setPagination((prev) => ({
                                                ...prev,
                                                page: Math.min(
                                                    prev.totalPages,
                                                    prev.page + 1
                                                ),
                                            }))
                                        }
                                        disabled={pagination.page === pagination.totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}




