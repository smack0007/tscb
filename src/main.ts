#!/usr/bin/env node
import { readFileSync } from "fs";
import path from "path";
import process from "process";
// import { rollup } from "rollup";
import ts from "typescript";

main(process.argv.slice(2));
//.then(x => process.exit(x));

async function main(args: string[]): Promise<number> {
    switch (args[0]) {
        case "build": 
            return await build(args.slice(1));

        // default:
        //     console.error("Unknown command.");
    }

    return 0;
}

export type CommandOptionValue = boolean | string | string[];

export interface CommandOption {
    name: string,
    alias?: string,
    type: 'boolean' | 'string',
    default?: CommandOptionValue,
};

export type CommandArgs = {
    [key: string]: CommandOptionValue,
    "-": string[],
};

export function parseCommandArgs(args: string[], options?: CommandOption[]): CommandArgs {
    if (options === undefined) {
        options = [];
    }
    
    const result: CommandArgs = { "-": [] };
    let nextArgValueFor: string | undefined = undefined;

    for (const arg of args) {
        if (arg.startsWith("--") || arg.startsWith("-")) {
            let option: CommandOption | undefined = undefined;

            if (arg.startsWith("--")) {
                option = options.find(x => x.name === arg.substring("--".length));
            } else {
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
            
        } else {
            if (nextArgValueFor !== undefined) {
                result[nextArgValueFor] = arg;
                nextArgValueFor = undefined;
            } else {
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

    // const rollupFileName = fileNameParts.dir + fileNameParts.name + ".js";

    // const bundle = await rollup({
    //     input: rollupFileName
    // });

    // await bundle.write({
    //     file: outputFileName,
    //     format: "iife",
    //     sourcemap: true
    // });

    return 0;
}

function tsc(fileName: string, options: ts.CompilerOptions): number {
    const source = readFileSync(fileName, { encoding: "utf8" });

    const result = ts.transpileModule(source, { compilerOptions: options });

    console.info(result);
    
    return 0;

    // let program = ts.createProgram([ fileName ], options);
    // let emitResult = program.emit();
  
    // let allDiagnostics = ts
    //   .getPreEmitDiagnostics(program)
    //   .concat(emitResult.diagnostics);
  
    // allDiagnostics.forEach(diagnostic => {
    //   if (diagnostic.file) {
    //     let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
    //     let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
    //     console.info(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    //   } else {
    //     console.info(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
    //   }
    // });
  
    // return emitResult.emitSkipped ? 1 : 0;
}