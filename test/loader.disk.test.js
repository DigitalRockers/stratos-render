var should = require('should');
var fs = require('fs');
var path = require('path');

var diskLoader = require('../lib/loader/disk');

describe('Disk Loader test', function() {

	it('Read test', function(done) {
    /*diskLoader.load(path.join(__dirname, './templates/test'), function (err, html, stylesheet, text) {
      should.not.exist(err);
      html.should.be.equal(fs.readFileSync(path.join(__dirname, './templates/test/html.ejs'), 'utf8'));
      text.should.be.equal(fs.readFileSync(path.join(__dirname, './templates/test/text.ejs'), 'utf8'));
      stylesheet.should.be.equal(fs.readFileSync(path.join(__dirname, './templates/test/style.css'), 'utf8'));
      done();
    });*/
		done();
	});
});
