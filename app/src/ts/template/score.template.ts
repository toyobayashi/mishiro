export default `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title></title>
</head>
<body>
  <img id="bg" src="../../asset/img.asar/bg_live_4004.png" class="img-middle">
  <div style="background: rgba(0,0,0,0.5);position:fixed;width:100%;height:100%"></div>
  <div class="combo">
    <span class="combo-number" id="combo">0</span>
    <span class="combo-text">combo</span>
  </div>
  ${process.env.NODE_ENV === 'production' ? '' : '<button id="debug" style="position: absolute; top: 0; left: 0; z-index: 2000;">debug</button>'}
</body>
</html>
`
