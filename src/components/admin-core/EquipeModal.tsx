'use client'

import { useState, useEffect } from 'react'
import { z } from 'zod'
import ImageGalleryPicker from './ImageGalleryPicker'

interface Equipe {
  id?: string
  nome: string
  cargo: string
  descricao: string
  imagem: string
  github?: string | null
  linkedin?: string | null
  instagram?: string | null
  ordem: number
}

interface Props {
  isOpen: boolean
  onClose: () => void
  membroToEdit: Equipe | null
  onSave: () => void
}

const equipeSchema = z.object({
  nome: z.string().min(2, 'O nome é obrigatório'),
  cargo: z.string().min(2, 'O cargo é obrigatório'),
  descricao: z.string().min(5, 'A descrição é obrigatória'),
  imagem: z.string().min(1, 'A imagem é obrigatória'),
  github: z.string().optional().nullable(),
  linkedin: z.string().optional().nullable(),
  instagram: z.string().optional().nullable(),
  ordem: z.number().int(),
})

export default function EquipeModal({ isOpen, onClose, membroToEdit, onSave }: Props) {
  const [formData, setFormData] = useState<Equipe>({
    nome: '',
    cargo: '',
    descricao: '',
    imagem: '',
    github: '',
    linkedin: '',
    instagram: '',
    ordem: 0,
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [galeriaOpen, setGaleriaOpen] = useState(false)

  const getCookie = (name: string): string => {
    if (typeof document === 'undefined') return ''
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(';').shift() || ''
    return ''
  }

  useEffect(() => {
    if (membroToEdit) {
      setFormData({
        id: membroToEdit.id,
        nome: membroToEdit.nome,
        cargo: membroToEdit.cargo,
        descricao: membroToEdit.descricao,
        imagem: membroToEdit.imagem,
        github: membroToEdit.github || '',
        linkedin: membroToEdit.linkedin || '',
        instagram: membroToEdit.instagram || '',
        ordem: membroToEdit.ordem || 0,
      })
    } else {
      setFormData({
        nome: '',
        cargo: '',
        descricao: '',
        imagem: '',
        github: '',
        linkedin: '',
        instagram: '',
        ordem: 0,
      })
    }
    setError('')
  }, [membroToEdit, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const validData = equipeSchema.parse(formData)
      
      const url = membroToEdit ? '/api/admin/equipe' : '/api/admin/equipe'
      const method = membroToEdit ? 'PUT' : 'POST'
      
      const body = membroToEdit ? { ...validData, id: membroToEdit.id } : validData

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
        const data = await res.json()
        throw new Error(data.error || 'Erro ao salvar')
      }

      onSave()
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message)
      } else {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
        <div className="bg-[#111] border border-[#00ff41]/30 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[0_0_30px_rgba(0,255,65,0.1)] relative">
          
          {/* Header */}
          <div className="border-b border-[#00ff41]/30 p-6 flex justify-between items-center shrink-0">
            <div>
              <h2 className="text-xl font-bold text-white tracking-widest uppercase">
                {membroToEdit ? 'Editar Membro' : 'Novo Membro'}
              </h2>
              <p className="text-[#00ff41]/50 text-xs mt-1 uppercase tracking-widest">
                Gerenciamento de Equipe
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-[#00ff41] transition-colors"
            >
              [ X ]
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 text-xs uppercase tracking-widest">
                [ ERROR ]: {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-xs text-[#00ff41]/70 uppercase tracking-widest font-bold">Nome *</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={e => setFormData({...formData, nome: e.target.value})}
                  className="w-full bg-black border border-[#00ff41]/30 text-white p-3 text-sm focus:border-[#00ff41] focus:outline-none transition-colors"
                  placeholder="Nome do membro"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#00ff41]/70 uppercase tracking-widest font-bold">Cargo *</label>
                <input
                  type="text"
                  value={formData.cargo}
                  onChange={e => setFormData({...formData, cargo: e.target.value})}
                  className="w-full bg-black border border-[#00ff41]/30 text-white p-3 text-sm focus:border-[#00ff41] focus:outline-none transition-colors"
                  placeholder="Ex: Desenvolvedor Front-end"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-[#00ff41]/70 uppercase tracking-widest font-bold">Foto (Imagem) *</label>
              
              <div className="flex items-center gap-4">
                {formData.imagem && (
                  <div className="w-16 h-16 rounded-full bg-black border border-[#00ff41]/30 overflow-hidden shrink-0">
                    <img src={formData.imagem} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={() => setGaleriaOpen(true)}
                  className="flex-1 border-2 border-dashed border-[#00ff41]/30 hover:border-[#00ff41]/60 text-[#00ff41]/60 hover:text-[#00ff41] transition-all p-4 text-xs font-bold tracking-widest uppercase text-center"
                >
                  {formData.imagem ? 'Alterar Foto' : '+ Selecionar da Galeria'}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-[#00ff41]/70 uppercase tracking-widest font-bold">Biografia (Descrição) *</label>
              <textarea
                value={formData.descricao}
                onChange={e => setFormData({...formData, descricao: e.target.value})}
                className="w-full bg-black border border-[#00ff41]/30 text-white p-3 text-sm h-24 resize-none focus:border-[#00ff41] focus:outline-none transition-colors"
                placeholder="Breve resumo sobre o membro da equipe..."
              />
            </div>

            <div className="border-t border-[#00ff41]/20 pt-5 mt-5">
              <h3 className="text-xs font-bold text-white tracking-widest uppercase mb-4 flex items-center gap-2">
                <span className="text-[#00ff41]">{'>'}</span> Redes Sociais
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest">LinkedIn (Opcional)</label>
                  <input
                    type="url"
                    value={formData.linkedin || ''}
                    onChange={e => setFormData({...formData, linkedin: e.target.value})}
                    className="w-full bg-black border border-[#00ff41]/20 text-white p-2.5 text-xs focus:border-[#00ff41]/50 focus:outline-none transition-colors"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest">GitHub (Opcional)</label>
                  <input
                    type="url"
                    value={formData.github || ''}
                    onChange={e => setFormData({...formData, github: e.target.value})}
                    className="w-full bg-black border border-[#00ff41]/20 text-white p-2.5 text-xs focus:border-[#00ff41]/50 focus:outline-none transition-colors"
                    placeholder="https://github.com/..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest">Instagram (Opcional)</label>
                  <input
                    type="url"
                    value={formData.instagram || ''}
                    onChange={e => setFormData({...formData, instagram: e.target.value})}
                    className="w-full bg-black border border-[#00ff41]/20 text-white p-2.5 text-xs focus:border-[#00ff41]/50 focus:outline-none transition-colors"
                    placeholder="https://instagram.com/..."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-[#00ff41]/70 uppercase tracking-widest font-bold">Ordem de Exibição</label>
              <input
                type="number"
                value={formData.ordem}
                onChange={e => setFormData({...formData, ordem: parseInt(e.target.value) || 0})}
                className="w-full bg-black border border-[#00ff41]/30 text-white p-3 text-sm focus:border-[#00ff41] focus:outline-none transition-colors"
              />
            </div>
          </form>

          {/* Footer */}
          <div className="border-t border-[#00ff41]/30 p-6 flex justify-end gap-4 shrink-0 bg-[#0a0a0a]">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 transition-colors text-xs uppercase tracking-widest font-bold"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-3 bg-[#00ff41]/10 border border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41] hover:text-black transition-colors text-xs uppercase tracking-widest font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvando...' : 'Salvar Membro'}
            </button>
          </div>
        </div>
      </div>

      {galeriaOpen && (
        <ImageGalleryPicker 
          isOpen={galeriaOpen}
          onClose={() => setGaleriaOpen(false)}
          onSelect={(url) => setFormData(prev => ({ ...prev, imagem: url }))}
        />
      )}
    </>
  )
}
