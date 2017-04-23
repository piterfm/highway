/*
 * Alexa Skill: California Highway Conditions.
 * (c) 2017 PiterFM.
 * MIT License.
 */
'use strict';

const fs = require('fs');
const path = require('path');

jest.mock('../src/request');
const getConditions = require('../src/conditions');

let getExpected = function(highway) {
    let file = path.resolve(__dirname, `./fixtures/${highway}-expected.txt`);
    
    return fs.readFileSync(file, 'utf8').split('###\n').map((segment) => {
        let lines = segment.split('\n');
        return {
            region: lines[0],
            status: lines[1],
        }
    });
};

describe('Get conditions on', () => {

    it('highway which doesn\'t exists', () => {
        return getConditions('555').catch((result) => expect(result).toBeUndefined());
    });
    
    it('empty response', () => {
        return getConditions('280').then((highway) => {
            expect(highway.name).toEqual('INTERSTATE 280');
            expect(highway.conditions).toEqual([])
        });
    });
    
    it('empty info', () => {
        return getConditions('50').then((highway) => {
            expect(highway.name).toEqual('US HIGHWAY 50');
            expect(highway.conditions).toEqual([])
        });
    });
    
    it('I-80 which is unavailable', () => {
        return getConditions('80').catch((result) => expect(result).toBeUndefined());
    });
    
    it('SR-88', () => {
        return getConditions('88').then((highway) => {
            expect(highway.name).toEqual('STATE ROUTE 88');
            expect(highway.conditions).toEqual(getExpected('sr88'))
        });
    });
    
    it('SR-89', () => {
        return getConditions('89').then((highway) => {
            expect(highway.name).toEqual('STATE ROUTE 89');
            expect(highway.conditions).toEqual(getExpected('sr89'))
        });
    });
    
    it('SR-116', () => {
        return getConditions('116').then((highway) => {
            expect(highway.name).toEqual('STATE ROUTE 116');
            expect(highway.conditions).toEqual(getExpected('sr116'))
        });
    });
    
    it('US-395', () => {
        return getConditions('395').then((highway) => {
            expect(highway.name).toEqual('US HIGHWAY 395');
            expect(highway.conditions).toEqual(getExpected('us395'))
        });
    });
    
    it('SR-1', () => {
        return getConditions('1').then((highway) => {
            expect(highway.name).toEqual('STATE ROUTE 1');
            expect(highway.conditions).toEqual(getExpected('sr1'))
        });
    });
    
    it('I-5', () => {
        return getConditions('5').then((highway) => {
            expect(highway.name).toEqual('INTERSTATE 5');
            expect(highway.conditions).toEqual(getExpected('i5'))
        });
    });
    
    it('I-80', () => {
        return getConditions('80').then((highway) => {
            expect(highway.name).toEqual('INTERSTATE 80');
            expect(highway.conditions).toEqual(getExpected('i80'))
        });
    });
    
    
});
