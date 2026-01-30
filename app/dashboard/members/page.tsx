"use client";


import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getUsers, createUser, updateUser, updateUserRole, deleteUser } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserPlus, Mail, Phone, Trash2, Edit } from "lucide-react";
import { formatDate, toTitleCase, getNameValidationError, getPhoneValidationError, formatKenyanPhone } from "@/lib/utils";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "sonner";

export default function MembersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MembersPageContent />
    </Suspense>
  );
}

function MembersPageContent() {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    role: "MEMBER" as "ADMIN" | "MEMBER" | "TREASURER",
  });

  useEffect(() => {
    loadUsers();
    
    // Auto-open dialog if action=new
    if (searchParams.get("action") === "new") {
      setDialogOpen(true);
    }
  }, [searchParams]);

  const loadUsers = async () => {
    setLoading(true);
    const result = await getUsers();
    if (result.success) {
      setUsers(result.users || []);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      name: "",
      phone: "",
      role: "MEMBER",
    });
    setNameError(null);
    setPhoneError(null);
    setIsEditing(false);
    setEditId(null);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const handleEdit = (user: any) => {
    setFormData({
      email: user.email,
      password: "", // Don't fill password
      name: user.name,
      phone: user.phone || "",
      role: user.role,
    });
    setEditId(user.id);
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleNameChange = (value: string) => {
    setFormData({ ...formData, name: value });
    // Clear error when user starts typing
    if (nameError) {
      setNameError(null);
    }
  };

  const handleNameBlur = () => {
    // Validate and capitalize on blur
    const error = getNameValidationError(formData.name);
    setNameError(error);
    
    if (!error && formData.name) {
      // Auto-capitalize if valid
      setFormData({ ...formData, name: toTitleCase(formData.name) });
    }
  };

  const handlePhoneChange = (value: string) => {
    setFormData({ ...formData, phone: value });
    // Clear error when user starts typing
    if (phoneError) {
      setPhoneError(null);
    }
  };

  const handlePhoneBlur = () => {
    // Validate and format on blur
    if (!formData.phone) {
      setPhoneError(null);
      return;
    }
    
    const error = getPhoneValidationError(formData.phone);
    setPhoneError(error);
    
    if (!error && formData.phone) {
      // Auto-format if valid
      setFormData({ ...formData, phone: formatKenyanPhone(formData.phone) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validation before submit
    const nameErr = getNameValidationError(formData.name);
    const phoneErr = formData.phone ? getPhoneValidationError(formData.phone) : null;
    
    if (nameErr) {
      setNameError(nameErr);
      return;
    }
    
    if (phoneErr) {
      setPhoneError(phoneErr);
      return;
    }

    // Ensure name is capitalized and phone is formatted before submitting
    const capitalizedData = {
      ...formData,
      name: toTitleCase(formData.name),
      phone: formData.phone ? formatKenyanPhone(formData.phone) : undefined,
    };

    let result;
    
    if (isEditing && editId) {
      result = await updateUser(editId, {
        name: capitalizedData.name,
        email: capitalizedData.email,
        // Only update password if it's not empty
        ...(capitalizedData.password && { password: capitalizedData.password }),
        phone: capitalizedData.phone,
        role: capitalizedData.role,
      });
    } else {
      result = await createUser(capitalizedData);
    }

    if (result.success) {
      setDialogOpen(false);
      resetForm();
      loadUsers();
      toast.success(isEditing ? "Member updated successfully!" : "Member created successfully!");
    } else {
      toast.error(String(result.error) || "Operation failed");
    }
  };

  const handleRoleChange = async (userId: string, role: any) => {
    const result = await updateUserRole(userId, role);
    if (result.success) {
      loadUsers();
      toast.success("Role updated");
    } else {
      toast.error("Failed to update role");
    }
  };

  const handleDelete = async (userId: string) => {
    if (confirm("Are you sure you want to delete this member?")) {
      const result = await deleteUser(userId);
      if (result.success) {
        loadUsers();
        toast.success("Member deleted successfully");
      } else {
        toast.error("Failed to delete member");
      }
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "default";
      case "TREASURER":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Members</h1>
          <p className="text-gray-600 mt-1">Manage your chama members</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Member" : "Add New Member"}</DialogTitle>
              <DialogDescription>
                {isEditing ? "Update member details" : "Create a new member account for your chama"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  onBlur={handleNameBlur}
                  placeholder="e.g., John Doe"
                  className={nameError ? "border-red-500" : ""}
                  required
                />
                {nameError && (
                  <p className="text-sm text-red-600">{nameError}</p>
                )}
                <p className="text-xs text-gray-500">
                  Enter at least two names. Names will be automatically capitalized.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password {isEditing && "(Leave blank to keep current)"}</Label>
                <PasswordInput
                  id="password"
                  value={formData.password}
                  onChange={(value) => setFormData({ ...formData, password: value })}
                  placeholder={isEditing ? "••••••••" : "Enter password"}
                  autoComplete="new-password"
                  required={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  onBlur={handlePhoneBlur}
                  placeholder="e.g., +254712345678 or 0712345678"
                  className={phoneError ? "border-red-500" : ""}
                />
                {phoneError && (
                  <p className="text-sm text-red-600">{phoneError}</p>
                )}
                <p className="text-xs text-gray-500">
                  Kenyan phone numbers will be automatically formatted.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: any) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEMBER">Member</SelectItem>
                    <SelectItem value="TREASURER">Treasurer</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                {isEditing ? "Update Member" : "Create Member"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Members</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-gray-500">Loading members...</p>
          ) : users.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No members yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Transactions</TableHead>
                  <TableHead>Loans</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const initials = user.name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase() || "U";

                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-blue-100 text-blue-700">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Phone className="h-3 w-3" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(value: any) => handleRoleChange(user.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MEMBER">Member</SelectItem>
                            <SelectItem value="TREASURER">Treasurer</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{user._count.transactions}</TableCell>
                      <TableCell>{user._count.loans}</TableCell>
                      <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(user)}
                          >
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
