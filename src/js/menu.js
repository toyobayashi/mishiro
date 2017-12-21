import { shell, remote } from "electron";
export default {
    data(){
        return {

        };
    },
    methods: {
        showOption(){
            this.playSe(this.enterSe);
            this.event.$emit("option");
        },
        showAbout(){
            this.playSe(this.enterSe);
            this.event.$emit("showAbout");
        },
        showLicense(){
            this.playSe(this.enterSe);
            this.event.$emit("license");
            this.event.$emit("alert", this.$t("menu.license"), `
<h3>The MIT License</h3><br/>

<p>Copyright (c) 2017 Toyobayashi <356608639@qq.com></p><br/>

<p>Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the
Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute,
and/or sublicense copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject
to the following conditions:</p><br/>

<p>The above copyright notice and this permission notice shall
  be included in all copies or substantial portions of the Software.</p><br/>

<p>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.</p>`, 800);
        },
        showVar(){
            this.playSe(this.enterSe);
            this.event.$emit("alert", this.$t("menu.var"), this.$t("menu.varCon"));
        },
        showRepo(){
            this.playSe(this.enterSe);
            shell.openExternal("https://github.com/toyobayashi/mishiro");
        },
        relaunch(){
            this.playSe(this.enterSe);
            remote.app.relaunch({ args: ["."] });
            remote.app.exit(0);
        }
    }
};