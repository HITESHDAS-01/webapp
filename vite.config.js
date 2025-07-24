import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'robots.txt'],
            // Use external manifest file
            useCredentials: true,
            // Workbox configuration for advanced caching
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,ttf,eot,otf}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
                            }
                        }
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'gstatic-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
                            }
                        }
                    },
                    {
                        urlPattern: /\/api\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'api-cache',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 60 * 60 * 24 // <== 24 hours
                            },
                            networkTimeoutSeconds: 10
                        }
                    }
                ],
                skipWaiting: true,
                clientsClaim: true
            },
            // PWA Manifest configuration (will be merged with public/manifest.json)
            manifest: {
                name: 'Easy Khata Web',
                short_name: 'Easy Khata',
                description: 'Easy Khata Web - Your Personal Finance Management PWA',
                theme_color: '#1976d2',
                background_color: '#ffffff',
                display: 'standalone',
                scope: '/',
                start_url: '/',
                icons: [
                    {
                        src: 'pwa-64x64.png',
                        sizes: '64x64',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    },
                    {
                        src: 'maskable-icon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable'
                    },
                    {
                        src: 'apple-touch-icon.png',
                        sizes: '180x180',
                        type: 'image/png'
                    }
                ]
            },
            // Development options
            devOptions: {
                enabled: true,
                type: 'module'
            }
        })
    ],
    build: {
        // Optimize for static hosting
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
        minify: 'esbuild',
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom']
                }
            }
        }
    },
    base: './',
    server: {
        port: 3000,
        open: true
    },
    preview: {
        port: 4173
    }
});
