var Brood = require('../').Brood;

describe('Brood constructor', function () {

  describe('when everything are not given', function () {

    var oldPath;

    beforeEach(function () {

      oldPath = process.cwd();
      process.chdir('test/lib/defaultBlueprint');
      this.brood = new Brood();
    
    });

    it('should be fine', function () {

      this.brood.should.be.ok;
    
    });

    it('should load the blueprint in cwd', function () {

      this.brood.rootPath.should.eql(process.cwd());

    });

    it('should import the species', function () {

      this.brood.library['foobar'].should.be.ok;

    });

    it('should set all the default value', function () {

      this.brood.timeout.should.equal(60000);
      this.brood.lifeDetectInterval.should.equal(5000);
    
    });

    afterEach(function () {

      process.chdir(oldPath);
    
    });
  
  });

  describe('when a bad blueprint.json is given', function () {

    it('should blame it', function () {

      (function () {
        var brood = new Brood({
          rootPath: "test/lib/badBlueprint"   
        });
      }).should.throw();
    
    });

  });

  describe('when a good blueprint.json is given', function () {

    beforeEach(function () {

      this.brood = new Brood({
        rootPath: "test/lib"
      });
    
    });

    it('should build it correctly', function () {

      this.brood.timeout.should.equal(1000);
      this.brood.lifeDetectInterval.should.equal(1000);
      this.brood.rootPath.should.be.ok;
    
    });

  });

});
