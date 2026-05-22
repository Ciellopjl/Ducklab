import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/rateLimiter'
import { verifyRecaptcha } from '@/lib/recaptcha'

// ============================================================================
// AUTH ADMIN — Login do painel admin com validação reCAPTCHA
// ============================================================================

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)
  const rateLimitResult = checkRateLimit(ip, 'auth-admin-login', 'auth')
  const rlHeaders = rateLimitHeaders(rateLimitResult)

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Muitas tentativas. Tente novamente mais tarde.' },
      { status: 429, headers: rlHeaders }
    )
  }

  try {
    const body = await req.json()
    const { password, recaptchaToken } = body

    // ── Validação do Google reCAPTCHA v3 ──────────────────────────────────────
    const recaptchaResult = await verifyRecaptcha(recaptchaToken, 'admin_login')
    if (!recaptchaResult.success) {
      return NextResponse.json(
        { error: recaptchaResult.error || 'Falha na verificação anti-robô' },
        { status: 403, headers: rlHeaders }
      )
    }

    if (!password || typeof password !== 'string' || password.length > 200) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401, headers: rlHeaders }
      )
    }

    const storedHash = process.env.ADMIN_PASSWORD_HASH

    if (!storedHash) {
      console.error('[AUTH_ADMIN] ADMIN_PASSWORD_HASH ausente')
      return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }

    const isValid = await bcrypt.compare(password, storedHash)


    if (!isValid) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401, headers: rlHeaders }
      )
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const token = await new SignJWT({ sub: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('4h')
      .sign(secret)

    const response = NextResponse.json({ success: true }, { headers: rlHeaders })

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 4 * 60 * 60,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('[AUTH_ADMIN] Erro na rota de login:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('admin_token')
  return response
}
