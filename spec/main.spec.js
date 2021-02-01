"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("./main");
describe("parseCommandArgs", () => {
    const testData = [
        { input: [], expected: { "-": [] } },
        { input: ["a", "b", "c"], expected: { "-": ["a", "b", "c"] } },
        {
            input: ["a", "-b", "--c"],
            options: [
                { name: "boo", alias: "b", type: "boolean" },
                { name: "c", type: "boolean" },
            ],
            expected: { "-": ["a"], "boo": true, "c": true }
        },
        {
            input: ["a", "-b", "--c"],
            options: [
                { name: "boo", alias: "b", type: "boolean" },
                { name: "c", type: "boolean" },
                { name: "d", type: "boolean", default: false },
            ],
            expected: { "-": ["a"], "boo": true, "c": true, "d": false }
        },
        {
            input: ["./src/foo.ts", "-o", "./dist/app.js"],
            options: [
                { name: "output", alias: "o", type: "string" },
            ],
            expected: { "-": ["./src/foo.ts"], "output": "./dist/app.js" }
        }
    ];
    for (const test of testData) {
        let testName = "[" + test.input.map(x => "\"" + x + "\"").join(", ") + "] => ";
        testName += JSON.stringify(test.expected);
        it(testName, () => {
            expect(main_1.parseCommandArgs(test.input, test.options)).toEqual(test.expected);
        });
    }
});
