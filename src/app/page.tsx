'use client'

import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Code2,
  Gauge,
  Globe2,
  LayoutDashboard,
  Layers3,
  LineChart,
  Menu,
  MonitorSmartphone,
  Palette,
  Rocket,
  ShoppingCart,
  Sparkles,
  Workflow,
  Zap,
  MonitorPlay,
  Target,
  Calendar,
  Clock,
  MessageCircle,
  Mail,
  Send,
  MapPin,
  Linkedin,
  Github,
  Instagram,
  ArrowUp,
  ExternalLink,
  ArrowUpRight,
  X,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import LoadingScreen from '@/components/LoadingScreen'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import dynamic from 'next/dynamic'
const DucklabMascot3D = dynamic(() => import('@/components/DucklabMascot3D'), { ssr: false })
const DucklabAIChat = dynamic(() => import('@/components/DucklabAIChat'), { ssr: false })

interface EquipeMember {
  id: string
  nome: string
  cargo: string
  descricao: string
  imagem: string
  github?: string
  linkedin?: string
  instagram?: string
  ordem: number
}

const easePremium = [0.22, 1, 0.36, 1] as const

const navItems = [
  { label: 'Início', href: '#inicio', id: 'inicio' },
  { label: 'Sobre', href: '#sobre', id: 'sobre' },
  { label: 'Serviços', href: '#servicos', id: 'servicos' },
  { label: 'Processo', href: '#processo', id: 'processo' },
  { label: 'Projetos', href: '#projetos', id: 'projetos' },
  { label: 'Equipe', href: '#equipe', id: 'equipe' },
]

const microInfos = ['Disponível para novos projetos', 'Entrega ágil', 'Suporte dedicado']

const aboutCards = [
  { icon: Palette, title: 'Design que converte' },
  { icon: Code2, title: 'Tecnologia escalável' },
  { icon: BrainCircuit, title: 'Estratégia digital' },
  { icon: Gauge, title: 'Performance e velocidade' },
]

const services = [
  { icon: Globe2, title: 'Desenvolvimento de Sites' },
  { icon: MonitorSmartphone, title: 'Landing Pages' },
  { icon: Palette, title: 'Branding / Identidade Visual' },
  { icon: LayoutDashboard, title: 'Gestão de Redes Sociais' },
  { icon: Sparkles, title: 'Design Gráfico' },
  { icon: MonitorPlay, title: 'Produção de Vídeos e Criativos' },
  { icon: Target, title: 'Marketing Digital' },
  { icon: BrainCircuit, title: 'Estratégia para Marcas' },
  { icon: LineChart, title: 'Tráfego Pago / Anúncios' },
  { icon: Code2, title: 'Soluções Digitais para Empresas' },
]

const processSteps = ['Diagnóstico', 'Estratégia', 'Design', 'Desenvolvimento', 'Lançamento', 'Evolução']


const results = [
  'Criamos imagem profissional',
  'Ajudamos empresas a crescer',
  'Unimos design + tecnologia + marketing',
]

const testimonials = [
  {
    quote:
      'A Ducklab Agência transformou uma ideia solta em uma operação digital clara, bonita e muito mais fácil de vender.',
    name: 'Marina Lopes',
    role: 'Diretora Comercial',
  },
  {
    quote:
      'O painel reduziu tarefas manuais e trouxe uma visão que a equipe nunca tinha conseguido acompanhar em tempo real.',
    name: 'Rafael Andrade',
    role: 'Gestor de Operações',
  },
  {
    quote:
      'A entrega teve cuidado visual, performance e um processo bem organizado do briefing ao lançamento.',
    name: 'Camila Martins',
    role: 'Founder',
  },
]

const team = [
  { icon: Code2, title: 'Fullstack Developer' },
  { icon: Palette, title: 'UI/UX Designer' },
  { icon: Layers3, title: 'Front-end Developer' },
  { icon: LineChart, title: 'Estratégia Digital' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
}

function SectionHeader({
  eyebrow,
  title,
  align = 'center',
}: {
  eyebrow: string
  title: string
  align?: 'center' | 'left'
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.35 }}
      variants={fadeUp}
      transition={{ duration: 0.7, ease: easePremium }}
      className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}
    >
      <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#00EB69]/20 bg-[#00EB69]/5 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[#00EB69]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#00EB69] shadow-[0_0_14px_rgba(0,235,105,0.9)]" />
        {eyebrow}
      </span>
      <h2 className="text-balance text-3xl font-black leading-tight tracking-normal text-white md:text-5xl">
        {title}
      </h2>
    </motion.div>
  )
}

function PremiumCard({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      variants={fadeUp}
      transition={{ duration: 0.7, ease: easePremium }}
      whileHover={{ y: -6 }}
      className={`group rounded-[8px] border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl transition-colors duration-300 hover:border-[#00EB69]/35 hover:bg-[#00EB69]/[0.045] ${className}`}
    >
      {children}
    </motion.div>
  )
}

export default function Home() {
  const [loadingDone, setLoadingDone] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const shouldReduceMotion = useReducedMotion()
  const [activeSection, setActiveSection] = useState('inicio')
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [dynamicProjects, setDynamicProjects] = useState<any[]>([])
  const [dynamicEquipe, setDynamicEquipe] = useState<EquipeMember[]>([])
  const [previewMedia, setPreviewMedia] = useState<string | null>(null)

  const isVideoUrl = (url: string) => {
    if (!url) return false
    if (url.includes('/video/upload/')) return true
    return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url)
  }

  useEffect(() => {
    // Buscar Projetos
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || ''
    fetch('/api/projetos', {
      headers: {
        'x-api-key': apiKey
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDynamicProjects(data)
        }
      })
      .catch(err => console.error('Erro ao carregar projetos:', err))

    // Buscar Equipe
    fetch('/api/equipe')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDynamicEquipe(data)
        }
      })
      .catch(err => console.error('Erro ao carregar equipe:', err))
  }, [])

  useEffect(() => {
    if (!loadingDone) return
    const sections = navItems.map((item) => item.id)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: '-45% 0px -45% 0px' }
    )

    sections.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [loadingDone])

  return (
    <main className="min-h-screen overflow-clip bg-[#020403] text-white selection:bg-[#00EB69] selection:text-black">
      <AnimatePresence>
        {!loadingDone && <LoadingScreen key="loading" onFinish={() => setLoadingDone(true)} />}
      </AnimatePresence>

      <AnimatePresence>
        {loadingDone && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: easePremium }}
            className="relative"
          >
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
              <motion.div
                animate={
                  shouldReduceMotion
                    ? {}
                                    : { scale: [1, 1.06, 1], opacity: [0.18, 0.3, 0.18] }
                }
                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute left-1/2 top-[-18rem] h-[44rem] w-[44rem] -translate-x-1/2 rounded-full bg-[#00EB69]/12 blur-[160px]"
              />
              <motion.div
                animate={shouldReduceMotion ? {} : { backgroundPosition: ['0 0', '52px 52px'] }}
                transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 opacity-[0.055]"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(0,235,105,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(0,235,105,0.14) 1px, transparent 1px)',
                  backgroundSize: '52px 52px',
                }}
              />
              <div
                className="absolute inset-0 opacity-[0.035] mix-blend-screen"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 220 220' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.55'/%3E%3C/svg%3E\")",
                }}
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020403_72%)]" />
            </div>

            <motion.header
              initial={{ y: -24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.75, ease: easePremium }}
              className="fixed left-0 right-0 top-4 z-50 flex justify-center px-4 md:px-8"
            >
              <div className="w-full max-w-6xl flex items-center justify-between rounded-full border border-white/[0.05] bg-[#060a06]/90 backdrop-blur-2xl shadow-2xl shadow-black/40 px-6 py-3">
                {/* Logo */}
                <a href="#" className="flex items-center gap-2.5 pl-1" aria-label="Ducklab Agência">
                  <span className="relative flex h-8 w-8 shrink-0 items-center justify-center bg-transparent">
                    <Image
                      src="/logo-duck.png"
                      alt="Logo Ducklab Agência"
                      fill
                      className="object-contain"
                      priority
                    />
                  </span>
                </a>


                {/* Nav central */}
                <nav className="hidden items-center gap-1 lg:flex">
                  {navItems.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => setActiveSection(item.id)}
                      className={
                        activeSection === item.id
                          ? 'rounded-full border border-[#00EB69] bg-[#00EB69]/10 px-5 py-2 text-[14px] font-medium text-white transition'
                          : 'rounded-full px-4 py-2 text-[14px] font-medium text-zinc-400 transition hover:text-white'
                      }
                    >
                      {/* Precisamos transformar de UPPERCASE para Title Case (já que os dados podem estar maiúsculos ou minúsculos) */}
                      {item.label.charAt(0).toUpperCase() + item.label.slice(1).toLowerCase()}
                    </a>
                  ))}
                </nav>

                {/* Contato + mobile */}
                <div className="flex items-center gap-2">
                  <a
                    href="#contato"
                    className="hidden items-center gap-2 rounded-full bg-white px-6 py-2 text-[14px] font-bold text-black transition hover:bg-zinc-200 md:inline-flex"
                  >
                    Contato
                    <ArrowRight size={15} />
                  </a>
                  <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="flex items-center justify-center p-1 text-[#00EB69] lg:hidden transition hover:opacity-80"
                    aria-label="Menu"
                  >
                    <Menu size={24} />
                  </button>
                </div>
              </div>
            </motion.header>

            {/* Mobile Menu */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <>
                  {/* Fundo escuro clicável */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
                  />
                  
                  {/* Drawer Menu (75% da tela) */}
                  <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed top-0 right-0 bottom-0 z-[100] flex w-[75vw] flex-col bg-[#020403]/98 backdrop-blur-3xl px-6 py-6 border-l border-white/10 shadow-2xl"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold tracking-widest text-white">DUCKLAB</span>
                      <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white hover:text-[#00EB69] transition hover:bg-white/5"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <nav className="mt-12 flex flex-col gap-6 text-left">
                      {navItems.map((item) => (
                        <a
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="text-xl font-bold text-zinc-400 hover:text-[#00EB69] transition"
                        >
                          {item.label}
                        </a>
                      ))}
                      <a
                        href="#contato"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="mt-6 rounded-full bg-[#00EB69] px-6 py-3.5 text-center text-[15px] font-black text-black transition hover:bg-[#00EB69]/90 shadow-[0_0_20px_rgba(0,235,105,0.2)]"
                      >
                        Solicitar Orçamento
                      </a>
                    </nav>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <div className="relative z-10">
              {/* ── HERO ───────────────────────────────────────────────────── */}
              <section id="inicio" className="relative flex min-h-screen w-full items-center">

                {/* Mascote Unificado — Responsive */}
                <div className="absolute inset-0 flex items-end justify-center opacity-20 pointer-events-none lg:pointer-events-auto lg:opacity-100 lg:inset-y-0 lg:left-0 lg:w-[52%] lg:items-center lg:pt-20">
                  <div className="relative w-full h-full pointer-events-none lg:pointer-events-auto">
                    <ErrorBoundary fallback={null}>
                      <DucklabMascot3D />
                    </ErrorBoundary>
                  </div>
                </div>

                {/* Conteúdo — coluna direita */}
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.13, delayChildren: 0.2 } },
                  }}
                  className="ml-auto w-full px-6 py-32 lg:w-[50%] lg:pr-16 lg:pl-8 flex flex-col items-center lg:items-start text-center lg:text-left pointer-events-auto"
                >
                  {/* Badge */}
                  <motion.span
                    variants={fadeUp}
                    transition={{ duration: 0.7, ease: easePremium }}
                    className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#00EB69]/20 bg-[#00EB69]/5 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#00EB69]"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00EB69] shadow-[0_0_14px_rgba(0,235,105,0.9)]" />
                    Agência Criativa
                  </motion.span>

                  {/* H1 */}
                  <motion.h1
                    variants={fadeUp}
                    transition={{ duration: 0.75, ease: easePremium }}
                    className="max-w-xl text-balance text-[2.6rem] font-black leading-[1.04] tracking-tight text-white sm:text-5xl lg:text-[3.2rem]"
                  >
                    Criamos experiências digitais que {' '}
                    <br className="hidden lg:block" />
                    <span className="text-[#00EB69] drop-shadow-[0_0_28px_rgba(0,235,105,0.4)]">
                      fortalecem marcas
                    </span>
                    <br className="hidden lg:block" />
                    {' '}e geram resultados.
                  </motion.h1>

                  {/* Subtítulo */}
                  <motion.p
                    variants={fadeUp}
                    transition={{ duration: 0.75, ease: easePremium }}
                    className="mt-6 max-w-md text-base leading-7 text-zinc-400"
                  >
                    Sites modernos, branding estratégico e marketing digital para empresas que querem crescer de verdade.
                  </motion.p>

                  {/* Botões */}
                  <motion.div
                    variants={fadeUp}
                    transition={{ duration: 0.75, ease: easePremium }}
                    className="mt-9 flex flex-col gap-3 sm:flex-row"
                  >
                    <a
                      href="#contato"
                      className="group inline-flex items-center justify-center gap-2.5 rounded-full border border-white/10 bg-white/[0.06] px-6 py-3.5 text-sm font-bold text-white backdrop-blur-xl transition hover:border-[#00EB69]/40 hover:text-[#00EB69]"
                    >
                      <Zap size={16} className="text-[#00EB69]" />
                      Solicitar Orçamento
                      <ChevronRight size={15} className="transition group-hover:translate-x-1" />
                    </a>
                    <a
                      href="#projetos"
                      className="group inline-flex items-center justify-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-bold text-white backdrop-blur-xl transition duration-300 hover:border-[#00EB69]/40 hover:text-[#00EB69] hover:shadow-[0_0_20px_rgba(0,235,105,0.15)]"
                    >
                      <Code2 size={16} className="text-[#00EB69]" />
                      Ver Portfólio
                      <ChevronRight size={15} className="transition group-hover:translate-x-1" />
                    </a>
                  </motion.div>

                  {/* Micro infos */}
                  <motion.div
                    variants={fadeUp}
                    transition={{ duration: 0.75, ease: easePremium }}
                    className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2"
                  >
                    {microInfos.map((info) => (
                      <span key={info} className="inline-flex items-center gap-2 text-xs text-zinc-400">
                        <CheckCircle2 size={13} className="text-[#00EB69]" />
                        {info}
                      </span>
                    ))}
                  </motion.div>
                </motion.div>
              </section>


              <section id="sobre" className="w-full px-8 md:px-16 lg:px-24 py-20 md:py-28">
                <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
                  <div>
                    <SectionHeader eyebrow="Sobre" title="Sobre a Ducklab Agência" align="left" />
                    <motion.p
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, amount: 0.35 }}
                      variants={fadeUp}
                      transition={{ duration: 0.7, ease: easePremium, delay: 0.08 }}
                      className="mt-6 text-lg leading-8 text-zinc-300"
                    >
                      Transformamos ideias em experiências digitais. A Ducklab une design, tecnologia e estratégia para criar marcas fortes, sites modernos e campanhas que geram resultados reais.
                    </motion.p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {aboutCards.map((card) => (
                      <PremiumCard key={card.title}>
                        <card.icon className="mb-5 text-[#00EB69]" size={26} />
                        <h3 className="text-lg font-bold text-white">{card.title}</h3>
                      </PremiumCard>
                    ))}
                  </div>
                </div>
              </section>

              <section id="servicos" className="border-y border-white/5 bg-white/[0.015]">
                <div className="w-full px-8 md:px-16 lg:px-24 py-20 md:py-28">
                  <SectionHeader eyebrow="Serviços" title="O que fazemos" />
                  <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {services.map((service) => (
                      <PremiumCard key={service.title} className="min-h-[160px]">
                        <service.icon className="mb-6 text-[#00EB69]" size={28} />
                        <h3 className="text-lg font-bold text-white">{service.title}</h3>
                      </PremiumCard>
                    ))}
                  </div>
                </div>
              </section>

              <section id="processo" className="w-full px-8 md:px-16 lg:px-24 py-20 md:py-28">
                <SectionHeader
                  eyebrow="Processo"
                  title="Como transformamos ideias em resultados"
                />
                <div className="relative mt-14">
                  <div className="absolute left-5 top-0 h-full w-px bg-white/10 lg:left-0 lg:right-0 lg:top-9 lg:mx-auto lg:h-px lg:w-full" />
                  <motion.div
                    initial={{ scaleX: 0, scaleY: 0 }}
                    whileInView={{ scaleX: 1, scaleY: 1 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 1.2, ease: easePremium }}
                    className="absolute left-5 top-0 h-full w-px origin-top bg-[#00EB69] shadow-[0_0_18px_rgba(0,235,105,0.55)] lg:left-0 lg:right-0 lg:top-9 lg:mx-auto lg:h-px lg:w-full lg:origin-left"
                  />
                  <div className="grid gap-5 lg:grid-cols-6">
                    {processSteps.map((step, index) => (
                      <motion.div
                        key={step}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.35 }}
                        variants={fadeUp}
                        transition={{ duration: 0.7, ease: easePremium, delay: index * 0.05 }}
                        className="relative flex gap-5 pl-14 lg:block lg:pl-0 lg:text-center"
                      >
                        <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border border-[#00EB69]/35 bg-black text-sm font-black text-[#00EB69] shadow-[0_0_22px_rgba(0,235,105,0.22)] lg:relative lg:mx-auto">
                          {index + 1}
                        </div>
                        <div className="rounded-[8px] border border-white/10 bg-white/[0.035] px-5 py-4 lg:mt-6">
                          <h3 className="text-base font-bold text-white">{step}</h3>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              <section id="projetos" className="border-y border-white/5 bg-white/[0.015]">
                <div className="w-full px-8 md:px-16 lg:px-24 py-20 md:py-28">
                  <SectionHeader eyebrow="Projetos" title="Projetos que mostram nossa evolução" />
                  <div className="mt-12 grid gap-6 lg:grid-cols-3">
                    {dynamicProjects.length === 0 ? (
                      <div className="col-span-full py-16 text-center bg-white/[0.01] border border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center p-8">
                        <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">
                          Nenhum projeto em exibição
                        </p>
                        <p className="text-zinc-600 text-xs mt-2">
                          Gerencie e adicione novas cases de sucesso através do painel da Ducklab.
                        </p>
                      </div>
                    ) : (
                      dynamicProjects.map((project, index) => (
                        <PremiumCard key={project.titulo || project.title} className="min-h-[380px] overflow-hidden flex flex-col group p-6 rounded-[2.5rem] bg-black/40 border border-white/5 hover:border-[#00EB69]/20 hover:shadow-2xl hover:shadow-[#00EB69]/5 transition-all duration-500 relative">
                          {project.imagem && (
                            <div 
                              className="aspect-video w-full relative mb-5 overflow-hidden rounded-[1.5rem] bg-black/40 border border-white/5 cursor-pointer group/media"
                              onClick={() => setPreviewMedia(project.imagem)}
                            >
                              {/* Overlay de Hover para indicar que é clicável */}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/media:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-[#00EB69]/90 text-black flex items-center justify-center transform scale-75 group-hover/media:scale-100 transition-transform duration-300 shadow-[0_0_20px_#00EB69]">
                                  {isVideoUrl(project.imagem) ? (
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                                  ) : (
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>
                                  )}
                                </div>
                              </div>
                              {isVideoUrl(project.imagem) ? (
                                <video 
                                  src={project.imagem} 
                                  autoPlay 
                                  muted 
                                  loop 
                                  playsInline 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                              ) : (
                                <img 
                                  src={project.imagem} 
                                  alt={project.titulo || project.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                              )}
                            </div>
                          )}
                          <div className="flex flex-col gap-2.5">
                            <div className="flex">
                              <span className="rounded-full bg-[#00EB69] text-black px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider shadow-lg shadow-[#00EB69]/10">
                                {project.categoria || project.category}
                              </span>
                            </div>
                            <h3 className="text-xl md:text-2xl font-black text-white leading-tight mt-1 line-clamp-1">
                              {project.titulo || project.title}
                            </h3>
                            <p className="text-zinc-400 text-xs md:text-sm leading-relaxed line-clamp-3">
                              {project.descricao || project.description}
                            </p>
                          </div>

                          {/* Linha Divisória e Rodapé do Card (Mockup do Usuário) */}
                          <div className="border-t border-white/5 pt-4 flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-1.5 text-gray-500 text-[11px] font-bold">
                              <Calendar className="w-3.5 h-3.5 text-gray-600" />
                              <span>{project.data || 'Sem data'}</span>
                            </div>

                            {project.link ? (
                              <a 
                                href={project.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white hover:text-[#00EB69] text-[11px] flex items-center gap-1 transition-colors font-black uppercase tracking-widest"
                              >
                                Ver Detalhes <span className="text-[#00EB69]">→</span>
                              </a>
                            ) : (
                              <span className="text-gray-600 text-[11px] font-black uppercase tracking-widest">
                                Ver Detalhes →
                              </span>
                            )}
                          </div>
                        </PremiumCard>
                      ))
                    )}
                  </div>
                </div>
              </section>

              <section className="w-full px-8 md:px-16 lg:px-24 py-20 md:py-28">
                <SectionHeader eyebrow="Diferenciais" title="Por que a Ducklab?" />
                <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {results.map((result) => (
                    <PremiumCard key={result} className="min-h-[150px]">
                      <Zap className="mb-5 text-[#00EB69]" size={24} />
                      <h3 className="text-base font-bold leading-6 text-white">{result}</h3>
                    </PremiumCard>
                  ))}
                </div>
              </section>

              <section className="border-y border-white/5 bg-white/[0.015]">
                <div className="w-full px-8 md:px-16 lg:px-24 py-20 md:py-28">
                  <SectionHeader eyebrow="Depoimentos" title="O que clientes dizem" />
                  <div className="mt-12 grid gap-5 lg:grid-cols-3">
                    {testimonials.map((testimonial) => (
                      <PremiumCard key={testimonial.name}>
                        <p className="text-base leading-8 text-zinc-300">"{testimonial.quote}"</p>
                        <div className="mt-8 border-t border-white/10 pt-5">
                          <h3 className="text-base font-bold text-white">{testimonial.name}</h3>
                          <p className="mt-1 text-sm text-[#00EB69]">{testimonial.role}</p>
                        </div>
                      </PremiumCard>
                    ))}
                  </div>
                </div>
              </section>

              <section id="equipe" className="w-full px-8 md:px-16 lg:px-24 py-20 md:py-28 relative">
                <SectionHeader 
                  eyebrow="Sobre nós" 
                  title="Conheça o time por trás da Agência." 
                />
                <p className="text-gray-400 text-center max-w-2xl mx-auto mt-4 mb-16">
                  Pessoas apaixonadas por tecnologia, design e resultados.
                </p>
                
                <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
                  {dynamicEquipe.length > 0 ? (
                    dynamicEquipe.map((member) => (
                      <div key={member.id} className="bg-[#111]/80 backdrop-blur-sm border border-[#00EB69]/10 rounded-2xl p-6 hover:border-[#00EB69]/30 hover:shadow-[0_0_30px_rgba(0,235,105,0.05)] transition-all duration-300 flex flex-col items-center text-center group">
                        
                        {/* Imagem redonda centralizada */}
                        <div className="w-24 h-24 rounded-full border-2 border-[#00EB69]/30 bg-[#00EB69]/5 overflow-hidden mb-5 relative shadow-[0_0_20px_rgba(0,235,105,0.1)] group-hover:border-[#00EB69] transition-colors duration-300">
                          <img 
                            src={member.imagem} 
                            alt={member.nome}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Nome e Cargo */}
                        <h3 className="text-xl font-bold text-white mb-1">{member.nome}</h3>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-4">{member.cargo}</p>
                        
                        {/* Descrição */}
                        <p className="text-gray-400 text-sm leading-relaxed mb-8 flex-1">
                          {member.descricao}
                        </p>
                        
                        {/* Redes Sociais */}
                        <div className="flex items-center gap-4 mt-auto">
                          {member.github && (
                            <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#00EB69] transition-colors p-2 bg-white/5 rounded-full hover:bg-[#00EB69]/10">
                              <Github size={18} />
                            </a>
                          )}
                          {member.linkedin && (
                            <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#00EB69] transition-colors p-2 bg-white/5 rounded-full hover:bg-[#00EB69]/10">
                              <Linkedin size={18} />
                            </a>
                          )}
                          {member.instagram && (
                            <a href={member.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#00EB69] transition-colors p-2 bg-white/5 rounded-full hover:bg-[#00EB69]/10">
                              <Instagram size={18} />
                            </a>
                          )}
                        </div>
                        
                      </div>
                    ))
                  ) : (
                    // Fallback estático caso não tenha ninguém no banco
                    team.map((member) => (
                      <PremiumCard key={member.title} className="text-center">
                        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-[#00EB69]/25 bg-[#00EB69]/10 text-[#00EB69]">
                          <member.icon size={25} />
                        </div>
                        <h3 className="text-lg font-bold text-white">{member.title}</h3>
                      </PremiumCard>
                    ))
                  )}
                </div>
              </section>

              <section id="contato" className="relative px-4 py-24 md:px-6 md:py-32 overflow-hidden">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.25 }}
                  variants={fadeUp}
                  transition={{ duration: 0.8, ease: easePremium }}
                  className="relative z-10 mx-auto max-w-5xl flex flex-col items-center text-center"
                >
                  <h2 className="text-balance text-4xl font-black leading-[1.1] text-white md:text-[3.5rem] lg:text-[4rem]">
                    Pronto para transformar <br className="hidden md:block" />
                    sua ideia em um <span className="text-[#00EB69]">projeto digital?</span>
                  </h2>
                  <p className="mt-6 text-lg text-zinc-300 md:text-xl font-medium">
                    Entre em contato conosco e vamos juntos criar algo <span className="text-[#00EB69]">extraordinário</span>
                  </p>

                  <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-xs md:text-sm font-semibold text-zinc-300">
                    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 backdrop-blur-md">
                      <Clock size={16} className="text-[#00EB69]" />
                      Resposta em até 24h
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 backdrop-blur-md">
                      <CheckCircle2 size={16} className="text-[#00EB69]" />
                      Orçamento sem compromisso
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 backdrop-blur-md">
                      <MessageCircle size={16} className="text-[#00EB69]" />
                      Atendimento personalizado
                    </div>
                  </div>

                  <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5 w-full max-w-lg mx-auto sm:max-w-none">
                    <a
                      href="https://wa.me/558799614464"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex w-full sm:w-auto items-center justify-center gap-3 rounded-[12px] border border-[#00EB69]/40 bg-black/50 px-8 py-4.5 text-[15px] font-bold text-white transition-all hover:bg-[#00EB69]/10 shadow-[0_0_30px_rgba(0,235,105,0.15)] hover:shadow-[0_0_45px_rgba(0,235,105,0.25)]"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-[#00EB69]" aria-hidden="true">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.555 4.122 1.528 5.855L.057 23.5a.5.5 0 00.61.61l5.763-1.47A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.95 9.95 0 01-5.092-1.395l-.364-.217-3.773.963.98-3.68-.236-.376A9.95 9.95 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                      </svg>
                      Conversar no WhatsApp
                    </a>
                    <a
                      href="#chat"
                      onClick={(e) => {
                        e.preventDefault();
                        window.dispatchEvent(new CustomEvent('open-ai-chat'));
                      }}
                      className="group flex w-full sm:w-auto items-center justify-center gap-3 rounded-[12px] border border-white/10 bg-transparent px-8 py-4.5 text-[15px] font-bold text-white transition hover:border-white/30 hover:bg-white/5"
                    >
                      <Sparkles size={20} className="text-[#00EB69]" />
                      Orçamento IA
                    </a>
                  </div>

                  <p className="mt-8 max-w-xl text-sm leading-relaxed text-zinc-500">
                    Use nossa <span className="text-[#00EB69] font-bold">IA assistente</span> para receber um orçamento personalizado em menos de 60 segundos. Rápido, prático e sem compromisso!
                  </p>

                  <div className="mt-16 grid w-full gap-6 sm:grid-cols-2 max-w-3xl mx-auto text-left">
                    <a
                      href="https://wa.me/558799614464"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col gap-4 rounded-[20px] border border-white/5 bg-[#0a0a0a] p-8 transition-all hover:border-[#00EB69]/30 hover:bg-[#111]"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_24px_rgba(37,211,102,0.6)]">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 text-white" aria-hidden="true">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.555 4.122 1.528 5.855L.057 23.5a.5.5 0 00.61.61l5.763-1.47A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.95 9.95 0 01-5.092-1.395l-.364-.217-3.773.963.98-3.68-.236-.376A9.95 9.95 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">WhatsApp</h3>
                        <p className="mt-1 text-sm text-zinc-400">Resposta imediata</p>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-[#00EB69] font-bold">
                        +55 (87) 9961-4464
                        <Send size={18} className="opacity-70 group-hover:opacity-100" />
                      </div>
                    </a>

                    <a
                      href="mailto:ducklabcontato@gmail.com"
                      className="group flex flex-col gap-4 rounded-[20px] border border-white/5 bg-[#0a0a0a] p-8 transition-all hover:border-white/20 hover:bg-[#111]"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_24px_rgba(234,67,53,0.5)]">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-7 w-7" aria-hidden="true">
                          <path fill="#4caf50" d="M45,16.2l-5,2.75l-5,4.75L35,40h7c1.657,0,3-1.343,3-3V16.2z"/>
                          <path fill="#1e88e5" d="M3,16.2l3.614,1.71L13,23.7V40H6c-1.657,0-3-1.343-3-3V16.2z"/>
                          <polygon fill="#e53935" points="35,11.2 24,19.45 13,11.2 12,17 13,23.7 24,31.95 35,23.7 36,17"/>
                          <path fill="#c62828" d="M3,12.298V16.2l10,7.5V11.2L9.876,8.859C9.132,8.301,8.228,8,7.298,8h0 C4.924,8,3,9.924,3,12.298z"/>
                          <path fill="#fbc02d" d="M45,12.298V16.2l-10,7.5V11.2l3.124-2.341C38.868,8.301,39.772,8,40.702,8h0 C43.076,8,45,9.924,45,12.298z"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">E-mail</h3>
                        <p className="mt-1 text-sm text-zinc-400">Contato profissional</p>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-[#00EB69] font-bold">
                        ducklabcontato@gmail.com
                        <Send size={18} className="opacity-70 group-hover:opacity-100" />
                      </div>
                    </a>
                  </div>
                </motion.div>
              </section>
            </div>



            <footer className="relative z-10 border-t border-white/5 bg-[#050505] pt-20 pb-8">
              <div className="mx-auto w-full px-8 md:px-16 lg:px-24">
                <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr_1fr] lg:gap-8">
                  {/* Left Column - About & Contact */}
                  <div className="flex flex-col gap-6">
                    <a href="#" className="flex items-center gap-2.5" aria-label="Ducklab Agência">
                      <span className="relative flex h-8 w-8 shrink-0 items-center justify-center bg-transparent">
                        <Image
                          src="/logo-duck.png"
                          alt="Logo Ducklab"
                          fill
                          className="object-contain"
                        />
                      </span>
                      <span className="text-xl font-bold tracking-widest text-white">DUCKLAB</span>
                    </a>
                    <p className="text-[13px] leading-relaxed text-zinc-400 max-w-[280px]">
                      Transformamos ideias em <span className="text-[#00EB69] font-semibold">experiências digitais</span> memoráveis que impulsionam negócios e conectam pessoas.
                    </p>
                    <div className="flex flex-col gap-3 mt-2">
                      <a href="mailto:ducklabcontato@gmail.com" className="flex items-center gap-3 text-[13px] text-zinc-400 transition hover:text-[#00EB69]">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 border border-white/10">
                          <Mail size={14} />
                        </div>
                        ducklabcontato@gmail.com
                      </a>
                      <a href="https://wa.me/558799614464" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[13px] text-zinc-400 transition hover:text-[#00EB69]">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 border border-white/10">
                          <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.555 4.122 1.528 5.855L.057 23.5a.5.5 0 00.61.61l5.763-1.47A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.95 9.95 0 01-5.092-1.395l-.364-.217-3.773.963.98-3.68-.236-.376A9.95 9.95 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                          </svg>
                        </div>
                        +55 (87) 9961-4464
                      </a>
                      <div className="flex items-center gap-3 text-[13px] text-zinc-400">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 border border-white/10">
                          <MapPin size={14} />
                        </div>
                        Brasil
                      </div>
                    </div>
                  </div>

                  {/* Middle Column - Quick Links */}
                  <div className="lg:mx-auto">
                    <h3 className="text-sm font-bold text-white mb-6">Links Rápidos</h3>
                    <ul className="flex flex-col gap-3.5">
                      {navItems.map((item) => (
                        <li key={item.id}>
                          <a href={item.href} className="text-[13px] text-zinc-400 transition hover:text-[#00EB69]">
                            {item.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Right Column - Social Media */}
                  <div className="lg:ml-auto lg:text-right">
                    <h3 className="text-sm font-bold text-white mb-6">Redes Sociais</h3>
                    <p className="text-[13px] text-zinc-400 mb-6 max-w-[200px] lg:ml-auto">
                      Acompanhe nossas novidades e projetos
                    </p>
                    <div className="flex items-center gap-3 lg:justify-end">
                      <a href="https://www.instagram.com/ducklab_/" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/10 bg-white/5 text-zinc-400 transition hover:border-[#00EB69]/50 hover:bg-[#00EB69]/10 hover:text-[#00EB69]" aria-label="Instagram">
                        <Instagram size={18} />
                      </a>
                      <a href="https://github.com/Ducklab-Studio" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/10 bg-white/5 text-zinc-400 transition hover:border-[#00EB69]/50 hover:bg-[#00EB69]/10 hover:text-[#00EB69]" aria-label="GitHub">
                        <Github size={18} />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-16 relative flex items-center justify-center border-t border-white/10 pt-8">

                  <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-zinc-500">
                      © 2026 Ducklab. Todos os direitos reservados.
                    </p>
                  </div>
                </div>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Preview de Mídia (Imagem/Vídeo) */}
      <AnimatePresence>
        {previewMedia && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 md:p-8"
            onClick={() => setPreviewMedia(null)}
          >
            <div 
              className="relative w-full max-w-6xl max-h-[90vh] bg-[#050505] rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-[#00EB69]/10 flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setPreviewMedia(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/60 hover:bg-[#00EB69] text-white hover:text-black rounded-full flex items-center justify-center transition-colors backdrop-blur-md"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
              
              {isVideoUrl(previewMedia) ? (
                <video 
                  src={previewMedia} 
                  autoPlay 
                  controls
                  playsInline
                  className="w-full h-full max-h-[90vh] object-contain"
                />
              ) : (
                <img 
                  src={previewMedia} 
                  alt="Preview"
                  className="w-full h-full max-h-[90vh] object-contain"
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* IA Chat flutuante — visível sempre, independente do loading */}
      {loadingDone && <ErrorBoundary fallback={null}><DucklabAIChat /></ErrorBoundary>}
    </main>
  )
}
