import React, { useEffect, useState } from 'react';
import { getAllUsers, updateUserStatus, deleteUser } from '../../lib/firebase/utils';
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MdDeleteOutline } from "react-icons/md";
import { GrView } from "react-icons/gr";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const SuperAdminDashboard: React.FC = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersData = await getAllUsers();
                console.log(usersData); // Check what is being returned
                const filteredUsers = usersData.filter(
                    (user: UserData) => user.role === 'merchant' && user.status === 'pending'
                );
                setUsers(filteredUsers);
                console.log(filteredUsers); // Check filtered users
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
            await updateUserStatus(userId, newStatus);
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

    const handleViewUser = (user: UserData) => {
        setSelectedUser(user);
        console.log("Selected User:", user);
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
                                <Select
                                    onValueChange={(newStatus) => handleStatusChange(user.id, newStatus)}
                                    value={user.status ?? undefined}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="approved">Approved</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </TableCell>
                            <TableCell className="flex space-x-4">
                                <button 
                                    onClick={() => handleDeleteUser(user.id)} 
                                    className="bg-red-500 text-white rounded px-2 py-1"
                                >
                                    <MdDeleteOutline size={20} />
                                </button>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <button 
                                            onClick={() => handleViewUser(user)}
                                            className="bg-blue-500 text-white rounded px-2 py-1"
                                        >
                                            <GrView size={20} />
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent>
    <DialogHeader>
        <DialogTitle>Merchant Details</DialogTitle>
    </DialogHeader>
    {selectedUser && (
        <div>
            <p><strong>Full Name:</strong> {selectedUser.fullName}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Brand Name:</strong> {selectedUser.brandName}</p>
            <p><strong>Contact Number:</strong> {selectedUser.contactNumber}</p>
            <p><strong>Service Description:</strong> {selectedUser.serviceDescription}</p>
            <p><strong>Status:</strong> {selectedUser.status}</p>
            <p><strong>User Type:</strong> {selectedUser.userType}</p> {/* Display userType */}
            <p><strong>Brand Logo:</strong> 
                {selectedUser.brandLogo ? (
                    <a href={selectedUser.brandLogo} target="_blank" rel="noopener noreferrer">
                        View Logo
                    </a>
                ) : (
                    <span>No logo available</span> // Handle cases when logo is not available
                )}
            </p>
            {/* Conditional rendering based on userType */}
            {selectedUser.userType === 'freelancer' ? (
                <>
                    <p><strong>ID File:</strong> 
                        {selectedUser.idFile ? (
                            <a href={selectedUser.idFile} target="_blank" rel="noopener noreferrer">
                                View ID File
                            </a>
                        ) : (
                            <span>No ID file available</span> // Handle cases when ID file is not available
                        )}
                    </p>
                    <p><strong>Selfie:</strong> 
                        {selectedUser.selfie ? (
                            <a href={selectedUser.selfie} target="_blank" rel="noopener noreferrer">
                                View Selfie
                            </a>
                        ) : (
                            <span>No selfie available</span> // Handle cases when selfie is not available
                        )}
                    </p>
                </>
            ) : (
                <p><strong>Business License:</strong> 
                    {selectedUser.businessLicense ? (
                        <a href={selectedUser.businessLicense} target="_blank" rel="noopener noreferrer">
                            View Business License
                        </a>
                    ) : (
                        <span>No business license available</span> // Handle cases when business license is not available
                    )}
                </p>
            )}
        </div>
    )}
</DialogContent>

                                </Dialog>
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
