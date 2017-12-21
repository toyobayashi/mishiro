import Vue from "vue";
import VueI18n from "vue-i18n";
import Vuex from "vuex";
import app from "./template/app.vue";
import zh from "./i18n/zh-CN.js";
import ja from "./i18n/ja-JP.js";
import vueGlobal from "./js/globalProperty.js";
import s from "./js/store.js";
import configurer from "./js/config.js";
let config = configurer.getConfig();
Vue.use(Vuex);
Vue.use(VueI18n);
Vue.use(vueGlobal);

const store = new Vuex.Store(s);

const i18n = new VueI18n({
    locale: config.language ? config.language : "zh",
    messages: {
        zh,
        ja
    }
});

new Vue({
    el: "#app",
    i18n,
    store,
    render: h => h(app)
});
