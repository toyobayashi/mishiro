import dl from "./download.js";

const downloadManifest = (resVer, progressing) => {
    return dl(
        `http://storage.game.starlight-stage.jp/dl/${resVer}/manifests/Android_AHigh_SHigh`,
        getPath(`./data/manifest_${resVer}`),
        progressing
    );
};

export default downloadManifest;
