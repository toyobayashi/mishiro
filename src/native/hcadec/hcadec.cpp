#include <node.h>
#include "clHCA.h"

using namespace v8;
using namespace std;

// js string to c++ string
string toCString (Local<Value> jsValue) {
  Local<String> jsPathString = Local<String>::Cast(jsValue);
  String::Utf8Value utfValue(jsPathString);
  return string(*utfValue);
}

void hcadec (const FunctionCallbackInfo<Value> &args) {
  Isolate *isolate = args.GetIsolate();
  if (!args[0]->IsString()) {
    isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "Hca file must be a string.")));
    return;
  }

  string hcafile = toCString(args[0]);

  unsigned int count = 0;
  char *filenameOut = NULL;
  float volume = 1;
  unsigned int ciphKey1 = 0xF27E3B22;
  unsigned int ciphKey2 = 0x00003657;
  int mode = 16;
  int loop = 0;

  char path[260];
  if (!(filenameOut && filenameOut[0])) {
    strcpy_s(path, sizeof(path), hcafile.c_str());
    char *d1 = strrchr(path, '\\');
    char *d2 = strrchr(path, '/');
    char *e = strrchr(path, '.');
    if (e && d1 < e && d2 < e)
      *e = '\0';
    strcat_s(path, sizeof(path), ".wav");
    filenameOut = path;
  }

  clHCA hca(ciphKey1, ciphKey2);
  if (!hca.DecodeToWavefile(hcafile.c_str(), filenameOut, volume, mode, loop)) {
    args.GetReturnValue().Set(Boolean::New(isolate, false));
    return;
  }
  args.GetReturnValue().Set(Boolean::New(isolate, true));
}

// module.exports = hcadec
void module_exports (Local<Object> exports, Local<Object> module) {
  NODE_SET_METHOD(module, "exports", hcadec);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, module_exports)
