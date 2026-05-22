import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

const SYSTEM_PROMPT = `Você é o assistente de IA da Ducklab Agência, uma agência criativa especializada em:
- Desenvolvimento de Sites e Landing Pages
- Branding e Identidade Visual
- Gestão de Redes Sociais
- Design Gráfico
- Produção de Vídeos e Criativos
- Marketing Digital e Tráfego Pago
- Estratégia para Marcas
- Soluções Digitais para Empresas

Seu papel é ajudar os visitantes a entender os serviços da Ducklab, tirar dúvidas sobre projetos e guiar o usuário para solicitar um orçamento.

Regras importantes:
- Responda SEMPRE em português do Brasil
- Seja amigável, direto e profissional
- Quando o usuário quiser um orçamento, colete: tipo de projeto, detalhes, recursos necessários e prazo
- Ao final da conversa de orçamento, incentive o contato via WhatsApp: +55 (87) 9961-4464
- Mantenha respostas curtas e objetivas (máximo 3 parágrafos)
- Use emojis com moderação para deixar a conversa mais amigável
- SEMPRE forneça uma estimativa de preço (uma faixa de valores, ex: R$ 1.500 a R$ 3.000) com base no que o usuário pedir. Use preços de mercado realistas para os serviços solicitados.`

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Mensagens inválidas' }, { status: 400 })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key não configurada' }, { status: 500 })
    }

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 500,
        stream: false,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Groq API error:', err)
      return NextResponse.json({ error: 'Erro ao consultar IA' }, { status: 500 })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content ?? 'Desculpe, não consegui processar sua mensagem.'

    return NextResponse.json({ message: content })
  } catch (error) {
    console.error('AI Chat error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
