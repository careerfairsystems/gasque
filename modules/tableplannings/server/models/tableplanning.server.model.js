'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Tableplanning Schema
 */
var TableplanningSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Tableplanning name',
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

mongoose.model('Tableplanning', TableplanningSchema);
