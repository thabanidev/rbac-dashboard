import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/permissions - get all permissions
export async function GET() {
  try {
    const permissions = await prisma.permission.findMany({
      include: {
        RolePermission: {
          include: {
            role: true,
          },
        },
      },
    });

    return NextResponse.json(permissions);
  } catch (error) {
    console.error("Error fetching permissions: ", (error as Error).message);
    return NextResponse.json(
      {
        error: "Error fetching permissions",
      },
      { status: 500 }
    );
  } finally {
    prisma.$disconnect();
  }
}

// POST /api/permissions - create a new permission
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    const newPermission = await prisma.permission.create({
      data: {
        name,
      },
    });

    return NextResponse.json(newPermission);
  } catch (error) {
    console.error("Error creating permission: ", (error as Error).message);
    return NextResponse.json(
      {
        error: "Error creating permission",
      },
      { status: 500 }
    );
  } finally {
    prisma.$disconnect();
  }
}

// DELETE /api/permissions?id={permissionId} - delete a permission by ID
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Permission ID is required" },
        { status: 400 }
      );
    }

    await prisma.permission.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Permission deleted successfully!" });
  } catch (error) {
    console.error("Error deleting permission: ", (error as Error).message);
    return NextResponse.json(
      { error: "Failed to delete permission" },
      { status: 500 }
    );
  }
}

// PUT /api/permissions - update a permission
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Permission ID is required" },
        { status: 400 }
      );
    }

    const updatedPermission = await prisma.permission.update({
      where: { id },
      data: {
        name,
      },
    });

    return NextResponse.json(updatedPermission);
  } catch (error) {
    console.error("Error updating permission: ", (error as Error).message);
    return NextResponse.json(
      { error: "Failed to update permission" },
      { status: 500 }
    );
  } finally {
    prisma.$disconnect();
  }
} 