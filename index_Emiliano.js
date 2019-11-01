// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.

const arrayComida = [
  "comida",
  "rappi",
  "pizza",
  "tacos",
  "uber eats",
  "hamburguesa"
];
const arrayVivienda = ["renta", "casa", "depa", "departamento"];
const arraySalud = ["medicina", "doctor", "pastillas"];
const arrayPrestamo = ["prestado", "préstamo"];
const arrayServicios = ["luz", "agua", "gas", "internet"];
const arrayTransporte = ["uber", "taxi", "metro"];
const arrayEducacion = ["clases", "universidad", "escuela", "colegiatura"];
const arrayEntretenimiento = ["cine", "netflix", "teatro", "fiesta", "peda"];
const arrayRopa = ["camisa", "pantalón", "falda"];
var sheet;

function printRecord(record) {
  console.log(`Flujo: ${record.flujo}`);
  console.log(`tipo: ${record.tipo}`);
  console.log(`cantidad: ${record.cantidad}`);
  console.log(`fechainput: ${record.fechainput}`);
  console.log(`info: ${record.info}`);
  console.log("--------------------");
}

const _ = require("underscore");
const Alexa = require("ask-sdk-core");
const GoogleSpreadsheet = require("google-spreadsheet");
const { promisify } = require("util");

const creds = require("./credentials.json");
async function accessSpreadsheat() {
  const doc = new GoogleSpreadsheet(
    "1KClrowuR8RJmGYknoXtBM_BjpMtAe2sh7DI2opZYrYg"
  );
  await promisify(doc.useServiceAccountAuth)(creds);
  const info = await promisify(doc.getInfo)();
  sheet = info.worksheets[1];

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

async function insertRow(row) {
  await promisify(sheet.addRow)(row);
}

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "LaunchRequest"
    );
  },
  handle(handlerInput) {
    const speakOutput =
      "Bienvenido a tu cartera, qué operación deseas realizar?";
    accessSpreadsheat();
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};

function searchTipo(arrayEntrada, sTipo, DESCRIPCION) {
  var found = false;
  _.each(arrayEntrada, function(item) {
    var i = DESCRIPCION.search(item);
    if (i > -1) {
      found = true;
    }
  });

  if (found) {
    return sTipo;
  } else return "Otros";
}

const GastoIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "GastoIntent"
    );
  },
  handle(handlerInput) {
    //const speakOutput = 'Hello World!';
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const CANTIDAD = slots["CANTIDAD"].value;
    var FECHA = slots["FECHA"].value;
    const DESCRIPCION = slots["DESCRIPCION"].value;
    var TIPO = "Otros";

    let arrTipos = [
      arrayComida,
      arrayEducacion,
      arrayEntretenimiento,
      arrayPrestamo,
      arrayRopa,
      arraySalud,
      arrayServicios,
      arrayTransporte,
      arrayVivienda
    ];
    let arrPalabras = [
      "Comida",
      "Educacion",
      "Entretenimiento",
      "Préstamo",
      "Ropa",
      "Salud",
      "Servicios",
      "Transporte",
      "Vivienda"
    ];
    var i;
    for (i = 0; i < arrTipos.length; i++) {
      TIPO = searchTipo(arrTipos[i], arrPalabras[i], DESCRIPCION);
      if (TIPO !== "Otros") {
        break;
      }
    }

    if (!FECHA) {
      FECHA = new Date().toJSON().slice(0, 10);
    }

    const row = {
      Flujo: "Out",
      Tipo: TIPO,
      Cantidad: CANTIDAD,
      Fechainput: FECHA,
      Info: DESCRIPCION
    };
    insertRow(row);

    let speakOutput = "Lo siento, no te entendí";

    if (CANTIDAD) {
      speakOutput =
        "Gasto de " +
        [CANTIDAD] +
        " pesos " +
        " en " +
        [DESCRIPCION] +
        " guardado exitosamente";
    }

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(
        "add a reprompt if you want to keep the session open for the user to respond"
      )
      .getResponse();
  }
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    const speakOutput = "You can say hello to me! How can I help?";

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};
const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "AMAZON.CancelIntent" ||
        Alexa.getIntentName(handlerInput.requestEnvelope) ===
          "AMAZON.StopIntent")
    );
  },
  handle(handlerInput) {
    const speakOutput = "Goodbye!";
    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
  }
};
const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) ===
      "SessionEndedRequest"
    );
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
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest"
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
    console.log(`~~ Error handled: ${error.stack}`);
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
    GastoIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    IntentReflectorHandler // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
  )
  .addErrorHandlers(ErrorHandler)

  .lambda();
