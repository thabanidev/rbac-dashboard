import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export type DashboardStatistics = {
    success: boolean;
    stats: {
        users: {
            total: number;
        };
        roles: {
            total: number;
        };
        permissions: {
            total: number;
        };
    };
};

export async function GET() {
    try {
        const statistics = await Promise.all([
            prisma.user.count(),
            prisma.role.count(),
            prisma.permission.count(),
        ]);

        const [
            totalUsers,
            totalRoles,
            totalPermissions,
        ] = statistics;

        return NextResponse.json({
            success: true,
            stats: {
                users: {
                    total: totalUsers,
                },
                roles: {
                    total: totalRoles,
                },
                permissions: {
                    total: totalPermissions,
                },
            },
        } as DashboardStatistics) ;
    
    } catch (error) {
        console.error('Error fetching statistics:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch statistics' },
            { status: 500 }
        );
    }
}