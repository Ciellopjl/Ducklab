'use client'

import Link from 'next/link'
import { MapPin, Phone, Clock, Instagram, MessageCircle } from 'lucide-react'
import { useTenant } from './TenantProvider'
import { formatarTelefone } from '@/lib/utils'

export default function FooterSection() {
  const empresa = useTenant()
  return (
    <footer id="contato" className="bg-black border-t border-white/10">
      {/* Conteúdo principal */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Logo e descrição */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/logo-duck.png"
                alt={empresa.nome}
                className="h-12 w-12 rounded-full object-cover border-2 border-[#FF4D00]"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
              <div>
                <h3 className="text-lg font-display font-bold italic">{empresa.nome || 'Ducklab'}</h3>
                <p className="text-[10px] text-[#FF4D00] font-black uppercase tracking-[0.2em] -mt-1">Agência Criativa</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Hambúrgueres artesanais com ingredientes selecionados e sabor único.
              Tradição e sabor em cada mordida — entregue quentinho na sua porta. 👑
            </p>
          </div>

          {/* Links rápidos */}
          <div>
            <h4 className="text-white font-display font-semibold mb-4 text-sm uppercase tracking-wider">
              Navegação
            </h4>
            <ul className="space-y-3">
              {[
                { href: `/${empresa.slug}`, label: 'Início' },
                { href: `/${empresa.slug}/#contato`, label: 'Contato' },
                { href: `/${empresa.slug}/checkout`, label: 'Finalizar Pedido' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-[#FF4D00] text-sm transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Informações */}
          <div>
            <h4 className="text-white font-display font-semibold mb-4 text-sm uppercase tracking-wider">
              Informações
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#FF4D00] mt-0.5 flex-shrink-0" />
                <span className="text-gray-400 text-sm">
                  {empresa.endereco || 'Av. Principal, 1000 - Cidade Jardim'}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#FF4D00] mt-0.5 flex-shrink-0" />
                <span className="text-gray-400 text-sm">
                  Seg a Dom: {empresa.horarioAbertura || '18:00'} às {empresa.horarioFechamento || '00:00'}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#FF4D00] mt-0.5 flex-shrink-0" />
                <span className="text-gray-400 text-sm">
                  {empresa.whatsapp ? formatarTelefone(empresa.whatsapp) : '(16) 99636-0597'}
                </span>
              </li>
            </ul>
          </div>

          {/* Redes sociais */}
          <div>
            <h4 className="text-white font-display font-semibold mb-4 text-sm uppercase tracking-wider">
              Redes Sociais
            </h4>
            <div className="flex gap-2">
              <a
                href="https://www.instagram.com/m.e_burger__delivery01/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-white/5 hover:bg-[#FF4D00]/20 border border-white/10 
                           hover:border-[#FF4D00]/50 transition-all duration-300 group"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-gray-400 group-hover:text-[#FF4D00] transition-colors" />
              </a>
              <a
                href={`https://wa.me/55${empresa.whatsapp?.replace(/\D/g, '') || '16996360597'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-white/5 hover:bg-green-600/20 border border-white/10 
                           hover:border-green-500/50 transition-all duration-300 group"
                aria-label="WhatsApp"
              >
                <svg className="w-5 h-5 text-gray-400 group-hover:text-green-400 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/5 py-6 pb-28 md:pb-6">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} {empresa.nome || 'Ducklab'}. Todos os direitos reservados.
          </p>
          <a 
            href="https://ciello-dev.vercel.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors duration-300 group"
          >
            <span className="text-xs">Desenvolvido por</span>
            <span className="text-xs font-semibold tracking-wide">ciello dev 👨‍💻</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
