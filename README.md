# Express & mongoose REST API in ES6 

## Overview

This is a REST APIs in Node.js for spoonandspanner using ES6 and Express. Follows [Airbnb's Javascript style guide](https://github.com/airbnb/javascript).

## Getting Started

Clone the repo:

Install dependencies:
```sh
npm install
```

Start server:
```sh
# set DEBUG env variable to get debug logs
DEBUG=express-mongoose-es6-rest-api:* npm start
# OR
# requires gulp to be installed globally
npm i -g gulp
gulp serve
```

Execute tests:
```sh
# compile with babel and run tests
npm test (or gulp mocha)

# use --code-coverage-reporter text to get code coverage for each file
gulp mocha --code-coverage-reporter text
```

Other gulp tasks:
```sh
# Wipe out dist and coverage directory
gulp clean

# Lint code with ESLint
gulp lint

# Default task: Wipes out dist and coverage directory. Compiles using babel.
gulp
```

##### Commit:

Follows [AngularJS's commit message convention](https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md#-git-commit-guidelines)
```sh
# Lint and execute tests before committing code.
npm run commit
# OR
# use git commit directly with correct message convention.
git commit -m "chore(ghooks): Add pre-commit and commit-msg ghook"
```

##### Deployment

```sh
# compile to ES5
1. npm build or gulp

# upload dist/ to your server
2. scp -rp dist/ user@dest:/path

# install production dependencies only
3. npm i --production

# Use any process manager to start your services
4. pm2 start index.js
```

In production you need to make sure your server is always up so you should ideally use any of the process manager recommended [here](http://expressjs.com/en/advanced/pm.html).
We recommend [pm2](http://pm2.keymetrics.io/) as it has several useful features like it can be configured to auto-start your services if system is rebooted.

## Logging

Universal logging library [winston](https://www.npmjs.com/package/winston) is used for logging. It has support for multiple transports.  A transport is essentially a storage device for your logs. Each instance of a winston logger can have multiple transports configured at different levels. For example, one may want error logs to be stored in a persistent remote location (like a database), but all logs output to the console or a local file. We just log to the console for simplicity, you can configure more transports as per your requirement.

#### API logging
Logs detailed info about each api request to console during development.
![Detailed API logging](https://cloud.githubusercontent.com/assets/4172932/12563354/f0a4b558-c3cf-11e5-9d8c-66f7ca323eac.JPG)

#### Error logging
Logs stacktrace of error to console along with other details. You should ideally store all error messages persistently.
![Error logging](https://cloud.githubusercontent.com/assets/4172932/12563361/fb9ef108-c3cf-11e5-9a58-3c5c4936ae3e.JPG)

## Code Coverage
Get code coverage summary on executing `npm test`
![Code Coverage Text Summary](https://cloud.githubusercontent.com/assets/4172932/12827832/a0531e70-cba7-11e5-9b7c-9e7f833d8f9f.JPG)

`npm test` also generates HTML code coverage report in `coverage/` directory. Open `lcov-report/index.html` to view it.
![Code coverage HTML report](https://cloud.githubusercontent.com/assets/4172932/12625331/571a48fe-c559-11e5-8aa0-f9aacfb8c1cb.jpg)

