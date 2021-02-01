#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCommandArgs = void 0;
const path_1 = __importDefault(require("path"));
const process_1 = __importDefault(require("process"));
const rollup_1 = require("rollup");
const typescript_1 = __importDefault(require("typescript"));
main(process_1.default.argv.slice(2));
//.then(x => process.exit(x));
function main(args) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (args[0]) {
            case "build":
                return yield build(args.slice(1));
            // default:
            //     console.error("Unknown command.");
        }
        return 0;
    });
}
;
function parseCommandArgs(args, options) {
    if (options === undefined) {
        options = [];
    }
    const result = { "-": [] };
    let nextArgValueFor = undefined;
    for (const arg of args) {
        if (arg.startsWith("--") || arg.startsWith("-")) {
            let option = undefined;
            if (arg.startsWith("--")) {
                option = options.find(x => x.name === arg.substring("--".length));
            }
            else {
                option = options.find(x => x.alias === arg.substring("-".length));
            }
            if (option === undefined) {
                throw new Error(`Unknown option ${arg}`);
            }
            switch (option.type) {
                case "boolean":
                    result[option.name] = true;
                    break;
                case "string":
                    result[option.name] = "";
                    nextArgValueFor = option.name;
                    break;
            }
        }
        else {
            if (nextArgValueFor !== undefined) {
                result[nextArgValueFor] = arg;
                nextArgValueFor = undefined;
            }
            else {
                result["-"].push(arg);
            }
        }
    }
    for (const option of options) {
        if (option.default !== undefined && result[option.name] === undefined) {
            result[option.name] = option.default;
        }
    }
    return result;
}
exports.parseCommandArgs = parseCommandArgs;
function build(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const commandArgs = parseCommandArgs(args, [
            { name: "output", alias: "o", type: "string" }
        ]);
        const fileName = commandArgs["-"][0];
        if (fileName === undefined) {
            console.error("Please provide a file to compile.");
            return 1;
        }
        const fileNameParts = path_1.default.parse(fileName);
        let outputFileName = commandArgs["output"];
        if (outputFileName === undefined) {
            outputFileName = fileNameParts.dir + fileNameParts.name + ".js";
        }
        console.info(`${fileName} => ${outputFileName}`);
        const tscResult = tsc(fileName, {
            noEmitOnError: true,
            noImplicitAny: true,
            target: typescript_1.default.ScriptTarget.ES2015,
            module: typescript_1.default.ModuleKind.ES2015,
        });
        if (tscResult !== 0) {
            return tscResult;
        }
        const rollupFileName = fileNameParts.dir + fileNameParts.name + ".js";
        const bundle = yield rollup_1.rollup({
            input: rollupFileName
        });
        yield bundle.write({
            file: outputFileName,
            format: "iife",
            sourcemap: true
        });
        return 0;
    });
}
function tsc(fileName, options) {
    let program = typescript_1.default.createProgram([fileName], options);
    let emitResult = program.emit();
    let allDiagnostics = typescript_1.default
        .getPreEmitDiagnostics(program)
        .concat(emitResult.diagnostics);
    allDiagnostics.forEach(diagnostic => {
        if (diagnostic.file) {
            let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
            let message = typescript_1.default.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
            console.info(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
        }
        else {
            console.info(typescript_1.default.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
        }
    });
    return emitResult.emitSkipped ? 1 : 0;
}
