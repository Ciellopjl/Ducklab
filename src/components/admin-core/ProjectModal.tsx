'use client'

import { useState, useEffect } from 'react'
import { z } from 'zod'
import ImageGalleryPicker from './ImageGalleryPicker'

const projectSchema = z.object({
  titulo: z.string().min(1, 'O título é obrigatório'),
  descricao: z.string().min(1, 'A descrição é obrigatória'),
  imagem: z.string().min(1, 'Selecione uma imagem ou vídeo'),
  categoria: z.string().min(1, 'A categoria é obrigatória'),
  link: z.string().url('Deve ser uma URL válida').optional().or(z.literal('')),
  data: z.string().optional().or(z.literal('')),
  ordem: z.number().int(),
  destaque: z.boolean(),
})

type ProjectData = z.infer<typeof projectSchema>

interface Props {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  projectToEdit?: {
    id: string
    titulo: string
    descricao: string
    imagem: string
    categoria: string
    link?: string | null
    data?: string | null
    ordem: number
    destaque: boolean
  } | null
}

export default function ProjectModal({ isOpen, onClose, onSave, projectToEdit }: Props) {
  const [formData, setFormData] = useState<ProjectData>({
    titulo: '',
    descricao: '',
    imagem: '',
    categoria: '',
    link: '',
    data: '',
    ordem: 0,
    destaque: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [galeriaOpen, setGaleriaOpen] = useState(false)

  const isVideoUrl = (url: string) => {
    if (!url) return false
    if (url.includes('/video/upload/')) return true
    return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url)
  }

  const getCookie = (name: string): string => {
    if (typeof document === 'undefined') return ''
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(';').shift() || ''
    return ''
  }

  useEffect(() => {
    if (projectToEdit) {
      setFormData({
        titulo: projectToEdit.titulo,
        descricao: projectToEdit.descricao,
        imagem: projectToEdit.imagem,
        categoria: projectToEdit.categoria,
        link: projectToEdit.link || '',
        data: projectToEdit.data || '',
        ordem: projectToEdit.ordem,
        destaque: projectToEdit.destaque,
      })
    } else {
      setFormData({
        titulo: '',
        descricao: '',
        imagem: '',
        categoria: '',
        link: '',
        data: '',
        ordem: 0,
        destaque: false,
      })
    }
    setError('')
  }, [projectToEdit, isOpen])

  if (!isOpen) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }))
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate client side
      const validData = projectSchema.parse(formData)

      const url = '/api/admin/projects'
      const method = projectToEdit ? 'PUT' : 'POST'
      const body = projectToEdit ? { ...validData, id: projectToEdit.id } : validData

      const res = await fetch(url, {
        method,
        credentials: 'same-origin',
        headers: { 
          'Content-Type': 'application/json',
          'x-csrf-token': getCookie('csrf_token')
        },
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Erro interno')
      }

      onSave()
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Erro desconhecido')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
      <div className="bg-[#0a0a0a] border border-[#00ff41]/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_0_20px_rgba(0,255,65,0.1)] relative">
        
        <div className="sticky top-0 bg-[#0a0a0a] border-b border-[#00ff41]/30 p-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-white tracking-widest uppercase">
            {projectToEdit ? 'EDITAR PROJETO' : 'NOVO PROJETO'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-[#00ff41] transition-colors"
          >
            [ X ]
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 text-sm">
              ERROR: {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-[#00ff41]/70 mb-1">Título *</label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  className="w-full bg-black border border-[#00ff41]/30 p-2 text-white focus:border-[#00ff41] outline-none placeholder:text-gray-700"
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-[#00ff41]/70 mb-1">Categoria *</label>
                <input
                  type="text"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  className="w-full bg-black border border-[#00ff41]/30 p-2 text-white focus:border-[#00ff41] outline-none placeholder:text-gray-700"
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-[#00ff41]/70 mb-1">Data</label>
                <input
                  type="text"
                  name="data"
                  value={formData.data}
                  onChange={handleChange}
                  placeholder="Ex: 15/01/2025"
                  className="w-full bg-black border border-[#00ff41]/30 p-2 text-white focus:border-[#00ff41] outline-none placeholder:text-gray-700"
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-[#00ff41]/70 mb-1">Link URL</label>
                <input
                  type="text"
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  className="w-full bg-black border border-[#00ff41]/30 p-2 text-white focus:border-[#00ff41] outline-none placeholder:text-gray-700"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs uppercase text-[#00ff41]/70 mb-1">Ordem</label>
                  <input
                    type="number"
                    name="ordem"
                    value={formData.ordem}
                    onChange={handleChange}
                    className="w-full bg-black border border-[#00ff41]/30 p-2 text-white focus:border-[#00ff41] outline-none"
                  />
                </div>
                <div className="flex-1 flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      name="destaque"
                      checked={formData.destaque}
                      onChange={handleChange}
                      className="accent-[#00ff41] w-4 h-4 cursor-pointer"
                    />
                    Destaque
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-[#00ff41]/70 mb-1">Imagem / Vídeo *</label>
                <button
                  type="button"
                  onClick={() => setGaleriaOpen(true)}
                  className={`
                    w-full border-2 border-dashed rounded-sm p-3 text-center transition-all duration-300 cursor-pointer
                    ${formData.imagem 
                      ? 'border-[#00ff41]/50 hover:border-[#00ff41]' 
                      : 'border-[#00ff41]/30 hover:border-[#00ff41]/60 hover:bg-[#00ff41]/5'
                    }
                  `}
                >
                  {formData.imagem ? (
                    <span className="text-[#00ff41] text-xs uppercase tracking-wider">✎ Alterar Mídia</span>
                  ) : (
                    <div className="space-y-1">
                      <div className="text-2xl text-[#00ff41]/40">+</div>
                      <p className="text-xs text-gray-500">Abrir Galeria</p>
                    </div>
                  )}
                </button>
              </div>
              
              {formData.imagem && (
                <div className="w-full h-40 bg-black border border-[#00ff41]/30 p-1 flex items-center justify-center overflow-hidden relative group">
                  {isVideoUrl(formData.imagem) ? (
                    <video 
                      src={formData.imagem} 
                      className="max-w-full max-h-full object-contain"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <img 
                      src={formData.imagem} 
                      alt="Preview" 
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '';
                        (e.target as HTMLImageElement).alt = 'Erro ao carregar mídia';
                      }}
                    />
                  )}
                  <div 
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    onClick={() => setGaleriaOpen(true)}
                  >
                    <span className="text-[#00ff41] text-xs uppercase tracking-widest">Trocar Mídia</span>
                  </div>
                </div>
              )}

              <ImageGalleryPicker
                isOpen={galeriaOpen}
                onClose={() => setGaleriaOpen(false)}
                onSelect={(url) => setFormData(prev => ({ ...prev, imagem: url }))}
                currentImage={formData.imagem}
              />

              <div>
                <label className="block text-xs uppercase text-[#00ff41]/70 mb-1">Descrição *</label>
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-black border border-[#00ff41]/30 p-2 text-white focus:border-[#00ff41] outline-none placeholder:text-gray-700 resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-[#00ff41]/30">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 transition-colors uppercase tracking-widest text-sm disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#00ff41]/10 border border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41] hover:text-black transition-colors font-bold uppercase tracking-widest text-sm disabled:opacity-50"
            >
              {loading ? 'SALVANDO...' : 'SALVAR PROJETO'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
