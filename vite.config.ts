import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        host: true
    },
    build: {
        // Raise warning threshold slightly (we know three.js is large)
        chunkSizeWarningLimit: 800,
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    // Three.js core — largest single dependency ~600KB
                    if (id.includes('node_modules/three/')) {
                        return 'vendor-three';
                    }
                    // React Three Fiber + Drei utilities
                    if (
                        id.includes('node_modules/@react-three/fiber') ||
                        id.includes('node_modules/@react-three/drei')
                    ) {
                        return 'vendor-r3f';
                    }
                    // Physics engine
                    if (
                        id.includes('node_modules/@react-three/cannon') ||
                        id.includes('node_modules/cannon-es')
                    ) {
                        return 'vendor-physics';
                    }
                    // React base
                    if (
                        id.includes('node_modules/react/') ||
                        id.includes('node_modules/react-dom/')
                    ) {
                        return 'vendor-react';
                    }
                    // Zustand and other small libs stay in main chunk
                },
            },
        },
    },
})
