#!/usr/bin/env node
/**
 * Description : This is the command line interface for running the lrs conformance test suite.
 *
 */
(function (process, require, program, exit, packageJson, Q, Joi, fs, path, Mocha) {
    'use strict';

    var DIRECTORY = "OptionA";//'v1_0_3';//'v1_0_2';

    program
        .version(packageJson.version)
        .usage('[options]')
        .option('-d, --directory [path]', 'test directory, default: ' + DIRECTORY)
        .option('-e, --endpoint <path>', 'the connection string')
        .option('-a, --basicAuth <true/false>', 'enables basic authentication')
        .option('-u, --authUser <username>', 'sets user name (required when basic authentication enabled)')
        .option('-p, --authPass <password>', 'sets password (required when basic authentication enabled)')
        .option('-R, --reporter <name>', 'specify the reporter to use')
        .option('-g, --grep <pattern>', 'only run tests matching <pattern>')
        .option('-b, --bail', 'bail after first test failure')
        .parse(process.argv);

    var deferred = Q.defer(),
        optionsValidator = Joi.object({
            directory: Joi.string(),
            /* See [RFC-3986](http://tools.ietf.org/html/rfc3986#page-17) */
            endpoint: Joi.string().regex(/^[a-zA-Z][a-zA-Z0-9+\.-]*:.+/, 'URI').required(),
            basicAuth: Joi.any(true, false),
            authUser: Joi.string().when('basicAuth', { is: 'true', then: Joi.required() }),
            authPass: Joi.string().when('basicAuth', { is: 'true', then: Joi.required() }),
            reporter: Joi.string().regex(/^((dot)|(spec)|(nyan)|(tap)|(List)|(progress)|(min)|(doc))$/).default('nyan'),
            grep: Joi.string()
        }).unknown(false);

    process.nextTick(function () {
        var options = {
                directory: program.directory || DIRECTORY,
                endpoint: program.endpoint,
                basicAuth: program.basicAuth,
                authUser: program.authUser,
                authPass: program.authPass,
                reporter: program.reporter,
                grep: program.grep
            },
            validOptions = Joi.validate(options, optionsValidator);

        if (validOptions.error) {
            deferred.reject(validOptions.error);
        } else {
            var mocha = new Mocha({
                uii: 'bdd',
                reporter: program.reporter,
                timeout: '15000',
                grep: program.grep,
                bail: program.bail
            });

            process.env.LRS_ENDPOINT = options.endpoint;
            process.env.BASIC_AUTH_ENABLED = options.basicAuth;
            process.env.BASIC_AUTH_USER = options.authUser;
            process.env.BASIC_AUTH_PASSWORD = options.authPass;
            var testDirectory = 'test/' + options.directory;
            fs.readdirSync(testDirectory).filter(function (file) {
                return file.substr(-3) === '.js';
            }).forEach(function (file) {
                mocha.addFile(
                    path.join(testDirectory, file)
                );
            });
            mocha.run(function (failures) {
                if (failures) {
                    deferred.reject(failures);
                } else {
                    deferred.resolve();
                }
            });
        }
    });

    deferred.promise.then(function () {
        console.log('Done!');
        exit(0);
    }, function (err) {
        console.log('Failed tests: ' + err);
        exit(1);
    });

}(process, require, require('commander'), require('exit'), require('../package.json'), require('q'), require('joi'), require('fs'), require('path'), require('mocha')));
