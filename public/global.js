const request = require("request");
const fs = require("fs");
const http = require("http");
const { execSync, exec } = require("child_process");
const SQL = require("sql.js");
const path = require("path");
const Vue = require("vue/dist/vue.js");
const VueI18n = require("vue-i18n");
const Vuex = require("vuex");

const APP_ROOT = path.join(__dirname, "..");
const system = (cmd) => execSync(cmd, { cwd: APP_ROOT });
const getPath = (relative) => path.join(APP_ROOT, relative);
