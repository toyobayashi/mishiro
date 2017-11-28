import app from "./template/app.vue";
import zh from "./i18n/zh-CN.js";
import ja from "./i18n/ja-JP.js";
import g from "./js/globalProperty.js";
import s from "./js/store.js";

// import "./css/theme.css";
Vue.use(Vuex);
Vue.use(VueI18n);
Vue.use(g);

SQL.Database.prototype._exec = function (sql){
    const resultArray = this.exec(sql);
    let r = [];
    for(let i = 0; i < resultArray.length; i++){
        const result = resultArray[i];
        let newResult = [];
        const columns = result.columns.length;
        const rows = result.values.length;
        for(let j = 0; j < rows; j++){
            const row = result.values[j];
            let rowObj = {};
            for(let k = 0; k < columns; k++){
                rowObj[result.columns[k]] = row[k];
            }
            newResult.push(rowObj);
        }
        r.push(newResult);
    }
    if(r.length === 0){
        return null;
    }
    else if(r.length === 1){
        return r[0];
    }
    else{
        return r;
    }
};

const store = new Vuex.Store(s);

const i18n = new VueI18n({
    locale: "zh",
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
