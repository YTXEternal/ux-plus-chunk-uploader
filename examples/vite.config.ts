import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { AntDesignResolver } from './build/resolvers/antd';
import AutoImport from 'unplugin-auto-import/vite';
import UnoCSS from 'unocss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    AutoImport({
      imports: ['react'],
      dts: true,
      resolvers: [
        AntDesignResolver({
          resolveIcons: true,
        }),
      ],
    }),
    UnoCSS({
      'configFile':'./unocss.config.ts'
    })
  ],
  server:{
    proxy:{
        '/api':{
            target:'http://localhost:3000',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
        }
    }
}  
})
