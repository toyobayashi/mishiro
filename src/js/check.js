import request from "request";
import fs from "fs";
import getPath from "./getPath.js";
import configurer from "./config.js";

let current = 0, max = 20;

function httpGetVersion(resVer, progressing){
    const option = {
        method: "GET",
        url: `http://storage.game.starlight-stage.jp/dl/${resVer}/manifests/all_dbmanifest`,
        headers: {
            "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 7.0; Nexus 42 Build/XYZZ1Y)",
            "X-Unity-Version": "5.1.2f1",
            "Accept-Encoding": "gzip"
        }
    };
    return new Promise((resolve) => {
        request(option, (err, res) => {
            if(err){
                resolve({ version: resVer, isExisting: false });
            }
            else{
                current++;
                progressing({ current, max, loading: 100 * current / max });
                if(res.statusCode === 200){
                    resolve({ version: resVer, isExisting: true });
                }
                else{
                    resolve({ version: resVer, isExisting: false });
                }
            }
        });
    });
}

function check(progressing){
    if(!fs.existsSync(getPath("./data"))){
        fs.mkdirSync(getPath("./data"));
    }
    let config = configurer.getConfig();
    if(config.resVer){
        return config.resVer;
    }
    if(!config.latestResVer){
        configurer.configure("latestResVer", 10033400);
    }

    let versionFrom = configurer.getConfig().latestResVer;

    return new Promise((resolve) => {
        let resVer = versionFrom;

        function checkVersion(versionFrom){
            let versionArr = [];
            for(let i = 10; i < 210; i += 10){
                versionArr.push(Number(versionFrom) + i);
            }
            let promiseArr = [];
            versionArr.forEach((v) => {
                promiseArr.push(httpGetVersion(v, progressing));
            });
            Promise.all(promiseArr).then((arr) => {
                max += 20;
                let temp = arr;
                let isContinue = false;
                for(let i = temp.length - 1; i >= 0; i--){
                    if(temp[i].isExisting === true){
                        isContinue = true;
                        resVer = temp[i].version;
                        checkVersion(temp[temp.length - 1].version);
                        break;
                    }
                }
                if(!isContinue){
                    // fs.writeFileSync(getPath("./data/version"), resVer);
                    configurer.configure("latestResVer", resVer);
                    resolve(resVer);
                }
            });
        }

        checkVersion(versionFrom);
    });
}
export default check;
