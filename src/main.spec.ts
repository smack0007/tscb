import { parseArgs } from "./main";

describe("parseArgs", () => {
    it ("should parse args", () => {
        expect(parseArgs(["a", "b", "c"])).toEqual({
            "a": "",
            "b": "",
            "c": "",
        });
    });
});