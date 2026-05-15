'use client'

import { useState, useEffect } from 'react'
import { 
  X, 
  Upload, 
  Trash2, 
  Check, 
  Loader2, 
  Image as ImageIcon,
  Search,
  Sparkles
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'

interface ImageFile {
  id: string
  name: string
  url: string
  atime: number
}

interface GalleryModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (url: string) => void
  processWithIA?: boolean
}

export default function GalleryModal({ isOpen, onClose, onSelect, processWithIA = false }: GalleryModalProps) {
  const [images, setImages] = useState<ImageFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null)

  const fetchImages = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/uploads')
      if (res.ok) {
        const data = await res.json()
        setImages(data)
      } else {
        const errorData = await res.json()
        toast.error(`Erro: ${errorData.detalhes || errorData.erro || 'Falha ao carregar galeria'}`)
      }
    } catch (error: any) {
      toast.error(`Erro de conexão: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchImages()
    }
  }, [isOpen])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande! Máximo 10MB.')
      return
    }

    setUploading(true)
    const processToast = processWithIA ? toast.loading('Processando imagem com IA...') : null
    
    const reader = new FileReader()
    reader.onloadend = async () => {
      try {
        let currentBase64 = reader.result as string

        // 1. Otimização Inicial
        const optimizedBlob = await new Promise<Blob>((resolve, reject) => {
          const img = new Image()
          img.onload = () => {
            const canvas = document.createElement('canvas')
            const MAX_WIDTH = 800
            const MAX_HEIGHT = 800
            let width = img.width
            let height = img.height
            if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } }
            else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }
            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')
            ctx?.drawImage(img, 0, 0, width, height)
            canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Canvas Error')), 'image/webp', 0.8)
          }
          img.src = currentBase64
        })

        currentBase64 = await new Promise<string>((resolve) => {
          const r = new FileReader()
          r.onloadend = () => resolve(r.result as string)
          r.readAsDataURL(optimizedBlob)
        })

        // 2. IA de Remoção de Fundo
        if (processWithIA) {
          try {
            const aiRes = await fetch('/api/admin/remove-bg', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ imageBase64: currentBase64 })
            })

            if (!aiRes.ok) {
              const aiError = await aiRes.json()
              throw new Error(aiError.erro || 'Falha na IA')
            }

            const aiData = await aiRes.json()
            currentBase64 = aiData.result
            if (processToast) toast.success('Fundo removido!', { id: processToast })
          } catch (e: any) {
            console.error('IA Error:', e)
            if (processToast) toast.error('Falha na IA, usando original', { id: processToast })
          }
        }

        const res = await fetch('/api/admin/uploads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: currentBase64 })
        })

        if (res.ok) {
          const data = await res.json()
          toast.success('Upload concluído!')
          fetchImages()
          setSelectedUrl(data.url)
        } else {
          const errorData = await res.json()
          toast.error(`Erro: ${errorData.detalhes || errorData.erro || 'Erro no upload'}`)
        }
      } catch (error: any) {
        toast.error(`Erro de conexão: ${error.message}`)
      } finally {
        setUploading(false)
        if (processToast) toast.dismiss(processToast)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Excluir esta imagem permanentemente?')) return

    try {
      const res = await fetch('/api/admin/uploads', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })

      if (res.ok) {
        toast.success('Imagem removida')
        fetchImages()
        if (selectedUrl?.includes(id)) setSelectedUrl(null)
      }
    } catch (error) {
      toast.error('Erro ao deletar')
    }
  }

  const filteredImages = images.filter(img => 
    img.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative bg-marca-pretoClaro border border-white/10 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div>
            <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
              <ImageIcon className="w-6 h-6 text-orange-500" />
              Galeria de Mídia
            </h2>
            <p className="text-gray-500 text-sm mt-1">Gerencie e selecione imagens para sua loja</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400 hover:text-white transition-all border border-white/5"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-6 border-b border-white/5 bg-white/[0.01] flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="text"
              placeholder="Buscar imagem pelo nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:border-orange-500/50 outline-none transition-all text-sm font-medium"
            />
          </div>
          
          <label className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold text-sm cursor-pointer transition-all shadow-lg shadow-orange-600/20 active:scale-95">
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : (processWithIA ? <Sparkles className="w-5 h-5" /> : <Upload className="w-5 h-5" />)}
            {processWithIA ? 'Upload com IA' : 'Fazer Upload'}
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
          </label>
        </div>

        {/* Grid Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4 text-gray-500">
              <div className="w-12 h-12 border-4 border-orange-600/20 border-t-orange-600 rounded-full animate-spin" />
              <p className="font-bold uppercase tracking-widest text-[10px]">Carregando arquivos...</p>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-white/5 rounded-[2rem]">
              <div className="p-4 bg-white/5 rounded-full text-gray-600">
                <ImageIcon className="w-12 h-12 text-orange-500" />
              </div>
              <div className="text-center">
                <p className="text-white font-bold">Nenhuma imagem encontrada</p>
                <p className="text-gray-500 text-sm">Faça o primeiro upload para começar</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {filteredImages.map((img) => (
                <motion.div
                  key={img.url}
                  layout
                  onClick={() => setSelectedUrl(img.url)}
                  className={`group relative aspect-square rounded-[1.5rem] overflow-hidden cursor-pointer border-2 transition-all ${
                    selectedUrl === img.url 
                      ? 'border-orange-600 ring-4 ring-orange-600/20' 
                      : 'border-white/5 hover:border-white/20'
                  }`}
                >
                  <img 
                    src={img.url} 
                    alt={img.name} 
                    className={`w-full h-full object-cover transition-transform duration-500 ${
                      selectedUrl === img.url ? 'scale-110' : 'group-hover:scale-110'
                    }`} 
                  />
                  
                  {/* Overlay Gradiente */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Ícone Selecionado */}
                  {selectedUrl === img.url && (
                    <div className="absolute top-3 right-3 p-1.5 bg-orange-600 rounded-lg text-white shadow-xl">
                      <Check className="w-4 h-4" />
                    </div>
                  )}

                  {/* Nome e Ações */}
                  <div className="absolute inset-x-0 bottom-0 p-3 flex items-center justify-between translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all">
                    <span className="text-[10px] text-white font-medium truncate max-w-[70%] bg-black/40 backdrop-blur-md px-2 py-1 rounded-md">
                      {img.name.slice(0, 10)}...
                    </span>
                    <button
                      onClick={(e) => handleDelete(img.id, e)}
                      className="p-2 bg-orange-600/90 hover:bg-orange-600 text-white rounded-xl shadow-lg transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
            {images.length} arquivos • Máx 10MB por arquivo
          </p>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-3 border border-white/10 rounded-2xl text-gray-400 font-bold hover:text-white hover:bg-white/5 transition-all"
            >
              Cancelar
            </button>
            <button 
              disabled={!selectedUrl}
              onClick={() => selectedUrl && onSelect(selectedUrl)}
              className={`px-8 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 ${
                selectedUrl 
                  ? 'bg-orange-600 text-white shadow-xl shadow-orange-600/30 hover:bg-orange-700' 
                  : 'bg-white/5 text-gray-600 cursor-not-allowed'
              }`}
            >
              Confirmar Seleção
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
