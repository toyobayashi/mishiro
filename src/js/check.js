let current = 0, max = 20;

function httpGetVersion(resVer, progressing){
    const option = {
        protocol: "http:",
        hostname: "storage.game.starlight-stage.jp",
        path: "/dl/" + resVer + "/manifests/all_dbmanifest",
        headers: {
            "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 7.0; Nexus 42 Build/XYZZ1Y)",
            "X-Unity-Version": "5.1.2f1",
            "Accept-Encoding": "gzip"
        }
    };
    return new Promise((resolve) => {
        http.get(option, (res) => {
            current++;
            progressing({ current, max, loading: 100 * current / max });
            if(res.statusCode === 200){
                resolve({ version: resVer, isExisting: true });
            }
            else{
                resolve({ version: resVer, isExisting: false });
            }
        }).on("error", function(){
            resolve({ version: resVer, isExisting: false });
        });
    });
}

function check(progressing, debugVersion){
    system("if not exist data md data");
    if(!fs.existsSync(getPath("./data/version"))){
        fs.writeFileSync(getPath("./data/version"), "10032840");
    }
    if(debugVersion){
        return debugVersion;
    }
    const versionFrom = Number(fs.readFileSync(getPath("./data/version")).toString());

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
                    fs.writeFileSync(getPath("./data/version"), resVer);
                    resolve(resVer);
                }
            });
        }

        checkVersion(versionFrom);
    });
}
export default check;
