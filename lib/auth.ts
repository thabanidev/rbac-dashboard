import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'

export async function createToken(payload: any) {
  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || '1234'
  )
  
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret)

  return token
}

export async function verifyAuth() {
  const token = (await cookies()).get('auth-token')?.value

  if (!token) {
    return null
  }

  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || '1234'
    )
    
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch {
    return null
  }
}

