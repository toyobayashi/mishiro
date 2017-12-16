const electron = require("electron");
const SQL = require("sql.js");
const { exec, execSync } = require("child_process");
const ipcMain = electron.ipcMain;
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require("path");
const url = require("url");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow (){
    // Create the browser window.
    mainWindow = new BrowserWindow({ width: 1296, height: 863 });

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, "./public/index.html"),
        protocol: "file:",
        slashes: true
    }));

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on("closed", function (){
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
        mainWindow = null;
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", function (){
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if(process.platform !== "darwin"){
        app.quit();
    }
});

app.on("activate", function (){
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if(mainWindow === null){
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
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

let manifest = null;
ipcMain.on("readManifest", (event, manifestFile) => {
    manifest = new SQL.Database(manifestFile);
    const manifests = manifest._exec("SELECT name, hash FROM manifests");
    event.sender.send("readManifest", manifests);
});


ipcMain.on("readMaster", (event, masterFile) => {
    const master = new SQL.Database(masterFile);
    const eventData = master._exec("SELECT * FROM event_data");
    const eventAvailable = master._exec("SELECT * FROM event_available");
    const cardData = master._exec("SELECT * FROM card_data");
    const charaData = master._exec("SELECT * FROM chara_data");
    const textData = master._exec("SELECT * FROM text_data WHERE category='2';SELECT * FROM text_data WHERE category='4'");
    const skillData = master._exec("SELECT * FROM skill_data");
    const leaderSkillData = master._exec("SELECT * FROM leader_skill_data");
    const musicData = master._exec("SELECT id, name FROM music_data");

    const liveManifest = manifest._exec("SELECT name, hash FROM manifests WHERE name LIKE \"l/%\"");
    const bgmManifest = manifest._exec("SELECT name, hash FROM manifests WHERE name LIKE \"b/%\"");
    manifest.close();
    master.close();

    charaData.forEach((chara, i) => {
        let hometown = textData[0].filter(row => row.index == chara.home_town)[0],
            seiza = textData[1].filter(row => (1000 + Number(row.index)) == chara.constellation)[0];
        if(hometown){
            charaData[i].hometown = hometown.text;
        }
        if(seiza){
            charaData[i].seiza = seiza.text;
        }
    });
    cardData.forEach((card, i) => {
        cardData[i].charaData = charaData.filter(row => row.chara_id == card.chara_id)[0];
        cardData[i].skill = skillData.filter(row => row.id == card.skill_id)[0];
        cardData[i].leaderSkill = leaderSkillData.filter(row => row.id == card.leader_skill_id)[0];
    });
    bgmManifest.forEach((bgm, i) => {
        let fileName = bgm.name.split("/")[1].split(".")[0] + ".mp3";
        bgmManifest[i].fileName = fileName;
    });
    liveManifest.forEach((song, i) => {
        let name = song.name.split("/")[1].split(".")[0];
        let arr = name.split("_");
        let fileName = "";
        if(Number(arr[1]) < 1000){
            fileName = name + ".mp3";
        }
        else{
            if(arr.length > 2){
                if(arr[2] === "another"){
                    fileName = arr[1] + "_" + arr[2] + "-" + musicData.filter(row => row.id == arr[1])[0].name.replace(/\\n/g, "") + ".mp3";
                }
                else{
                    fileName = arr[1] + "_" + arr[2] + "-" + musicData.filter(row => row.id == arr[1])[0].name.replace(/\\n/g, "") + "（" + charaData.filter(row => row.chara_id == arr[2])[0].name + "）.mp3";
                }
            }
            else{
                fileName = arr[1] + "-" + musicData.filter(row => row.id == arr[1])[0].name.replace(/\\n/g, "") + ".mp3";
            }
        }
        liveManifest[i].fileName = fileName;
    });
    event.sender.send("readMaster", { cardData, eventData, eventAvailable, bgmManifest, liveManifest });
});


ipcMain.on("acb", (event, acbPath, url) => {
    const name = acbPath.split("\\")[acbPath.split("\\").length - 1].split(".")[0];
    exec(`bin\\CGSSAudio.exe ${acbPath}`, (err) => {
        if(!err){
            if(url.split("/")[url.split("/").length - 2] === "live"){
                exec(`ren "public\\asset\\sound\\live\\${name}.mp3" "${url.split("/")[url.split("/").length - 1]}"`, (err) => {
                    if(!err){
                        event.sender.send("acb", acbPath, url);
                    }
                });
            }
            else{
                event.sender.send("acb", acbPath, url);
            }
        }
    });
});

