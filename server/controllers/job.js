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
            newJob._creator = loggedInUser;
            getLatAndLong(req.body.place_id, function(err, result) {
                newJob.loc = {
                    "type": "Point",
                    "coordinates": [result.longitude, result.latitude]
                };
                newJob.save(function(err, savedJob) {
                    cb(err, savedJob)
                })
            })
        }
    ], function(err, result) {
        if (!err) {
            res.send(result);
        } else {
            res.send({ status: 'fail' });
        }
    });
}

export function apply(req, res, next) {
    const loggedInUser = req.user;
    const { jobId, _id, coverLetter } = req.body;
    async.waterfall([
        function findIfValid(cb) {
            Job.findById(jobId)
                .populate('applications')
                .exec(function(err, jobApplications) {
                    let newApplication = true;
                    const applications = jobApplications.applications;
                    applications.forEach(function(application) {
                        if (application._creator.toString() === loggedInUser) newApplication = false;
                    })
                    cb(null, newApplication, jobApplications);
                })
        },
        function createNewApplication(newJob, job, cb) {
            if (newJob) {
                let newApplication = new Application({
                    coverLetter: coverLetter,
                    _creator: loggedInUser,
                    jobId: jobId
                });
                newApplication.save(function(err, savedApplication) {
                    job.applications.push(savedApplication._id);
                    job.applicants.push(loggedInUser);
                    job.save(function(err, savedJob) {
                        if (!err) {
                            cb(null, savedJob, newJob);
                        }
                    });

                });
            } else cb(null, job)
        }
    ], function(err, job) {
        res.send({ status: 'ok' });
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
                'shortAddress': 1
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
        }
    ], function(err, resultArr) {
        if (!err) {
            res.send({ status: 'ok' });
        } else res.send({ status: 'fail' });

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
                "query": { "loc.type": "Point" }
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

export function getApplicants(req, res, next) {
    const { jobId } = req.query;
    Job.findById(jobId)
        .populate({
            path: 'applications',
            populate: {
                path: '_creator',
                select: { 'title': 1, 'phone': 1, 'fullAddress': 1, '_id': 1, 'imgUrl': 1 }
            }
        })
        .exec(function(err, docs) {
            res.send(docs.applications);
        });
}

export function hire(req, res, next) {
    const { jobId, providerId } = req.body;
    async.parallel([
        function hirePerson(cb) {
            Job.findById(jobId, function(err, job) {
                job.hirees = job.hirees || [];
                if (job.hirees.indexOf(providerId) === -1) {
                    job.hirees.push(providerId);
                }
                job.save(function() {
                    cb();
                });
            });
        }
    ], function(err, resultArr) {
        if (!err) {
            res.send({ status: 'ok' });
        } else res.send({ status: 'fail' });

    });
}

export default { create, apply, get, inviteProviders, addInvitee, findJobsCloseBy, getApplicants, hire }