#!/usr/bin/env node
import path from "path";
import process from "process";
import { rollup } from "rollup";
import ts from "typescript";

main(process.argv.slice(2));

function main(args: string[]) {
    switch (args[0]) {
        case "build": 
            build(args.slice(1));
            break;
    }
}

async function build(args: string[]) {
    const fileName = args[0];
    const fileNameParts = path.parse(fileName);
    
    const outputFileName = fileNameParts.dir + fileNameParts.name + ".js";

    console.info(`${fileName} => ${outputFileName}`);

    tsc(fileName, {
        noEmitOnError: true,
        noImplicitAny: true,
        target: ts.ScriptTarget.ES2015,
        module: ts.ModuleKind.ES2015,
    });

    const rollupFileName = fileNameParts.dir + fileNameParts.name + ".js";

    const bundle = await rollup({
        input: rollupFileName
    });

    await bundle.write({
        file: outputFileName,
        format: "iife",
        sourcemap: true
    });
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
  
  