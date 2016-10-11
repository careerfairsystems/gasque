'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Banquet = mongoose.model('Banquet'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, banquet;

/**
 * Banquet routes tests
 */
describe('Banquet CRUD tests', function () {

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

    // Save a user to the test db and create new Banquet
    user.save(function () {
      banquet = {
        name: 'Banquet name'
      };

      done();
    });
  });

  it('should be able to save a Banquet if logged in', function (done) {
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

        // Save a new Banquet
        agent.post('/api/banquets')
          .send(banquet)
          .expect(200)
          .end(function (banquetSaveErr, banquetSaveRes) {
            // Handle Banquet save error
            if (banquetSaveErr) {
              return done(banquetSaveErr);
            }

            // Get a list of Banquets
            agent.get('/api/banquets')
              .end(function (banquetsGetErr, banquetsGetRes) {
                // Handle Banquet save error
                if (banquetsGetErr) {
                  return done(banquetsGetErr);
                }

                // Get Banquets list
                var banquets = banquetsGetRes.body;

                // Set assertions
                (banquets[0].user._id).should.equal(userId);
                (banquets[0].name).should.match('Banquet name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Banquet if not logged in', function (done) {
    agent.post('/api/banquets')
      .send(banquet)
      .expect(403)
      .end(function (banquetSaveErr, banquetSaveRes) {
        // Call the assertion callback
        done(banquetSaveErr);
      });
  });

  it('should not be able to save an Banquet if no name is provided', function (done) {
    // Invalidate name field
    banquet.name = '';

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

        // Save a new Banquet
        agent.post('/api/banquets')
          .send(banquet)
          .expect(400)
          .end(function (banquetSaveErr, banquetSaveRes) {
            // Set message assertion
            (banquetSaveRes.body.message).should.match('Please fill Banquet name');

            // Handle Banquet save error
            done(banquetSaveErr);
          });
      });
  });

  it('should be able to update an Banquet if signed in', function (done) {
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

        // Save a new Banquet
        agent.post('/api/banquets')
          .send(banquet)
          .expect(200)
          .end(function (banquetSaveErr, banquetSaveRes) {
            // Handle Banquet save error
            if (banquetSaveErr) {
              return done(banquetSaveErr);
            }

            // Update Banquet name
            banquet.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Banquet
            agent.put('/api/banquets/' + banquetSaveRes.body._id)
              .send(banquet)
              .expect(200)
              .end(function (banquetUpdateErr, banquetUpdateRes) {
                // Handle Banquet update error
                if (banquetUpdateErr) {
                  return done(banquetUpdateErr);
                }

                // Set assertions
                (banquetUpdateRes.body._id).should.equal(banquetSaveRes.body._id);
                (banquetUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Banquets if not signed in', function (done) {
    // Create new Banquet model instance
    var banquetObj = new Banquet(banquet);

    // Save the banquet
    banquetObj.save(function () {
      // Request Banquets
      request(app).get('/api/banquets')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Banquet if not signed in', function (done) {
    // Create new Banquet model instance
    var banquetObj = new Banquet(banquet);

    // Save the Banquet
    banquetObj.save(function () {
      request(app).get('/api/banquets/' + banquetObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', banquet.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Banquet with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/banquets/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Banquet is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Banquet which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Banquet
    request(app).get('/api/banquets/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Banquet with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Banquet if signed in', function (done) {
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

        // Save a new Banquet
        agent.post('/api/banquets')
          .send(banquet)
          .expect(200)
          .end(function (banquetSaveErr, banquetSaveRes) {
            // Handle Banquet save error
            if (banquetSaveErr) {
              return done(banquetSaveErr);
            }

            // Delete an existing Banquet
            agent.delete('/api/banquets/' + banquetSaveRes.body._id)
              .send(banquet)
              .expect(200)
              .end(function (banquetDeleteErr, banquetDeleteRes) {
                // Handle banquet error error
                if (banquetDeleteErr) {
                  return done(banquetDeleteErr);
                }

                // Set assertions
                (banquetDeleteRes.body._id).should.equal(banquetSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Banquet if not signed in', function (done) {
    // Set Banquet user
    banquet.user = user;

    // Create new Banquet model instance
    var banquetObj = new Banquet(banquet);

    // Save the Banquet
    banquetObj.save(function () {
      // Try deleting Banquet
      request(app).delete('/api/banquets/' + banquetObj._id)
        .expect(403)
        .end(function (banquetDeleteErr, banquetDeleteRes) {
          // Set message assertion
          (banquetDeleteRes.body.message).should.match('User is not authorized');

          // Handle Banquet error error
          done(banquetDeleteErr);
        });

    });
  });

  it('should be able to get a single Banquet that has an orphaned user reference', function (done) {
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

          // Save a new Banquet
          agent.post('/api/banquets')
            .send(banquet)
            .expect(200)
            .end(function (banquetSaveErr, banquetSaveRes) {
              // Handle Banquet save error
              if (banquetSaveErr) {
                return done(banquetSaveErr);
              }

              // Set assertions on new Banquet
              (banquetSaveRes.body.name).should.equal(banquet.name);
              should.exist(banquetSaveRes.body.user);
              should.equal(banquetSaveRes.body.user._id, orphanId);

              // force the Banquet to have an orphaned user reference
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

                    // Get the Banquet
                    agent.get('/api/banquets/' + banquetSaveRes.body._id)
                      .expect(200)
                      .end(function (banquetInfoErr, banquetInfoRes) {
                        // Handle Banquet error
                        if (banquetInfoErr) {
                          return done(banquetInfoErr);
                        }

                        // Set assertions
                        (banquetInfoRes.body._id).should.equal(banquetSaveRes.body._id);
                        (banquetInfoRes.body.name).should.equal(banquet.name);
                        should.equal(banquetInfoRes.body.user, undefined);

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
      Banquet.remove().exec(done);
    });
  });
});
