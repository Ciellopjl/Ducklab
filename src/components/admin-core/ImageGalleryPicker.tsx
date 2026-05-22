'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface GaleriaItem {
  id: string
  nome: string
  url: string
  criadoEm: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onSelect: (url: string) => void
  currentImage?: string
}

export default function ImageGalleryPicker({ isOpen, onClose, onSelect, currentImage }: Props) {
  const [imagens, setImagens] = useState<GaleriaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [error, setError] = useState('')
  const [selectedUrl, setSelectedUrl] = useState(currentImage || '')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isVideoUrl = (url: string) => {
    // Cloudinary video URLs contain "/video/upload/" in the path
    if (url.includes('/video/upload/')) return true
    // Fallback: check file extension
    return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url)
  }

  const getCookie = (name: string): string => {
    if (typeof document === 'undefined') return ''
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(';').shift() || ''
    return ''
  }

  const fetchGaleria = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/galeria', {
        headers: { 'x-admin-verified': 'true' }
      })
      if (res.ok) {
        const data = await res.json()
        setImagens(data)
      }
    } catch {
      setError('Erro ao carregar galeria')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchGaleria()
      setSelectedUrl(currentImage || '')
      setError('')
    }
  }, [isOpen, currentImage, fetchGaleria])

  if (!isOpen) return null

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploading(true)
    setError('')
    
    const totalFiles = files.length
    let uploaded = 0

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setUploadProgress(`Enviando ${i + 1} de ${totalFiles}: ${file.name}`)

      const formData = new FormData()
      formData.append('file', file)

      try {
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 
            'x-admin-verified': 'true',
            'x-csrf-token': getCookie('csrf_token')
          },
          body: formData,
        })

        if (!res.ok) {
          const errData = await res.json()
          throw new Error(errData.error || 'Erro no upload')
        }

        const newImage = await res.json()
        setImagens(prev => [newImage, ...prev])
        uploaded++

        // Auto selecionar se for upload único
        if (totalFiles === 1) {
          setSelectedUrl(newImage.url)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao enviar imagem')
      }
    }

    setUploadProgress('')
    setUploading(false)

    if (uploaded > 0 && totalFiles > 1) {
      setUploadProgress(`${uploaded} de ${totalFiles} imagens enviadas com sucesso`)
      setTimeout(() => setUploadProgress(''), 3000)
    }
  }

  const handleDelete = async (id: string, url: string) => {
    if (!confirm('Tem certeza que deseja excluir esta imagem?')) return

    try {
      const res = await fetch(`/api/admin/galeria?id=${id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: { 
          'x-admin-verified': 'true',
          'x-csrf-token': getCookie('csrf_token')
        },
      })

      if (res.ok) {
        setImagens(prev => prev.filter(img => img.id !== id))
        if (selectedUrl === url) {
          setSelectedUrl('')
        }
      }
    } catch {
      setError('Erro ao excluir imagem')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleUpload(e.dataTransfer.files)
  }

  const handleConfirm = () => {
    if (selectedUrl) {
      onSelect(selectedUrl)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 font-mono">
      <div className="bg-[#0a0a0a] border border-[#00ff41]/30 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[0_0_30px_rgba(0,255,65,0.15)] relative">
        
        {/* Header */}
        <div className="border-b border-[#00ff41]/30 p-4 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-white tracking-widest uppercase flex items-center gap-3">
            <span className="text-[#00ff41]">{'>'}</span>
            GALERIA DE MÍDIA
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-[#00ff41] transition-colors"
          >
            [ X ]
          </button>
        </div>

        {/* Upload Area */}
        <div className="p-4 border-b border-[#00ff41]/20 shrink-0">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-sm p-6 text-center cursor-pointer transition-all duration-300
              ${dragOver 
                ? 'border-[#00ff41] bg-[#00ff41]/10 shadow-[0_0_20px_rgba(0,255,65,0.2)]' 
                : 'border-[#00ff41]/30 hover:border-[#00ff41]/60 hover:bg-[#00ff41]/5'
              }
              ${uploading ? 'pointer-events-none opacity-60' : ''}
            `}
          >
            {uploading ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#00ff41] border-t-transparent rounded-full animate-spin" />
                  <span className="text-[#00ff41] text-sm">{uploadProgress}</span>
                </div>
                <div className="w-48 h-1 bg-[#00ff41]/20 mx-auto rounded-full overflow-hidden">
                  <div className="h-full bg-[#00ff41] rounded-full animate-pulse" style={{ width: '60%' }} />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-3xl text-[#00ff41]/50">⬆</div>
                <p className="text-sm text-gray-400">
                  <span className="text-[#00ff41]">Clique aqui</span> ou arraste arquivos para fazer upload
                </p>
                <p className="text-xs text-gray-600">
                  Imagens: JPG, PNG, WebP, GIF, SVG • Máx. 10MB<br/>
                  Vídeos: MP4, WebM, OGG • Máx. 100MB
                </p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,video/mp4,video/webm,video/ogg"
            multiple
            onChange={(e) => handleUpload(e.target.files)}
            className="hidden"
          />
        </div>

        {/* Error / Status */}
        {error && (
          <div className="mx-4 mt-3 bg-red-500/10 border border-red-500 text-red-500 p-2 text-xs shrink-0">
            ERROR: {error}
          </div>
        )}
        {uploadProgress && !uploading && (
          <div className="mx-4 mt-3 bg-[#00ff41]/10 border border-[#00ff41]/30 text-[#00ff41] p-2 text-xs shrink-0">
            ✓ {uploadProgress}
          </div>
        )}

        {/* Gallery Grid */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-6 h-6 border-2 border-[#00ff41] border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 text-gray-400 text-sm">Carregando galeria...</span>
            </div>
          ) : imagens.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-600">
              <p className="text-lg mb-1">Nenhuma mídia na galeria</p>
              <p className="text-xs">Faça upload de imagens ou vídeos usando a área acima</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {imagens.map((img) => (
                <div
                  key={img.id}
                  className={`
                    group relative aspect-square bg-black border-2 rounded-sm cursor-pointer 
                    transition-all duration-200 overflow-hidden
                    ${selectedUrl === img.url 
                      ? 'border-[#00ff41] shadow-[0_0_15px_rgba(0,255,65,0.3)] scale-[1.02]' 
                      : 'border-[#00ff41]/20 hover:border-[#00ff41]/50'
                    }
                  `}
                  onClick={() => setSelectedUrl(img.url)}
                >
                  {isVideoUrl(img.url) ? (
                    <video
                      src={img.url}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <img
                      src={img.url}
                      alt={img.nome}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                  
                  {/* Selected overlay */}
                  {selectedUrl === img.url && (
                    <div className="absolute inset-0 bg-[#00ff41]/10 flex items-center justify-center">
                      <div className="w-8 h-8 bg-[#00ff41] rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(0,255,65,0.5)]">
                        <span className="text-black font-bold text-lg">✓</span>
                      </div>
                    </div>
                  )}

                  {/* Hover overlay with delete */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1">
                    <div className="w-full flex justify-between items-center">
                      <span className="text-[10px] text-gray-300 truncate max-w-[80%]">{img.nome}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(img.id, img.url) }}
                        className="text-red-500 hover:text-red-400 text-xs font-bold p-1 leading-none"
                        title="Excluir mídia"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#00ff41]/30 p-4 flex justify-between items-center shrink-0">
          <div className="text-xs text-gray-500">
            {imagens.length} {imagens.length === 1 ? 'arquivo' : 'arquivos'} na galeria
            {selectedUrl && <span className="text-[#00ff41] ml-2">• 1 selecionado</span>}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 transition-colors uppercase tracking-widest text-xs"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedUrl}
              className="px-5 py-2 bg-[#00ff41]/10 border border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41] hover:text-black transition-colors font-bold uppercase tracking-widest text-xs disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#00ff41]"
            >
              Usar Mídia
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
