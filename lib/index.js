'use strict';

/*!
 * Module dependencies.
 */
var async	= require('async');
var path = require('path');
var juice 	= require('juice');
var cons 	= require('consolidate');
var htmlMinify = require('html-minifier').minify;

var diskLoader = require('./loader/disk');
var mongoLoader = require('./loader/mongodb');


function Render () {
  this.options = {
    renderEngine: 'ejs',
  };
}

var allowedType = ['file', 'db'];

Render.prototype._loadTemplate = function (options, callback) {
  if (!options.template) {
    return callback(new Error({message: 'Missing template arguments'}));
  }
  if (!options.template.type) {
		options.template.type = 'file';
  }

	if (allowedType.indexOf(options.template.type) === -1) {
		return callback(new Error({message: 'Wrong template type'}));
  }

	if (options.layout) {
    if (!options.layout.type) {
      options.layout.type = 'file';
    } else if (allowedType.indexOf(options.layout.type) === -1) {
      return callback(new Error({message: 'Wrong layout type'}));
    }
  }


	var templateHtml;
	var templateStylesheet;
	var templateText;

  var afterLayoutCb = function (err, layoutHtml, layoutStylesheet) {
		if (err) {
      return callback(err);
    }

		if (layoutHtml) {
			templateHtml = layoutHtml.replace(/<%-body %>/i, templateHtml);
			if (layoutStylesheet) {
				templateStylesheet = layoutStylesheet + '\n' + templateStylesheet;
      }

			templateHtml = htmlMinify(
        templateHtml,
        {
          removeComments: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true,
        });
			callback(null, templateHtml, templateStylesheet);
		}
	};

	var afterTemplateCb = function (err, html, stylesheet, text) {
    if (err) {
      return callback(err);
    }
		templateHtml = html;
		templateStylesheet = stylesheet;
		templateText = text;

		if (options.layout) {
			if (options.layout.type === 'file') {
				diskLoader.load(path.join(options.layout.dir, options.layout.name), afterLayoutCb);
			} else if (options.layout.type === 'db') {
				mongoLoader.load(options.layout.id, afterLayoutCb);
      }
		} else {
			templateHtml = htmlMinify(
        templateHtml,
        {
          removeComments: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true,
        });
			callback(null, templateHtml, templateStylesheet);
		}
  };

  if (options.template.type === 'file') {
    diskLoader.load(path.join(options.template.dir, options.template.name), afterTemplateCb);
  } else if (options.template.type === 'db') {
    mongoLoader.load(options.template.id, afterTemplateCb);
  }
};


Render.prototype.renderTemplate = function (data, options, callback) {
  var self = this;
	this._loadTemplate(options, function (err, html, stylesheet) {
		if (err) {
      return callback(err);
    }
		data.content = data.content || '';
    var renderEngine = cons[options.renderEngine || self.options.renderEngine];
		renderEngine.render(data.content, data, function (err, content) {
			if (err) {
        return callback(err);
      }
			data.content = content;
			renderEngine.render(html, data, function (err, html) {
        if (err) {
          return callback(err);
        }

				if (stylesheet && stylesheet.length) {
					html = juice.inlineContent(html, stylesheet);
        }

				callback(null, html);
			});
		});
	});
};


Render.prototype.renderTemplateBulk = function (dataArray, options, callbackEach, callbackFinal) {
	if (!callbackFinal) {
    callbackFinal = callbackEach;
		callbackEach = undefined;
	}

  var self = this;
	this._loadTemplate(options, function (err, html, stylesheet) {
		if (err) {
      return callbackFinal(err);
    }

		async.map(
			dataArray,
			function (data, cb) {
        var dataObj = data.data ? data.data : data;

				dataObj.content = dataObj.content || '';
        var renderEngine = cons[options.renderEngine || self.options.renderEngine];
				renderEngine.render(dataObj.content, dataObj, function (err, content) {
					if (err) {
						if (callbackEach) {
							callbackEach(err, data, null, null, cb);
						} else {
							cb(err);
            }
					}

					dataObj.content = content;
					renderEngine.render(html, dataObj, function (err, html, text) {
            if (stylesheet && stylesheet.length) {
							html = juice.inlineContent(html, stylesheet);
            }

						if (callbackEach) {
							callbackEach(err, data, html, text, cb);
						} else {
							cb(err, html);
            }
					});
				});
			}, callbackFinal);
	});
};

module.exports = new Render();
