'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Shield, UserPlus, Mail, X, CheckCircle2, ShieldAlert, Crown, Wrench } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { buscarUsuarios, adicionarUsuario, removerUsuario } from '@/app/actions/usuarios'
import { toast } from 'react-hot-toast'
import { useSession } from 'next-auth/react'

interface UsuarioVinculo {
  id: string        // ID do vínculo EmpresaUsuario
  usuarioId: string
  email: string
  nome: string | null
  imagem: string | null
  role: string
  ultimoAcesso: Date | null
  criadoEm: Date
}

export default function LiberacaoPage() {
  const { data: session } = useSession()
  const [usuarios, setUsuarios] = useState<UsuarioVinculo[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState('STAFF')

  // @ts-ignore
  const isBoss = session?.user?.role === 'BOSS'

  useEffect(() => {
    if (isBoss) {
      loadUsuarios()
      
      // Auto-refresh a cada 30 segundos enquanto estiver na página
      const interval = setInterval(loadUsuarios, 30000)
      return () => clearInterval(interval)
    }
  }, [isBoss])

  async function loadUsuarios() {
    try {
      const data = await buscarUsuarios()
      setUsuarios(data)
    } catch (err: any) {
      console.error("Erro ao carregar usuários:", err)
      toast.error(err.message || 'Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmail.includes('@gmail.com')) {
      toast.error('Apenas contas @gmail.com são permitidas.')
      return
    }

    try {
      await adicionarUsuario(newEmail, newRole)
      toast.success('Usuário autorizado com sucesso!')
      setNewEmail('')
      setIsModalOpen(false)
      loadUsuarios()
    } catch (err: any) {
      toast.error(err.message || 'Erro ao adicionar usuário.')
    }
  }

  const handleRemoveUser = async (vinculoId: string, email: string) => {
    if (email === session?.user?.email) {
      toast.error('Você não pode remover a si mesmo.')
      return
    }

    if (!confirm(`Deseja remover o acesso de ${email}?`)) return

    try {
      await removerUsuario(vinculoId)
      toast.success('Acesso removido.')
      loadUsuarios()
    } catch (err: any) {
      toast.error(err.message || 'Erro ao remover.')
    }
  }

  // Função para calcular tempo de ausência
  const getStatus = (ultimoAcesso: Date | null) => {
    if (!ultimoAcesso) return { status: 'offline', text: 'Nunca acessou' }
    
    const dataAcesso = new Date(ultimoAcesso)
    const agora = new Date()
    const diffMs = agora.getTime() - dataAcesso.getTime()
    const diffMin = Math.floor(diffMs / (1000 * 60))

    if (diffMin < 2) return { status: 'online', text: 'ONLINE AGORA' }
    
    if (diffMin < 60) return { status: 'offline', text: `Saiu há ${diffMin} min` }
    
    const diffHoras = Math.floor(diffMin / 60)
    if (diffHoras < 24) return { status: 'offline', text: `Saiu há ${diffHoras}h` }
    
    return { status: 'offline', text: `Offline há dias` }
  }

  if (!isBoss) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-6">
        <div className="p-6 bg-orange-500/10 rounded-full border border-orange-500/20">
          <ShieldAlert className="w-16 h-16 text-orange-500" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-white">Acesso Restrito</h1>
          <p className="text-gray-500 mt-2 max-w-sm mx-auto">
            Apenas o administrador (**Dono**) pode gerenciar as permissões de acesso do sistema.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-xl md:text-3xl font-display font-bold text-white flex items-center gap-2 md:gap-3">
            <Shield className="text-orange-500 w-6 h-6 md:w-8 md:h-8" />
            Liberação de Acessos
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Gerencie quem pode acessar o painel administrativo e quais são suas permissões.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-orange-600/20 active:scale-95"
        >
          <UserPlus className="w-5 h-5" />
          Autorizar Gmail
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
           <div className="w-12 h-12 border-4 border-orange-600/20 border-t-orange-600 rounded-full animate-spin" />
        </div>
      ) : (
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
        {usuarios
          .filter(user => user.email.toLowerCase().trim() !== session?.user?.email?.toLowerCase().trim())
          .map((user) => (
            <motion.div
              key={user.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-4 md:p-6 border border-white/5 hover:border-white/10 transition-all group relative flex flex-col gap-4"
            >
              {/* Header do Card */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-orange-600/10 flex items-center justify-center text-orange-500 border border-orange-600/20 overflow-hidden shrink-0">
                  {user.imagem ? (
                    <img src={user.imagem} alt={user.nome || user.email} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <Mail className="w-5 h-5 md:w-6 md:h-6" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-white font-bold truncate text-xs md:text-base leading-tight">
                    {user.nome || user.email.split('@')[0]}
                  </h3>
                  {/* Badge de Status */}
                  {(() => {
                    const info = getStatus(user.ultimoAcesso)
                    return (
                      <span className={`text-[8px] md:text-[10px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1 mt-1 w-fit ${
                        info.status === 'online' 
                        ? 'bg-green-500/10 text-green-500' 
                        : 'bg-white/5 text-gray-600'
                      }`}>
                        {info.status === 'online' && (
                          <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
                        )}
                        <span className="truncate">{info.text}</span>
                      </span>
                    )
                  })()}
                </div>
              </div>

              {/* Informações Extras */}
              <div className="space-y-2 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[8px] md:text-[10px] text-gray-500 font-bold uppercase tracking-wider">Cargo</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest border shrink-0 ${
                    user.role === 'BOSS' 
                    ? 'bg-orange-600/10 text-orange-500 border-orange-500/20' 
                    : 'bg-blue-600/10 text-blue-500 border-blue-500/20'
                  }`}>
                     {user.role === 'BOSS' ? 'Dono' : 'Equipe'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[8px] md:text-[10px] text-gray-500 font-bold uppercase tracking-wider">Autorizado</span>
                  <span className="text-[8px] md:text-[10px] text-gray-400 font-medium">
                    {new Date(user.criadoEm).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Ação de Remover */}
              <button
                onClick={() => handleRemoveUser(user.id, user.email)}
                className="mt-2 w-full py-2 bg-red-500/5 hover:bg-red-500/10 text-red-500/40 hover:text-red-500 rounded-xl transition-all flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest border border-red-500/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remover
              </button>
            </motion.div>
          ))}

        {usuarios.filter(user => user.email.toLowerCase().trim() !== session?.user?.email?.toLowerCase().trim()).length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[2.5rem] bg-white/[0.01]">
            <Shield className="w-12 h-12 text-gray-700 mx-auto mb-4 opacity-20" />
            <p className="text-gray-500 font-medium uppercase text-[10px] tracking-widest">Nenhum outro funcionário autorizado.</p>
          </div>
        )}
      </div>
      )}

      {/* Modal / Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              className="relative w-full max-w-md bg-zinc-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-6 h-6 text-orange-500" />
                  Autorizar Novo GMAIL
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddUser} className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Endereço de E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                    <input
                      type="email"
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all font-mono"
                      placeholder="exemplo@gmail.com"
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1 italic">
                    * O usuário deve fazer login usando este Gmail para acessar.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Nível de Acesso</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none transition-all appearance-none"
                  >
                    <option value="STAFF">Funcionário (Pedidos/Produtos/Adicionais/Cupons/Promoções)</option>
                    <option value="BOSS">Dono (Controle Total)</option>
                  </select>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Permissões para "{newRole === 'BOSS' ? 'Dono' : 'Funcionário'}"
                  </h4>
                  <ul className="text-[10px] text-gray-500 space-y-1.5 list-disc pl-4 uppercase font-black tracking-widest">
                    <li>Ver Dashboard Financeiro (Só Dono)</li>
                    <li>Gerenciar Pedidos em tempo real (Dono e Funcionário)</li>
                    <li>Acesso a Cupons, Produtos, Categorias, Adicionais e Promoções</li>
                    <li>Gerenciar outros usuários (Só Dono)</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={!newEmail}
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-900/50 disabled:text-white/30 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Confirmar Autorização
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
