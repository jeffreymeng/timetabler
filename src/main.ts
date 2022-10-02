import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import "./assets/base.css";
import  VueGoogleMaps from '@fawmi/vue-google-maps'


const app = createApp(App);

app.use(createPinia());

app.use(VueGoogleMaps, {
    load: {
        key: 'AIzaSyDbDbQCr2WO9glUq_LCf9J_fSiqKGKR5JY',
    },
})

app.mount("#app");
