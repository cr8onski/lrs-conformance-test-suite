/**
 * Description : This is a test suite that tests an LRS endpoint based on the testing requirements document
 * found at https://github.com/adlnet/xapi-lrs-conformance-requirements
 */

(function (module, fs, extend, moment, request, requestPromise, chai, liburl, Joi, helper, multipartParser, redirect) {
    // "use strict";

    var expect = chai.expect;
    if(global.OAUTH)
        request = helper.OAuthRequest(request);

describe('Activities Resource Requirements (Communication 2.5)', () => {

/**
 * XAPI-00250 - below
 * XAPI-00251 - below
 * XAPI-00252 - below
 * XAPI-00253 - below
 * XAPI-00254 - below
 */

/**  XAPI-00252, Communication 2.5 Activities Resource
 * An LRS has an Activities API with endpoint "base IRI" + /activities" (7.5) Implicit (in that it is not named this by the spec)
 */
    it('An LRS has an Activities Resource with endpoint "base IRI" + /activities" (Communication 2.5, XAPI-00252', function () {
        var templates = [
            {statement: '{{statements.default}}'}
        ];
        var data = helper.createFromTemplate(templates);
        var statement = data.statement;
        var parameters = {
            activityId: data.statement.object.id
        }
        return helper.sendRequest('post', helper.getEndpointStatements(), undefined, [statement], 200)
            .then(function () {
                return helper.sendRequest('get', helper.getEndpointActivities(), parameters, undefined, 200);
            });
    });

/**  XAPI-00253, Communication 2.5 Activities Resource
 * An LRS's Activities API accepts GET requests
 */
    it('An LRS\'s Activities Resource accepts GET requests (Communication 2.5, XAPI-00253)', function () {
        var templates = [
            {statement: '{{statements.default}}'}
        ];
        var data = helper.createFromTemplate(templates);
        var statement = data.statement;
        var parameters = {
            activityId: data.statement.object.id
        }
        return helper.sendRequest('post', helper.getEndpointStatements(), undefined, [statement], 200)
            .then(function () {
                return helper.sendRequest('get', helper.getEndpointActivities(), parameters, undefined, 200);
            });
    });

/**  XAPI-00251, Communication 2.5 Activities Resource
 * An LRS's Activities API upon processing a successful GET request returns 200 OK and the complete Activity Object
 */
    it('An LRS\'s Activities Resource upon processing a successful GET request returns the complete Activity Object (Communication 2.5.s1, XAPI-00251)', function () {
        var templates = [
            {statement: '{{statements.object_activity}}'},
            {object: '{{activities.default}}'}
        ];
        var data = helper.createFromTemplate(templates);
        var statement = data.statement;
        statement.object.id = 'http://www.example.com/verify/complete/' + helper.generateUUID();

        return helper.sendRequest('post', helper.getEndpointStatements(), undefined, [statement], 200)
        .then(function () {
            var parameters = {
                activityId: statement.object.id
            };
            return helper.sendRequest('get', helper.getEndpointActivities(), parameters, undefined, 200)
            .then(function (res) {
                var activity = res.body;
                expect(activity).to.be.ok;
                expect(activity).to.eql(statement.object);
            });
        });
    });

/**  XAPI-00250, Communication 2.5 Activities Resource
 * An LRS's Activities API rejects a GET request without "activityId" as a parameter with error code 400 Bad Request
 */
    it('An LRS\'s Activities Resource rejects a GET request without "activityId" as a parameter with error code 400 Bad Request (multiplicity, Communication.md#2.5.s1.table1.row1, XAPI-00250)', function () {
        return helper.sendRequest('get', helper.getEndpointActivities(), undefined, undefined, 400);
    });

/**  XAPI-00254, Communication 2.5 Activities Resource
 * The Activity Object must contain all available information about an activity from any statements who target the same “activityId”. For example, LRS accepts two statements each with a different language description of an activity using the exact same “activityId”. The LRS must return both language descriptions when a GET request is made to the Activities endpoint for that “activityId”.
 */
    it('The Activity Object must contain all available information about an activity from any statements who target the same "activityId". For example, LRS accepts two statements each with a different language description of an activity using the exact same "activityId". The LRS must return both language descriptions when a GET request is made to the Activities endpoint for that "activityId" (multiplicity, Communication.md#2.5.s1.table1.row1, XAPI-00254)', function () {

        var templates = [
            {statement: '{{statements.object_activity}}'},
            {object: '{{activities.default}}'}
        ];
        var data = helper.createFromTemplate(templates);
        var data2 = helper.createFromTemplate(templates);
        var statement = data.statement;
        var statement2 = data2.statement;
        var uuid = helper.generateUUID();
        statement.object.id = 'http://www.example.com/verify/complete/' + uuid;
        statement2.object.id = 'http://www.example.com/verify/complete/' + uuid;

        statement2.object.definition.name['fr-FR'] = "réunion";
        delete statement2.object.definition.name['en-US'];

        return helper.sendRequest('post', helper.getEndpointStatements(), undefined, [statement,statement2], 200)
        .then(function () {
            var parameters = {
                activityId: statement.object.id
            };
            return helper.sendRequest('get', helper.getEndpointActivities(), parameters, undefined, 200)
            .then(function (res) {
                var activity = res.body;
                expect(activity.definition.name['en-US']).to.eql("example meeting");
                expect(activity.definition.name['fr-FR']).to.eql("réunion");
            });
        });
    });
});

}(module, require('fs'), require('extend'), require('moment'), require('super-request'), require('supertest-as-promised'), require('chai'), require('url'), require('joi'), require('./../helper'), require('./../multipartParser'), require('./../redirect.js')));
