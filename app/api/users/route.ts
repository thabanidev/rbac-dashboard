import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Returns all users and their roles
export async function GET() {
    try {
        const users = await prisma.user.findMany({
            include: {
                
                roles: {
                    include: {
                        role: true 
                    }
                }
            }
        });
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({error: "Failed to fetch users", message: (error as Error).message}, {status: 500});
    }
}

// Creates new user and returns that user
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {name, email, password, roleIds} = body;

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password,
                roles: {
                    create: roleIds.map((roleId: string) => ({roleId}))
                },
            },
        });
        return NextResponse.json(newUser);
    } catch (error) {
        return NextResponse.json({error: "Failed to create user", message: (error as Error).message}, {status: 500});
    }
}

// Deletes user by id
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id || typeof id !== "string" || id.length <= 0) {
            return NextResponse.json({error: "User ID is required"}, {status: 400});
        }

        await prisma.user.delete({
            where: {id}
        });
        return NextResponse.json({message: "User deleted successfully"});
    } catch (error) {
        return NextResponse.json({error: "Failed to delete user", message: (error as Error).message}, {status: 500});
    }
}
