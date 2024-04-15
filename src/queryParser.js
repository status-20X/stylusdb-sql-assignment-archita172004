// function parseQuery(query) {
//   const selectRegex = /SELECT (.+) FROM (.+)/i;
//   const match = query.match(selectRegex);

//   if (match) {
//     const [, fields, table] = match;
//     return {
//       fields: fields.split(",").map((field) => field.trim()),
//       table: table.trim(),
//     };
//   } else {
//     throw new Error("Invalid query format");
//   }
// }

// module.exports = parseQuery;
// src/queryParser.js

// function parseQuery(query) {
//   const selectRegex = /SELECT (.+?) FROM (.+?)(?: WHERE (.*))?$/i;
//   const match = query.match(selectRegex);

//   if (match) {
//     const [, fields, table, whereClause] = match;
//     return {
//       fields: fields.split(",").map((field) => field.trim()),
//       table: table.trim(),
//       whereClause: whereClause ? whereClause.trim() : null,
//     };
//   } else {
//     throw new Error("Invalid query format");
//   }
// }

// module.exports = parseQuery;

function parseQuery(query) {
  const selectRegex = /SELECT (.+?) FROM (.+?)(?: WHERE (.*))?$/i;
  const match = query.match(selectRegex);

  if (match) {
    const [, fields, table, whereString] = match;
    const whereClauses = whereString ? parseWhereClause(whereString) : [];
    return {
      fields: fields.split(",").map((field) => field.trim()),
      table: table.trim(),
      whereClauses,
    };
  } else {
    throw new Error("Invalid query format");
  }
}

function parseWhereClause(whereString) {
  const conditions = whereString.split(/ AND | OR /i);
  return conditions.map((condition) => {
    // Add error handling for invalid condition format
    const parts = condition.trim().split(/\s+/);
    if (parts.length < 3 || parts.length > 3) {
      throw new Error("Invalid WHERE clause condition format");
    }

    const [field, operator, value] = parts;
    return { field, operator, value };
  });
}

module.exports = parseQuery;
