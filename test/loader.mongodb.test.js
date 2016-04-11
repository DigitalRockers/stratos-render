var should = require('should');
var fs = require('fs');
var path = require('path');

var mongoLoader = require('../lib/loader/mongodb');
var Model = mongoLoader.TemplateModel;

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/stratos-test');
mongoose.connection.on('error', function (err) {
  console.error('MongoDB connection error: ' + err);
  process.exit(-1);
});
//mongoose.set('debug', true);

describe('MongoDB Loader test', function() {
  var html = fs.readFileSync(path.join(__dirname, './templates/test/html.ejs'), 'utf8');
  var text = fs.readFileSync(path.join(__dirname, './templates/test/text.ejs'), 'utf8');
  var stylesheet = fs.readFileSync(path.join(__dirname, './templates/test/style.css'), 'utf8');
  var template = new Model({
    html: html,
    text: text,
    stylesheet: stylesheet
  });

  before(function(done) {
    Model.remove().exec().then(function() {
      done();
    });
  });

  afterEach(function(done) {
    Model.remove().exec().then(function() {
      done();
    });
  });

  it('should begin with no templates', function(done) {
    Model.find({}, function(err, element) {
      element.should.have.length(0);
      done();
    });
  });

	it('Read test', function(done) {
    template.save(function (err, template) {
      should.not.exist(err);

      mongoLoader.load(template._id, function (err, html, stylesheet, text) {
        should.not.exist(err);
        html.should.be.equal(html);
        stylesheet.should.be.equal(stylesheet);
        text.should.be.equal(text);
        done();
      });
    });
	});
});
