const GoogleSpreadsheet = require("google-spreadsheet");
const { promisify } = require("util");

const creds = require("./my-wallet-5ec18ebadfe9.json");

function printRecord(record) {
  console.log(`Flujo: ${record.flujo}`);
  console.log(`tipo: ${record.tipo}`);
  console.log(`cantidad: ${record.cantidad}`);
  console.log(`fechainput: ${record.fechainput}`);
  console.log(`info: ${record.info}`);
  console.log("--------------------");
}

async function accessSpreadsheat() {
  const doc = new GoogleSpreadsheet(
    "1KClrowuR8RJmGYknoXtBM_BjpMtAe2sh7DI2opZYrYg"
  );
  await promisify(doc.useServiceAccountAuth)(creds);
  const info = await promisify(doc.getInfo)();
  const sheet = info.worksheets[0];
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

accessSpreadsheat();
