#!/usr/bin/env node
import path from "path";
import process from "process";
import { rollup } from "rollup";
import ts from "typescript";
import { parseCommandArgs } from "./utils/commandArgs";

main(process.argv.slice(2)).then(x => process.exit(x));

async function main(args: string[]): Promise<number> {
    switch (args[0]) {
        case "build": 
            return await build(args.slice(1));

        default:
            console.error("Unknown command.");
    }

    return 0;
}

async function build(args: string[]): Promise<number> {
    const commandArgs = parseCommandArgs(args, [
        { name: "output", alias: "o", type: "string" }
    ]);
    
    const fileName = commandArgs["-"][0];

    if (fileName === undefined) {
        console.error("Please provide a file to compile.");
        return 1;
    }

    const fileNameParts = path.parse(fileName);
    
    let outputFileName = commandArgs["output"] as string | undefined;
    if (outputFileName === undefined) {
        outputFileName = fileNameParts.dir + fileNameParts.name + ".js";
    }    

    console.info(`${fileName} => ${outputFileName}`);

    const tscResult = tsc(fileName, {
        noEmitOnError: true,
        noImplicitAny: true,
        target: ts.ScriptTarget.ES2015,
        module: ts.ModuleKind.ES2015,
    });

    if (tscResult !== 0) {
        return tscResult;
    }

    const rollupFileName = fileNameParts.dir + fileNameParts.name + ".js";

    const bundle = await rollup({
        input: rollupFileName
    });

    await bundle.write({
        file: outputFileName,
        format: "iife",
        sourcemap: true
    });

    return 0;
}

function tsc(fileName: string, options: ts.CompilerOptions): number {
    let program = ts.createProgram([ fileName ], options);
    let emitResult = program.emit();
  
    let allDiagnostics = ts
      .getPreEmitDiagnostics(program)
      .concat(emitResult.diagnostics);
  
    allDiagnostics.forEach(diagnostic => {
      if (diagnostic.file) {
        let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
        let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
        console.info(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
      } else {
        console.info(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
      }
    });
  
    return emitResult.emitSkipped ? 1 : 0;
}