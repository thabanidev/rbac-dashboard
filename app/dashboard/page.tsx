"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardStatistics } from "../api/dashboard/route";
import { Users, UserCog, Shield, AlertCircle } from 'lucide-react';

type UserRole = {
  role: {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    permissions: string[];
  };
  roleId: string;
  userId: string;
};

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<DashboardStatistics | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[] | null>(null);
  
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/dashboard");
        console.log("Response:", response);
        const result = await response.json();
        if (result.success) {
          console.log("Fetched statistics:", result);
          setData(result as DashboardStatistics);
        } else {
          console.error("Failed to fetch statistics");
        }
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchUserRole = async () => {
      try {
        const response = await fetch("/api/auth/me");
        const result = await response.json();
    
        if (response.ok) {
          const userRoles = result.roles;
          if (userRoles) {
            setUserRoles(userRoles);
          } else {
            console.error("User roles not found in the response");
          }
        } else {
          console.error("Failed to fetch user role:", result.error);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    fetchStatistics();
    fetchUserRole();
  }, []);

  console.log("User roles:", userRoles);

  const canManageRoles = userRoles?.some((role) => role.role.name === "Admin" || role.role.name === "Super Admin");
  const canManageUsers = userRoles?.some((role) => role.role.name === "Admin" || role.role.name === "Super Admin");
  const canManagePermissions = userRoles?.some((role) => role.role.name === "Super Admin");

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="shadow-lg">
            <CardHeader>
              <Skeleton className="h-6 w-[180px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-[120px]" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-[140px]" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] bg-gray-50">
        <AlertCircle className="w-16 h-16 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-semibold mb-4">No Data Available</h2>
        <p className="text-gray-500 text-center max-w-md">
          We couldn&apos;t fetch the dashboard statistics at this moment. Please try again later or contact support if the issue persists.
        </p>
        <Button className="mt-6" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  const cards = [
    {
      title: "Total Users",
      value: data.stats.users.total,
      icon: Users,
      canManage: canManageUsers,
      manageLink: "/dashboard/users",
      manageText: "Manage Users",
      description: "Active users in the system",
    },
    {
      title: "Total Roles",
      value: data.stats.roles.total,
      icon: UserCog,
      canManage: canManageRoles,
      manageLink: "/dashboard/roles",
      manageText: "Manage Roles",
      description: "Defined roles for access control",
    },
    {
      title: "Total Permissions",
      value: data.stats.permissions.total,
      icon: Shield,
      canManage: canManagePermissions,
      manageLink: "/dashboard/permissions",
      manageText: "Manage Permissions",
      description: "Available permissions in the system",
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <Card key={index} className="shadow-lg transition-all duration-300 hover:shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
            {card.canManage && (
              <CardFooter>
                <Button asChild className="w-full">
                  <a href={card.manageLink}>{card.manageText}</a>
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

