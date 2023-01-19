import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import { createPinia, setActivePinia } from 'pinia'

import i18n from '@/plugins/i18n'
import 'virtual:windi.css'
import { DatePicker } from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
const app = createApp(App)


const pinia = createPinia();

function randomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


app.use(i18n)
app.use(router)
app.use(DatePicker);
app.use(pinia)
app.use(function (app) {
    app.config.globalProperties.$randomNumber = randomNumber
})

app.mount('#app')




