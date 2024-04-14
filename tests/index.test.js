const readCSV = require("../src/csvReader");

test("Read CSV File", async () => {
  const data = await readCSV("./sample.csv");
  expect(data.length).toBeGreaterThan(0);
  expect(data.length).toBe(3);
  expect(data[0].name).toBe("John");
  expect(data[0].age).toBe("30"); //ignore the string type here, we will fix this later
});

// const parseQuery = require("../src/queryParser");

// test("Parse SQL Query", () => {
//   const query = "SELECT id, name FROM sample";
//   const parsed = parseQuery(query);
//   expect(parsed).toEqual({
//     fields: ["id", "name"],
//     table: "sample",
//   });
// });

// tests/index.test.js

const parseQuery = require("../src/queryParser");

test("Parse SQL Query", () => {
  const query = "SELECT id, name FROM sample";
  let parsed;
  try {
    parsed = parseQuery(query);
    expect(parsed).toEqual({
      fields: ["id", "name"],
      table: "sample",
    });
  } catch (error) {
    fail(`Parsing failed with error: ${error.message}`);
  }
});
