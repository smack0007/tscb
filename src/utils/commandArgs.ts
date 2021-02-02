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