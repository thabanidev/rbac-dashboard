import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import prisma from "@/lib/db";

export async function checkPermission(requiredPermission: string): Promise<boolean> {
  const token = (await cookies()).get("auth-token")?.value;

  if (!token) {
    return false;
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET || "1234") as { userId: string };
    const userId = decoded.userId;

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
      return false;
    }

    const userPermissions = user.roles.flatMap(role => 
      role.role.permissions.map(p => p.permission.name)
    );

    return userPermissions.includes(requiredPermission);
  } catch (error) {
    console.error("Permission check error:", error);
    return false;
  }
}

