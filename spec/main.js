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
exports.parseArgs = void 0;
const path_1 = __importDefault(require("path"));
const process_1 = __importDefault(require("process"));
const rollup_1 = require("rollup");
const typescript_1 = __importDefault(require("typescript"));
main(process_1.default.argv.slice(2));
function main(args) {
    switch (args[0]) {
        case "build":
            build(args.slice(1));
            break;
    }
}
function parseArgs(args) {
    const result = {};
    for (const arg of args) {
        result[arg] = "";
    }
    return result;
}
exports.parseArgs = parseArgs;
function build(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const fileName = args[0];
        const fileNameParts = path_1.default.parse(fileName);
        const outputFileName = fileNameParts.dir + fileNameParts.name + ".js";
        console.info(`${fileName} => ${outputFileName}`);
        tsc(fileName, {
            noEmitOnError: true,
            noImplicitAny: true,
            target: typescript_1.default.ScriptTarget.ES2015,
            module: typescript_1.default.ModuleKind.ES2015,
        });
        const rollupFileName = fileNameParts.dir + fileNameParts.name + ".js";
        const bundle = yield rollup_1.rollup({
            input: rollupFileName
        });
        yield bundle.write({
            file: outputFileName,
            format: "iife",
            sourcemap: true
        });
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
