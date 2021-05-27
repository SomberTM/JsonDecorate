export function constructorOf(target: Object | Function): Function {
    if (target instanceof Function) return target;
    else return target.constructor;
}

export type Class<T> = { new (...args: any[]): T };
export type JsonObject<ValueType = any> = { [key: string]: ValueType, [key: number]: ValueType };