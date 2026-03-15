import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginVitest from '@vitest/eslint-plugin'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

const autoImportConfig = require('.eslintrc-auto-import.json')

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),
  {
    languageOptions: {
      globals: { ...autoImportConfig.globals },
    },
  },

  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
  },
  skipFormatting,
  {
    rules: {
      'vue/multi-word-component-names': [
        'error', // Disable rule for multi-word component names
        {
          ignores: ['App', 'About', 'Home', 'Login', 'Index'], // Add common single-word component names to ignore
        },
      ], // Disable rule for multi-word component names
      'vue/no-v-html': 'off', // Disable rule for v-html usage
      'vue/no-unused-vars': 'warn', // Warn on unused variables in Vue files
      '@typescript-eslint/no-explicit-any': 'off', // Allow usage of 'any' type
    },
  },
)
