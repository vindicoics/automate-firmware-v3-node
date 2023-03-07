import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './vuetify'

import './assets/main.css'

import axios from 'axios';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)

const app = createApp(App)


app.config.globalProperties.axios=axios
app.config.globalProperties.dayjs=dayjs

app.use(vuetify)
app.use(router)

app.mount('#app')
