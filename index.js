// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const GoogleSpreadsheet = require("google-spreadsheet");
const { promisify } = require("util");
const _ = require("underscore");
const creds = require("./credentials.json");


var balanceActual;
var sheet = [];
var balance = 0;
var ingresos = 0;
var gastos = 0;
var rows = "0";
var title = "none";
var saldo = 0;

const arrayComida = ["comida", "rappi", "pizza", "tacos", "uber eats", "hamburguesa"];
const arrayVivienda = ["vivienda","renta","casa","depa","departamento"];
const arraySalud = ["salud","medicina","doctor","pastillas"];
const arrayPrestamo = ["deuda","prestado","préstamo","prestó"];
const arrayServicios = ["servicios","luz","agua","gas","internet"];
const arrayTransporte = ["transporte","uber","taxi","metro"];
const arrayEducacion = ["clases","universidad","escuela","colegiatura"];
const arrayEntretenimiento = ["cine","netflix","teatro","fiesta","peda"];
const arrayRopa = ["camisa","pantalón","falda"];

const arrayTipodeIngresoPrestamo = [
  "prestó",
  "presto",
  "prestamo",
  "prestado",
  "prestame",
  "pedi",
  "pedí"
];
const arrayTipodeIngresoDonacion = [
    "dono",
    "donó",
    "donación",
    "donacion",
    "donante",
    "donar",
    "donado",
    "dona",
    "donada",
    "donan"
];
const arrayTipodeIngresoInversion = [
    "invierto",
    "invertido",
    "invirtio",
];
const arrayTipodeIngresoSueldo = [
    "pagaron",
    "pagarón",
    "pago",
    "pagó",
    "pagame",
    "pagado",
    "sueldo",
    "salario",
    "aginaldo"
];
const arrayTipodeIngresoRegalo = [
    "regalo",
    "obsequio",
    "invito",
    "invitó",
    "concedio",
    "dio",
    "dío",
    "dió"
];


async function insertRow(row) {
  await promisify(sheet[0].addRow)(row);
}

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

async function getBalance() {

  ingresos = 0;
  gastos = 0;
  saldo = 0;

  const rows = await promisify(sheet[0].getRows)({
    offset: 1
  });
  rows.forEach(row => {
    if (row.flujo === "In") {
      ingresos += Number(row.cantidad);
    } else if (row.flujo === "Out") {
      gastos += Number(row.cantidad);
    }
  });
  saldo = ingresos - gastos;
}
async function getBalanceMonth(dateinput) {
var output;
  ingresos = 0;
  gastos = 0;
  const rows = await promisify(sheet[0].getRows)({
    offset: 1
  });
  //2019-10
  //2019-10-29
  rows.forEach(row => {
    var date = row.fechainput;
    date = date.substring(5, 7);

    if (dateinput.month === date)
      if (row.flujo === "In") {
        ingresos += Number(row.cantidad);
      } else if (row.flujo === "Out") {
        gastos += Number(row.cantidad);
      }
  });

}
async function getBalanceDay(dateinput) {
  ingresos = 0;
  gastos = 0;
  const rows = await promisify(sheet[0].getRows)({
    offset: 1
  });
  //2019-10
  //2019-10-29
  rows.forEach(row => {
    var date = row.fechainput;

    if (date.length > 7) {
      date = date.substring(5, 7);
    } else date = "00";
    
    if (dateinput.day === date)
      if (row.flujo === "In") {
        ingresos += Number(row.cantidad);
      } else if (row.flujo === "Out") {
        gastos += Number(row.cantidad);
      }
  });

}
function getSundayFromWeekNum(weekNum, year) {
  var sunday = new Date(year, 0, 1 + (weekNum - 1) * 7);
  while (sunday.getDay() !== 0) {
    sunday.setDate(sunday.getDate() - 1);
  }
  return sunday;
}
function getSaturdayFromWeekNum(weekNum, year) {
  var saturday = new Date(year, 0, 1 + (weekNum - 1) * 7);
  while (saturday.getDay() !== 0) {
    saturday.setDate(saturday.getDate() + 5);
  }
  return saturday;
}
async function getBalanceWeek(dateinput) {
  ingresos = 0;
  gastos = 0;

  const rows = await promisify(sheet[0].getRows)({
    offset: 1
  });

  var weekNum = Number(dateinput.substring(6, 8));
  var year = Number(dateinput.substring(0, 4));

  var dateLower = getSundayFromWeekNum(weekNum, year);
  var dateUpper = getSaturdayFromWeekNum(weekNum, year);

  console.log(`${year} ${weekNum}`);

  rows.forEach(row => {
    var fechaInput = row.fechainput;
    var day = Number(fechaInput.substring(8, 10));
    var month = Number(fechaInput.substring(5, 7));

    var date = new Date(year, month - 1, day);

    if (dateLower <= date && dateUpper >= date) {
      if (row.flujo === "In") {
        ingresos += Number(row.cantidad);
      } else if (row.flujo === "Out") {
        gastos += Number(row.cantidad);
      }
    }
  });

}
async function getBalanceYear(dateinput) {
  ingresos = 0;
  gastos = 0;
  const rows = await promisify(sheet[0].getRows)({
    offset: 1
  });
  //2019
  rows.forEach(row => {
    var date = row.fechainput;

    if (date.length >= 4) {
      date = date.substring(0, 4);
    } else date = "00";
    
    console.log(`${date}`);
    if (dateinput.year === date)
      if (row.flujo === "In") {
        ingresos += Number(row.cantidad);
      } else if (row.flujo === "Out") {
        gastos += Number(row.cantidad);
      }
  });
}
async function accessSpreadsheet() {
  const doc = new GoogleSpreadsheet(
    "1KClrowuR8RJmGYknoXtBM_BjpMtAe2sh7DI2opZYrYg"
  );
  await promisify(doc.useServiceAccountAuth)(creds);
  const info = await promisify(doc.getInfo)();

info.worksheets.forEach(worksheet => {
    sheet.push(worksheet);
  });
  title = sheet[0].title;
  rows = sheet[0].rowCount;
  
/*
  var date2 = getSundayFromWeekNum(44, 2019);
  var date3 = getSaturdayFromWeekNum(44, 2019);

  const date = [
    {
      day: date2.getDate(),
      month: date2.getMonth(),
      year: date2.getFullYear()
    },
    {
      day: date3.getDate(),
      month: date3.getMonth(),
      year: date3.getFullYear()
    }
  ];
*/
  //console.log(`${date2}`);
  //console.log(`${date[0].day}-${date[0].month}-${date[0].month}`);
  //console.log(`${date[1].day}-${date[1].month}-${date[1].month}`);
  //getBalanceMonth(date);
  //getBalanceDay(date);
  //getBalanceWeek("2019-W43");

  /*
  var date = new Date();
  var curr = new Date(); // get current date
  var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
  var last = first + 6; // last day is the first day + 6
  var firstday = new Date(curr.setDate(first)).getDate();
  var lastday = new Date(curr.setDate(last)).getDate();
  var now = Date.now();
  console.log(`${firstday}`);
  console.log(`${lastday}`);
  console.log(now);
  */

  //getBalance(month);
  //getBalance(day);
  //getBalance(week);

  //getBalance();

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
    Info: "Una pizza que se comio el Luis"
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
function getDatefromWeek(dateinput) {
  var weekNum = Number(dateinput.substring(6, 8));
  var year = Number(dateinput.substring(0, 4));
  var dateLower = getSundayFromWeekNum(weekNum, year);
  var month = dateLower.getMonth() + 1;

  var output =
    dateLower.getFullYear() + "-" + month + "-" + dateLower.getDate();

  return output;
}
//Funcion para Ingresar valores a la cartera
async function IngresoSpeakOut(cant, tipo, fecha, descr) {
  var outPut = "";
  //Condicional para checar si no hay fecha dada por el usuario, en ese caso,pone la del día que se mando el comando
  if (!fecha) {
    fecha = new Date().toJSON().slice(0, 10);
  }
  if(fecha.length === 8){
      fecha = getSundayFromWeekNum(fecha);
  }

  if (cant) {
    if (cant > 1) {
      outPut = "Ingreso de " + cant + " pesos, guardado exitosamente.";
    } else {
      outPut = "Ingreso de " + cant + " peso, guardado exitosamente.";
    }
    await IngresoBaseDeDatos(tipo, cant, fecha, descr);
  }

  return outPut;
}
//Funcion para agregar los valores de ingreso a la base de datos
async function IngresoBaseDeDatos(tipo, cant, fecha, descr) {
  const row = {
    Flujo: "In",
    Tipo: tipo,
    Cantidad: cant,
    FechaInput: fecha,
    Info: descr
  };
  await promisify(sheet[0].addRow)(row);
}
//Funcion para buscar las palabras de TIPO para meterlas a la base de datos de cierta manera
function BuscadorPalabras(palabraTipo) {
    var palabraLista = false;
    if(!palabraLista){    
        //Ciclo para buscar sinonimos/conjugaciones de la palabra Prestamo y cambiarla a esa misma
        var foundTipoIngresoPrestamo = false;
        _.each(arrayTipodeIngresoPrestamo, function(item) {
        var i = palabraTipo.search(item);
        if (i > -1) {
            foundTipoIngresoPrestamo = true;
        }
        });

        if (foundTipoIngresoPrestamo) {
            type = "Préstamo";
            palabraLista = true;
        }
         /////////////////////////////////////////////////////////////////////////////////////////////
    }
    if(!palabraLista){    
        //Ciclo para buscar sinonimos/conjugaciones de la palabra Donacion y cambiarla a esa misma
        var foundTipoIngresoDonacion = false;
        _.each(arrayTipodeIngresoDonacion, function(item) {
        var i = palabraTipo.search(item);
        if (i > -1) {
            foundTipoIngresoDonacion = true;
        }
        });

        if (foundTipoIngresoDonacion) {
            type = "Donación";
            palabraLista = true;
        }
         /////////////////////////////////////////////////////////////////////////////////////////////
    }
    if(!palabraLista){    
        //Ciclo para buscar sinonimos/conjugaciones de la palabra Regalo y cambiarla a esa misma
        var foundTipoIngresoRegalo = false;
        _.each(arrayTipodeIngresoRegalo, function(item) {
        var i = palabraTipo.search(item);
        if (i > -1) {
            foundTipoIngresoRegalo = true;
        }
        });

        if (foundTipoIngresoRegalo) {
            type = "Regalo";
            palabraLista = true;
        }
         /////////////////////////////////////////////////////////////////////////////////////////////
    }
    if(!palabraLista){    
        //Ciclo para buscar sinonimos/conjugaciones de la palabra Inversion y cambiarla a esa misma
        var foundTipoIngresoInversion = false;
        _.each(arrayTipodeIngresoInversion, function(item) {
        var i = palabraTipo.search(item);
        if (i > -1) {
            foundTipoIngresoInversion = true;
        }
        });

        if (foundTipoIngresoInversion) {
            type = "Inversión";
            palabraLista = true;
        }
         /////////////////////////////////////////////////////////////////////////////////////////////
    }
    if(!palabraLista){    
        //Ciclo para buscar sinonimos/conjugaciones de la palabra Sueldo y cambiarla a esa misma
        var foundTipoIngresoSueldo = false;
        _.each(arrayTipodeIngresoSueldo, function(item) {
        var i = palabraTipo.search(item);
        if (i > -1) {
            foundTipoIngresoSueldo = true;
        }
        });

        if (foundTipoIngresoSueldo) {
            type = "Sueldo";
            palabraLista = true;
        }
         /////////////////////////////////////////////////////////////////////////////////////////////
    }
    if(!palabraLista){    
        //Si la palabra no pertence a ninguna categoria de las funciones anteriores se le dara el nombre de Otro 
        type = "Otro";
        palabraLista = true;
    }
  var type;
  return type;
}

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    async handle(handlerInput) {
        await accessSpreadsheet();
        const speakOutput = 'Bienvenido a mi cartera, ¿qué acción deseas realizar?';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
//
//
//
//Intent para conocer el SALDO del usuario - LISTO
const GetSaldoIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetSaldoIntent';
    },
    async handle(handlerInput) {
        var speakOutput;
        await getBalance();
        
        //Saldo negativo
        if (saldo < 0) {
            //Hace saldo positivo
            saldo *= -1;
            speakOutput = 'Tienes un saldo negativo de ' + saldo + ' pesos.';
        } 
        //Saldo positivo
        else {
            speakOutput = 'Tienes un saldo de ' + saldo + ' pesos.';
        }
        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
//
//
//
//Intent para conocer los INGRESOS - LISTO
const GetIngresosIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetIngresosIntent';
    },
    async handle(handlerInput) {
        const slots = handlerInput.requestEnvelope.request.intent.slots;
        const tiempo = slots['TIEMPO'].value;
        var date = {
            year: '',
            month: '',
            day: ''
        };
        var speakOutput;
        
        //Si el uisuario definió un tiempo
        if (tiempo) {
            //Por día 2019-10-31
            if (tiempo.length === 10) {
                //Objeto date que leen las funciones GetBalance
                date.year = tiempo.substring(0,4);
                date.month = tiempo.substring(5,7);
                date.day = tiempo.substring(8,10);
                await getBalanceDay(date);
            }
            //Por semana 2019-W44
            else if (tiempo.length === 8) {
                await getBalanceWeek(tiempo);
            }
            //Por mes 2019-10
            else if (tiempo.length === 7) {
                date.year = tiempo.substring(0,4);
                date.month = tiempo.substring(5,7);
                await getBalanceMonth(date);
            }
            //Por año 2019
            else if (tiempo.length === 4) {
                date.year = tiempo.substring(0,4);
                await getBalanceYear(date);
            }
            //Actual
        } else {
            await getBalance();
        }
        
        if (ingresos === 0) {
            speakOutput = 'No tienes ingresos.';
        }
        if (ingresos === 1) {
            speakOutput = ' Tienes ingresos por un total de un peso.';
        } else {
            speakOutput = 'Tienes ingresos por un total de ' + ingresos + ' pesos.' ;
        }
        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
//
//
//
//Intent para conocer los GASTOS
//Intent para conocer los GASTOS - LISTO
const GetGastosIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetGastosIntent';
    },
    async handle(handlerInput) {
        const slots = handlerInput.requestEnvelope.request.intent.slots;
        const tiempo = slots['TIEMPO'].value;
        var date = {
            year: '',
            month: '',
            day: ''
        };
        var speakOutput;
        //Si el usuario definió un tiempo
        if (tiempo) {
            //Por día 2019-10-31
            if (tiempo.length === 10) {
                //Objeto date que leen las funciones GetBalance
                date.year = tiempo.substring(0,4);
                date.month = tiempo.substring(5,7);
                date.day = tiempo.substring(8,10);
                await getBalanceDay(date);
            }
            //Por semana 2019-W44
            else if (tiempo.length === 8) {
                await getBalanceWeek(tiempo);
            }
            //Por mes 2019-10
            else if (tiempo.length === 7) {
                date.year = tiempo.substring(0,4);
                date.month = tiempo.substring(5,7);
                await getBalanceMonth(date);
            }
            //Por año 2019
            else if (tiempo.length === 4) {
                date.year = tiempo.substring(0,4);
                await getBalanceYear(date);
            }
            //Actual
        } else {
            await getBalance();
        }
        
        if (gastos === 0) {
            speakOutput = 'No tienes gastos.';
        }
        if (gastos === 1) {
            speakOutput = 'Tienes gastos por un total de un peso.';
        } else {
            speakOutput = 'Tienes gastos por un total de ' + gastos + ' pesos.';
        }
        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
//Intent para conocer los préstamos
const GetPrestamosIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetPrestamosIntent';
    },
    handle(handlerInput) {
        //const slots = handlerInput.requestEnvelope.request.intent.slots;
        //const saldo = slots['SALDO'].value;
        const speakOutput = 'Has solicitado 4 préstamos y has otorgado 2';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
//
//
//
//Intent para conocer el BALANCE - LISTO
const GetBalanceIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetBalanceIntent';
    },
    async handle(handlerInput) {
        const slots = handlerInput.requestEnvelope.request.intent.slots;
        const tiempo = slots['TIEMPO'].value;
        var date = {
            year: '',
            month: '',
            day: ''
        };
        var speakOutput;
        
        //Si el usuario definió el tiempo
        if (tiempo) {
            //Por día 2019-10-31
            if (tiempo.length === 10) {
                //Objeto date que leen las funciones GetBalance
                date.year = tiempo.substring(0,4);
                date.month = tiempo.substring(5,7);
                date.day = tiempo.substring(8,10);
                await getBalanceDay(date);
            }
            //Por semana 2019-W44
            else if (tiempo.length === 8) {
                await getBalanceWeek(tiempo);
            }
            //Por mes 2019-10
            else if (tiempo.length === 7) {
                date.year = tiempo.substring(0,4);
                date.month = tiempo.substring(5,7);
                await getBalanceMonth(date);
            }
            //Por año 2019
            else if (tiempo.length === 4) {
                date.year = tiempo.substring(0,4);
                await getBalanceYear(date);
            }
            //Actual
        } else {
            await getBalance();
        }
        
        //Valida valor de gastos
        //Balance positivo
        if (ingresos > gastos) {
            if (ingresos !== 1 && gastos !== 1) {
                speakOutput = 'Tienes un balance positivo con ingresos de ' + ingresos + ' pesos y gastos de ' + gastos + ' pesos.';
            } else if (ingresos !== 1 && gastos === 1) {
                speakOutput = 'Tienes un balance positivo con ingresos de ' + ingresos + ' pesos y gastos de un peso.';
            } else if (ingresos === 1 && gastos !== 1) {
                speakOutput = 'Tienes un balance positivo con ingresos de un peso y gastos de ' + gastos + ' pesos.';
            } else {
                speakOutput = 'Tienes un balance positivo con ingresos de un peso y gastos de un peso.';
            }
        }
        //Balance negativo
        else {
            if (ingresos !== 1 && gastos !== 1) {
                speakOutput = 'Tienes un balance negativo con ingresos de ' + ingresos + ' pesos y gastos de ' + gastos + ' pesos.';
            } else if (ingresos !== 1 && gastos === 1) {
                speakOutput = 'Tienes un balance negativo con ingresos de ' + ingresos + ' pesos y gastos de un peso.';
            } else if (ingresos === 1 && gastos !== 1) {
                speakOutput = 'Tienes un balance negativo con ingresos de un peso y gastos de ' + gastos + ' pesos.';
            } else {
                speakOutput = 'Tienes un balance negativo con ingresos de un peso y gastos de un peso.';
            }
        }
        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
//
//
//
//Intent de evaluación de riesgos (supervivencia)
const SobrevivoIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SobrevivoIntent';
    },
    handle(handlerInput) {
        //const slots = handlerInput.requestEnvelope.request.intent.slots;
        //const saldo = slots['SALDO'].value;
        const speakOutput = 'Según tus datos, es posible sobrevivir esta semana';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
//
//
//
//Intent para conocer el último gasto
const UltimoGastoIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'UltimoGastoIntent';
    },
    handle(handlerInput) {
        //const slots = handlerInput.requestEnvelope.request.intent.slots;
        //const saldo = slots['SALDO'].value;
        const speakOutput = 'Tu último gasto fue de 49 pesos en Entretenimiento el 29 de octubre de 2019';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
//
//
//
//Intent para conocer el último ingreso
const UltimoIngresoIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'UltimoIngresoIntent';
    },
    handle(handlerInput) {
        //const slots = handlerInput.requestEnvelope.request.intent.slots;
        //const saldo = slots['SALDO'].value;
        const speakOutput = 'Tu último ingreso fue de 70 pesos por Regalo el 31 de octubre de 2019';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
//
//
//
//Intent para calcular saldo FALTANTE para META - LISTO
const GetFaltanteIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetFaltanteIntent';
    },
    async handle(handlerInput) {
        const slots = handlerInput.requestEnvelope.request.intent.slots;
        const cantidad = slots['CANTIDAD'].value;
        var speakOutput;
        var faltante;
        
        await getBalance();
        
        if (saldo < cantidad) {
            faltante = cantidad - saldo;
            speakOutput = 'Te faltan ' + faltante + ' para alcanzar un saldo de ' + cantidad + ' pesos.';
        }
        else if (saldo === cantidad) {
            speakOutput = 'Ya cuentas con la cantidad exacta.';
        } else {
            speakOutput = 'Tu saldo ya es mayor que esa cantidad.';
        }
        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
//
//
//
const IngresoIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "IngresoIntent"
    );
  },
  async handle(handlerInput) {
    const slots = handlerInput.requestEnvelope.request.intent.slots; //Checar los slots del intent
    //Lee las variables
    const Cantidad = slots["Cantidad"].value;
    const Tipo = slots["Tipo"].value;
    const FechaInput = slots["FechaInput"].value;
    const Descripcion = slots["Descripcion"].value;
    let speakOutput = "Error en tomar los datos";
    //Funcion para cambiar la palabra de Tipo para la base de datos
    if (Tipo) {
      var Type = BuscadorPalabras(Tipo);
      //Llama la funcion en donde se define lo que dira Alexa y el guardado en la base de datos
      speakOutput = await IngresoSpeakOut(Cantidad, Type, FechaInput, Descripcion);
    } else {
      //Llama la funcion en donde se define lo que dira Alexa y el guardado en la base de datos
      speakOutput = await IngresoSpeakOut(Cantidad, Tipo, FechaInput, Descripcion);
    }
    return handlerInput.responseBuilder
      .speak(speakOutput)
      //.reprompt("¿Quieres decir otro comando?")
      .getResponse();
  }
};
//
//
//
const GastoIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "GastoIntent"
    );
  },
  async handle(handlerInput) {
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
    
    await insertRow(row);

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
      //.reprompt("add a reprompt if you want to keep the session open for the user to respond")
      .getResponse();
  }
};
//
//
//
const HelloWorldIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelloWorldIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Hello World!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
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
        GastoIntentHandler,
        IngresoIntentHandler,
        GetSaldoIntentHandler,
        GetIngresosIntentHandler,
        GetGastosIntentHandler,
        GetPrestamosIntentHandler,
        GetBalanceIntentHandler,
        SobrevivoIntentHandler,
        GastoIntentHandler,
        UltimoGastoIntentHandler,
        UltimoIngresoIntentHandler,
        GetFaltanteIntentHandler,
        HelloWorldIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();
