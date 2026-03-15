import {createApp} from 'vue'
import {createPinia} from 'pinia'
import ElementPlus from 'element-plus'
import App from './App.vue'
import router from './router'

import '@/assets/styles/index.scss'
import 'element-plus/dist/index.css'
import '@/assets/styles/tailwind.css'

const app = createApp(App)
app.use(ElementPlus)
app.use(createPinia())
app.use(router)

app.mount('#app')
