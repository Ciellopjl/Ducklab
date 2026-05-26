'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import ProjectModal from '@/components/admin-core/ProjectModal'
import EquipeModal from '@/components/admin-core/EquipeModal'

// Lê o token CSRF do cookie (definido pelo middleware)
function getCsrfToken(): string {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/)
  return match ? match[1] : ''
}

const isVideoUrl = (url: string) => {
  if (!url) return false
  if (url.includes('/video/upload/')) return true
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url)
}

interface Project {
  id: string
  titulo: string
  descricao: string
  imagem: string
  categoria: string
  link?: string | null
  data?: string | null
  ordem: number
  destaque: boolean
  criadoEm: string
}

interface Equipe {
  id: string
  nome: string
  cargo: string
  descricao: string
  imagem: string
  github?: string | null
  linkedin?: string | null
  instagram?: string | null
  ordem: number
}

export default function AdminDashboard() {
  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || '/hacker-duck'
  const [activeTab, setActiveTab] = useState<'projetos' | 'equipe'>('projetos')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const [projects, setProjects] = useState<Project[]>([])
  const [equipe, setEquipe] = useState<Equipe[]>([])
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null)
  
  const [isEquipeModalOpen, setIsEquipeModalOpen] = useState(false)
  const [equipeToEdit, setEquipeToEdit] = useState<Equipe | null>(null)
  
  const router = useRouter()

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/projects')
      if (res.status === 401) {
        window.location.href = adminPath + '/login'
        return
      }
      if (!res.ok) throw new Error('Falha ao carregar projetos')
      const data = await res.json()
      setProjects(data)
    } catch (err) {
      setError('Erro de conexão com o banco de dados')
    } finally {
      setLoading(false)
    }
  }, [adminPath])

  const fetchEquipe = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/equipe')
      if (res.status === 401) {
        window.location.href = adminPath + '/login'
        return
      }
      if (!res.ok) throw new Error('Falha ao carregar equipe')
      const data = await res.json()
      setEquipe(data)
    } catch (err) {
      setError('Erro de conexão com o banco de dados')
    } finally {
      setLoading(false)
    }
  }, [adminPath])

  useEffect(() => {
    if (activeTab === 'projetos') {
      fetchProjects()
    } else {
      fetchEquipe()
    }
  }, [fetchProjects, fetchEquipe, activeTab])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/admin', { method: 'DELETE' })
      window.location.href = adminPath + '/login'
    } catch (e) {
      console.error(e)
    }
  }

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Deseja realmente deletar este projeto?')) return
    
    try {
      const res = await fetch(`/api/admin/projects?id=${id}`, {
        method: 'DELETE',
        headers: { 'x-csrf-token': getCsrfToken() },
      })
      if (res.ok) {
        fetchProjects()
      } else {
        const data = await res.json().catch(() => ({}))
        alert(`Erro ao deletar projeto: ${data?.error || res.status}`)
      }
    } catch (e) {
      alert('Erro ao deletar projeto')
    }
  }

  const handleDeleteEquipe = async (id: string) => {
    if (!confirm('Deseja realmente deletar este membro?')) return
    
    try {
      const res = await fetch(`/api/admin/equipe?id=${id}`, {
        method: 'DELETE',
        headers: { 'x-csrf-token': getCsrfToken() },
      })
      if (res.ok) {
        fetchEquipe()
      } else {
        const data = await res.json().catch(() => ({}))
        alert(`Erro ao deletar membro: ${data?.error || res.status}`)
      }
    } catch (e) {
      alert('Erro ao deletar membro')
    }
  }

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#111] border-r border-[#00ff41]/20 flex-col justify-between hidden md:flex">
        <div className="p-6">
          <div className="mb-10 text-center border-b border-[#00ff41]/20 pb-6">
            <h1 className="text-xl font-bold tracking-widest uppercase text-white">
              DUCKLAB <span className="text-[#00ff41]">ADMIN</span>
            </h1>
            <p className="text-[10px] text-[#00ff41]/50 mt-1 uppercase tracking-widest">System Control</p>
          </div>
          
          <nav className="flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab('projetos')}
              className={`w-full flex items-center gap-3 px-4 py-3 border transition-all font-bold tracking-widest text-sm uppercase ${
                activeTab === 'projetos' 
                  ? 'text-[#00ff41] bg-[#00ff41]/10 border-[#00ff41]/50' 
                  : 'text-gray-500 border-transparent hover:border-[#00ff41]/30 hover:text-[#00ff41]'
              }`}
            >
              {activeTab === 'projetos' && <span className="w-2 h-2 rounded-full bg-[#00ff41] shadow-[0_0_8px_#00ff41] animate-pulse"></span>}
              PROJETOS
            </button>
            <button 
              onClick={() => setActiveTab('equipe')}
              className={`w-full flex items-center gap-3 px-4 py-3 border transition-all font-bold tracking-widest text-sm uppercase ${
                activeTab === 'equipe' 
                  ? 'text-[#00ff41] bg-[#00ff41]/10 border-[#00ff41]/50' 
                  : 'text-gray-500 border-transparent hover:border-[#00ff41]/30 hover:text-[#00ff41]'
              }`}
            >
              {activeTab === 'equipe' && <span className="w-2 h-2 rounded-full bg-[#00ff41] shadow-[0_0_8px_#00ff41] animate-pulse"></span>}
              EQUIPE
            </button>
          </nav>
        </div>

        <div className="p-6 border-t border-[#00ff41]/20">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 px-4 py-3 border border-transparent hover:border-red-500/30 transition-all tracking-widest text-xs uppercase"
          >
            [ SAIR DO PAINEL ]
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside className={`fixed top-0 left-0 bottom-0 z-30 w-64 bg-[#111] border-r border-[#00ff41]/20 flex flex-col justify-between transition-transform duration-300 ease-in-out md:hidden ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6">
          <div className="mb-10 text-center border-b border-[#00ff41]/20 pb-6 mt-12">
            <h1 className="text-xl font-bold tracking-widest uppercase text-white">
              DUCKLAB <span className="text-[#00ff41]">ADMIN</span>
            </h1>
            <p className="text-[10px] text-[#00ff41]/50 mt-1 uppercase tracking-widest">System Control</p>
          </div>
          
          <nav className="flex flex-col gap-2">
            <button 
              onClick={() => {
                setActiveTab('projetos')
                setIsMobileMenuOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 border transition-all font-bold tracking-widest text-sm uppercase ${
                activeTab === 'projetos' 
                  ? 'text-[#00ff41] bg-[#00ff41]/10 border-[#00ff41]/50' 
                  : 'text-gray-500 border-transparent hover:border-[#00ff41]/30 hover:text-[#00ff41]'
              }`}
            >
              {activeTab === 'projetos' && <span className="w-2 h-2 rounded-full bg-[#00ff41] shadow-[0_0_8px_#00ff41] animate-pulse"></span>}
              PROJETOS
            </button>
            <button 
              onClick={() => {
                setActiveTab('equipe')
                setIsMobileMenuOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 border transition-all font-bold tracking-widest text-sm uppercase ${
                activeTab === 'equipe' 
                  ? 'text-[#00ff41] bg-[#00ff41]/10 border-[#00ff41]/50' 
                  : 'text-gray-500 border-transparent hover:border-[#00ff41]/30 hover:text-[#00ff41]'
              }`}
            >
              {activeTab === 'equipe' && <span className="w-2 h-2 rounded-full bg-[#00ff41] shadow-[0_0_8px_#00ff41] animate-pulse"></span>}
              EQUIPE
            </button>
          </nav>
        </div>

        <div className="p-6 border-t border-[#00ff41]/20">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 px-4 py-3 border border-transparent hover:border-red-500/30 transition-all tracking-widest text-xs uppercase"
          >
            [ SAIR DO PAINEL ]
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-[#111] border-b border-[#00ff41]/20 p-4 flex justify-between items-center sticky top-0 z-10 md:hidden">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                className="text-[#00ff41] hover:text-white transition-colors focus:outline-none"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <h1 className="text-lg font-bold tracking-widest text-[#00ff41] uppercase">DUCKLAB ADMIN</h1>
            </div>
            <button onClick={handleLogout} className="text-red-500 text-xs tracking-widest">[ SAIR ]</button>
        </header>

        <div className="p-4 sm:p-6 lg:p-10 flex-1 overflow-y-auto">
          {/* Aba Projetos */}
          {activeTab === 'projetos' && (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-bold tracking-widest uppercase text-white mb-1">Meus Projetos</h2>
                  <p className="text-[#00ff41]/60 text-xs tracking-widest uppercase">Gerenciamento de Portfólio</p>
                </div>
                
                <button 
                  onClick={() => {
                    setProjectToEdit(null)
                    setIsProjectModalOpen(true)
                  }}
                  className="w-full sm:w-auto bg-[#00ff41]/10 border border-[#00ff41] text-[#00ff41] px-6 py-3 font-bold uppercase tracking-widest text-sm hover:bg-[#00ff41] hover:text-black transition-colors text-center"
                >
                  + NOVO PROJETO
                </button>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 mb-8 tracking-widest text-sm uppercase">
                  [ ERROR ]: {error}
                </div>
              )}

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="bg-[#111] border border-gray-800 h-72 animate-pulse"></div>
                  ))}
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-[#00ff41]/30 text-[#00ff41]/50 tracking-widest uppercase">
                  Nenhum projeto encontrado no banco de dados.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {projects.map(project => (
                    <div key={project.id} className="bg-[#111] border border-[#00ff41]/20 hover:border-[#00ff41]/60 transition-colors flex flex-col group relative">
                      
                      {project.destaque && (
                        <div className="absolute top-2 right-2 bg-[#00ff41] text-black text-[10px] font-black px-2 py-1 tracking-widest uppercase z-10">
                          DESTAQUE
                        </div>
                      )}

                      <div className="h-48 w-full bg-black border-b border-[#00ff41]/20 overflow-hidden relative">
                        {isVideoUrl(project.imagem) ? (
                          <video 
                            src={project.imagem} 
                            autoPlay 
                            muted 
                            loop 
                            playsInline 
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                          />
                        ) : (
                          <img 
                            src={project.imagem} 
                            alt={project.titulo}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                          />
                        )}
                      </div>
                      
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[#00ff41] text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 bg-[#00ff41]/10 border border-[#00ff41]/30">
                            {project.categoria}
                          </span>
                          <span className="text-gray-500 text-[10px] tracking-widest">
                            {project.data || ''}
                          </span>
                        </div>
                        
                        <h3 className="font-bold text-white text-sm mb-1 uppercase tracking-wide line-clamp-1" title={project.titulo}>
                          {project.titulo}
                        </h3>
                        
                        <div className="flex items-center gap-2 mt-auto pt-4">
                          <button 
                            onClick={() => {
                              setProjectToEdit(project)
                              setIsProjectModalOpen(true)
                            }}
                            className="flex-1 bg-transparent border border-gray-700 text-gray-400 py-1.5 text-xs hover:border-[#00ff41] hover:text-[#00ff41] transition-colors uppercase tracking-widest"
                          >
                            Editar
                          </button>
                          <button 
                            onClick={() => handleDeleteProject(project.id)}
                            className="flex-1 bg-transparent border border-gray-700 text-gray-400 py-1.5 text-xs hover:border-red-500 hover:text-red-500 transition-colors uppercase tracking-widest"
                          >
                            Deletar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Aba Equipe */}
          {activeTab === 'equipe' && (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-bold tracking-widest uppercase text-white mb-1">Equipe</h2>
                  <p className="text-[#00ff41]/60 text-xs tracking-widest uppercase">Gerenciamento de Membros</p>
                </div>
                
                <button 
                  onClick={() => {
                    setEquipeToEdit(null)
                    setIsEquipeModalOpen(true)
                  }}
                  className="w-full sm:w-auto bg-[#00ff41]/10 border border-[#00ff41] text-[#00ff41] px-6 py-3 font-bold uppercase tracking-widest text-sm hover:bg-[#00ff41] hover:text-black transition-colors text-center"
                >
                  + NOVO MEMBRO
                </button>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 mb-8 tracking-widest text-sm uppercase">
                  [ ERROR ]: {error}
                </div>
              )}

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="bg-[#111] border border-gray-800 h-72 animate-pulse"></div>
                  ))}
                </div>
              ) : equipe.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-[#00ff41]/30 text-[#00ff41]/50 tracking-widest uppercase">
                  Nenhum membro encontrado no banco de dados.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {equipe.map(membro => (
                    <div key={membro.id} className="bg-[#111] border border-[#00ff41]/20 hover:border-[#00ff41]/60 transition-colors flex flex-col group relative items-center p-6 text-center">
                      
                      <div className="w-24 h-24 rounded-full bg-black border-2 border-[#00ff41]/30 overflow-hidden mb-4 relative shadow-[0_0_15px_rgba(0,255,65,0.1)]">
                        <img 
                          src={membro.imagem} 
                          alt={membro.nome}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                        />
                      </div>
                      
                      <h3 className="font-bold text-white text-lg mb-1 tracking-wide">
                        {membro.nome}
                      </h3>
                      
                      <span className="text-[#00ff41] text-xs font-bold tracking-widest uppercase mb-3">
                        {membro.cargo}
                      </span>
                      
                      <p className="text-gray-400 text-xs line-clamp-3 mb-6">
                        {membro.descricao}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-auto w-full pt-4 border-t border-[#00ff41]/20">
                        <button 
                          onClick={() => {
                            setEquipeToEdit(membro)
                            setIsEquipeModalOpen(true)
                          }}
                          className="flex-1 bg-transparent border border-gray-700 text-gray-400 py-1.5 text-xs hover:border-[#00ff41] hover:text-[#00ff41] transition-colors uppercase tracking-widest"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDeleteEquipe(membro.id)}
                          className="flex-1 bg-transparent border border-gray-700 text-gray-400 py-1.5 text-xs hover:border-red-500 hover:text-red-500 transition-colors uppercase tracking-widest"
                        >
                          Deletar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <ProjectModal 
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        projectToEdit={projectToEdit}
        onSave={() => {
          setIsProjectModalOpen(false)
          fetchProjects()
        }}
      />

      <EquipeModal 
        isOpen={isEquipeModalOpen}
        onClose={() => setIsEquipeModalOpen(false)}
        membroToEdit={equipeToEdit}
        onSave={() => {
          setIsEquipeModalOpen(false)
          fetchEquipe()
        }}
      />
    </div>
  )
}
