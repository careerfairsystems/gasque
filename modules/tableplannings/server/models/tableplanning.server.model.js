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
  tables: [{
    nbrSeats: {
      type: Number,
      default: 0
    }, 
    name: {
      type: String,
      trim: true
    },
    seats: [{
      nbr: Number,
      name: String,
      company: String,
      matched: Number,
      clothing: String,
      id: {
        type: Schema.ObjectId,
        ref: 'Reservation'
      }
    }]
  }],
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
