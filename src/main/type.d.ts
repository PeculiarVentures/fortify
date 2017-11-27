type Assoc<T> = { [key: string]: T };

interface IConfigureProvider {
    lib: string;
    slot?: number;
}

interface IConfigure {
    logging?: boolean;
    locale?: string;
    disableCardUpdate?: boolean;
    cards?: string;
    providers?: IConfigureProvider[];
}

declare module "sudo-prompt" {
    export function exec(script: string, options: any, cb: (err: Error, stdout: Buffer) => void): void;
}

interface ICreateWindowOptions {
    title?: string;
    alwaysOnTop?: boolean;
    parent?: any;
}