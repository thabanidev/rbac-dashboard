import { useState, useEffect } from 'react'

export function usePermissions() {
  const [permissions, setPermissions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchPermissions() {
      try {
        const response = await fetch('/api/auth/me')
        if (!response.ok) {
          throw new Error('Failed to fetch permissions')
        }
        
        const userData = await response.json()
        const userPermissions = userData.roles.flatMap((role: any) => 
          role.role.permissions.map((p: any) => p.permission.name)
        )
        
        setPermissions([...new Set(userPermissions)])
      } catch (error) {
        console.error('Error fetching permissions:', error)
        setPermissions([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchPermissions()
  }, [])

  const checkPermission = (requiredPermission: string) => {
    return permissions.includes(requiredPermission)
  }

  return { permissions, checkPermission, isLoading }
}

