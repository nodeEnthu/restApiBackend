import path from 'path'
import User from '../models/user';
import Job from '../models/job';
import { getLatAndLong } from '../helpers/geo'
import Application from '../models/application'
import async from 'async';
import messagingService from './../helpers/phoneMessagingService';
import { transport, EmailTemplate, templatesDir } from './../helpers/emailService';

export function create(req, res, next) {
    const loggedInUser = req.user;

    async.waterfall([
        function createJob(cb) {
            let newJob = new Job(req.body);
            getLatAndLong(req.body.place_id, function(err, result) {
                newJob.loc = {
                    "type": "Point",
                    "coordinates": [result.longitude, result.latitude]
                };
                newJob.save(function(err, savedJob) {
                    cb(err, savedJob)
                })
            })
        },
        function(savedJob, cb) {
            User.findById(loggedInUser, function(err, user) {
                user.jobs.push(savedJob._id);
                user.save();
            })
            cb(null, savedJob);
        }
    ], function(err, result) {
        res.send({ result });
    });
}

export function apply(req, res, next) {
    const loggedInUser = req.user;
    const userResponse = req.body
    const jobId = userResponse.jobId;
    let newApplication = new Application({
        coverLetter: userResponse.coverLetter,
        _creator: loggedInUser
    });
    newApplication.save(function(err, savedApplication) {
        Job.findById(jobId, function(err, job) {
            job.applications.push(savedApplication._id);
            job.save(function(err, savedJob) {
                if (!err) {
                    res.send({ savedJob });
                }
            });
        });
    });
}

export function get(req, res, next) {
    let id = req.params.id;
    Job.findById(id, function(err, job) {
        res.send({ job });
    });
}

export function inviteProviders(req, res, next) {
    const { latitude, longitude } = req.query;
    User.aggregate(
        [{
            "$geoNear": {
                "near": {
                    "type": "Point",
                    "coordinates": [parseFloat(longitude), parseFloat(latitude)]
                },
                "distanceField": "distance",
                "maxDistance": 10000,
                "spherical": true,
                "distanceMultiplier": 0.001,
                "query": { "loc.type": "Point", published: true, userType: "provider" }
            }
        }, {
            $project: {
                'distance': 1,
                'title': 1,
                'serviceOffered': 1,
                'phone': 1,
                'imgUrl': 1,
                'name': 1,
                'email': 1,
                'shortAddress': 1,
                'jobInvites': 1
            }
        }, {
            "$sort": { "distance": 1 }
        }],
        function(err, results) {
            res.send({ results });
        }
    )
}

export function addInvitee(req, res, next) {
    const { jobId, providerId } = req.body;
    async.parallel([
        function addInviteeToJob(cb) {
            Job.findById(jobId, function(err, job) {
                job.invitees = job.invitees || [];
                if (job.invitees.indexOf(providerId) === -1) {
                    job.invitees.push(providerId);
                }
                job.save();
                cb();
            });
        },
        function saveiNProvidersDb(cb) {
            User.findById(providerId, function(err, user) {
                user.jobInvites = user.jobInvites || [];
                if (user.jobInvites.indexOf(jobId) === -1) {
                    user.jobInvites.push(jobId);
                }
                user.save();
                cb();
            })
        }
    ], function(err, resultArr) {
        res.send({ status: 'ok' });
    });
}

export function findJobsCloseBy(req, res, next) {
    const { latitude, longitude } = req.query;
    Job.aggregate(
        [{
            "$geoNear": {
                "near": {
                    "type": "Point",
                    "coordinates": [parseFloat(longitude), parseFloat(latitude)]
                },
                "distanceField": "distance",
                "maxDistance": 10000,
                "spherical": true,
                "distanceMultiplier": 0.001,
                "query": { "loc.type": "Point"}
            }
        }, {
            "$sort": { "distance": 1 }
        }, {
            "$limit": 12
        }],
        function(err, results) {
            res.send({ results });
        }
    )
}

export default { create, apply, get, inviteProviders, addInvitee, findJobsCloseBy }