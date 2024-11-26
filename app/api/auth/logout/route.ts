import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// POST /api/auth/logout
export async function POST() {
  try {
    // Clear the auth cookie
    (await
      // Clear the auth cookie
      cookies()).delete('auth-token');
    
    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error: ", (error as Error).message);
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
} 