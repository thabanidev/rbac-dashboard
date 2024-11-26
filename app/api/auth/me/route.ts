import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import prisma from "@/lib/db";

// GET /api/auth/me - get current user's information
export async function GET() {
	try {
		const token = (await cookies()).get("auth-token")?.value;

		if (!token) {
			return NextResponse.json(
				{ error: "Not authenticated" },
				{ status: 401 }
			);
		}

		// Verify token
		const decoded = verify(
			token,
			process.env.JWT_SECRET || "your-secret-key"
		) as { userId: string };
		const userId = decoded.userId;

		// Get fresh user data from database
		const user = await prisma.user.findUnique({
			where: { id: userId },
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
			(await cookies()).delete("auth-token");
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 401 }
			);
		}

		// Return user data (excluding password)
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password, ...sanitizedUser } = user;
		return NextResponse.json(sanitizedUser);
	} catch (error) {
		console.error("Auth verification error: ", (error as Error).message);
		return NextResponse.json(
			{ error: "Authentication failed" },
			{ status: 401 }
		);
	} finally {
		prisma.$disconnect();
	}
}
