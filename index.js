const Alexa = require('ask-sdk-core');
const https = require('https');

const quoteID = function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
};


const getFrasesMotivacionais = function () {
  return new Promise((resolve, reject) => {
    const request = https.get(
      'https://raw.githubusercontent.com/joelgarciajr84/alexa-frases-inspiracao/master/quotes.json',
      (response) => {
        response.setEncoding('utf8');

        let returnData = '';
        if (response.statusCode < 200 || response.statusCode >= 300) {
          return reject(
            new Error(
              `${response.statusCode}: ${response.req.getHeader('host')} ${
                response.req.path
              }`
            )
          );
        }

        response.on('data', (chunk) => {
          returnData += chunk;
        });

        response.on('end', () => {
          console.log('END -> ', returnData);
          resolve(returnData);
        });

        response.on('error', (error) => {
          reject(error);
        });
      }
    );
    request.end();
  });
};


const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Olá! Posso te ajudar a se inspirar?';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const justGoIntentHandler = {
    
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'justGoIntent'
    );
  },
  
   async handle(handlerInput) {
    const shouldRepeat = 'espero que tenha ajudado, gostaria de ouvir mais?';
    const quotes = JSON.parse(await getFrasesMotivacionais());
    const id = quoteID(0, quotes.length);
    const quoteToSay = `${quotes[id].quote}. frase de  ${quotes[id].author}. ${shouldRepeat}`;
    return handlerInput.responseBuilder.speak(quoteToSay).reprompt(quoteToSay).getResponse();
  },
};

const noGoIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'noGoIntent'
    );
  },
  handle(handlerInput) {
    const speakOutput = 'ok, fique bem, até mais!';
    return (
      handlerInput.responseBuilder
        .speak(speakOutput)
        .getResponse()
    );
  },
};




const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent'
    );
  },
  handle(handlerInput) {
    const speakOutput = 'Estou aqui para te ajudar a se inspirar. Se quiser ouvir algo que possa ajudar diga sim, caso contrário basta dizer não. Posso te ajudar a se inspirar? ';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};


const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) ===
        'AMAZON.CancelIntent' ||
        Alexa.getIntentName(handlerInput.requestEnvelope) ===
          'AMAZON.StopIntent')
    );
  },
  handle(handlerInput) {
    const speakOutput = 'Goodbye!';
    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
  },
};
const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) ===
      'SessionEndedRequest'
    );
  },
  handle(handlerInput) {
    // Any cleanup logic goes here.
    return handlerInput.responseBuilder.getResponse();
  },
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
    );
  },
  handle(handlerInput) {
    const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
    const speakOutput = `You just triggered ${intentName}`;

    return (
      handlerInput.responseBuilder
        .speak(speakOutput)
        //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
        .getResponse()
    );
  },
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`~~~~ Error handled: ${error.stack}`);
    const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    justGoIntentHandler,
    noGoIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    IntentReflectorHandler // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
