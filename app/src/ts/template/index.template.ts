export default `<!DOCTYPE html>
<html>
  <head>
    <title>mishiro</title>
    <meta charset="utf-8"/>
    ${process.env.NODE_ENV === 'production' ? '<link id="css" rel="stylesheet" type="text/css" href="./mishiro.renderer.css"/>' : ''}
  </head>
  <body>
    <div id="app"></div>
    <script src="./dll.js"></script>
    <script src="./mishiro.renderer.js"></script>
  </body>
</html>
`
