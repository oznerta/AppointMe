import React, { useEffect, useState } from 'react';
import { getAllUsers, updateUserRole, deleteUser } from '../../lib/firebase/utils';
import { UserData } from '../../lib/firebase/utils';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SuperAdminDashboard: React.FC = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersData = await getAllUsers(); // Fetch all users
                // Filter for merchants with pending status
                const filteredUsers = usersData.filter((user: UserData) => user.role === 'merchant' && user.status === 'pending');
                setUsers(filteredUsers);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleStatusChange = async (userId: string, newStatus: string) => {
        try {
            await updateUserRole(userId, newStatus); // Update status
            setUsers(prev => prev.map(user => user.id === userId ? { ...user, status: newStatus } : user));
        } catch (error) {
            console.error("Error updating user status:", error);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        try {
            await deleteUser(userId);
            setUsers(prev => prev.filter(user => user.id !== userId));
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Superadmin Dashboard</h1>
            <h2 className="text-xl mb-2">User Management</h2>
            <Table>
                <TableCaption>A list of merchants with pending status.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map(user => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.fullName}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.role}</TableCell>
                            <TableCell>
                                <select 
                                    value={user.status || ''} 
                                    onChange={(e) => handleStatusChange(user.id, e.target.value)}
                                    className="border rounded p-1"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </TableCell>
                            <TableCell>
                                <button 
                                    onClick={() => handleDeleteUser(user.id)} 
                                    className="bg-red-500 text-white rounded px-2 py-1"
                                >
                                    Delete
                                </button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={4} className="text-right font-bold">Total Users:</TableCell>
                        <TableCell className="text-right">{users.length}</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    );
};

export default SuperAdminDashboard;
