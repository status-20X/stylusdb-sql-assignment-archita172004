// // // src/index.js

// // const parseQuery = require("./queryParser");
// // const readCSV = require("./csvReader");

// // async function executeSELECTQuery(query) {
// //   const { fields, table } = parseQuery(query);
// //   const data = await readCSV(`${table}.csv`);

// //   // Filter the fields based on the query
// //   return data.map((row) => {
// //     const filteredRow = {};
// //     fields.forEach((field) => {
// //       filteredRow[field] = row[field];
// //     });
// //     return filteredRow;
// //   });
// // }

// // module.exports = executeSELECTQuery;
// // src/index.js

// const parseQuery = require("./queryParser");
// const readCSV = require("./csvReader");

// async function executeSELECTQuery(query) {
//   try {
//     const { fields, table } = parseQuery(query);
//     const data = await readCSV(`${table}.csv`);

//     // Filter the fields based on the query
//     return data.map((row) => {
//       const filteredRow = {};
//       fields.forEach((field) => {
//         filteredRow[field] = row[field];
//       });
//       return filteredRow;
//     });
//   } catch (error) {
//     // Handle any errors here
//     throw new Error(`Failed to execute SELECT query: ${error.message}`);
//   }
// }

// module.exports = executeSELECTQuery;
const parseQuery = require("./queryParser");
const readCSV = require("./csvReader");

async function executeSELECTQuery(query) {
  const { fields, table, whereClause } = parseQuery(query);
  const data = await readCSV(`${table}.csv`);

  // Filtering based on WHERE clause
  const filteredData = whereClause
    ? data.filter((row) => {
        const [field, value] = whereClause.split("=").map((s) => s.trim());
        return row[field] === value;
      })
    : data;

  // Selecting the specified fields
  return filteredData.map((row) => {
    const selectedRow = {};
    fields.forEach((field) => {
      selectedRow[field] = row[field];
    });
    return selectedRow;
  });
}

module.exports = executeSELECTQuery;
