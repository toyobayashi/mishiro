import { spawn } from 'child_process'
import { join } from 'path'

let cp = spawn(require('electron'), [join(__dirname, '../public/mishiro.main.js')])
cp.stdout.pipe(process.stdout)
cp.stderr.pipe(process.stderr)
