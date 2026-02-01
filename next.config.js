/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimizaciones para producción
  swcMinify: true,
  
  // Configuración de imágenes
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Optimizaciones para memoria limitada
    minimumCacheTTL: 60,
  },

  // Configuración de build
  productionBrowserSourceMaps: false,
  
  // Configuración de seguridad
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },

  // Configuración de redirecciones
  redirects: async () => {
    return [
      {
        source: '/dashboard',
        destination: '/',
        permanent: false,
      },
    ]
  },

  // Configuración de rewrites para proxies
  rewrites: async () => {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [],
    }
  },

  // Optimizaciones para Railway
  experimental: {
    // Permite que Next.js se construya correctamente en Railway
  },
}

module.exports = nextConfig
