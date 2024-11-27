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
import { usePermissions } from "@/hooks/usePermissions";

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPermission, setNewPermission] = useState({ name: "" });
  const [editingPermission, setEditingPermission] = useState<{ id: string; name: string } | null>(null);
  const { checkPermission, isLoading: isLoadingPermissions } = usePermissions();
  const { toast } = useToast();

  const fetchPermissions = useCallback(async () => {
    try {
      const response = await fetch("/api/permissions");
      const data = await response.json();
      setPermissions(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch permissions. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const handleCreatePermission = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPermission),
      });
      if (response.ok) {
        toast({
          title: "Success",
          description: "Permission created success"});
        fetchPermissions();
      } else {
        throw new Error("Failed to create permission");
      }
    } catch (error) {
      console.error("Error creating permission:", error);
      toast({
        title: "Error",
        description: "Failed to create permission. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditPermission = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!editingPermission) return;
      const response = await fetch(`/api/permissions/${editingPermission.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPermission),
      });
      if (response.ok) {
        toast({
          title: "Success",
          description: "Permission updated success"});
        fetchPermissions();
      } else {
        throw new Error("Failed to update permission");
      }
    } catch (error) {
      console.error("Error updating permission:", error);
      toast({
        title: "Error",
        description: "Failed to update permission. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePermission = async (permissionId: string) => {
    if (confirm("Are you sure you want to delete this permission?")) {
      try {
        const response = await fetch(`/api/permissions/${permissionId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          toast({
            title: "Success",
            description: "Permission deleted successfully.",
          });
          fetchPermissions();
        } else {
          throw new Error("Failed to delete permission");
        }
      } catch (error) {
        console.error("Error deleting permission:", error);
        toast({
          title: "Error",
          description: "Failed to delete permission. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading || isLoadingPermissions) {
    return <div>Loading...</div>;
  }

  const canManagePermissions = checkPermission("manage_permissions");

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Permissions</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!canManagePermissions}>Create Permission</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPermission ? "Edit Permission" : "Create New Permission"}</DialogTitle>
              <DialogDescription>
                Enter the name for the {editingPermission ? "existing" : "new"} permission.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={editingPermission ? handleEditPermission : handleCreatePermission}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={editingPermission ? editingPermission.name : newPermission.name}
                    onChange={(e) =>
                      editingPermission
                        ? setEditingPermission({ ...editingPermission, name: e.target.value })
                        : setNewPermission({ ...newPermission, name: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editingPermission ? "Update Permission" : "Create Permission"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {permissions.map((permission) => (
            <TableRow key={permission.id}>
              <TableCell>{permission.name}</TableCell>
              <TableCell>
                {canManagePermissions && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      onClick={() => {
                        setEditingPermission(permission);
                        setIsDialogOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeletePermission(permission.id)}
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

