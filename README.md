# Brood - A container and manager for spawned scripts
Brood is not 'another child_process helper'. Brood is for holding and 
managing spawned scripts, for people who needs to spawn different scripts with
different configuralation, and only listen to their responses, instead of
controlling them.

## Installation
`` npm install brood ``

## Usage

```JavaScript
var Brood = require('brood').Brood;

// Create a new brood instance and load scripts from rootPath
var brood = new Brood({
  rootPath: "scripts"
});

// Breed a new typeA larva
var larva = brood.breed('typeA');

// Now you could listen to events
larva.on('error', function (err) {
  console.log('Oops, error: %s', err);
});
larva.on('exit', function () {
  console.log('See ya!');
});

// Default stdout event
larva.on('info', function (msg) {
  console.log('I got a message from my child: %s', msg);
});

// Custom event
larva.on('story', function (msg) {
  console.log('My child just told me a story: %s', msg);
});

// Stderr (the stderr are seperated from normal error event)
larva.on('stderr', function (msg) {
  console.log('A msg from stderr: ',msg);
});
```

## Brood
Brood is the catalog of species, brood will build the library with given 
``blueprint.json``.

Brood constructor:
```
  // Available options
  var options = {
    rootPath: 'script'
  };
  var brood = new Brood(options);
```

__rootPath could be absolute path or relative path, actually we directly use
``path.resolve(rootPath)`` to deal with it.__

``Brood.breed(speciesName, [args])`` will return a __Larva__ that contains a 
``child_process`` that spawned with predefined configuration, and append the
additional args on it. ``args`` could be string or array of strings.

When a larva is created by Brood, brood will keep watching it and kill it if 
it is regarded as "no-response".

## Larva
Larva is the container of the spawned child_process, it will help us handling
stdout, events and heartbeats. The reason of handling stdout is that ``stdout.on('data')``
is triggered only when the stdout buffer is flushed. so the data we get from it
might be seperated or concated.

While creating a larva, brood will do this behind the scene:
```Javascript
child_process.spawn(command, [path, arg1, ...], env);
```
Params like ``command``, ``path``, ``args``, ``env`` are calculated by the
__species__.

## Species
Species is the DNA of your spawned child_process, a species is an JSON object
which describes how the child will be spawned, each species should has a unique
name, while building the library, the species with the same name will be overriden. 

The example below contains every available field:
```
{
  "command": "phantomjs", // The command for executing the script, Default: node
  "name": "yourHouse.myGhost", // The identity of the species
  "scriptPath": "", // Optional 
  "extension": "", // Optional, Default: js
  "args": [], // Optional
  "env": {}, // Optional
  "aliasOf": "", //Optional
}
```

- ``scriptPath``: the relative path to the rootPath, if not given, brood will 
calculate it from name and __replace "." with "/"__. If the name is "yourHouse.myGhost",
the default scriptPath will be "yourHouse/myGhost".
- ``extension``: the extension of your script, default is 'js'
- ``args``: An array or a string
- ``env``: An object, it will be merged with ``process.env`` and passed into
spawned child.
- ``aliasOf``: A string, the real species.

### Alias
If ``aliasOf`` is given, it will copy properties from it and merge envs. 
Only env will be merged, other properties on this species will be ignored.
__The real species should be put above alias species__.

E.g:
```
{
  "name": "killer.jackTheRipper",
  "command": "murder", 
  "extension": "js",
  "env": {
    "area": "London",
    "weapon": "knife"
  }
},
{
  "name": "killer.zodiac",
  "aliasOf": "killer.jackTheRipper",
  "env": {
    "area": "California"  
  }
}
```

killer.zodiac will has the same args, command and timeout with jackTheRipper,
env.weapon is copied from jackTheRipper and env.area is overriden with
'California'.

## Timeout
When a larva receive a message from stdout, it will update the latestHeartBeat,
Brood will check the hearbeat timestamp regularly, if the timeout reached, it
will be regarded as "dead" and be killed. 

__Brood only use stdout to determine if a child_process is dead, so brood is no
proper for scripts that doesn't/rarely print out msg__

## Response event
If the msg printed in stdout is a valid JSON and follow this structure:
```JSON
{
  event: "updateStatus", 
  data: "i am inside the building now"
}
```
than it will be emitted as a custom event:
```
  larva.emit('updateStatus', 'i am inside the building now');
```
otherwise, it will be emitted as an 'info' event:
```
  larva.emit('info', wholeMessage);
```

## Speak to children
Brood doesn't provide a wrap of stdin rightnow, but you could still use the raw
stdin stream:
```
  larva.child.stdin.write("Say your prayers little one");
```

## Manage your library
Brood will load your library from a ``bludprint.json`` you provide. __Please put
it in your rootPath.__

The scheme of blueprint:
```JSON
{
  "species": [],
  "timeout": 100000, // optional, global timeout, Default: 60000 
  "lifeDetectInterval": 2000 // optional, Default: 2000
}
```

If your library looks like:
```Clean
rootPath
|
+--blueprint.json
+--typeA
|  |
|  +--speciesB.js
|  \--speciesC.js
+--typeD
|  |
|  +--speciesE.py
|  \--speciesF.rb
\--speciesG.js
```

than the blueprint.json should looks like:
```JSON
{
  "species": [
    {
      "name": "typeA.speciesB",
      "command": "node"
    },
    {
      "name": "typeA.speciesC",
      "command": "node",
      "env": {
        "PORT": 8888,
        "HOST": "localhost" 
      },
      "args": ['-arg']
    },
    {
      "name": "typeD.speciesE",
      "command": "python",
      "extension": "py",
      "timeout": "10000"
    },
    {
      "name": "typeD.speciesF",
      "command": "ruby",
      "extension": "rb"
    },
    {
      "name": "speciesG",
      "command": "casperjs"
    }
  ]  
}
```

## utils
For convience, brood provides a set of tool to do the common jobs. If you put
your rootPath inside the nodejs project and your spawned script is a nodejs 
script, you could use ``var utils = require('brood').utils`` to get those utils.

Right now it only has one function: ``utils.report``:
```
var utils = require('brood').utils;

utils.report('customEvent', 'hi there! this is a msg for ya');
// output is a stringified JSON: 
//    '{"event":"customEvent","data":"hi there! this is a msg for ya"}'

```

This funcftion is made for sending msg back to father process and trigger a
custom event
