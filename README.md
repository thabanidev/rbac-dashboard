# RBAC Dashboard

## Overview

The RBAC Dashboard is a role-based access control system built with Next.js and Prisma. It allows for managing users, roles, and permissions within an application. The system is designed to provide fine-grained access control to various parts of the application based on user roles.

## Demo

You can view a live demo of the  [RBAC Dashboard here](https://rbac-dashboard.vercel.app).

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up the database: `npx prisma migrate dev`
4. Start the development server: `npm run dev`

## Features

- User management (create, read, update, delete)
- Role management (assign permissions to roles)
- Permission management (define and manage permissions)
- Dashboard view with statistics

## Roles and Permissions

### Permission Management

- `create_user`: Create new users
- `read_user`: Read user information
- `update_user`: Update user information
- `delete_user`: Delete users
- `manage_roles`: Manage roles and their permissions
- `manage_permissions`: Manage permissions
- `view_dashboard`: View dashboard statistics

### Role Management

- **Super Admin**: All permissions
- **Admin**: All permissions except `manage_permissions`
- **Moderator**: `read_user`, `update_user`, `view_dashboard`
- **Viewer**: `read_user`, `view_dashboard`

## Prisma Schema (Using SQLite Database)

The database schema is defined using Prisma. Below is the schema definition outlined in tables:

### User

| Field     | Type     | Attributes                  |
|-----------|----------|-----------------------------|
| id        | String   | @id @default(cuid())        |
| email     | String   | @unique                     |
| password  | String   |                             |
| name      | String   |                             |
| isActive  | Boolean  | @default(true)              |
| createdAt | DateTime | @default(now())             |
| updatedAt | DateTime | @updatedAt                  |
| roles     | UserRole |                             |

### Role

| Field      | Type           | Attributes                  |
|------------|----------------|-----------------------------|
| id         | String         | @id @default(cuid())        |
| name       | String         | @unique                     |
| createdAt  | DateTime       | @default(now())             |
| updatedAt  | DateTime       | @updatedAt                  |
| users      | UserRole       |                             |
| permissions| RolePermission |                             |

### UserRole

| Field  | Type | Attributes                                      |
|--------|------|-------------------------------------------------|
| userId | String |                                               |
| roleId | String |                                               |
| user   | User   | @relation(fields: [userId], references: [id], onDelete: Cascade, onUpdate: Cascade) |
| role   | Role   | @relation(fields: [roleId], references: [id], onDelete: Cascade, onUpdate: Cascade) |

### Permission

| Field     | Type     | Attributes                  |
|-----------|----------|-----------------------------|
| id        | String   | @id @default(cuid())        |
| name      | String   | @unique                     |
| createdAt | DateTime | @default(now())             |
| updatedAt | DateTime | @updatedAt                  |
| roles     | RolePermission |                       |

### RolePermission

| Field        | Type       | Attributes                                      |
|--------------|------------|-------------------------------------------------|
| roleId       | String     |                                                 |
| permissionId | String     |                                                 |
| role         | Role       | @relation(fields: [roleId], references: [id], onDelete: Cascade, onUpdate: Cascade) |
| permission   | Permission | @relation(fields: [permissionId], references: [id], onDelete: Cascade, onUpdate: Cascade) |

## API Endpoints

### Users

- `GET /api/users`: Get all users
- `POST /api/users`: Create a new user
- `DELETE /api/users?id={userId}`: Delete a user by ID
- `PUT /api/users`: Update a user

### Roles

- `GET /api/roles`: Get all roles
- `POST /api/roles`: Create a new role
- `DELETE /api/roles?id={roleId}`: Delete a role by ID
- `PUT /api/roles`: Update a role

### Permissions

- `GET /api/permissions`: Get all permissions
- `POST /api/permissions`: Create a new permission
- `DELETE /api/permissions?id={permissionId}`: Delete a permission by ID
- `PUT /api/permissions`: Update a permission

## Frontend Components

### Users Page

- Fetches and displays a list of users
- Allows creating, updating, and deleting users

### Roles Page

- Fetches and displays a list of roles
- Allows creating, updating, and deleting roles
- Assigns permissions to roles

### Permissions Page

- Fetches and displays a list of permissions
- Allows creating, updating, and deleting permissions

### Dashboard Page

- Displays dashboard statistics
- Access controlled based on user roles

## Tech Stack

- Next.js
- Prisma
- SQLite
- React
- Tailwind CSS
- Shadcn UI
