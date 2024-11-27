import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/roles - get all roles
export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          select: {
            permission: true,
          }
        }
      },
    });

    return NextResponse.json(roles);
  } catch (error) {
    console.error("Error fetching roles: ", (error as Error).message);
    return NextResponse.json(
      {
        error: "Error fetching roles",
      },
      { status: 500 }
    );
  } finally {
    prisma.$disconnect();
  }
}

// POST /api/roles - create a new role
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, permissions } = body;

    const newRole = await prisma.role.create({
      data: {
        name,
        permissions: {
          create: permissions?.map((permissionId: string) => ({
            permission: {
              connect: { id: permissionId },
            },
          })),
        },
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return NextResponse.json(newRole);
  } catch (error) {
    console.error("Error creating role: ", (error as Error).message);
    return NextResponse.json(
      {
        error: "Error creating role",
      },
      { status: 500 }
    );
  } finally {
    prisma.$disconnect();
  }
}

// DELETE /api/roles?id={roleId} - delete a role by ID
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Role ID is required" },
        { status: 400 }
      );
    }

    await prisma.role.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Role deleted successfully!" });
  } catch (error) {
    console.error("Error deleting role: ", (error as Error).message);
    return NextResponse.json(
      { error: "Failed to delete role" },
      { status: 500 }
    );
  }
}

// PUT /api/roles - update a role
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, permissions } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Role ID is required" },
        { status: 400 }
      );
    }

    // First delete existing role permissions
    await prisma.rolePermission.deleteMany({
      where: { roleId: id },
    });

    // Then update the role with new permissions
    const updatedRole = await prisma.role.update({
      where: { id },
      data: {
        name,
        permissions: {
          create: permissions?.map((permissionId: string) => ({
            permission: {
              connect: { id: permissionId },
            },
          })),
        },
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return NextResponse.json(updatedRole);
  } catch (error) {
    console.error("Error updating role: ", (error as Error).message);
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  } finally {
    prisma.$disconnect();
  }
} 