var Larva = require('../larva');
var EventEmitter = require('events').EventEmitter;

describe('Larva', function () {

  describe('#constructor', function () {

    var larva;
    var options;

    beforeEach(function () {

      options = {

        command: 'test',

        env: {

          fromConfig: 'test' 
        },

        args: ['test']

      };
    
    });

    describe('when all params are given', function () {

      beforeEach(function () {

        process.env['LARVA_MOCHA_TEST'] = 'test';
      
      });

      beforeEach(function () {

        larva = new Larva(options);

      });

      it('should has command', function () {

        larva.should.have.property('command', 'test');
      
      });

      it('should merge enviroments', function () {


        larva.should.have.property('env');
        larva.env['fromConfig'].should.eql('test');
        larva.env['LARVA_MOCHA_TEST'].should.eql('test');
      
      });

      it('should has args', function () {
        
        larva.should.have.property('args');
        larva.args.should.be.Array;
        larva.args.should.containEql('test');
      
      });

      it('should be a EventEmitter', function () {

        larva.should.be.instanceof(EventEmitter);
      
      });

    });
  
    describe('command missing', function () {

      beforeEach(function () {

        delete options.command;
      
      });

      beforeEach(function () {

        larva = new Larva(options);

      });

      it('should be node', function () {

        larva.command.should.eql('node');

      });

    });

    describe('env missing', function () {

      beforeEach(function () {

        delete options.env;
      
      });

      beforeEach(function () {
      
        larva = new Larva(options);

      });

      it('should exists', function () {

        larva.should.have.property('env');
      
      });
    
    });

    describe('args missing', function () {

      beforeEach(function () {

        delete options.args;
      
      });

      beforeEach(function () {
      
        larva = new Larva(options);

      });

      it('should be empty array', function () {

        larva.args.should.be.Array.and.have.length(0);
      
      });
    
    });

  });

  describe('#spawn', function () {

    var larva;

    beforeEach(function () {

      larva = new Larva({
        args: ['test/lib/echoBoy.js']
      });
    
    });

    it('should work correctly', function (done) {

      var words = 'My name is beemo, what is your name?';
      larva.spawn([words]);
      larva.on('info', function (msg) {

        msg.should.eql(words);
        done();
      
      });
    
    });

  });

  describe('#die', function () {

    var larva;

    beforeEach(function () {

      larva = new Larva({
        args: ['test/lib/heartBeat.js'] 
      });
      larva.spawn();
    
    });

    it('should kill childProcess', function (done) {

      setImmediate(function () {

        larva.die();
        larva.on('exit', function () {

          done();

        });
      
      });
    
    });
  
  });

  describe('event emitting', function () {

    var larva;

    it('should emit a desired custom event', function (done) {

      var answer = 'grande mocha without milk';

      larva = new Larva({
        args: ['test/lib/customEvent.js'] 
      });

      larva.spawn();
      larva.on('mochaTest', function (msg) {

        msg.should.eql(answer);
        done();
      
      });

    });

    it('should be able to handle long msg', function (done) {

      larva = new Larva({
        args: ['test/lib/longMsg.js'] 
      });

      larva.spawn();
      larva.on('info', function (msg) {

        msg.should.have.lengthOf(500000);
        done();
      
      });
    
    });
  
  });

  describe('heartbeat', function () {

    var larva;

    beforeEach(function () {

      larva = new Larva({
        args: ['test/lib/heartBeat.js'] 
      });

      larva.spawn();

    });

    it('should update heartbeat', function (done) {

      var firstBeat = larva.lastHeartBeat;

      setTimeout(function () {

        var lastHeartBeat = larva.lastHeartBeat;
        lastHeartBeat.should.not.eql(firstBeat);
        done();
      
      }, 200);

    });

    afterEach(function () {

      larva.die();
    
    });
  
  });


});
