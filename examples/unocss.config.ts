import {defineConfig} from 'unocss/vite'
import transformerVariantGroup from '@unocss/transformer-variant-group';
import presetUno from '@unocss/preset-uno';
import presetAttributify from '@unocss/preset-attributify';
import presetWebFonts from '@unocss/preset-web-fonts';
import transformerDirectives from '@unocss/transformer-directives';
export default defineConfig({
    transformers: [transformerVariantGroup(),transformerDirectives({})],
    presets:[presetUno(),presetAttributify(),presetWebFonts()]
})