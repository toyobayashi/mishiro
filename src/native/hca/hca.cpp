#include <node.h>
#include <uv.h>
#include "clHCA.h"

using namespace v8;
using namespace std;

float volume = 1;
unsigned int ciphKey1 = 0xF27E3B22;
unsigned int ciphKey2 = 0x00003657;
int mode = 16;
int loop = 0;

// js string to c++ string
string toCString (Local<Value> jsValue) {
  Local<String> jsPathString = Local<String>::Cast(jsValue);
  String::Utf8Value utfValue(jsPathString);
  return string(*utfValue);
}

struct async_req {
  uv_work_t req;
  string input;
  bool output;
  Isolate *isolate;
  Persistent<Function> callback;
};

string toWavSuffix (string hcafile) {
  string base = hcafile.substr(0, hcafile.find_last_of("."));
  string filenameOut = base + ".wav";
  return filenameOut;
}

void DoAsync (uv_work_t *r) {
  async_req *req = reinterpret_cast<async_req *>(r->data);
  string hcafile = req->input;

  const char *filenameOut = toWavSuffix(hcafile).c_str();

  clHCA hca(ciphKey1, ciphKey2);
  if (!hca.DecodeToWavefile(hcafile.c_str(), filenameOut, volume, mode, loop)) {
    req->output = false;
    return;
  }
  req->output = true;
}

void AfterAsync(uv_work_t *r) {
  async_req *req = reinterpret_cast<async_req *>(r->data);
  Isolate *isolate = req->isolate;
  HandleScope scope(isolate);

  Local<Value> argv[1] = { Boolean::New(isolate, req->output) };

  TryCatch try_catch(isolate);

  Local<Object> global = isolate->GetCurrentContext()->Global();
  Local<Function> callback = Local<Function>::New(isolate, req->callback);

  callback->Call(global, 1, argv);

  req->callback.Reset();
  delete req;

  if (try_catch.HasCaught()) {
    node::FatalException(isolate, try_catch);
  }
}

void dec (const FunctionCallbackInfo<Value> &args) {
  Isolate *isolate = args.GetIsolate();
  if (!args[0]->IsString()) {
    isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "Hca file must be a string.")));
    return;
  }

  async_req *req = new async_req;
  req->req.data = req;

  req->input = toCString(args[0]);
  req->output = false;
  req->isolate = isolate;

  Local<Function> callback = Local<Function>::Cast(args[1]);
  req->callback.Reset(isolate, callback);

  uv_queue_work(uv_default_loop(),
                &req->req,
                DoAsync,
                (uv_after_work_cb)AfterAsync);
}

void decSync (const FunctionCallbackInfo<Value> &args) {
  Isolate *isolate = args.GetIsolate();
  if (!args[0]->IsString()) {
    isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "Hca file must be a string.")));
    return;
  }

  string hcafile = toCString(args[0]);
  const char *filenameOut = toWavSuffix(hcafile).c_str();
  clHCA hca(ciphKey1, ciphKey2);
  if (!hca.DecodeToWavefile(hcafile.c_str(), filenameOut, volume, mode, loop)) {
    args.GetReturnValue().Set(Boolean::New(isolate, false));
    return;
  }
  args.GetReturnValue().Set(Boolean::New(isolate, true));
}

void init (Local<Object> exports, Local<Object> module) {
  NODE_SET_METHOD(exports, "dec", dec);
  NODE_SET_METHOD(exports, "decSync", decSync);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, init)
