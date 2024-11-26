import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import passwordsMatch from "@/lib/passwordsMatch";
import { cookies } from "next/headers";
import { sign } from "jsonwebtoken";

// POST /api/auth/login
export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { email, pwd } = body;
		// Find user by email
		const user = await prisma.user.findUnique({
			where: { email },
			include: {
				roles: {
					include: {
						role: {
							include: {
								permissions: {
									include: {
										permission: true,
									},
								},
							},
						},
					},
				},
			},
		});

		if (!user) {
			return NextResponse.json(
				{ error: "Invalid credentials" },
				{ status: 401 }
			);
		}
		
		const isValidPassword = await passwordsMatch(pwd, user.password);
		if (!isValidPassword) {
			return NextResponse.json(
				{
					error: "Invalid Credentials",
				},
				{ status: 401 }
			);
		}

		// Check if user is active
		if (!user.isActive) {
			return NextResponse.json(
				{ error: "Account is inactive" },
				{ status: 403 }
			);
		}

		// Create session token
		const token = sign(
			{
				userId: user.id,
				email: user.email,
				roles: user.roles.map((ur) => ({
					id: ur.role.id,
					name: ur.role.name,
					permissions: ur.role.permissions.map((rp) => ({
						id: rp.permissionId,
						name: rp.permission.name,
						createdAt: rp.permission.createdAt,
						updatedAt: rp.permission.updatedAt,
					})),
				})),
			},
			process.env.JWT_SECRET || "your-secret-key",
			{ expiresIn: "24h" }
		);

		// Set cookie
		(
			await // Set cookie
			cookies()
		).set("auth-token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 60 * 60 * 24, // 24 hours
		});

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password, ...sanitizedUser } = user;
		return NextResponse.json({
			message: "Login successful",
			user: sanitizedUser,
		});
	} catch (error) {
		console.error("Login error: ", (error as Error).message);
		return NextResponse.json(
			{
				error: "Authentication failed",
			},
			{ status: 500 }
		);
	} finally {
		prisma.$disconnect();
	}
}
