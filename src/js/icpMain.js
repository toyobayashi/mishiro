import { ipcMain } from "electron";
import SQL from "./sqlExec.js";
import { exec } from "child_process";
import { getPath } from "./getPath.js";
import { configurer } from "./config.js";

let config = configurer.getConfig();
let fix = {};
if(!config.latestVersion){
    fix.latestResVer = 10033300;
}
if(config.language !== "zh" && config.language !== "ja"){
    fix.language = "zh";
}
if(Object.keys(fix).length){
    configurer.configure(fix);
}

let manifest = null;

function getRarity(id, cardData){
    for(var i = 0; i < cardData.length; i++){
        if(id == cardData[i].id){
            return cardData[i].rarity;
        }
    }
}

ipcMain.on("readManifest", (event, manifestFile) => {
    manifest = new SQL.Database(manifestFile);
    const manifests = manifest._exec("SELECT name, hash FROM manifests");
    event.sender.send("readManifest", manifests);
});

ipcMain.on("readMaster", (event, masterFile) => {
    const master = new SQL.Database(masterFile);
    const eventAll = master._exec("SELECT * FROM event_data");
    const eventNow = master._exec("SELECT * FROM event_data WHERE event_start = (SELECT MAX(event_start) FROM (SELECT * FROM event_data WHERE event_start < DATETIME(CURRENT_TIMESTAMP, 'localtime')))")[0];
    const eventData = config.event ? master._exec(`SELECT * FROM event_data WHERE id="${config.event}"`)[0] : eventNow;
    const eventAvailable = master._exec(`SELECT * FROM event_available WHERE event_id = "${eventData.id}"`);

    let cardData = master._exec("SELECT * FROM card_data");
    let charaData = master._exec("SELECT * FROM chara_data");
    const textData = master._exec("SELECT * FROM text_data WHERE category='2';SELECT * FROM text_data WHERE category='4'");
    const skillData = master._exec("SELECT * FROM skill_data");
    const leaderSkillData = master._exec("SELECT * FROM leader_skill_data");
    const musicData = master._exec("SELECT id, name FROM music_data");

    let gachaNow = master._exec("SELECT * FROM gacha_data WHERE start_date = (SELECT MAX(start_date) FROM gacha_data WHERE id LIKE '3%') AND id LIKE '3%'")[0];
    let gachaData = config.gacha ? master._exec(`SELECT * FROM gacha_data WHERE id="${config.gacha}"`)[0] : gachaNow;
    let gachaAvailable = master._exec(`SELECT * FROM gacha_available WHERE gacha_id LIKE '${gachaData.id}'`);

    let liveManifest = manifest._exec("SELECT name, hash FROM manifests WHERE name LIKE \"l/%\"");
    let bgmManifest = manifest._exec("SELECT name, hash FROM manifests WHERE name LIKE \"b/%\"");
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

    let R = 0, SR = 0, SSR = 0, fes = false;
    gachaAvailable.forEach(function (v, i){
        gachaAvailable[i].rarity = getRarity(v.reward_id, cardData);
        switch(gachaAvailable[i].rarity){
            case 3:
                R++;
                break;
            case 5:
                SR++;
                break;
            case 7:
                SSR++;
                break;
            default:
                break;
        }
    });

    if(new RegExp("シンデレラフェス").test(gachaData.dicription)){
        fes = true;
    }
    if(gachaAvailable[0]["relative_odds"] === 0){
        let R_ODDS = 850000, SR_ODDS = 120000, SSR_ODDS = 30000;
        let R_ODDS_SR = 0, SR_ODDS_SR = 970000, SSR_ODDS_SR = 30000;

        if(fes){
            R_ODDS = 820000, SR_ODDS = 120000, SSR_ODDS = 60000;
            R_ODDS_SR = 0, SR_ODDS_SR = 940000, SSR_ODDS_SR = 60000;
        }

        gachaAvailable.forEach(function (v, i){
            if(v.rarity == 3){
                gachaAvailable[i]["relative_odds"] = Math.round(R_ODDS / R);
                gachaAvailable[i]["relative_sr_odds"] = Math.round(R_ODDS_SR / R);
            }
            else if(v.rarity == 5){
                gachaAvailable[i]["relative_odds"] = Math.round(SR_ODDS / SR);
                gachaAvailable[i]["relative_sr_odds"] = Math.round(SR_ODDS_SR / SR);
            }
            else if(v.rarity == 7){
                gachaAvailable[i]["relative_odds"] = Math.round(SSR_ODDS / SSR);
                gachaAvailable[i]["relative_sr_odds"] = Math.round(SSR_ODDS_SR / SSR);
            }
        });
    }
    gachaData.count = { R, SR, SSR, fes };

    event.sender.send("readMaster", { eventAll, cardData, eventData, eventAvailable, bgmManifest, liveManifest, gachaData, gachaAvailable, gachaNow });
});

ipcMain.on("acb", (event, acbPath, url = "") => {
    const name = acbPath.split("\\")[acbPath.split("\\").length - 1].split(".")[0];
    exec(`${getPath()}\\bin\\CGSSAudio.exe ${acbPath}`, (err) => {
        if(!err){
            if(url){
                if(url.split("/")[url.split("/").length - 2] === "live"){
                    exec(`ren "${getPath()}\\public\\asset\\sound\\live\\${name}.mp3" "${url.split("/")[url.split("/").length - 1]}"`, (err) => {
                        if(!err){
                            event.sender.send("acb", acbPath, url);
                        }
                    });
                }
                else{
                    event.sender.send("acb", acbPath, url);
                }
            }
            else{
                exec(`del /q /f ${acbPath}`);
            }
        }
    });
});

export default config;
