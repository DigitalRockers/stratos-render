var fs = require('fs');
var path = require('path');
var glob = require('glob');
var async = require('async');

var readFile = function (templatePath, pattern, callback) {
	glob(templatePath + pattern, function (err, htmlFiles) {
		if (err) {

			console.log(templatePath + pattern)
			return callback(err);
		}
		if (!htmlFiles || !htmlFiles.length) {
			return callback(new Error('Template file not found'));
		}

		fs.readFile(htmlFiles[0], 'utf8', function(err, data) {
			if (err) {
				return callback(err);
			}
			if (data === '') {
				return callback(new Error('Empty template file "' + htmlFiles[0] + '"'));
			} else {
				callback(null, data);
			}
		});
	});
};

exports.load = function (templatePath, callback) {
	fs.stat(templatePath, function (err, stats) {
		if (err) {
			return callback(err);
		}
		if (!stats.isDirectory()) {
			return callback(new Error('Invalid template path "' + path + '"'));
		}

		var html = '';
		var text = '';
		var stylesheet = '';;
		async.parallel(
			[
				function (cb){
					readFile(templatePath, '/*html.*', function (err, htmlFile) {
						if (err) {
							return cb(err);
						}
						html = htmlFile;
						cb();
					});
				},
				function (cb){
					readFile(templatePath, '/*text.*', function (err, textFile) {
						if (err) {
							return cb();
						}
						text = textFile;
						cb();
					});
				},
				function (cb){
					readFile(templatePath, '/*style.css', function (err, stylesheetFile) {
						if (err) {
							return cb();
						}
						stylesheet = stylesheetFile;
						cb();
					});
				}
			],
			function (err){
				callback(err, html, stylesheet, text);
			});
	});
};
