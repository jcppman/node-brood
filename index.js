var Larva = require('./larva');
var underscore = require('underscore');
var util = require('util');
var path = require('path');
var VError = require('verror');
var assert = require('assert');

function Brood (params) {

  var that = this;
  var rootPath;
  var blueprint;
  var blueprintPath;
  var species;
  var timeout;
  var interval;

  if (typeof params === 'undefined') {

    params = {};
  
  }
  rootPath = params.rootPath;

  // If the rootPath is not given, we use cwd
  if (typeof rootPath === 'undefined') {

    rootPath = process.cwd();
  
  } else {

    assert.equal(typeof rootPath, 'string', 'rootPath should be a string');
  
  }

  try {

    blueprintPath = path.resolve(rootPath, 'blueprint.json'); 
    blueprint = require(blueprintPath);

  } catch (err) {

    throw new VError(err, 'invalid blueprint file: %s', blueprintPath);
  
  }

  timeout = params.timeout;
  if (typeof timeout === 'undefined') {

    timeout = blueprint.timeout || 60000;
  
  }

  interval = params.lifeDetectInterval;
  if (typeof interval === 'undefined') {

    interval = blueprint.lifeDetectInterval || 5000;
  
  }

  species = blueprint.species;
  assert.ok(underscore.isArray(species),
    'blueprint species should be an array: %s',
    JSON.stringify(species));

  that.timeout = timeout;
  that.rootPath = rootPath;
  that.lifeDetectInterval = interval;
  that.library = {};

  underscore.each(species, function (value, idx) {

    that.importType(value);
  
  });

};

Brood.prototype.breed = function BroodBreed (larvaType, args) {

  /*
   * Return a larva that belongs to a specific type
   *
   * @param larvaType: string, the type of larva, if
   * the type exists than return a created larva will
   * be returned, if not, return null.
   */ 

  var that = this;
  var library = that.library;
  var species = library[larvaType];
  var larva;
  
  if (typeof species === 'undefined') {

    var errMsg = util.format(
      'BROOD_BREED * type -> %s * err -> TYPE_NOT_FOUND',
      larvaType);
    throw new Error(errMsg);
  
  }

  larva = new Larva(species);
  process.nextTick(function () {

    larva.spawn(args);
    larva.on('exit', function () {

      var timer = larva.timer;
      if (typeof timer !== 'undefined') {

        clearTimeout(timer);
      
      }
    
    });
    that.watch(larva);

  });
  return larva;

};

Brood.prototype.watch = function BroodWatch (larva) {

  /*
   * Keep watching the larva, if lastHeartBeat + timeout < now, kill it
   * @param larava: the larva
   */

  var that = this;
  var heartBeat = larva.lastHeartBeat;
  var timeout = larva.timeout;
  var expiryTime = heartBeat + timeout;
  var date = new Date();
  var now = date.getTime();
  var interval = that.lifeDetectInterval;

  if (expiryTime < now) {

    larva.emit('error', new VError('Larva no response'));
    larva.die();

  } else {

    var timer = setTimeout(function () {

      that.watch(larva);
    
    }, interval);

    larva.timer = timer;
  
  }

};

Brood.prototype.importType = function BroodImportType (species) {

  /*
   * Import the type into library, the object with same
   * name will be overriden.
   *
   * @param species: a json, the description of 
   * the species
   *
   * The scheme is: 
   * {
   *   name: "killer.theRipper"
   *   inheritFrom: "killer.zodiac",
   *   scriptPath: "killer/theRipper.js",
   *   command: "casperjs",
   *   timeout: 10000,
   *   args: ['firstArg', 'secondArg'],
   *   env: {
   *     "foo": "bar"
   *   }
   * }
   *
   */

  var that = this;
  var library = that.library;
  var inheritFrom = species.inheritFrom;
  var name = species.name;
  var scriptPath;
  var command;
  var timeout;
  var extension;
  var args;
  var env;
  var father;

  if (typeof name === 'undefined') {

    throw new VError('Species name missing: %s', JSON.stringify(species));
  
  }

  if (typeof inheritFrom  === 'string') {

    father = library[inheritFrom];
    if (!!father) {

      command = father.command;
      extension = father.extension;
      scriptPath = father.scriptPath;
      timeout = father.timeout;
      args = father.args;
      env = underscore.clone(father.env);

    }

  }

  // Priority: species > father > global/default
  
  command = species.command || command || 'node';
  extension = species.extension || extension || 'js';

  if (typeof species.scriptPath === 'string') {

    scriptPath = path.resolve(that.rootPath, species.scriptPath);

  } else if (!scriptPath) {

    // If scriptPath is not given, than we calculate the default path by name
    // default_path = root/name(. => /).extension
    
    scriptPath = path.resolve(
      that.rootPath,
      (name.replace('.', '/') + '.' + extension));
  
  }

  timeout = timeout || that.timeout;
  if (typeof species.timeout !== 'undefined') {

    timeout = parseInt(species.timeout);
    
    if (!timeout) {

      timeout = that.timeout;
    
    }

  }
  
  if (typeof species.args !== 'undefined') {

    if (underscore.isArray(species.args)) {

      args = [scriptPath].concat(species.args);
    
    } else if (typeof species.args === 'string') {

      args = [scriptPath, args];

    } else {

      throw new VError('Species has invalid args: %s', JSON.stringify(species));
    
    }

  } else if (typeof args === 'undefined') {

    args = [scriptPath];
  
  } 

  if (typeof env === 'undefined') {

    env = {};
  
  }

  if (typeof species.env !== 'undefined') {

    underscore.extend(env, species.env);
  
  }

  library[name] = {
    command: command,
    timeout: parseInt(timeout),
    args: args,
    env: env 
  };

};

exports.Brood = Brood;
exports.utils = {
  report: function (event, msg) {
    console.log(JSON.stringify({
      event: event,
      data: msg 
    }));
  }
};
