// const readCSV = require("../src/csvReader");

// test("Read CSV File", async () => {
//   const data = await readCSV("./sample.csv");
//   expect(data.length).toBeGreaterThan(0);
//   expect(data.length).toBe(3);
//   expect(data[0].name).toBe("John");
//   expect(data[0].age).toBe("30"); //ignore the string type here, we will fix this later
// });

// // const parseQuery = require("../src/queryParser");

// // test("Parse SQL Query", () => {
// //   const query = "SELECT id, name FROM sample";
// //   const parsed = parseQuery(query);
// //   expect(parsed).toEqual({
// //     fields: ["id", "name"],
// //     table: "sample",
// //   });
// // });

// // tests/index.test.js

// const parseQuery = require("../src/queryParser");

// test("Parse SQL Query", () => {
//   const query = "SELECT id, name FROM sample";
//   let parsed;
//   try {
//     parsed = parseQuery(query);
//     expect(parsed).toEqual({
//       fields: ["id", "name"],
//       table: "sample",
//     });
//   } catch (error) {
//     fail(`Parsing failed with error: ${error.message}`);
//   }
// });
// tests/index.test.js

// const executeSELECTQuery = require("../src/index");

// test("Execute SQL Query with WHERE Clause", async () => {
//   const query = "SELECT id, name FROM sample WHERE age = 25";
//   const result = await executeSELECTQuery(query);
//   expect(result.length).toBe(1);
//   expect(result[0]).toHaveProperty("id");
//   expect(result[0]).toHaveProperty("name");
//   expect(result[0].id).toBe("2");
// });

// const executeSELECTQuery = require("../src/index");

// test("Execute SQL Query with WHERE Clause", async () => {
//   const query = "SELECT id, name FROM sample WHERE age = 25";
//   const result = await executeSELECTQuery(query);
//   expect(result.length).toBe(1);
//   expect(result[0]).toHaveProperty("id");
//   expect(result[0]).toHaveProperty("name");
//   expect(result[0].id).toBe("2"); // Modify this expectation based on your sample data
// });

// // Test with non-existent value in WHERE clause
// test("Execute SQL Query with non-existent WHERE Clause value", async () => {
//   const query = "SELECT id, name FROM sample WHERE age = 30";
//   const result = await executeSELECTQuery(query);
//   expect(result.length).toBe(0); // Expect no results
// });

// // Test case sensitivity
// test("Execute SQL Query with WHERE Clause (case-sensitive)", async () => {
//   const query = "SELECT id, name FROM sample WHERE AGE = 25"; // All caps in WHERE clause
//   const result = await executeSELECTQuery(query);
//   expect(result.length).toBe(0); // Expect no results (shouldn't match due to case sensitivity)
// });

// // Test case insensitivity
// test("Execute SQL Query with WHERE Clause (case-insensitive)", async () => {
//   const query = "SELECT id, name FROM sample WHERE AgE = 25"; // Mixed case in WHERE clause
//   const result = await executeSELECTQuery(query);
//   expect(result.length).toBe(1); // Expect one result (case-insensitive matching)
// });
const executeSELECTQuery = require("../src/index");

test("Parse SQL Query with Multiple WHERE Clauses", () => {
  const query = "SELECT id, name FROM sample WHERE age = 30 AND name = John";
  const parsed = parseQuery(query);
  expect(parsed).toEqual({
    fields: ["id", "name"],
    table: "sample",
    whereClauses: [
      { field: "age", operator: "=", value: "30" },
      { field: "name", operator: "=", value: "John" },
    ],
  });
});

test("Execute SQL Query with Multiple WHERE Clause", async () => {
  const query = "SELECT id, name FROM sample WHERE age = 30 AND name = John";
  const result = await executeSELECTQuery(query);
  expect(result.length).toBe(1); // Modify this expectation based on your sample data
  expect(result[0]).toHaveProperty("id");
  expect(result[0]).toHaveProperty("name");
});

// Test with unsupported operator
test("Execute SQL Query with Unsupported Operator", async () => {
  expect.assertions(1); // Only expect one assertion (the error)
  try {
    const query = "SELECT id, name FROM sample WHERE age <> 30"; // Unsupported operator
    await executeSELECTQuery(query);
  } catch (error) {
    expect(error.message).toContain("Unsupported operator"); // Check for error message
  }
});

// Test with missing value in WHERE clause
test("Parse SQL Query with Missing Value in WHERE Clause", () => {
  expect.assertions(1); // Only expect one assertion (the error)
  try {
    const query = "SELECT id, name FROM sample WHERE age = "; // Missing value
    parseQuery(query);
  } catch (error) {
    expect(error.message).toContain("Invalid WHERE clause condition format"); // Check for error message
  }
});
