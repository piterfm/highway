/*
 * Alexa Skill: California Highway Conditions.
 * (c) 2017 PiterFM.
 * MIT License.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const request = function(code) {
    return new Promise((resolve, reject) => {
        let file = path.resolve(__dirname, `../../tests/fixtures/${code}.txt`);
        
        if (fs.existsSync(file)) {
            let body = fs.readFileSync(file, 'utf8');
            process.nextTick(() => {
               resolve(body); 
            });
        }
        else {
            reject();
        }
    });
};

module.exports = request;
