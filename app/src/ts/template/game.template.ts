export default `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title></title>
  ${process.env.NODE_ENV === 'production' ? '<link id="css" rel="stylesheet" type="text/css" href="./mishiro.live.css"/>' : ''}
</head>
<body>
  <div id="app"></div>
  <script src="./dll.js"></script>
  <script src="./mishiro.live.js"></script>
</body>
</html>
`
