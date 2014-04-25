var Brood = require('../').Brood;

describe('brood.watch()', function () {

  var brood;

  before(function () {

    brood = new Brood({
      rootPath: 'test/lib',
      timeout: 300,
      lifeDetectInterval: 50
    });

  });

  describe('when a larvar reports in time', function () {

    var larva;

    beforeEach(function () {

      larva = brood.breed('heartBeat');

    });

    it('should not kill it', function (done) {

      setTimeout(function () {

        larva.status.should.equal('spawned');
        done();

      }, 500);

    });

    afterEach(function () {

      larva.die();
    
    });
  
  });

  describe('when a larva is timeout', function () {

    var larva;

    it('should be killed by brood', function (done) {

      larva = brood.breed('silentBoy');
      larva.on('error', function (msg) {

        msg.should.be.Error;
        done();
      
      });

    });

  });

});
