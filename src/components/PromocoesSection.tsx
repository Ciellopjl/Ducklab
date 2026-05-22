'use client'

import { motion } from 'framer-motion'
import { Promocao } from '@/data/types'

interface PromocoesProps {
  promocoes: Promocao[]
}

export default function PromocoesSection({ promocoes }: PromocoesProps) {
  if (!promocoes || promocoes.length === 0) return null

  return (
    <section id="promocoes" className="section-padding bg-marca-fundo relative overflow-hidden">
      {/* Background */}
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-600/5 rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-orange-500 text-sm font-semibold uppercase tracking-widest">
            Ofertas saborosas
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold mt-3">
            Nossas <span className="text-gradient">Promoções</span>
          </h2>
        </motion.div>

        {/* Grid de promoções */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {promocoes.map((promo, index) => (
            <motion.div
              key={promo.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${promo.cor} 
                         p-6 border ${promo.corBorda} card-hover cursor-pointer`}
            >
              {/* Padrão decorativo */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />

              <div className="relative z-10">
                {/* Tag */}
                <span
                  className="inline-block bg-white/20 text-white text-xs font-bold 
                             px-3 py-1 rounded-full mb-4 backdrop-blur-sm"
                >
                  {promo.tag}
                </span>

                {/* Ícone */}
                <div className="text-4xl mb-3">{promo.icone}</div>

                {/* Título */}
                <h3 className="text-xl font-display font-bold text-white mb-2">
                  {promo.titulo}
                </h3>

                {/* Descrição */}
                <p className="text-white/80 text-sm leading-relaxed">
                  {promo.descricao}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
