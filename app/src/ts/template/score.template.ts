export default `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title></title>
  <style>
  .img-middle {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    z-index: -1000;
  }
  .combo {
    position: absolute;
    top: 5%;
    right: 5%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .combo > .combo-number {
    -webkit-text-stroke: 2px rgb(240,144,0);
    color: #f0f0f0;
    font-size: 80px;
    font-family: "CGSS-B";
    font-weight: bold;
    height: 80px;
    line-height: 80px;
  }
  .combo > .combo-text {
    -webkit-text-stroke: 1px rgb(240,144,0);
    color: #f0f0f0;
    font-size: 35px;
    font-family: "CGSS-B";
    height: 35px;
    line-height: 35px;
  }
  </style>
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
