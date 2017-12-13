export default function(p){
    let filename = "";
    if(p.indexOf("/") !== -1){
        const patharr = p.split("/");
        filename = patharr[patharr.length - 1];
    }
    else if(p.indexOf("\\") !== -1){
        const patharr = p.split("\\");
        filename = patharr[patharr.length - 1];
    }
    else{
        filename = p;
    }
    return filename;
}