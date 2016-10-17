'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Banquet Schema
 */
var BanquetSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Banquet name',
    trim: true
  },
  description: String,
  location: String,
  capacity: Number,
  buffer: Number,
  date: {
    type: Date,
    required: 'Please fill Banquet date'
  },
  starttime: {
    type: String,
    required: 'Please fill starttime for Banquet'
  },
  endtime: {
    type: String,
    required: 'Please fill endtime for Banquet'
  },
  tables: [{
    name: String,
    quantity: Number,
    description: String
  }],
  active: {
    type: Boolean,
    required: 'Please fill status of the Banquet',
    default: false
  },
  created: {
    type: Date,
    default: Date.now
  },
  thankyoumail: {
    type: Schema.ObjectId,
    ref: 'Mailtemplate'
  },
  reservmail: {
    type: Schema.ObjectId,
    ref: 'Mailtemplate'
  },
  paymentreceivedmail: {
    type: Schema.ObjectId,
    ref: 'Mailtemplate'
  },
  paymentinformationmail: {
    type: Schema.ObjectId,
    ref: 'Mailtemplate'
  },
  unregisteredmail: {
    type: Schema.ObjectId,
    ref: 'Mailtemplate'
  },
  seatofferedmail: {
    type: Schema.ObjectId,
    ref: 'Mailtemplate'
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Banquet', BanquetSchema);
