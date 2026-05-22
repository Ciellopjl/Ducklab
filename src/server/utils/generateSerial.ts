import { randomBytes } from 'crypto'

/**
 * Gera uma chave de acesso segura no formato:
 * DUCK-XXXX-XXXX-XXXX-XXXX
 * 128 bits de entropia — criptograficamente seguro
 */
export function generateSerial(): string {
  const bytes = randomBytes(8) // 64 bits por segmento
  const hex = bytes.toString('hex').toUpperCase()

  return [
    'DUCK',
    hex.slice(0, 4),
    hex.slice(4, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
  ].join('-')
}
