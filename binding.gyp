{
  "variables": {
    "module_name": "hca",
    "module_path": "./public/addon",
    "PRODUCT_DIR": "./build/Release"
  },
  "targets": [
    {
      "target_name": "<(module_name)",
      "sources": [
        "./src/cpp/hca/hca.cpp",
        "./src/cpp/hca/clHCA.cpp"
      ]
    },
    {
      "target_name": "action_after_build",
      "type": "none",
      "dependencies": [ "<(module_name)" ],
      "copies": [
        {
          "files": [ "<(PRODUCT_DIR)/<(module_name).node" ],
          "destination": "<(module_path)"
        }
      ]
    }
  ]
}
