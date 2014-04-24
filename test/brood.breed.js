var Brood = require('../').Brood;

var brood;

before(function () {
  
  brood = new Brood({
    rootPath: "test/lib" 
  });

});

describe('brood.breed', function () {

  describe('good species', function () {

    it('should put args to child_process', function (done) {

      var larva = brood.breed('sayYourPrayer', ['finalFrontier']);
      larva.on('exit', function (code, signal) {

        code.should.be.ok;
        done();

      });

    });
  
  });

  describe('bad species', function () {

    it('should throw an exception', function () {

      (function () {
        var larva = brood.breed('dunno');
      }).should.throw();
    
    });
  
  });

});

