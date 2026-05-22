import { z } from 'zod'

// ============================================================================
// ZOD SCHEMAS — VALIDAÇÃO DE INPUT ENTERPRISE-GRADE
// ============================================================================
// Cada schema define a forma exata dos dados aceitos por cada endpoint.
// Previne: SQL Injection, XSS, data corruption, type confusion.
// Filosofia Google: "Never trust the client. Validate everything."
// ============================================================================

// --- Helpers ---
const sanitizedString = (max = 500) =>
  z.string().trim().min(1, 'Campo obrigatório').max(max).transform(s =>
    s.replace(/<[^>]*>/g, '').replace(/javascript:/gi, '').replace(/on\w+=/gi, '')
  )

const optionalSanitizedString = (max = 500) =>
  z.string().trim().max(max).transform(s =>
    s.replace(/<[^>]*>/g, '').replace(/javascript:/gi, '').replace(/on\w+=/gi, '')
  ).optional().nullable()

const safePrice = z.union([z.number(), z.string(), z.null(), z.undefined()])
  .transform(v => {
    if (v === null || v === undefined) return 0
    if (typeof v === 'string') {
      const sanitized = v.replace(',', '.').trim()
      return sanitized === '' ? 0 : parseFloat(sanitized)
    }
    return v
  })
  .refine(v => !isNaN(v) && v >= 0 && v <= 99999, 'Preço inválido (0-99999)')

const uuid = z.string().uuid('ID inválido')

// --- Produto ---
export const ProdutoCreateSchema = z.object({
  nome: sanitizedString(200),
  descricao: optionalSanitizedString(2000),
  preco: safePrice,
  imagem: z.string().max(1000000).optional().default(''),
  categoriaId: uuid,
  badge: optionalSanitizedString(50),
  disponivel: z.boolean().optional().default(true),
  isPizza: z.boolean().optional().default(false),
  precos: z.array(z.object({
    tamanhoId: uuid,
    preco: safePrice,
  })).optional(),
  // Promoção
  emPromocao: z.boolean().optional().default(false),
  precoPromocional: z.union([
    z.number().min(0).max(99999),
    z.string().transform(v => {
      const n = parseFloat(String(v).replace(',', '.'))
      return isNaN(n) ? null : n
    }),
    z.null(),
    z.undefined(),
  ]).optional().nullable(),
  badgePromocao: optionalSanitizedString(50),
})

export const ProdutoUpdateSchema = ProdutoCreateSchema.partial()

// --- Categoria ---
export const CategoriaCreateSchema = z.object({
  nome: sanitizedString(100),
  label: sanitizedString(100),
  icone: z.string().max(10).optional().default(''),
  adicionaisHabilitados: z.boolean().optional().default(true),
})

export const CategoriaUpdateSchema = CategoriaCreateSchema.partial()

// --- Cupom ---
export const CupomCreateSchema = z.object({
  codigo: sanitizedString(30).transform(s => s.toUpperCase()),
  tipo: z.enum(['porcentagem', 'valor', 'percentual', 'fixo'], { 
    errorMap: () => ({ message: 'Tipo deve ser porcentagem ou valor' }) 
  }),
  valor: safePrice,
  pedidoMinimo: safePrice.optional().default(0),
  ativo: z.boolean().optional().default(true),
  validade: z.string().optional().nullable().transform(v => {
    if (!v) return null
    // Converte DD/MM/YYYY para YYYY-MM-DD para garantir parse correto no servidor
    const ddmmyyyy = /^(\d{2})\/(\d{2})\/(\d{4})$/
    const match = v.match(ddmmyyyy)
    if (match) {
      const [_, d, m, y] = match
      return `${y}-${m}-${d}`
    }
    return v
  }),
})

export const CupomUpdateSchema = CupomCreateSchema.partial()

// --- Adicional ---
export const AdicionalCreateSchema = z.object({
  nome: sanitizedString(200),
  preco: safePrice,
  disponivel: z.boolean().optional().default(true),
})

export const AdicionalUpdateSchema = AdicionalCreateSchema.partial()

// --- Pedido (POST público - cliente faz sem sessão) ---
export const PedidoCreateSchema = z.object({
  empresaId: uuid,
  nomeCliente: sanitizedString(200),
  telefone: z.string().min(8).max(20).regex(/^[\d\s()+\-]+$/, 'Telefone inválido'),
  endereco: sanitizedString(500),
  bairro: sanitizedString(200),
  itens: z.array(z.object({
    nome: z.string().max(300),
    quantidade: z.number().int().positive().max(100),
    preco: z.number().min(0).max(99999),
    tamanho: z.any().optional(),
    sabores: z.any().optional(),
    adicionais: z.any().optional(),
  })).min(1, 'Pelo menos 1 item'),
  total: z.number().min(0).max(999999),
  formaPagamento: sanitizedString(50),
  trocoParaValor: optionalSanitizedString(20),
  observacoes: optionalSanitizedString(1000),
  cupomCodigo: optionalSanitizedString(30),
  desconto: z.number().min(0).max(100).optional().default(0),
  totalFinal: z.number().min(0).max(999999).optional(),
})

// --- Tamanho ---
export const TamanhoCreateSchema = z.object({
  nome: sanitizedString(50),
  sigla: optionalSanitizedString(10),
  maxSabores: z.number().int().min(1).max(20).optional().default(1),
  ordem: z.number().int().min(0).max(100).optional().default(0),
})

// --- Sabor ---
export const SaborCreateSchema = z.object({
  nome: sanitizedString(200),
  descricao: optionalSanitizedString(500),
  categoriaId: uuid.optional().nullable(),
  imagem: z.string().max(2000).optional().nullable(),
  disponivel: z.boolean().optional().default(true),
  precoAdicional: safePrice.optional().default(0),
})

// --- Empresa (Config) ---
export const EmpresaUpdateSchema = z.object({
  nome: optionalSanitizedString(200),
  whatsapp: z.string().max(20).optional().nullable(),
  horarioAbertura: z.string().max(10).optional().nullable(),
  horarioFechamento: z.string().max(10).optional().nullable(),
  diasAbertos: z.string().max(30).optional().nullable(),
  taxaEntrega: safePrice.optional(),
  endereco: optionalSanitizedString(500),
  chavePix: optionalSanitizedString(200),
  logo: z.string().max(2000).optional().nullable(),
})

// --- Projeto ---
export const ProjetoCreateSchema = z.object({
  titulo: sanitizedString(200),
  descricao: sanitizedString(10000),
  imagem: z.string().max(1000000).min(1, 'A imagem é obrigatória'),
  categoria: sanitizedString(100),
  link: optionalSanitizedString(1000),
  data: optionalSanitizedString(100),
  ordem: z.number().int().min(0).max(10000).optional().default(0),
  destaque: z.boolean().optional().default(false),
})

export const ProjetoUpdateSchema = ProjetoCreateSchema.partial()


// ============================================================================
// SAFE PARSE HELPER
// ============================================================================
// Uso: const result = safeParse(ProdutoCreateSchema, dados)
//      if ('error' in result) return NextResponse.json({ erro: result.error }, { status: 400 })
//      const validData = result.data
// ============================================================================

export function safeParse<T>(schema: z.ZodSchema<T>, data: unknown): { data: T } | { error: string } {
  const result = schema.safeParse(data)
  if (!result.success) {
    const messages = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ')
    return { error: messages }
  }
  return { data: result.data }
}
