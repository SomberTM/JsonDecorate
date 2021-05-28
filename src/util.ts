// @ts-nocheck

export function constructorOf(target: Object | Function): Function {
    if (target instanceof Function) return target;
    else return target.constructor;
}

export type Class<T> = { new (...args: any[]): T };
export type JsonObject<ValueType = any> = { [key: string]: ValueType, [key: number]: ValueType };

export function caller(depth?: number): string {
    var pst, stack, file, frame;

    pst = Error.prepareStackTrace;
    Error.prepareStackTrace = function (_, stack) {
        Error.prepareStackTrace = pst;
        return stack;
    };

    stack = (new Error()).stack;
    depth = !depth || isNaN(depth) ? 1 : (depth > stack.length - 2 ? stack.length - 2 : depth);
    stack = stack.slice(depth + 1);

    do {
        frame = stack.shift();
        file = frame && frame.getFileName();
    } while (stack.length && file === 'module.js');

    return file;
};

export function callerDir(): string {
    var file: string = caller();
    return file.substring(0, file.lastIndexOf("\\") + 1);
}


