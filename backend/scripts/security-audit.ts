import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

// ============================================================================
// GOOGLE-GRADE SECURITY HEALTH CHECK
// ============================================================================
// Este script valida a integridade da arquitetura de segurança.
// Ideal para rodar no pipeline de CI/CD ou antes de cada deploy.
// ============================================================================

const COLORS = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m"
}

console.log(`${COLORS.magenta}====================================================${COLORS.reset}`)
console.log(`${COLORS.magenta}🛡️  PROJECT FUTUROS - SECURITY AUDIT SYSTEM${COLORS.reset}`)
console.log(`${COLORS.magenta}====================================================${COLORS.reset}\n`)

let issuesFound = 0
let warningsFound = 0

function check(label: string, condition: boolean, failMessage: string, isWarning = false) {
  if (condition) {
    console.log(`${COLORS.green}✅ [PASS]${COLORS.reset} ${label}`)
  } else {
    if (isWarning) {
      console.log(`${COLORS.yellow}⚠️  [WARN]${COLORS.reset} ${label}: ${failMessage}`)
      warningsFound++
    } else {
      console.log(`${COLORS.red}❌ [FAIL]${COLORS.reset} ${label}: ${failMessage}`)
      issuesFound++
    }
  }
}

// 1. Variáveis de Ambiente Críticas
const envContent = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf8') : ''
check('DATABASE_URL Presence', envContent.includes('DATABASE_URL='), 'DATABASE_URL não encontrada no .env')
check('ADMIN_EMAIL Presence', envContent.includes('ADMIN_EMAIL='), 'ADMIN_EMAIL não configurada (Risco: Ninguém será BOSS)')
check('NEXTAUTH_SECRET Strength', /NEXTAUTH_SECRET="[a-f0-9]{32,}"/.test(envContent), 'NEXTAUTH_SECRET ausente ou muito curto (mínimo 32 hex chars)', true)

// 2. Proteção de Rotas de Debug
const debugDbRoute = path.join('src', 'app', 'api', 'debug-db', 'route.ts')
if (fs.existsSync(debugDbRoute)) {
  const content = fs.readFileSync(debugDbRoute, 'utf8')
  check('Debug DB Neutralized', content.includes('status: 404'), 'Rota debug-db ainda está ativa e expondo dados!')
}

// 3. Middleware Configuration
const middlewarePath = path.join('src', 'middleware.ts')
if (fs.existsSync(middlewarePath)) {
  const content = fs.readFileSync(middlewarePath, 'utf8')
  check('Rate Limiting Active', content.includes('rateLimitMap'), 'Rate limiting não detectado no middleware')
  check('Security Headers Present', content.includes('X-Frame-Options'), 'Middleware não está injetando headers de segurança')
}

// 4. Prisma Hardening
const prismaPath = path.join('src', 'lib', 'prisma.ts')
if (fs.existsSync(prismaPath)) {
  const content = fs.readFileSync(prismaPath, 'utf8')
  const isPrismaSecure = content.includes('log: isProduction') || content.includes('log: []')
  check('Prisma Logging Off in Prod', isPrismaSecure, 'Prisma está logando queries sensíveis em produção!')
}

// 5. Gitignore Integrity
const gitignore = fs.readFileSync('.gitignore', 'utf8')
check('Env Files Ignored', gitignore.includes('.env') && gitignore.includes('.env.local'), '.gitignore não protege arquivos .env!')
check('Certificates Ignored', gitignore.includes('*.pem') || gitignore.includes('*.key'), 'Arquivos de certificados/chaves podem ser commitados!')

console.log(`\n${COLORS.magenta}----------------------------------------------------${COLORS.reset}`)
if (issuesFound === 0) {
  console.log(`${COLORS.green}🚀 AUDITORIA CONCLUÍDA: SISTEMA PRONTO PARA PRODUÇÃO${COLORS.reset}`)
} else {
  console.log(`${COLORS.red}🚫 AUDITORIA FALHOU: ${issuesFound} ERROS CRÍTICOS ENCONTRADOS${COLORS.reset}`)
}
console.log(`${COLORS.yellow}Total Alertas: ${warningsFound}${COLORS.reset}`)
console.log(`${COLORS.magenta}----------------------------------------------------${COLORS.reset}\n`)

if (issuesFound > 0) process.exit(1)
