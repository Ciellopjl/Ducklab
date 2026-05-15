/** @type {import('next').NextConfig} */
const nextConfig = {
  // ============================================================================
  // NEXT.JS CONFIG — SEGURANÇA DE PRODUÇÃO
  // ============================================================================
  
  // Desabilitar header "x-powered-by" para não revelar a tecnologia
  poweredByHeader: false,

  async redirects() {
    return [
      { source: '/oxente',           destination: '/suculentos', permanent: true },
      { source: '/oxente/:path*',    destination: '/suculentos/:path*', permanent: true },
      { source: '/meburger',         destination: '/suculentos', permanent: true },
      { source: '/meburger/:path*',  destination: '/suculentos/:path*', permanent: true },
      { source: '/churrasburger',    destination: '/suculentos', permanent: true },
      { source: '/churrasburger/:path*', destination: '/suculentos/:path*', permanent: true },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Proteção contra clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Previne MIME-type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Controle de referrer
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Bloqueia câmera, microfone e geolocalização
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // Proteção XSS do navegador
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Força HTTPS por 1 ano com subdomains
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // DNS Prefetch Control
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      // Headers específicos para APIs — sem cache de dados sensíveis
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, private',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
        ],
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  // Em produção, otimização de bundle
  ...(process.env.NODE_ENV === 'production' ? {
    compiler: {
      removeConsole: {
        exclude: ['error', 'warn'],
      },
    },
  } : {}),
}

export default nextConfig
