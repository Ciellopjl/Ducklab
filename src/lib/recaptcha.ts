// ============================================================================
// RECAPTCHA VERIFICATION — Ducklab Security
// ============================================================================
// Valida o token de reCAPTCHA v3 enviado pelo cliente contra a API do Google.
// Score mínimo exigido: 0.5.
// Em ambiente de produção, a chave secreta é OBRIGATÓRIA.
// ============================================================================

export interface RecaptchaValidationResult {
  success: boolean
  score?: number
  error?: string
}

/**
 * Valida o token reCAPTCHA v3 no servidor.
 * @param token - Token enviado pelo cliente
 * @param action - Nome esperado da ação executada no frontend
 */
export async function verifyRecaptcha(
  token: string | null | undefined,
  action: string
): Promise<RecaptchaValidationResult> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY

  // Bypass amigável em desenvolvimento se as chaves não estiverem configuradas
  if (!secretKey || secretKey.startsWith('SUBSTITUA-')) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[RECAPTCHA] Bypass ativo em desenvolvimento devido a chaves não configuradas.`);
      return { success: true, score: 1.0 }
    }
    return { success: false, error: 'Chave secreta do reCAPTCHA não configurada em produção.' }
  }

  if (!token) {
    return { success: false, error: 'Token reCAPTCHA ausente.' }
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`,
    })

    if (!response.ok) {
      return { success: false, error: 'Falha de comunicação com servidor do Google reCAPTCHA.' }
    }

    const data = await response.json()

    if (!data.success) {
      const errorCodes = data['error-codes'] ? `; erros: ${data['error-codes'].join(', ')}` : ''
      return { success: false, error: `Google reCAPTCHA rejeitou a requisição${errorCodes}` }
    }

    // Validação de score (recomendado mínimo 0.5)
    const score = typeof data.score === 'number' ? data.score : 0
    if (score < 0.5) {
      return { success: false, score, error: `Score reCAPTCHA muito baixo: ${score} (mínimo: 0.5)` }
    }

    // Validação opcional da ação para evitar replays de tokens de outras ações
    if (data.action && data.action !== action) {
      return { success: false, score, error: `Ação inválida. Esperada: ${action}, Recebida: ${data.action}` }
    }

    return { success: true, score }
  } catch (err: any) {
    console.error('[RECAPTCHA_VERIFY_ERROR]:', err)
    return { success: false, error: 'Erro interno ao validar reCAPTCHA.' }
  }
}
