/*
 * Alexa Skill: California Highway Conditions.
 * (c) 2017 PiterFM.
 * MIT License.
 */
'use strict';

const http = require('http');
const request = require('./request');
const getHighway = require('./highways');

const getConditions = function (highwayNumber) {
    return new Promise((resolve, reject) => {
        let highway = getHighway(highwayNumber);

        if (highway !== null) {
            request(highway.code)
                .then((body) => resolve(parseResponse(highway, body)))
                .catch(() => reject());
        }
        else {
            reject();
        } 
    });
};

const parseResponse = function(highway, body) {
    let conditions = [];
    highway.conditions = conditions;
    
    // Find the first region name and start from there.
    let k = body.indexOf('[');
    if (k < 0) return highway;
    
    body = body.substr(k);
    
    let lines = body.split('\n').map((line) => {
        var s = line.trim();
        return s === '' ? '.' : s;
    });

    let segment = null;
    lines.forEach((line) => {
        if (line.startsWith('[')) {
            segment = {
                region: normalize(line.slice(1, line.length - 1)),
                status: '',
            };
            conditions.push(segment);
        }
        else {
            segment.status += line === '.' && segment.status.endsWith('. ') ? '' : normalize(line + ' ');
        }
    });
    
    return highway;

};

const MONTHS = {
    '1':  'JANUARY',  
    '2':  'FEBRUARY',  
    '3':  'MARCH',  
    '4':  'APRIL',  
    '5':  'MAY',  
    '6':  'JUNE',  
    '7':  'JULY',  
    '8':  'AUGUST',  
    '9':  'SEPTEMBER',  
    '10': 'OCTOBER',  
    '11': 'NOVEMBER',  
    '12': 'DECEMBER',  
};

const normalize = function(text) {
    text = text
        // & -> AND
        .replace(/&/g, 'AND')
            
        // BDRY -> BORDER
        .replace(/BDRY/g, 'BORDER')
            
        // JCT -> JUNCTION
        .replace(/JCT/g, 'JUNCTION')
            
        // NAT'L -> NATIONAL
        .replace(/NAT\'L/g, 'NATIONAL')
            
        // CO) -> COUNTY
        .replace(/(\sCO)(\)|\s)/g, (match, p1, ending) => {
            return ` COUNTY${ending}`;
        })
            
        // CO$ -> COUNTY
        .replace(/(\sCO)$/g, () => {
            return ' COUNTY';
        })
            
        // MI -> MILES
        .replace(/ MI /g, ' MILES ')
            
        // THRU -> THOUGH
        .replace(/THRU /g, 'THROUGH ')
            
        // 3/3/17 -> MARCH 3, 2017
        .replace(/(\d{1,2})\/(\d{1,2})\/(\d{2})/g, (match, month, day, year) => {
            // This will break in 3rd millennium :)
            return `${MONTHS[month]} ${day} 20${year}`;
        })
        
        // /string/ -> (string)
        .replace(/\/(.*)\//g, '($1)')
        
        // string1/string2 -> string1-string2
        .replace(/(\S+)\/(\S+)/, '$1-$2')
            
        // 0900 HRS -> 9AM
        // 1400 HRS -> 2PM
        // BUG!!!: 2359 -> 11pm instead of 12am
        .replace(/(\d{4}\sHRS)/g, (match, hours) => {
            hours = parseInt(hours.substr(0, 2), 10);
            
            if (hours === 12) hours = '12PM';
            else if (hours === 24) hours = '12AM';
            else if (hours > 12) hours = (hours - 12) + 'PM';
            else hours = hours + 'AM';
            
            return hours;
        })
        
        // HRS -> HOURS
        .replace(/ HRS/g, ' HOURS')
        ;
    
    return text;
};

module.exports = getConditions;
