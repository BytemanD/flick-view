/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import '@fortawesome/fontawesome-free/css/all.css'

// Composables
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import { fa } from 'vuetify/iconsets/fa'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'light',
    // defaultTheme: 'dark',
  },
  icons: {
    defaultSet: 'mdi',
    global: {
      density: 'compact' // 可选值: 'default', 'comfortable', 'compact'
    },
    aliases: {
      ...aliases,
      python: 'fa:fab fa-python',
      docker: 'fa:fab fa-docker',
      server: 'fa:fas fa-server',
    },
    sets: {
      mdi,
      fa,
    },
  },
})
