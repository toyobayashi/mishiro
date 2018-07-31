import { spawn } from 'child_process'
import { join } from 'path'

let cp = spawn(require('electron'), [join(__dirname, '..')])
cp.stdout.pipe(process.stdout)
cp.stderr.pipe(process.stderr)
