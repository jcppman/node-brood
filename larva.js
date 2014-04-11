var util = require('util');
var spawn = require('child_process').spawn;
var underscore = require('underscore');
var carrier = require('carrier');
var EventEmitter = require('events').EventEmitter;

function Larva(config) {
  
  /*
   * This constructor accept a config to construct larva
   * @param config: {
   *   "command": "the command",
   *   "env": "explictic enviroments",
   *   "args": "args"
   * }
   */

  var that = this;
  var command = config.command;
  var env = config.env || {};
  var args = config.args || "";

  Larva.super_.call(this);
  that.command = command;
  that.env = underscore.extend(process.env, env);
  that.args = args;
  that.childProcess = null;
  that.lastHeartBeat = new Date().getTime();

}

util.inherits(Larva, EventEmitter);

Larva.prototype.spawn = function larvaSpawn (addArgs) {
  /*
   * Spawn a child_process, attach a live detector on it and carry the stdout
   * event to larva
   * @param addArgs: an array or a string. the additional args that you want 
   * it to be appended when the child process get spawned
   */

  var that = this;
  var env = that.env;
  var args = that.args;
  var command = that.command;

  if (underscore.isArray(addArgs)) {

    args = args.concat(addArgs);
  
  } else if (typeof addArgs === 'string') {

    args.push(addArgs);
  
  }
  
  if (that.childProcess !== null) {

    process.nextTick(function () {

      that.emit('error', 'The larva is already spawned');
    
    });

  } else {

    process.nextTick(function () {

      var child = spawn(command, args, {
        env: env 
      });

      // Plug a life detector to check if the larva is alive
      child.stdout.on('data', function (msg) {

        that.lastHeartBeat = new Date().getTime();
      
      });

      child.on('exit', function () {

        that.emit('exit', arguments);
      
      });

      carrier.carry(child.stdout, function onLine (line) {

        var parsed;
        var event;
        var data;

        try {

          parsed = JSON.parse(line);
          event = parsed.event;
          if (typeof event === 'undefined') {
            event = 'info'; 
          }
          data = parsed.data;
          that.emit(event, data);
        
        } catch (err) {

          that.emit('info', line);
        
        }
      
      });

      carrier.carry(child.stderr, function onError (line) {

        that.emit('error', line);
      
      });

      that.childProcess = child;
    
    });
  
  }

  return that;

};

Larva.prototype.die = function larvaDie () {
  /*
   * Rest In Peace
   */

  var that = this;
  var child = that.childProcess;

  child.kill('SIGKILL');

  return that;

};

module.exports = Larva;
