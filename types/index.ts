import { Prisma } from "@prisma/client";

export type UserWithoutPassword = Omit<
  Prisma.UserGetPayload<{
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: true
            }
          }
        }
      }
    }
  }>,
  'password'
> & {
  roles: Array<{
    role: {
      permissions: Prisma.RolePermissionGetPayload<{
        include: {
          permission: true
        }
      }>[];
    }
  }>;
};
