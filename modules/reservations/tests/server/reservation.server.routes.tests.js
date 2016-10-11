'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Reservation = mongoose.model('Reservation'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, reservation;

/**
 * Reservation routes tests
 */
describe('Reservation CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new Reservation
    user.save(function () {
      reservation = {
        name: 'Reservation name'
      };

      done();
    });
  });

  it('should be able to save a Reservation if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Reservation
        agent.post('/api/reservations')
          .send(reservation)
          .expect(200)
          .end(function (reservationSaveErr, reservationSaveRes) {
            // Handle Reservation save error
            if (reservationSaveErr) {
              return done(reservationSaveErr);
            }

            // Get a list of Reservations
            agent.get('/api/reservations')
              .end(function (reservationsGetErr, reservationsGetRes) {
                // Handle Reservation save error
                if (reservationsGetErr) {
                  return done(reservationsGetErr);
                }

                // Get Reservations list
                var reservations = reservationsGetRes.body;

                // Set assertions
                (reservations[0].user._id).should.equal(userId);
                (reservations[0].name).should.match('Reservation name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Reservation if not logged in', function (done) {
    agent.post('/api/reservations')
      .send(reservation)
      .expect(403)
      .end(function (reservationSaveErr, reservationSaveRes) {
        // Call the assertion callback
        done(reservationSaveErr);
      });
  });

  it('should not be able to save an Reservation if no name is provided', function (done) {
    // Invalidate name field
    reservation.name = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Reservation
        agent.post('/api/reservations')
          .send(reservation)
          .expect(400)
          .end(function (reservationSaveErr, reservationSaveRes) {
            // Set message assertion
            (reservationSaveRes.body.message).should.match('Please fill Reservation name');

            // Handle Reservation save error
            done(reservationSaveErr);
          });
      });
  });

  it('should be able to update an Reservation if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Reservation
        agent.post('/api/reservations')
          .send(reservation)
          .expect(200)
          .end(function (reservationSaveErr, reservationSaveRes) {
            // Handle Reservation save error
            if (reservationSaveErr) {
              return done(reservationSaveErr);
            }

            // Update Reservation name
            reservation.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Reservation
            agent.put('/api/reservations/' + reservationSaveRes.body._id)
              .send(reservation)
              .expect(200)
              .end(function (reservationUpdateErr, reservationUpdateRes) {
                // Handle Reservation update error
                if (reservationUpdateErr) {
                  return done(reservationUpdateErr);
                }

                // Set assertions
                (reservationUpdateRes.body._id).should.equal(reservationSaveRes.body._id);
                (reservationUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Reservations if not signed in', function (done) {
    // Create new Reservation model instance
    var reservationObj = new Reservation(reservation);

    // Save the reservation
    reservationObj.save(function () {
      // Request Reservations
      request(app).get('/api/reservations')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Reservation if not signed in', function (done) {
    // Create new Reservation model instance
    var reservationObj = new Reservation(reservation);

    // Save the Reservation
    reservationObj.save(function () {
      request(app).get('/api/reservations/' + reservationObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', reservation.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Reservation with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/reservations/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Reservation is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Reservation which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Reservation
    request(app).get('/api/reservations/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Reservation with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Reservation if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Reservation
        agent.post('/api/reservations')
          .send(reservation)
          .expect(200)
          .end(function (reservationSaveErr, reservationSaveRes) {
            // Handle Reservation save error
            if (reservationSaveErr) {
              return done(reservationSaveErr);
            }

            // Delete an existing Reservation
            agent.delete('/api/reservations/' + reservationSaveRes.body._id)
              .send(reservation)
              .expect(200)
              .end(function (reservationDeleteErr, reservationDeleteRes) {
                // Handle reservation error error
                if (reservationDeleteErr) {
                  return done(reservationDeleteErr);
                }

                // Set assertions
                (reservationDeleteRes.body._id).should.equal(reservationSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Reservation if not signed in', function (done) {
    // Set Reservation user
    reservation.user = user;

    // Create new Reservation model instance
    var reservationObj = new Reservation(reservation);

    // Save the Reservation
    reservationObj.save(function () {
      // Try deleting Reservation
      request(app).delete('/api/reservations/' + reservationObj._id)
        .expect(403)
        .end(function (reservationDeleteErr, reservationDeleteRes) {
          // Set message assertion
          (reservationDeleteRes.body.message).should.match('User is not authorized');

          // Handle Reservation error error
          done(reservationDeleteErr);
        });

    });
  });

  it('should be able to get a single Reservation that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      username: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new Reservation
          agent.post('/api/reservations')
            .send(reservation)
            .expect(200)
            .end(function (reservationSaveErr, reservationSaveRes) {
              // Handle Reservation save error
              if (reservationSaveErr) {
                return done(reservationSaveErr);
              }

              // Set assertions on new Reservation
              (reservationSaveRes.body.name).should.equal(reservation.name);
              should.exist(reservationSaveRes.body.user);
              should.equal(reservationSaveRes.body.user._id, orphanId);

              // force the Reservation to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the Reservation
                    agent.get('/api/reservations/' + reservationSaveRes.body._id)
                      .expect(200)
                      .end(function (reservationInfoErr, reservationInfoRes) {
                        // Handle Reservation error
                        if (reservationInfoErr) {
                          return done(reservationInfoErr);
                        }

                        // Set assertions
                        (reservationInfoRes.body._id).should.equal(reservationSaveRes.body._id);
                        (reservationInfoRes.body.name).should.equal(reservation.name);
                        should.equal(reservationInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Reservation.remove().exec(done);
    });
  });
});
