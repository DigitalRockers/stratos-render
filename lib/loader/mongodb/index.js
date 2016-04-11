'use strict';

var mongoose = require('mongoose');

var Template = mongoose.model('Template', new mongoose.Schema({
		html: {type: String},
		text: {type: String},
		stylesheet: {type: String},
		name: {type: String}
	}));
exports.TemplateModel = Template;

exports.load = function (id, callback){
	Template.findById(id, function(err, template){
		if (err) {
			return callback(err);
		}
		if (!template) {
			return callback(new Error({message: 'Template not found'}));
		}

		callback(null, template.html, template.stylesheet, template.text);
	});
};
