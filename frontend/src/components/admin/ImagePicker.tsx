'use client'

import { useState } from 'react'
import { ImageIcon, Edit2, Trash2, CheckCircle2, Sparkles, Loader2 } from 'lucide-react'
import GalleryModal from './GalleryModal'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'

interface ImagePickerProps {
  value: string
  onChange: (url: string) => void
  label?: string
  description?: string
  className?: string
  processWithIA?: boolean
}

export default function ImagePicker({ value, onChange, label, description, className, processWithIA = false }: ImagePickerProps) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSelect = (url: string) => {
    onChange(url)
    setIsGalleryOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
  }

  const handleRemoveBg = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!value) return

    setIsProcessing(true)
    const t = toast.loading('Removendo fundo...')

    try {
      const res = await fetch('/api/admin/remove-bg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: value })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.erro || 'Falha na IA')
      }

      const data = await res.json()
      onChange(data.result)
      toast.success('Fundo removido!', { id: t })
    } catch (err: any) {
      toast.error(err.message || 'Erro ao remover fundo', { id: t })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">
          {label}
        </label>
      )}
      
      <div 
        onClick={() => setIsGalleryOpen(true)}
        className={`group relative w-full aspect-square md:aspect-video rounded-[2rem] overflow-hidden border-2 border-dashed transition-all cursor-pointer ${
          value 
            ? 'border-white/10 bg-white/5 ring-4 ring-white/5' 
            : 'border-white/10 bg-white/[0.02] hover:bg-white/5 hover:border-orange-500/50'
        }`}
      >
        {value ? (
          <div className="relative w-full h-full">
            <img 
              src={value} 
              alt="Preview" 
              className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" 
            />
            
            {/* Toolbar Mobile/Desktop */}
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center gap-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
              {processWithIA && (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleRemoveBg}
                  className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg active:scale-95 transition-all disabled:opacity-50"
                  title="Remover Fundo (IA Pro)"
                >
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                </button>
              )}
              <div className="p-3 bg-white/10 rounded-2xl text-white backdrop-blur-md">
                <Edit2 className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={handleClear}
                className="p-3 bg-orange-600 rounded-2xl text-white shadow-lg active:scale-95 transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            
            {/* Badge Selecionado */}
            <div className="absolute top-4 right-4 p-2 bg-green-500 rounded-xl text-white shadow-xl shadow-green-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="p-5 bg-white/5 rounded-[1.5rem] group-hover:bg-white/10 group-hover:text-orange-500 transition-all transform group-hover:-translate-y-1 duration-300 relative">
              <ImageIcon className="w-8 h-8 text-gray-600" />
              {processWithIA && (
                <div className="absolute -top-2 -right-2 bg-orange-600 text-[8px] font-black px-1.5 py-0.5 rounded-full text-white shadow-lg animate-pulse border border-orange-400/50 uppercase tracking-tighter">
                  IA Pro
                </div>
              )}
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-sm">Selecionar Imagem</p>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                {processWithIA ? 'Remoção de Fundo Ativada' : 'Acesse sua Galeria'}
              </p>
            </div>
          </div>
        )}
      </div>

      {description && (
        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest leading-relaxed">
          {description}
        </p>
      )}

      <AnimatePresence>
        {isGalleryOpen && (
          <GalleryModal
            isOpen={isGalleryOpen}
            onClose={() => setIsGalleryOpen(false)}
            onSelect={handleSelect}
            processWithIA={processWithIA}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
