import path from 'path'
import User from '../models/user';
import Job from '../models/job';
import { getLatAndLong } from '../helpers/geo'
import Application from '../models/application'
import async from 'async';
import messagingService from './../helpers/phoneMessagingService';
import { transport, EmailTemplate, templatesDir } from './../helpers/emailService';
import { sendNotification } from '../helpers/sendNotification'
import moment from 'moment'
import config from '../../config/env/index'

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
                    cb(err, savedJob);
                });
            })
        },
        function sendConfirmationToUser(jobDetails, cb) {
            let template = new EmailTemplate(path.join(templatesDir, 'job-posted-customer'));
            User.findById(loggedInUser, function(err, user) {
                if (user) {
                    let devices = user.devices;
                    devices = devices || [];
                    // register in the list of devices
                    if (devices.length > 0) {
                        // send push notification
                        sendNotification('Your tiffin requirement is live', devices);
                    }
                    let phone = user.phone;
                    req.body.start_date = moment.utc(jobDetails.start_date).format("ddd, MMM Do");
                    req.body.end_date = moment.utc(jobDetails.end_date).format("ddd, MMM Do");
                    req.body.actionUrl = config.homeUrl + "job/" + jobDetails._id + "/invite";
                    template.render(req.body, function(error, results) {
                        if (results && results.html) {
                            let mailOptions = {
                                from: '"Spoon&Spanner 👥"<support@spoonandspanner.com>', // sender address
                                // to: req.body.customerEmailId + ', ' + req.body.providerEmailId, // list of receivers
                                to: user.email,
                                subject: 'Your tiffin requirement is live', // Subject line
                                html: results.html, // html body
                            };
                            transport.sendMail(mailOptions, function(error, info) {});
                            cb(error, jobDetails);
                        } else cb(err, jobDetails);
                    });
                } else cb(err, jobDetails);
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
        function createNewApplication(newApplication, job, cb) {
            if (newApplication) {
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
                            cb(null, JSON.parse(JSON.stringify(savedJob)), newApplication);
                        }
                    });

                });
            } else cb(null, job)
        },
        function emailCustomerAboutNewProposal(jobDetails, newApplication, cb) {
            if (newApplication) {
                let template = new EmailTemplate(path.join(templatesDir, 'job-proposal-customer'));
                User.findById(jobDetails._creator, function(err, user) {
                    if (user) {
                        let devices = user.devices;
                        devices = devices || [];
                        // register in the list of devices
                        if (devices.length > 0) {
                            // send push notification
                            sendNotification('You have been invited to apply', devices);
                        }
                        let phone = user.phone;
                        jobDetails.start_date = moment.utc(jobDetails.start_date).format("ddd, MMM Do");
                        jobDetails.end_date = moment.utc(jobDetails.end_date).format("ddd, MMM Do");
                        jobDetails.providerId = _id;
                        jobDetails.actionUrl = config.homeUrl + "job/" + jobDetails._id + "/proposals";
                        template.render(jobDetails, function(error, results) {
                            if (results && results.html) {
                                let mailOptions = {
                                    from: '"Spoon&Spanner 👥"<support@spoonandspanner.com>', // sender address
                                    to: user.email,
                                    subject: 'New proposal for: ' + jobDetails.title, // Subject line
                                    html: results.html, // html body
                                };
                                transport.sendMail(mailOptions, function(error, info) {});
                                cb(error, jobDetails);
                            } else cb(err, jobDetails);
                        });
                    } else cb(err, jobDetails);
                })
            } else cb();
        }
    ], function(err, job) {
        res.send({ status: 'ok' });
    });
}

export function get(req, res, next) {
    let id = req.params.id;
    const loggedInUser = req.user;
    Job.findById(id, function(err, job) {
        if (job._creator.toString() === loggedInUser) {
            res.send({ job });
        } else res.status(401).send({ message: 'not authorized' });
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
                'description': 1,
                'title': 1,
                'serviceOffered': 1,
                'phone': 1,
                'imgUrl': 1,
                'name': 1,
                'email': 1,
                'fullAddress': 1,
                'serviceOffered': 1,
                'methodsOfPayment': 1
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
    const loggedInUser = req.user;
    async.waterfall([
        function addInviteeToJob(cb) {
            Job.findById(jobId, function(err, job) {
                if (job._creator.toString() === loggedInUser) {
                    job.invitees = job.invitees || [];
                    if (job.invitees.indexOf(providerId) === -1) {
                        job.invitees.push(providerId);
                    }
                    job.save();
                    cb(err, JSON.parse(JSON.stringify(job)));
                } else {
                    cb(new Error('not authorized'));
                }
            });
        },
        function sendInviteToProvider(jobDetails, cb) {
            let template = new EmailTemplate(path.join(templatesDir, 'job-invite-provider'));
            User.findById(providerId, function(err, user) {
                if (user) {
                    let devices = user.devices;
                    devices = devices || [];
                    // register in the list of devices
                    if (devices.length > 0) {
                        // send push notification
                        sendNotification('You have been invited to apply', devices);
                    }
                    let phone = user.phone;
                    jobDetails.start_date = moment.utc(jobDetails.start_date).format("ddd, MMM Do");
                    jobDetails.end_date = moment.utc(jobDetails.end_date).format("ddd, MMM Do");
                    jobDetails.actionUrl = config.homeUrl + "job/apply/board";
                    template.render(jobDetails, function(error, results) {
                        if (results && results.html) {
                            let mailOptions = {
                                from: '"Spoon&Spanner 👥"<support@spoonandspanner.com>', // sender address
                                to: user.email,
                                subject: 'You have been invited to apply', // Subject line
                                html: results.html, // html body
                            };
                            transport.sendMail(mailOptions, function(error, info) {});
                            cb(error, jobDetails);
                        } else cb(err, jobDetails);
                    });
                } else cb(err, jobDetails);
            })
        }
    ], function(err, resultArr) {
        if (!err) {
            res.send({ status: 'ok' });
        } else res.send({ status: 'fail' });

    });
}

export function findJobsCloseBy(req, res, next) {
    const { latitude, longitude } = req.query;
    const loggedInUser = req.user;
    User.findById(loggedInUser, function(err, user) {
        if (user) {
            let longitude = user.loc.coordinates[0];
            let latitude = user.loc.coordinates[1];
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
        } else res.status(401).send({ message: 'not authorized' });
    })

}

export function getApplicants(req, res, next) {
    const { jobId } = req.query;
    const loggedInUser = req.user;
    Job.findById(jobId)
        .populate({
            path: 'applications',
            populate: {
                path: '_creator',
                select: {
                    'distance': 1,
                    'title': 1,
                    'description': 1,

                    'serviceOffered': 1,
                    'phone': 1,
                    'imgUrl': 1,
                    'name': 1,
                    'email': 1,
                    'fullAddress': 1,
                    'serviceOffered': 1,
                    'methodsOfPayment': 1
                }
            }
        })
        .exec(function(err, docs) {
            if (loggedInUser === docs._creator.toString()) {
                res.send(docs.applications);
            } else res.status(401).send({ message: 'not authorized' });

        });
}

export function hire(req, res, next) {
    const { jobId, providerId } = req.body;
    const loggedInUser = req.user;
    async.waterfall([
        function hirePerson(cb) {
            Job.findById(jobId, function(err, job) {
                if (job._creator.toString() === loggedInUser) {
                    job.hirees = job.hirees || [];
                    if (job.hirees.indexOf(providerId) === -1) {
                        job.hirees.push(providerId);
                    }
                    job.save(function(err, savedJob) {
                        cb(err, JSON.parse(JSON.stringify(savedJob)));
                    });
                } else cb(new Error('not authorized'));
            });
        },
        function sendHireEmailToProvider(jobDetails, cb) {
            let template = new EmailTemplate(path.join(templatesDir, 'job-hired-provider'));
            User.findById(loggedInUser, function(err, consumer) {
                if (consumer) {
                    User.findById(providerId, function(err, user) {
                        if (user) {
                            let devices = user.devices;
                            devices = devices || [];
                            // register in the list of devices
                            if (devices.length > 0) {
                                // send push notification
                                sendNotification('You are hired for a tiffin requirement', devices);
                            }
                            let phone = user.phone;
                            if (phone != '') {
                                //messagingService(phone, 'Hired for ' + jobDetails.title, function() {});
                            }
                            jobDetails.start_date = moment.utc(jobDetails.start_date).format("ddd, MMM Do");
                            jobDetails.end_date = moment.utc(jobDetails.end_date).format("ddd, MMM Do");
                            jobDetails.phone = consumer.phone;
                            jobDetails.email = consumer.email;
                            jobDetails.actionUrl = config.homeUrl + "job/apply/board";
                            template.render(jobDetails, function(error, results) {
                                if (results && results.html) {
                                    let mailOptions = {
                                        from: '"Spoon&Spanner 👥"<support@spoonandspanner.com>', // sender address
                                        to: user.email,
                                        subject: 'Hired for ' + jobDetails.title, // Subject line
                                        html: results.html, // html body
                                    };
                                    transport.sendMail(mailOptions, function(error, info) {});
                                    cb(error, jobDetails);
                                } else cb(err, jobDetails);
                            });
                        } else cb(err, jobDetails);
                    })
                } else cb();
            })

        }
    ], function(err, resultArr) {
        if (!err) {
            res.send({ status: 'ok' });
        } else res.send({ status: 'fail' });

    });
}
export function getHiredProviders(req, res, next) {
    const { jobId } = req.query;
    const loggedInUser = req.user;
    Job.findById(jobId)
        .populate({
            path: 'hirees',
            select: {
                'distance': 1,
                'title': 1,
                'description': 1,
                'serviceOffered': 1,
                'phone': 1,
                'imgUrl': 1,
                'name': 1,
                'email': 1,
                'fullAddress': 1,
                'serviceOffered': 1,
                'methodsOfPayment': 1
            }

        })
        .exec(function(err, docs) {
            if (loggedInUser === docs._creator.toString()) {
                res.send(docs.hirees);
            } else res.status(401).send({ message: 'not authorized' });

        });
}

export function list(req, res, next) {
    const loggedInUser = req.user;
    Job.find({ _creator: loggedInUser })
        .exec(function(err, docs) {
            res.send(docs);
        });
}



export default { create, apply, get, inviteProviders, addInvitee, findJobsCloseBy, getApplicants, hire, getHiredProviders, list }