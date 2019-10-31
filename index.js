const GoogleSpreadsheet = require("google-spreadsheet");
const { promisify } = require("util");
var moment = require("moment");
moment().format();

const creds = require("./my-wallet-5ec18ebadfe9.json");

var balanceActual;
var sheet = [];
var balance = 0;
var ingresos = 0;
var gastos = 0;

function printRecord(record) {
  console.log(`Flujo: ${record.flujo}`);
  console.log(`tipo: ${record.tipo}`);
  console.log(`cantidad: ${record.cantidad}`);
  console.log(`fechainput: ${record.fechainput}`);
  console.log(`info: ${record.info}`);
  console.log("--------------------");
}
async function getBalance() {
  ingresos = 0;
  gastos = 0;

  const rows = await promisify(sheet_0.getRows)({
    offset: 1
  });
  rows.forEach(row => {
    if (row.flujo === "In") {
      ingresos += Number(row.cantidad);
    } else if (row.flujo === "Out") {
      gastos += Number(row.cantidad);
    }
  });
  console.log(
    `Tu balance total es ${ingresos} en ingresos y tienes gastos de ${gastos}`
  );
}
async function getBalanceMonth(dateinput) {
  ingresos = 0;
  gastos = 0;
  const rows = await promisify(sheet_0.getRows)({
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

  console.log(
    `Tu balance del mes es ${ingresos} en ingresos y tienes gastos de ${gastos}`
  );
}
async function getBalanceDay(dateinput) {
  ingresos = 0;
  gastos = 0;
  const rows = await promisify(sheet_0.getRows)({
    offset: 1
  });
  //2019-10
  //2019-10-29
  rows.forEach(row => {
    var date = row.fechainput;

    if (date.length > 7) {
      date = date.substring(5, 7);
    } else date = "00";
    console.log(`${date}`);
    if (dateinput.day === date)
      if (row.flujo === "In") {
        ingresos += Number(row.cantidad);
      } else if (row.flujo === "Out") {
        gastos += Number(row.cantidad);
      }
  });

  console.log(
    `Tu balance del día es ${ingresos} en ingresos y tienes gastos de ${gastos}`
  );
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
//Input Format: '2019-W43'
async function getBalanceWeek(dateinput) {
  ingresos = 0;
  gastos = 0;

  const rows = await promisify(sheet_0.getRows)({
    offset: 1
  });

  weekNum = Number(dateinput.substring(6, 8));
  year = Number(dateinput.substring(0, 4));

  dateLower = getSundayFromWeekNum(weekNum, year);
  dateUpper = getSaturdayFromWeekNum(weekNum, year);

  console.log(`${year} ${weekNum}`);

  rows.forEach(row => {
    fechaInput = row.fechainput;
    day = Number(fechaInput.substring(8, 10));
    month = Number(fechaInput.substring(5, 7));

    date = new Date(year, month - 1, day);
    console.log(`${date}`);

    if (dateLower <= date && dateUpper >= date) {
      if (row.flujo === "In") {
        ingresos += Number(row.cantidad);
      } else if (row.flujo === "Out") {
        gastos += Number(row.cantidad);
      }
    }
  });
  console.log(
    `Tu balance del día es ${ingresos} en ingresos y tienes gastos de ${gastos}`
  );
}
//Input Format: '2019-W43'
async function willSurviveWeek(dateinput) {
  ingresos = 0;
  gastos = 0;

  const rows = await promisify(sheet_0.getRows)({
    offset: 1
  });

  weekNum = Number(dateinput.substring(6, 8));
  year = Number(dateinput.substring(0, 4));

  dateLower = getSundayFromWeekNum(weekNum, year);
  dateUpper = getSaturdayFromWeekNum(weekNum, year);

  //console.log(`${year} ${weekNum}`);

  rows.forEach(row => {
    fechaInput = row.fechainput;
    day = Number(fechaInput.substring(8, 10));
    month = Number(fechaInput.substring(5, 7));

    date = new Date(year, month - 1, day);
    //console.log(`${date}`);

    if (dateLower <= date && dateUpper >= date) {
      if (row.flujo === "In") {
        ingresos += Number(row.cantidad);
      } else if (row.flujo === "Out") {
        gastos += Number(row.cantidad);
      }
    }
  });
  console.log(
    `Tu balance del día es ${ingresos} en ingresos y tienes gastos de ${gastos}`
  );
}

async function accessSpreadsheat() {
  const doc = new GoogleSpreadsheet(
    "1KClrowuR8RJmGYknoXtBM_BjpMtAe2sh7DI2opZYrYg"
  );
  await promisify(doc.useServiceAccountAuth)(creds);
  const info = await promisify(doc.getInfo)();

  sheet_0 = info.worksheets[0];

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

  console.log(`${date2}`);
  //console.log(`${date[0].day}-${date[0].month}-${date[0].month}`);
  //console.log(`${date[1].day}-${date[1].month}-${date[1].month}`);
  //getBalance();
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

accessSpreadsheat();
