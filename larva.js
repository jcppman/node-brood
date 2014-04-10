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

}

util.inherits(Larva, EventEmitter);

Larva.prototype.spawn = function larvaSpawn (addArgs) {

  var that = this;
  var env = that.env;
  var args = that.args;
  var command = that.command;

  if (underscore.isArray(addArgs)) {

    args = args.concat(addArgs);
  
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

      // Let's plug a life detector to check if the larva is alive
      child.stdout.on('data', function (msg) {

      
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
    
    });
  
  }

};

module.exports = Larva;
