import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verify } from "jsonwebtoken";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = (await cookies()).get("auth-token")?.value;

  if (!token) {
    redirect("/");
  }

  try {
    verify(token, process.env.JWT_SECRET || "your-secret-key");
  } catch (error) {
    console.error('JWT verification failed:', error);
    (await cookies()).delete('auth-token');
    redirect("/");
  }

  return (
    <div className="min-h-screen">
      {/* Add your dashboard navigation/header here later */}
      <main>{children}</main>
    </div>
  );
} 