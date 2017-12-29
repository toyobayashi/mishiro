import { remote } from "electron";
import cheerio from "cheerio";
import request from "request";
export default {
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
        update(){
            this.playSe(this.enterSe);
            if(!navigator.onLine){
                this.event.$emit("alert", this.$t("home.errorTitle"), this.$t("home.noNetwork"));
                return;
            }
            this.$emit("checking");
            const gitRoot = "https://github.com";
            request.get(`${gitRoot}/toyobayashi/mishiro/releases`, (err, res, body) => {
                this.$emit("checked");
                if(!err){
                    let $ = cheerio.load(body);
                    const title = $(".release.label-latest .release-title > a").text();
                    const version = title.substr(title.indexOf(" v") + 2);
                    const commitUrl = gitRoot + $(".release.label-latest .tag-references a[href*=\"commit\"]").attr("href");
                    const commit = commitUrl.split("/")[commitUrl.split("/").length - 1];

                    const zipPath = $(".release.label-latest .release-body a[href$=\".zip\"][href*=\"releases/download\"]").attr("href");
                    const zipUrl = zipPath ? gitRoot + zipPath : null;

                    const exePath = $(".release.label-latest .release-body a[href$=\".exe\"]").attr("href");
                    const exeUrl = exePath ? gitRoot + exePath : null;

                    const description = $(".release.label-latest .release-body .markdown-body").html().replace(/\n/g, "").trim();
                    const versionData = { version, commit, description, commitUrl, zipUrl, exeUrl };
                    console.log(versionData);
                    if(remote.app.getVersion() < version){
                        this.event.$emit("versionCheck", versionData);
                    }
                    else{
                        this.event.$emit("alert", this.$t("menu.update"), this.$t("menu.noUpdate"));
                    }
                }
                else{
                    throw new Error(err);
                }
            });
        },
        relaunch(){
            this.playSe(this.enterSe);
            remote.app.relaunch({ args: ["."] });
            remote.app.exit(0);
        }
    }
};