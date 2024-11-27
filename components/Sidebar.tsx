"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Users, UserCog, Shield, LayoutDashboard, Menu } from 'lucide-react';

type NavItem = {
  name: string;
  href: string;
  icon: React.ElementType;
  permission: string;
};

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permission: "view_dashboard" },
  { name: "Users", href: "/dashboard/users", icon: Users, permission: "read_user" },
  { name: "Roles", href: "/dashboard/roles", icon: UserCog, permission: "manage_roles" },
  { name: "Permissions", href: "/dashboard/permissions", icon: Shield, permission: "manage_permissions" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        const response = await fetch("/api/auth/me");
        const userData = await response.json();
        const permissions = userData.roles.flatMap((role: any) => 
          role.role.permissions.map((p: any) => p.permission.name)
        );
        setUserPermissions([...new Set(permissions)]);
      } catch (error) {
        console.error("Error fetching user permissions:", error);
      }
    };

    fetchUserPermissions();
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <>
      <button
        className="fixed p-2 m-2 text-gray-500 transition-colors duration-200 rounded-md lg:hidden hover:text-gray-800 focus:outline-none focus:ring"
        onClick={toggleSidebar}
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className={`fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto transition duration-300 transform bg-white border-r border-gray-200 lg:translate-x-0 lg:static lg:inset-0 ${
        isSidebarOpen ? "translate-x-0 ease-out" : "-translate-x-full ease-in"
      }`}>
        <div className="flex items-center justify-center mt-8">
          <div className="flex items-center">
            <span className="mx-2 text-2xl font-semibold text-gray-800">RBAC Dashboard</span>
          </div>
        </div>

        <nav className="mt-10">
          {navigation.map((item) => {
            if (!userPermissions.includes(item.permission)) return null;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-6 py-2 mt-4 duration-200 border-l-4 ${
                  pathname === item.href
                    ? "bg-gray-100 border-gray-800 text-gray-800"
                    : "border-transparent hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="mx-4">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}

