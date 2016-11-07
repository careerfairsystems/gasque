'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Tableplanning = mongoose.model('Tableplanning'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, tableplanning;

/**
 * Tableplanning routes tests
 */
describe('Tableplanning CRUD tests', function () {

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

    // Save a user to the test db and create new Tableplanning
    user.save(function () {
      tableplanning = {
        name: 'Tableplanning name'
      };

      done();
    });
  });

  it('should be able to save a Tableplanning if logged in', function (done) {
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

        // Save a new Tableplanning
        agent.post('/api/tableplannings')
          .send(tableplanning)
          .expect(200)
          .end(function (tableplanningSaveErr, tableplanningSaveRes) {
            // Handle Tableplanning save error
            if (tableplanningSaveErr) {
              return done(tableplanningSaveErr);
            }

            // Get a list of Tableplannings
            agent.get('/api/tableplannings')
              .end(function (tableplanningsGetErr, tableplanningsGetRes) {
                // Handle Tableplanning save error
                if (tableplanningsGetErr) {
                  return done(tableplanningsGetErr);
                }

                // Get Tableplannings list
                var tableplannings = tableplanningsGetRes.body;

                // Set assertions
                (tableplannings[0].user._id).should.equal(userId);
                (tableplannings[0].name).should.match('Tableplanning name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Tableplanning if not logged in', function (done) {
    agent.post('/api/tableplannings')
      .send(tableplanning)
      .expect(403)
      .end(function (tableplanningSaveErr, tableplanningSaveRes) {
        // Call the assertion callback
        done(tableplanningSaveErr);
      });
  });

  it('should not be able to save an Tableplanning if no name is provided', function (done) {
    // Invalidate name field
    tableplanning.name = '';

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

        // Save a new Tableplanning
        agent.post('/api/tableplannings')
          .send(tableplanning)
          .expect(400)
          .end(function (tableplanningSaveErr, tableplanningSaveRes) {
            // Set message assertion
            (tableplanningSaveRes.body.message).should.match('Please fill Tableplanning name');

            // Handle Tableplanning save error
            done(tableplanningSaveErr);
          });
      });
  });

  it('should be able to update an Tableplanning if signed in', function (done) {
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

        // Save a new Tableplanning
        agent.post('/api/tableplannings')
          .send(tableplanning)
          .expect(200)
          .end(function (tableplanningSaveErr, tableplanningSaveRes) {
            // Handle Tableplanning save error
            if (tableplanningSaveErr) {
              return done(tableplanningSaveErr);
            }

            // Update Tableplanning name
            tableplanning.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Tableplanning
            agent.put('/api/tableplannings/' + tableplanningSaveRes.body._id)
              .send(tableplanning)
              .expect(200)
              .end(function (tableplanningUpdateErr, tableplanningUpdateRes) {
                // Handle Tableplanning update error
                if (tableplanningUpdateErr) {
                  return done(tableplanningUpdateErr);
                }

                // Set assertions
                (tableplanningUpdateRes.body._id).should.equal(tableplanningSaveRes.body._id);
                (tableplanningUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Tableplannings if not signed in', function (done) {
    // Create new Tableplanning model instance
    var tableplanningObj = new Tableplanning(tableplanning);

    // Save the tableplanning
    tableplanningObj.save(function () {
      // Request Tableplannings
      request(app).get('/api/tableplannings')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Tableplanning if not signed in', function (done) {
    // Create new Tableplanning model instance
    var tableplanningObj = new Tableplanning(tableplanning);

    // Save the Tableplanning
    tableplanningObj.save(function () {
      request(app).get('/api/tableplannings/' + tableplanningObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', tableplanning.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Tableplanning with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/tableplannings/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Tableplanning is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Tableplanning which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Tableplanning
    request(app).get('/api/tableplannings/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Tableplanning with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Tableplanning if signed in', function (done) {
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

        // Save a new Tableplanning
        agent.post('/api/tableplannings')
          .send(tableplanning)
          .expect(200)
          .end(function (tableplanningSaveErr, tableplanningSaveRes) {
            // Handle Tableplanning save error
            if (tableplanningSaveErr) {
              return done(tableplanningSaveErr);
            }

            // Delete an existing Tableplanning
            agent.delete('/api/tableplannings/' + tableplanningSaveRes.body._id)
              .send(tableplanning)
              .expect(200)
              .end(function (tableplanningDeleteErr, tableplanningDeleteRes) {
                // Handle tableplanning error error
                if (tableplanningDeleteErr) {
                  return done(tableplanningDeleteErr);
                }

                // Set assertions
                (tableplanningDeleteRes.body._id).should.equal(tableplanningSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Tableplanning if not signed in', function (done) {
    // Set Tableplanning user
    tableplanning.user = user;

    // Create new Tableplanning model instance
    var tableplanningObj = new Tableplanning(tableplanning);

    // Save the Tableplanning
    tableplanningObj.save(function () {
      // Try deleting Tableplanning
      request(app).delete('/api/tableplannings/' + tableplanningObj._id)
        .expect(403)
        .end(function (tableplanningDeleteErr, tableplanningDeleteRes) {
          // Set message assertion
          (tableplanningDeleteRes.body.message).should.match('User is not authorized');

          // Handle Tableplanning error error
          done(tableplanningDeleteErr);
        });

    });
  });

  it('should be able to get a single Tableplanning that has an orphaned user reference', function (done) {
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

          // Save a new Tableplanning
          agent.post('/api/tableplannings')
            .send(tableplanning)
            .expect(200)
            .end(function (tableplanningSaveErr, tableplanningSaveRes) {
              // Handle Tableplanning save error
              if (tableplanningSaveErr) {
                return done(tableplanningSaveErr);
              }

              // Set assertions on new Tableplanning
              (tableplanningSaveRes.body.name).should.equal(tableplanning.name);
              should.exist(tableplanningSaveRes.body.user);
              should.equal(tableplanningSaveRes.body.user._id, orphanId);

              // force the Tableplanning to have an orphaned user reference
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

                    // Get the Tableplanning
                    agent.get('/api/tableplannings/' + tableplanningSaveRes.body._id)
                      .expect(200)
                      .end(function (tableplanningInfoErr, tableplanningInfoRes) {
                        // Handle Tableplanning error
                        if (tableplanningInfoErr) {
                          return done(tableplanningInfoErr);
                        }

                        // Set assertions
                        (tableplanningInfoRes.body._id).should.equal(tableplanningSaveRes.body._id);
                        (tableplanningInfoRes.body.name).should.equal(tableplanning.name);
                        should.equal(tableplanningInfoRes.body.user, undefined);

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
      Tableplanning.remove().exec(done);
    });
  });
});
