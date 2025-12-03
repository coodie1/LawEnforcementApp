import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Edit, Trash2, Plus, Search, FileText } from "lucide-react";
import { usersAPI, activityLogsAPI } from "@/api";
import type { ActivityLog } from "@/types";
import { toast } from "sonner";
import type { User } from "@/types";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";

export default function UserList() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [activityLogDialogOpen, setActivityLogDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredUsers(users);
        } else {
            const query = searchQuery.toLowerCase();
            setFilteredUsers(
                users.filter(
                    (user) =>
                        user.email?.toLowerCase().includes(query) ||
                        user.firstName?.toLowerCase().includes(query) ||
                        user.lastName?.toLowerCase().includes(query) ||
                        user.role?.toLowerCase().includes(query)
                )
            );
        }
    }, [searchQuery, users]);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const data = await usersAPI.getAll();
            setUsers(data);
            setFilteredUsers(data);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to fetch users");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!userToDelete) return;

        try {
            // Convert ID to string - handle both string and ObjectId formats
            const userId = typeof userToDelete.id === 'string' 
                ? userToDelete.id 
                : userToDelete.id.toString();
            
            await usersAPI.delete(userId);
            toast.success("User deleted successfully");
            fetchUsers();
            setDeleteDialogOpen(false);
            setUserToDelete(null);
        } catch (error: any) {
            console.error("Delete error:", error);
            const errorMsg = error.response?.data?.message || error.message || "Failed to delete user";
            toast.error(errorMsg);
        }
    };

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case "admin":
                return "destructive";
            case "officer":
                return "default";
            case "analyst":
                return "secondary";
            default:
                return "outline";
        }
    };

    const handleViewActivityLogs = async (user: User) => {
        setSelectedUser(user);
        setActivityLogDialogOpen(true);
        setIsLoadingLogs(true);
        
        try {
            const userId = typeof user.id === 'string' ? user.id : user.id.toString();
            const response = await activityLogsAPI.getAll({ userId, limit: 100 });
            setActivityLogs(response.logs);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to fetch activity logs");
        } finally {
            setIsLoadingLogs(false);
        }
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
            users: "bg-violet-100 text-violet-800",
        };
        return colors[entityType] || "bg-gray-100 text-gray-800";
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-muted-foreground">Loading users...</div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground">Manage system users and their roles</p>
                </div>
                <Button onClick={() => navigate("/admin/users/create")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground">
                                    No users found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        {user.firstName} {user.lastName}
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge 
                                            variant={getRoleBadgeVariant(user.role)}
                                            className={user.role === "analyst" ? "bg-yellow-500 text-white border-transparent hover:bg-yellow-600" : ""}
                                        >
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {user.temporaryPassword ? (
                                            <Badge variant="outline" className="text-orange-600">
                                                Temporary Password
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-green-600">
                                                Active
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                                                onClick={() =>
                                                    navigate(`/admin/users/edit/${user.id}`)
                                                }
                                            >
                                                <Edit className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 hover:text-blue-600"
                                                onClick={() => handleViewActivityLogs(user)}
                                                title="View Activity Logs"
                                            >
                                                <FileText className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                onClick={() => {
                                                    setUserToDelete(user);
                                                    setDeleteDialogOpen(true);
                                                }}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user{" "}
                            <strong>
                                {userToDelete?.firstName} {userToDelete?.lastName}
                            </strong>{" "}
                            from the system.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={activityLogDialogOpen} onOpenChange={setActivityLogDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            Activity Logs - {selectedUser?.firstName} {selectedUser?.lastName}
                        </DialogTitle>
                        <DialogDescription>
                            View all actions performed by this user
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                        {isLoadingLogs ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Loading activity logs...
                            </div>
                        ) : activityLogs.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No activity logs found for this user
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Timestamp</TableHead>
                                            <TableHead>Action</TableHead>
                                            <TableHead>Entity Type</TableHead>
                                            <TableHead>Entity</TableHead>
                                            <TableHead>Details</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {activityLogs.map((log) => (
                                            <TableRow key={log._id}>
                                                <TableCell className="font-mono text-sm">
                                                    {format(
                                                        new Date(log.createdAt),
                                                        "MMM dd, yyyy HH:mm:ss"
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getActionBadgeVariant(log.action)}>
                                                        {log.action.toUpperCase()}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getEntityTypeColor(log.entityType)}>
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
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

