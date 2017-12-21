import fs from "fs";
//Binary Reader for Uint8Array
/* class BinaryReader */
var BinaryReader = function(array){
    this.ary = array;
    this.curPos = 0;
};
BinaryReader.prototype.readByte = function(){
    this.curPos++;
    return this.ary[this.curPos - 1];
};
BinaryReader.prototype.readShortLE = function(){
    this.curPos += 2;
    return this.ary[this.curPos - 2] + (this.ary[this.curPos - 1] << 8);
};
BinaryReader.prototype.readIntLE = function(){
    this.curPos += 4;
    return this.ary[this.curPos - 4] + (this.ary[this.curPos - 3] << 8) + (this.ary[this.curPos - 2] << 16) + (this.ary[this.curPos - 1] << 24);
};
BinaryReader.prototype.copyBytes = function(dst, offset, size){
    dst.set(this.ary.slice(this.curPos, this.curPos + size), offset);
    this.curPos += size;
};
BinaryReader.prototype.seekAbs = function(pos){
    this.curPos = pos;
};
BinaryReader.prototype.seekRel = function(diff){
    this.curPos += diff;
};
BinaryReader.prototype.getPos = function(){
    return this.curPos;
};


//Unity LZ4 Decompressor for Uint8Array
/* class lz4 */
var lz4 = function(array){
    this.reader = new BinaryReader(array);
};
/* public: */
lz4.prototype.decompress = function(){
    var r = this.reader;
    var retArray;
    var dataSize = 0;
    var decompressedSize = 0;

    var token = 0;
    var sqSize = 0;
    var matchSize = 0;
    // var litPos = 0;
    var offset = 0;
    var retCurPos = 0;
    var endPos = 0;

    r.seekAbs(4);
    decompressedSize = r.readIntLE();
    dataSize = r.readIntLE();
    endPos = dataSize + 16;
    retArray = new Uint8Array(decompressedSize);

    r.seekAbs(16);

    //Start reading sequences
    while(1){
        //read the LiteralSize and the MatchSize
        token = r.readByte();
        sqSize = token >> 4;
        matchSize = (token & 0x0F) + 4;
        if(sqSize == 15)
            sqSize += this.readAdditionalSize(r);

        //copy the literal
        r.copyBytes(retArray, retCurPos, sqSize);
        retCurPos += sqSize;

        if(r.getPos() >= endPos - 1)
            break;

        //read the offset
        offset = r.readShortLE();

        //read the additional MatchSize
        if(matchSize == 19)
            matchSize += this.readAdditionalSize(r);

        //copy the match properly
        if(matchSize > offset){
            var matchPos = retCurPos - offset;
            while(1){
                retArray.copyWithin(retCurPos, matchPos, matchPos + offset);
                retCurPos += offset;
                matchSize -= offset;
                if(matchSize < offset)
                    break;
            }
        }
        retArray.copyWithin(retCurPos, retCurPos - offset, retCurPos - offset + matchSize);
        retCurPos += matchSize;
    }


    return retArray;
};

/* private: */
//read Additional Bytes of size
lz4.prototype.readAdditionalSize = function(reader){
    var size = reader.readByte();
    if(size == 255)
        return size + this.readAdditionalSize(reader);
    else
        return size;
};

function toArrayBuffer(buffer){
    var ab = new ArrayBuffer(buffer.length);
    var view = new Uint8Array(ab);
    for(var i = 0; i < buffer.length; ++i){
        view[i] = buffer[i];
    }
    return view;
}

function toBuffer(ab){
    var buf = new Buffer(ab.byteLength);
    var view = new Uint8Array(ab);
    for(var i = 0; i < buf.length; ++i){
        buf[i] = view[i];
    }
    return buf;
}

function lz4dec(input, output){
    output = output || "unity3d";
    var buff = new Buffer(fs.readFileSync(input));
    var fbuf = new Uint8Array(toArrayBuffer(buff));
    var dec = new lz4(fbuf);
    var raw = dec.decompress();
    fs.writeFileSync(input + "." + output, toBuffer(raw));
    return input + "." + output;
}

export default lz4dec;


/************ in browser ***************

function handleFileSelect(loaded) {
	var file = $("#file").prop("files")[0];
	if(file == null) {
		alert('Please select a file.');
		return;
	}
	var reader = new FileReader();
	reader.onload = function() {
		loaded(reader.result, file.name);
	}
	reader.readAsArrayBuffer(file);
}
$(function() {
	$('#load').click(function(){
		handleFileSelect(function(ary, name) {
			var fBuf = new Uint8Array(ary);
			var dec = new lz4(fBuf);
			var raw = dec.decompress();
			var blob = new Blob([raw], { type:"octet/stream" });
			var a = document.createElement("a");
		    a.href = URL.createObjectURL(blob);
		    a.target = '_blank';
		    a.download = name + '.unity3d';
		    a.click();
		});
	});
});
**************************************/