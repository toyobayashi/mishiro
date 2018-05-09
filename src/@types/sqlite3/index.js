/* npm install sqlite3 --save-dev --build-from-source --runtime=electron --target=2.0.0 --target_arch=x64 --dist-url=https: //atom.io/download/electron */

var util = require('util')
var path = require('path')
var binding = require('sqlite3')
var sqlite3 = module.exports = exports = binding
var EventEmitter = require('events').EventEmitter

function normalizeMethod (fn) {
  return function (sql) {
    var errBack
    var args = Array.prototype.slice.call(arguments, 1)
    if (typeof args[args.length - 1] === 'function') {
      var callback = args[args.length - 1]
      errBack = function (err) {
        if (err) {
          callback(err)
        }
      }
    }
    var statement = new Statement(this, sql, errBack)
    return fn.call(this, statement, args)
  }
}

function inherits (target, source) {
  for (var k in source.prototype) { target.prototype[k] = source.prototype[k] }
}

sqlite3.cached = {
  Database: function (file, a, b) {
    if (file === '' || file === ':memory:') {
      // Don't cache special databases.
      return new Database(file, a, b)
    }

    var db
    file = path.resolve(file)
    function cb () { callback.call(db, null) }

    if (!sqlite3.cached.objects[file]) {
      db = sqlite3.cached.objects[file] = new Database(file, a, b)
    } else {
      // Make sure the callback is called.
      db = sqlite3.cached.objects[file]
      var callback = (typeof a === 'number') ? b : a
      if (typeof callback === 'function') {
        if (db.open) process.nextTick(cb)
        else db.once('open', cb)
      }
    }

    return db
  },
  objects: {}
}

var Database = sqlite3.Database
var Statement = sqlite3.Statement

inherits(Database, EventEmitter)
inherits(Statement, EventEmitter)

// Database#prepare(sql, [bind1, bind2, ...], [callback])
Database.prototype.prepare = normalizeMethod(function (statement, params) {
  return params.length
    ? statement.bind.apply(statement, params)
    : statement
})

// Database#run(sql, [bind1, bind2, ...], [callback])
Database.prototype.run = normalizeMethod(function (statement, params) {
  statement.run.apply(statement, params).finalize()
  return this
})

// Database#get(sql, [bind1, bind2, ...], [callback])
Database.prototype.get = normalizeMethod(function (statement, params) {
  statement.get.apply(statement, params).finalize()
  return this
})

// Database#all(sql, [bind1, bind2, ...], [callback])
Database.prototype.all = normalizeMethod(function (statement, params) {
  statement.all.apply(statement, params).finalize()
  return this
})

// Promisify. Create by Toyobayashi
Database.prototype._all = function (sql) {
  return new Promise((resolve, reject) => {
    this.all(sql, (err, rows) => {
      if (err) reject(err)
      else resolve(rows)
    })
  })
}

sqlite3.openAsync = function (db, mode = sqlite3.OPEN_READONLY) {
  return new Promise((resolve, reject) => {
    let d = new sqlite3.Database(db, mode, err => {
      if (err) reject(err)
      else resolve(d)
    })
  })
}

// Database#each(sql, [bind1, bind2, ...], [callback], [complete])
Database.prototype.each = normalizeMethod(function (statement, params) {
  statement.each.apply(statement, params).finalize()
  return this
})

Database.prototype.map = normalizeMethod(function (statement, params) {
  statement.map.apply(statement, params).finalize()
  return this
})

Statement.prototype.map = function () {
  var params = Array.prototype.slice.call(arguments)
  var callback = params.pop()
  params.push(function (err, rows) {
    if (err) return callback(err)
    var result = {}
    if (rows.length) {
      var keys = Object.keys(rows[0])
      var key = keys[0]
      if (keys.length > 2) {
        // Value is an object
        for (var i = 0; i < rows.length; i++) {
          result[rows[i][key]] = rows[i]
        }
      } else {
        var value = keys[1]
        // Value is a plain value
        for (i = 0; i < rows.length; i++) {
          result[rows[i][key]] = rows[i][value]
        }
      }
    }
    callback(err, result)
  })
  return this.all.apply(this, params)
}

var isVerbose = false

var supportedEvents = [ 'trace', 'profile', 'insert', 'update', 'delete' ]

Database.prototype.addListener = Database.prototype.on = function (type) {
  var val = EventEmitter.prototype.addListener.apply(this, arguments)
  if (supportedEvents.indexOf(type) >= 0) {
    this.configure(type, true)
  }
  return val
}

Database.prototype.removeListener = function (type) {
  var val = EventEmitter.prototype.removeListener.apply(this, arguments)
  if (supportedEvents.indexOf(type) >= 0 && !this._events[type]) {
    this.configure(type, false)
  }
  return val
}

Database.prototype.removeAllListeners = function (type) {
  var val = EventEmitter.prototype.removeAllListeners.apply(this, arguments)
  if (supportedEvents.indexOf(type) >= 0) {
    this.configure(type, false)
  }
  return val
}

// Save the stack trace over EIO callbacks.
sqlite3.verbose = function () {
  if (!isVerbose) {
    /* var trace = require('./trace'); */
    var trace = {
      extendTrace: function (object, property, pos) {
        var old = object[property]
        object[property] = function () {
          var error = new Error()
          var name = object.constructor.name + '#' + property + '(' +
            Array.prototype.slice.call(arguments).map(function (el) {
              return util.inspect(el, false, 0)
            }).join(', ') + ')'

          if (typeof pos === 'undefined') pos = -1
          if (pos < 0) pos += arguments.length
          var cb = arguments[pos]
          if (typeof arguments[pos] === 'function') {
            arguments[pos] = function replacement () {
              try {
                return cb.apply(this, arguments)
              } catch (err) {
                if (err && err.stack && !err.__augmented) {
                  err.stack = filter(err).join('\n')
                  err.stack += '\n--> in ' + name
                  err.stack += '\n' + filter(error).slice(1).join('\n')
                  err.__augmented = true
                }
                throw err
              }
            }
          }
          return old.apply(this, arguments)
        }
      }
    };
    [
      'prepare',
      'get',
      'run',
      'all',
      'each',
      'map',
      'close',
      'exec'
    ].forEach(function (name) {
      trace.extendTrace(Database.prototype, name)
    });
    [
      'bind',
      'get',
      'run',
      'all',
      'each',
      'map',
      'reset',
      'finalize'
    ].forEach(function (name) {
      trace.extendTrace(Statement.prototype, name)
    })
    isVerbose = true
  }

  return this
}

function filter (error) {
  return error.stack.split('\n').filter(function (line) {
    return line.indexOf(__filename) < 0
  })
}
