"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("./main");
describe("parseArgs", () => {
    it("should parse args", () => {
        expect(main_1.parseArgs(["a", "b", "c"])).toEqual({
            "a": "",
            "b": "",
            "c": "",
        });
    });
});
