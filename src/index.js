/*
 * Alexa Skill: California Highway Conditions.
 * (c) 2017 PiterFM.
 * MIT License.
 */
'use strict';

const Alexa = require('alexa-sdk');
const getConditions = require('./conditions');

const APP_ID = 'YOUR_APP_ID';

const help = function() {
    this.attributes.speechOutput = this.t('HELP_MESSAGE');
    this.attributes.repromptSpeech = this.t('HELP_REPROMPT');
    this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
};

const handlers = {
    'LaunchRequest': function() {
        this.attributes.speechOutput = this.t('WELCOME_MESSAGE', this.t('SKILL_NAME'));
        // If a user either does not reply to the welcome message or says something that is not
        // understood, they will be prompted again with this text.
        this.attributes.repromptSpeech = this.t('WELCOME_REPROMT');
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
    'HighwayIntent': function() {
        const highwaySlot = this.event.request.intent.slots.Highway;
        let highwayNumber;
        if (highwaySlot && highwaySlot.value) {
            highwayNumber = highwaySlot.value;
        }
        
        if (Number.isNaN(highwayNumber) || (highwayNumber <= 0)) {
            highwayNumber = null;
        }

        let self = this;
        const repromptSpeech = self.t('HIGHWAY_NOT_FOUND_REPROMPT');

        getConditions(highwayNumber)
            .then((highway) => {

                const cardTitle = this.t('DISPLAY_CARD_TITLE', this.t('SKILL_NAME'), highway.code);
                
                let conditions = highway.conditions;
                let speechOutput = self.t('HIGHWAY_NOT_FOUND_MESSAGE');
                
                self.attributes.repromptSpeech = self.t('HIGHWAY_REPEAT_MESSAGE');
                
                if (conditions.length > 0) {
                    speechOutput = self.t('HIGHWAY_INTRO', highway.name);
                    conditions.forEach((segment) => {
                        speechOutput += ` ${segment.region}: ${segment.status}`;
                    });
                }
                else {
                    speechOutput = self.t('HIGHWAY_NO_INFO');
                }

                self.attributes.speechOutput = speechOutput;
                self.emit(':tellWithCard', speechOutput, repromptSpeech, cardTitle, speechOutput);
            })
            .catch(() => {
                let speechOutput = self.t('HIGHWAY_NOT_FOUND_MESSAGE');

                if (highwayNumber) {
                    speechOutput += self.t('HIGHWAY_NOT_FOUND_WITH_NAME', highwayNumber);
                } else {
                    speechOutput += self.t('HIGHWAY_NOT_FOUND_WITHOUT_NAME');
                }
                speechOutput += repromptSpeech;
    
                self.attributes.speechOutput = speechOutput;
                self.attributes.repromptSpeech = repromptSpeech;
    
                self.emit(':ask', speechOutput, repromptSpeech);
            });
    },
    'AMAZON.RepeatIntent': function() {
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
    'AMAZON.StopIntent': function() {
        this.emit('SessionEndedRequest');
    },
    'AMAZON.CancelIntent': function() {
        this.emit('SessionEndedRequest');
    },
    'SessionEndedRequest': function() {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'AMAZON.HelpIntent': help,
    'Unhandled': help,
};

const languageStrings = {
    'en-US': {
        translation: {
            SKILL_NAME: 'California Highway Conditions.',
            WELCOME_MESSAGE: 'Welcome to %s. You can ask about any California highway. For example, you can say: tell me about two eighty... Now, what can I help you with.',
            WELCOME_REPROMT: 'For instructions on what you can say, please say help me.',
            DISPLAY_CARD_TITLE: '%s for %s.',
            HELP_MESSAGE: 'You can ask questions such as, what are conditions on 88? ...Now, what can I help you with.',
            HELP_REPROMPT: 'You can ask questions such as, tell me about highway 89, or you can say exit... Now, what can I help you with?',
            STOP_MESSAGE: 'Goodbye!',
            HIGHWAY_REPEAT_MESSAGE: 'Try saying repeat.',
            HIGHWAY_INTRO: 'Here is information about %s.',
            HIGHWAY_NO_INFO: 'I don\'t have any information.',
            HIGHWAY_NOT_FOUND_MESSAGE: 'I\'m sorry, I didn\'t find ',
            HIGHWAY_NOT_FOUND_WITH_NAME: 'information for %s. ',
            HIGHWAY_NOT_FOUND_WITHOUT_NAME: 'information for that highway. ',
            HIGHWAY_NOT_FOUND_REPROMPT: 'What else can I help with?',
        },
    },
};

exports.handler = (event, context) => {
    const alexa = Alexa.handler(event, context);
    
    alexa.APP_ID = APP_ID;
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
