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
// const parseQuery = require("./queryParser");
// const readCSV = require("./csvReader");

// async function executeSELECTQuery(query) {
//   const { fields, table, whereClause } = parseQuery(query);
//   const data = await readCSV(`${table}.csv`);

//   // Filtering based on WHERE clause
//   const filteredData = whereClause
//     ? data.filter((row) => {
//         const [field, value] = whereClause.split("=").map((s) => s.trim());
//         return row[field] === value;
//       })
//     : data;

//   // Selecting the specified fields
//   return filteredData.map((row) => {
//     const selectedRow = {};
//     fields.forEach((field) => {
//       selectedRow[field] = row[field];
//     });
//     return selectedRow;
//   });
// }

// module.exports = executeSELECTQuery;

async function executeSELECTQuery(query) {
  const { fields, table, whereClauses } = parseQuery(query);
  const data = await readCSV(`${table}.csv`);

  // Apply WHERE clause filtering
  const filteredData =
    whereClauses.length > 0
      ? data.filter((row) =>
          whereClauses.every((clause) => {
            const { field, operator, value } = clause;

            // Handle different operators (expand as needed)
            switch (operator.toLowerCase()) {
              case "===":
                return row[field] === value;
              case "!==":
                return row[field] !== value;
              case ">":
                return row[field] > value;
              case "<":
                return row[field] < value;
              // Add more cases for other operators
              default:
                throw new Error(`Unsupported operator: ${operator}`);
            }
          })
        )
      : data;

  // Select the specified fields
  return filteredData.map((row) => {
    const selectedRow = {};
    fields.forEach((field) => {
      selectedRow[field] = row[field];
    });
    return selectedRow;
  });
}
