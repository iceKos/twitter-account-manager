import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import { createPinia,setActivePinia } from 'pinia'

import i18n from '@/plugins/i18n'
import 'virtual:windi.css'
import { DatePicker } from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
const app = createApp(App)


const pinia = createPinia();


app.use(i18n)
app.use(router)
app.use(DatePicker);
app.use(pinia)
app.mount('#app')




