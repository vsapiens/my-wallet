// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');

const GoogleSpreadsheet = require("google-spreadsheet");
const { promisify } = require("util");
const creds = require("./credentials.json");
var sheet;

var rows = '0';
var title = 'none';

async function accessSpreadsheat() {
  const doc = new GoogleSpreadsheet(
    "1KClrowuR8RJmGYknoXtBM_BjpMtAe2sh7DI2opZYrYg"
  );
  await promisify(doc.useServiceAccountAuth)(creds);
  const info = await promisify(doc.getInfo)();
  sheet = info.worksheets[0];
  
  title = sheet.title;
  rows = sheet.rowCount;
  /*
  //Leer e imprimir
  const rows = await promisify(sheet.getRows)({
    offset: 2,
    limit: 6,
    orderby: "flujo"
  });
  rows.forEach(row => {
    printRecord(row);
  });
  */
  /*
  // Imprimir
  const row = {
    Flujo: "Out",
    Tipo: "Comida",
    Cantidad: "120",
    Fechainput: "10/29/2019",
    Info: "Una pizza que se chingo el Luis"
  };
  await promisify(sheet.addRow)(row);
*/
  /*
//Query and save changes
  const rows = await promisify(sheet.getRows)({
    query: "flujo = Out"
  });

  rows.forEach(row => {
    row.cantidad = 10;
    row.save();
  });
  */
}



const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Bienvenido a tu cartera, ¿que quieres hacer?';
        accessSpreadsheat();
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};


//Funcion para Ingresar valores a la cartera
function IngresoSpeakOut(cant,tipo,fecha,descr){
    var outPut = "";
    //Condicional para checar si no hay fecah dada por el usuario, pone la del día que se mando el comando
    if(!fecha){
        fecha = new Date().toJSON().slice(0,10);
    }
       if(cant && tipo){
           //Si se agrego descripcion de quien viene la cantidad ingresada
            if(descr){
                //Si se usan palabras derivadas del verbo Prestar
                if(tipo === "presto" || tipo === "prestó"){
                    if(cant > 1){
                        outPut = "Préstamo de " + descr + " por " + cant + " pesos, guardado exitosamente.";
                    } else {
                        outPut = "Préstamo de " + descr + " por " + cant + " peso, guardado exitosamente.";
                    }
                }else {
                    if(cant > 1){
                        outPut = tipo + " de " + descr + " por " + cant + " pesos, guardado exitosamente.";
                    } else {
                        outPut = tipo + " de " + descr + " por " + cant + " peso, guardado exitosamente.";
                    }
                }
                IngresoBaseDeDatos(tipo,cant,fecha,descr);
            } else {
                if(cant > 1){
                    outPut = tipo + " por " + cant + " pesos, guardado exitosamente."
                } else{
                    outPut = tipo + " por " + cant + " peso, guardado exitosamente."
                }
                IngresoBaseDeDatos(tipo,cant,fecha,descr);
            }
        }
        if(cant){
            if(cant > 1){
                outPut = "Ingreso de " + cant + " pesos, guardado exitosamente.";
            } else {
                outPut = "Ingreso de " + cant + " peso, guardado exitosamente.";
            }
            IngresoBaseDeDatos(tipo,cant,fecha,descr);
        }
    
    return outPut;
}

//Funcion para agregar los valores de ingreso a la base de datos
async function IngresoBaseDeDatos(tipo,cant,fecha,descr){
    const row = {
            Flujo: "In",
            Tipo: tipo,
            Cantidad: cant,
            Fechainput: fecha,
            Info: descr
    }
  await promisify(sheet.addRow)(row);
}

const IngresoIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'IngresoIntent';
    },
    handle(handlerInput) {
        const slots = handlerInput.requestEnvelope.request.intent.slots;    //Checar los slots del intent
        //Lee las variables
        const Cantidad = slots['Cantidad'].value;
        const Tipo = slots['Tipo'].value;
        const FechaInput = slots['FechaInput'].value;
        const Descripcion = slots['Descripcion'].value;
        let speakOutput = "Error , no te he entendido";
        //Llama la funcion en donde se define lo que dira Alexa y el guardado en la base de datos
        speakOutput = IngresoSpeakOut(Cantidad,Tipo,FechaInput,Descripcion);
        /* Para probar que se tenga acceso al google sheet
        speakOutput = "Titulo es " + title + " Numero de renglones es " + rows;
        */
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('Quieres decir otro comando?')
            .getResponse();
    }
};
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
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
    }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        IngresoIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();