import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify, SignJWT } from 'jose'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value

  if (!token) {
    return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)

    if (payload.sub !== 'admin') {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
    }

    const response = NextResponse.json({ success: true })

    // Auto-renovação se faltar menos de 1 hora
    const now = Math.floor(Date.now() / 1000)
    const exp = payload.exp as number
    
    if (exp - now < 60 * 60) {
      const newToken = await new SignJWT({ sub: 'admin' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('4h')
        .sign(secret)

      response.cookies.set('admin_token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 4 * 60 * 60, // 4 horas
        path: '/',
      })
    }

    return response
  } catch (error) {
    return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
  }
}
