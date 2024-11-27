"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { usePermissions } from "@/hooks/usePermissions";

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<{ name: string; permissions: string[] }>({ name: "", permissions: [] });
  interface Role {
    id: string;
    name: string;
    permissions: string[];
  }
  
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const { checkPermission, isLoading: isLoadingPermissions } = usePermissions();
  const { toast } = useToast();

  const fetchRoles = useCallback(async () => {
    try {
      const response = await fetch("/api/roles");
      const data = await response.json();
      setRoles(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast({
        title: "Error",
        description: "Failed to fetch roles. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await fetch("/api/permissions");
        const data = await response.json();
        setPermissions(data);
      } catch (error) {
        console.error("Error fetching permissions:", error);
        toast({
          title: "Error",
          description: "Failed to fetch permissions. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchRoles();
    fetchPermissions();
  }, [fetchRoles, toast]);

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRole),
      });
      if (response.ok) {
        toast({
          title: "Success",
          description: "Role created successfully.",
        });
        setIsDialogOpen(false);
        fetchRoles();
      } else {
        throw new Error("Failed to create role");
      }
    } catch (error) {
      console.error("Error creating role:", error);
      toast({
        title: "Error",
        description: "Failed to create role. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;
    try {
      const response = await fetch(`/api/roles/${editingRole.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingRole),
      });
      if (response.ok) {
        toast({
          title: "Success",
          description: "Role updated successfully.",
        });
        setIsDialogOpen(false);
        fetchRoles();
      } else {
        throw new Error("Failed to update role");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "Failed to update role. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (confirm("Are you sure you want to delete this role?")) {
      try {
        const response = await fetch(`/api/roles/${roleId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          toast({
            title: "Success",
            description: "Role deleted successfully.",
          });
          fetchRoles();
        } else {
          throw new Error("Failed to delete role");
        }
      } catch (error) {
        console.error("Error deleting role:", error);
        toast({
          title: "Error",
          description: "Failed to delete role. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading || isLoadingPermissions) {
    return <div>Loading...</div>;
  }

  const canManageRoles = checkPermission("manage_roles");

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Roles</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!canManageRoles}>Create Role</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingRole ? "Edit Role" : "Create New Role"}</DialogTitle>
              <DialogDescription>
                Enter the details for the {editingRole ? "existing" : "new"} role.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={editingRole ? handleEditRole : handleCreateRole}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={editingRole ? editingRole.name : newRole.name}
                    onChange={(e) =>
                      editingRole
                        ? setEditingRole({ ...editingRole, name: e.target.value })
                        : setNewRole({ ...newRole, name: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right">Permissions</Label>
                  <div className="col-span-3 space-y-2">
                    {permissions.map((permission: { id: string; name: string }) => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`permission-${permission.id}`}
                          checked={
                            editingRole
                              ? editingRole.permissions.includes(permission.id)
                              : newRole.permissions.includes(permission.id)
                          }
                          onCheckedChange={(checked) => {
                            if (editingRole) {
                              setEditingRole({
                                ...editingRole,
                                permissions: checked
                                  ? [...editingRole.permissions, permission.id]
                                  : editingRole.permissions.filter((id) => id !== permission.id),
                              });
                            } else {
                              setNewRole({
                                ...newRole,
                                permissions: checked
                                  ? [...newRole.permissions, permission.id]
                                  : newRole.permissions.filter((id) => id !== permission.id),
                              });
                            }
                          }}
                        />
                        <Label htmlFor={`permission-${permission.id}`}>{permission.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editingRole ? "Update Role" : "Create Role"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Permissions</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role: Role) => (
            <TableRow key={role.id}>
              <TableCell>{role.name}</TableCell>
              <TableCell>
                
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any*/}
                {role.permissions.map((p: any) => p.permission.name).join(", ")}
              </TableCell>
              <TableCell>
                {canManageRoles && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      onClick={() => {
                        setEditingRole(role);
                        setIsDialogOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteRole(role.id)}
                    >
                      Delete
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

