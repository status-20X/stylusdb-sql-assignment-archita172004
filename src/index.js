const { parseQuery } = require("./queryParser");
const readCSV = require("./csvReader");

function applyGroupBy(data, groupByFields, aggregateFunctions) {
  const groupResults = {};
  data.forEach((row) => {
    // Generate a key for the group
    const groupKey = groupByFields.map((field) => row[field]).join("-");
    // Initialize group in results if it doesn't exist
    if (!groupResults[groupKey]) {
      groupResults[groupKey] = { count: 0, sums: {}, mins: {}, maxes: {} };
      groupByFields.forEach(
        (field) => (groupResults[groupKey][field] = row[field])
      );
    }
    // Aggregate calculations
    groupResults[groupKey].count += 1;
    aggregateFunctions.forEach((func) => {
      const match = /(\w+)\((\w+)\)/.exec(func);
      if (match) {
        const [, aggFunc, aggField] = match;
        const value = parseFloat(row[aggField]);
        switch (aggFunc.toUpperCase()) {
          case "SUM":
            groupResults[groupKey].sums[aggField] =
              (groupResults[groupKey].sums[aggField] || 0) + value;
            break;
          case "MIN":
            groupResults[groupKey].mins[aggField] = Math.min(
              groupResults[groupKey].mins[aggField] || value,
              value
            );
            break;
          case "MAX":
            groupResults[groupKey].maxes[aggField] = Math.max(
              groupResults[groupKey].maxes[aggField] || value,
              value
            );
            break;
          // Additional aggregate functions can be added here
        }
      }
    });
  });
  // Convert grouped results into an array format
  return Object.values(groupResults).map((group) => {
    // Construct the final grouped object based on required fields
    const finalGroup = {};
    groupByFields.forEach((field) => (finalGroup[field] = group[field]));
    aggregateFunctions.forEach((func) => {
      const match = /(\w+)\((\*|\w+)\)/.exec(func);
      if (match) {
        const [, aggFunc, aggField] = match;
        switch (aggFunc.toUpperCase()) {
          case "SUM":
            finalGroup[func] = group.sums[aggField];
            break;
          case "MIN":
            finalGroup[func] = group.mins[aggField];
            break;
          case "MAX":
            finalGroup[func] = group.maxes[aggField];
            break;
          case "COUNT":
            finalGroup[func] = group.count;
            break;
          // Additional aggregate functions can be handled here
        }
      }
    });
    return finalGroup;
  });
}

function evaluateCondition(row, clause) {
  let { field, operator, value } = clause;
  // Check if the field exists in the row
  if (row[field] === undefined) {
    throw new Error(`Invalid field: ${field}`);
  }
  // Parse row value and condition value based on their actual types
  const rowValue = parseValue(row[field]);
  let conditionValue = parseValue(value);
  switch (operator) {
    case "=":
      return rowValue === conditionValue;
    case "!=":
      return rowValue !== conditionValue;
    case ">":
      return rowValue > conditionValue;
    case "<":
      return rowValue < conditionValue;
    case ">=":
      return rowValue >= conditionValue;
    case "<=":
      return rowValue <= conditionValue;
    default:
      throw new Error(`Unsupported operator: ${operator}`);
  }
}

async function executeSELECTQuery(query) {
  try {
    const {
      fields,
      table,
      whereClauses,
      joinType,
      joinTable,
      joinCondition,
      groupByFields,
      hasAggregateWithoutGroupBy,
      orderByFields,
      limit,
    } = parseQuery(query);
    let data = await readCSV(`${table}.csv`);

    // Perform INNER JOIN if specified
    if (joinTable && joinCondition) {
      const joinData = await readCSV(`${joinTable}.csv`);
      switch (joinType.toUpperCase()) {
        case "INNER":
          data = performInnerJoin(data, joinData, joinCondition, fields, table);
          break;
        case "LEFT":
          data = performLeftJoin(data, joinData, joinCondition, fields, table);
          break;
        case "RIGHT":
          data = performRightJoin(data, joinData, joinCondition, fields, table);
          break;
        default:
          throw new Error(`Unsupported JOIN type: ${joinType}`);
      }
    }
    // Apply WHERE clause filtering after JOIN (or on the original data if no join)
    let filteredData =
      whereClauses.length > 0
        ? data.filter((row) =>
            whereClauses.every((clause) => evaluateCondition(row, clause))
          )
        : data;

    let groupResults = filteredData;
    if (hasAggregateWithoutGroupBy) {
      // Special handling for queries like 'SELECT COUNT(*) FROM table'
      const result = {};

      fields.forEach((field) => {
        const match = /(\w+)\((\*|\w+)\)/.exec(field);
        if (match) {
          const [, aggFunc, aggField] = match;
          switch (aggFunc.toUpperCase()) {
            case "COUNT":
              result[field] = filteredData.length;
              break;
            case "SUM":
              result[field] = filteredData.reduce(
                (acc, row) => acc + parseFloat(row[aggField]),
                0
              );
              break;
            case "AVG":
              result[field] =
                filteredData.reduce(
                  (acc, row) => acc + parseFloat(row[aggField]),
                  0
                ) / filteredData.length;
              break;
            case "MIN":
              result[field] = Math.min(
                ...filteredData.map((row) => parseFloat(row[aggField]))
              );
              break;
            case "MAX":
              result[field] = Math.max(
                ...filteredData.map((row) => parseFloat(row[aggField]))
              );
              break;
          }
        }
      });
      return [result];
      // Add more cases here if needed for other aggregates
    } else if (groupByFields) {
      groupResults = applyGroupBy(filteredData, groupByFields, fields);

      // order
      let orderedResults = groupResults;
      if (orderByFields) {
        orderedResults = groupResults.sort((a, b) => {
          for (let { fieldName, order } of orderByFields) {
            if (a[fieldName] < b[fieldName]) return order === "ASC" ? -1 : 1;
            if (a[fieldName] > b[fieldName]) return order === "ASC" ? 1 : -1;
          }
          return 0;
        });
      }
      if (limit !== null) {
        groupResults = groupResults.slice(0, limit);
      }
      return groupResults;
    } else {
      let orderedResults = groupResults;
      if (orderByFields) {
        orderedResults = groupResults.sort((a, b) => {
          for (let { fieldName, order } of orderByFields) {
            if (a[fieldName] < b[fieldName]) return order === "ASC" ? -1 : 1;
            if (a[fieldName] > b[fieldName]) return order === "ASC" ? 1 : -1;
          }
          return 0;
        });
      }

      if (limit !== null) {
        orderedResults = orderedResults.slice(0, limit);
      }

      // Select the specified fields
      return orderedResults.map((row) => {
        const selectedRow = {};
        fields.forEach((field) => {
          // Assuming 'field' is just the column name without table prefix
          selectedRow[field] = row[field];
        });
        return selectedRow;
      });
    }
  } catch (error) {
    throw new Error(`Error executing query: ${error.message}`);
  }
}
module.exports = executeSELECTQuery;
