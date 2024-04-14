// // src/index.js

// const parseQuery = require("./queryParser");
// const readCSV = require("./csvReader");

// async function executeSELECTQuery(query) {
//   const { fields, table } = parseQuery(query);
//   const data = await readCSV(`${table}.csv`);

//   // Filter the fields based on the query
//   return data.map((row) => {
//     const filteredRow = {};
//     fields.forEach((field) => {
//       filteredRow[field] = row[field];
//     });
//     return filteredRow;
//   });
// }

// module.exports = executeSELECTQuery;
// src/index.js

const parseQuery = require("./queryParser");
const readCSV = require("./csvReader");

async function executeSELECTQuery(query) {
  try {
    const { fields, table } = parseQuery(query);
    const data = await readCSV(`${table}.csv`);

    // Filter the fields based on the query
    return data.map((row) => {
      const filteredRow = {};
      fields.forEach((field) => {
        filteredRow[field] = row[field];
      });
      return filteredRow;
    });
  } catch (error) {
    // Handle any errors here
    throw new Error(`Failed to execute SELECT query: ${error.message}`);
  }
}

module.exports = executeSELECTQuery;
