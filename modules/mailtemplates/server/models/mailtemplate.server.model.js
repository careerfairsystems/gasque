'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Mailtemplate Schema
 */
var MailtemplateSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Mailtemplate name',
    trim: true
  },
  subject: {
    type: String,
    default: '',
    trim: true
  },
  content: {
    type: String,
    default: '',
    trim: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Mailtemplate', MailtemplateSchema);
