var should = require('should');
var path = require('path');

var render = require('../lib/index');

describe('Render', function() {

  it('should throw error "wrong type"', function(done) {
    var data = {
      name: 'John'
    };
    var templateOptions = {
      template: {
        type: 'memory',
        name: 'test'
      },
      renderEngine: 'ejs'
    };
    render.renderTemplate(data, templateOptions, function (err) {
      should.exist(err);
      done();
    });
  });

  it('should throw error "file not found"', function(done) {
    var data = {
      name: 'John'
    };
    var templateOptions = {
      template: {
        type: 'file',
        dir: path.join(__dirname, './templates/'),
        name: 'fileNotFound'
      },
      renderEngine: 'ejs'
    };
    render.renderTemplate(data, templateOptions, function (err) {
      should.exist(err);
      done();
    });
  });

  it('should throw error "missing arguments"', function(done) {
    var data = {
      name: 'John'
    };
    var templateOptions = {
      renderEngine: 'ejs'
    };
    render.renderTemplate(data, templateOptions, function (err) {
      should.exist(err);
      done();
    });
  });

  it('renderTemplate without layout', function(done) {
    var data = {
      name: 'John'
    };
    var templateOptions = {
      template: {
        type: 'file',
        dir: path.join(__dirname, './templates/'),
        name: 'test'
      },
      renderEngine: 'ejs'
    };
    render.renderTemplate(data, templateOptions, function (err, html) {
      should.not.exist(err);
      var rendered = '<h1 style="color: green;">Test Title</h1><p style="font-style: italic;">Hi John!</p>';
      html.should.be.equal(rendered);
      done();
    });
	});

	it('renderTemplate with template', function(done) {
    var data = {
      name: 'John'
    };
    var templateOptions = {
      layout: {
        type: 'file',
        dir: path.join(__dirname, './templates/'),
        name: 'layout',
      },
      template: {
        type: 'file',
        dir: path.join(__dirname, './templates/'),
        name: 'test'
      },
      renderEngine: 'ejs'
    };
    render.renderTemplate(data, templateOptions, function (err, html) {
      should.not.exist(err);
      var rendered = '<table class="body-wrap"><tr><td class="container" style="width: 600px;"><table class="content" style="width: 100%;"><tr><td class="title" style="font-weight: bold;">Layout Title</td></tr><tr><td><h1 style="color: green;">Test Title</h1><p style="font-style: italic;">Hi John!</p></td></tr></table></td></tr></table>';
      html.should.be.equal(rendered);
      done();
    });
	});
});
