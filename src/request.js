/*
 * Alexa Skill: California Highway Conditions.
 * (c) 2017 PiterFM.
 * MIT License.
 */
'use strict';

const http = require('http');

const host = 'www.dot.ca.gov';
const path = '/hq/roadinfo/';

const request = function(code) {
    return new Promise(resolve => {
        http.get({
            host: host,
            path: path + code,
        }, response => {
            let body = '';
            response.on('data', data => body += data);
            response.on('end', () => resolve(body));
        });
    });
};

module.exports = request;
