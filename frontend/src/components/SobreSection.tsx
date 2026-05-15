'use client'

import { motion } from 'framer-motion'
import { Utensils, Award, Heart } from 'lucide-react'

export default function SobreSection() {
  const diferenciais = [
    {
      icone: <Utensils className="w-6 h-6" />,
      titulo: 'Hambúrguer Artesanal',
      descricao:
        'Blend especial de carnes nobres moídas diariamente para garantir o máximo de suculência e sabor.',
    },
    {
      icone: <Award className="w-6 h-6" />,
      titulo: 'Ingredientes Premium',
      descricao:
        'Queijos selecionados, bacon crocante e vegetais fresquinhos colhidos para compor o burger perfeito.',
    },
    {
      icone: <Heart className="w-6 h-6" />,
      titulo: 'Feito com Paixão',
      descricao:
        'Mais do que uma hamburgueria, somos apaixonados por criar momentos memoráveis através do sabor.',
    },
  ]

  
    
  
}
