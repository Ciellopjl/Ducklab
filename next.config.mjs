/** @type {import('next').NextConfig} */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const nextConfig = {
  // ============================================================================
  // NEXT.JS CONFIG — SEGURANÇA DE PRODUÇÃO
  // ============================================================================
  
  // Desabilitar header "x-powered-by" para não revelar a tecnologia
  poweredByHeader: false,


  async rewrites() {
    const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || '/hacker-duck';
    return [
      {
        source: `${adminPath}`,
        destination: '/admin-core',
      },
      {
        source: `${adminPath}/:path*`,
        destination: '/admin-core/:path*',
      },
    ];
  },

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
          // Força HTTPS por 2 anos com subdomains (OWASP recomenda mínimo 1 ano, ideal 2)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // DNS Prefetch Control
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          // Content Security Policy (CSP)
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "connect-src 'self' blob: wss: https://*.neon.tech https://www.google.com https://raw.githack.com https://*.githubusercontent.com https://cdn.jsdelivr.net https://api.groq.com",
              "worker-src 'self' blob:",
              "img-src 'self' data: blob: https:",
              "media-src 'self' blob: https:",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "frame-src 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
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
