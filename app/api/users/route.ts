import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import hashPassword from "@/lib/hashPassword";

// GET /api/users - get all users
export async function GET() {
	try {
		const users = await prisma.user.findMany({
			include: {
				roles: {
					include: {
						role: true,
					},
				},
			},
		});

		
		const sanitizedUsers = users.map(user => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { password, ...userWithoutPassword } = user;
			return userWithoutPassword;
		});

		return NextResponse.json(sanitizedUsers);
	} catch (error) {
		console.error("Error fetching users: ", (error as Error).message);
		return NextResponse.json(
			{
				error: {
					code: "USERS_FETCH_ERROR",
					title: "Error fetching users",
					message: (error as Error).message,
					timestamp: new Date().toISOString()
				}
			},
			{ status: 500 }
		);
	} finally {
		prisma.$disconnect();
	}
}

// POST /api/users - create a new user
export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { email, pwd, name, roleIds } = body;
		const newUser = await prisma.user.create({
			data: {
				name,
				email,
				password: await hashPassword(pwd),
				roles: {
					create: roleIds.map((roleId: string) => ({ roleId })),
				},
			},
		});

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password, ...sanitizedUser } = newUser;

		return NextResponse.json(sanitizedUser);
	} catch (error) {
		return NextResponse.json(
			{
				error: {
					code: "USER_CREATE_ERROR",
					title: "Error creating user",
					message: (error as Error).message,
					timestamp: new Date().toISOString(),
				},
			},
			{ status: 500 }
		);
	} finally {
		prisma.$disconnect();
	}
}

// DELETE /api/users?id={userId} - delete a user by ID
export async function DELETE(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");

		if (!id) {
			return NextResponse.json(
				{ error: {
					code: "USER_DELETE_ERROR",
					title: "Error deleting user",
					message: "User ID is required",
					timestamp: new Date().toISOString()
        } },
				{ status: 400 }
			);
		}

		await prisma.user.delete({
			where: { id },
		});

		return NextResponse.json({ message: "User deleted successfully!" });
	} catch (error) {
		console.error("Error deleting user: ", (error as Error).message);
		return NextResponse.json(
			{ error: {
				code: "USER_DELETE_ERROR",
				title: "Error deleting user",
				message: (error as Error).message,
				timestamp: new Date().toISOString()
      } },
			{ status: 500 }
		);
	}
}

// PUT /api/users - update a user
export async function PUT(request: Request) {
	try {
		const body = await request.json();
		const { id, email, name, isActive, pwd, roleIds } = body;

		if (!id) {
			return NextResponse.json(
				{ error: {
					code: "USER_UPDATE_ERROR",
					title: "Error updating user",
					message: "User ID is required",
					timestamp: new Date().toISOString()
				} },
				{ status: 400 }
			);
		}

		const updatedUser = await prisma.user.update({
			where: { id },
			data: {
				name,
				email,
				isActive,
				roles: {
					update: roleIds.map((roleId: string) => ({ roleId })),
				},
			},
		});

		if (pwd) updatedUser.password = await hashPassword(pwd);

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password, ...sanitizedUser } = updatedUser;

		return NextResponse.json(sanitizedUser);
	} catch (error) {
		console.error("Error updating user: ", (error as Error).message);
		return NextResponse.json(
			{ error: {
				code: "USER_UPDATE_ERROR", 
				title: "Error updating user",
				message: (error as Error).message,
				timestamp: new Date().toISOString()
			} },
			{ status: 500 }
		);
	} finally {
		prisma.$disconnect();
	}
}
