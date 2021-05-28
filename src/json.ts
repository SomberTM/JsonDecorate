import DecoratedElement from "./decoratedElement";
import { callerDir, Class, constructorOf, JsonObject } from "./util";

import path from "path";
import fs from "fs";

export namespace Json {

    const decorated: DecoratedElement[] = [];

    function isDecorated(target: any): boolean {
        return decorated.some((decorated) => decorated.matches(target));
    }

    function decoratedOf(target: any): DecoratedElement {
        target = constructorOf(target);
        Json(target);
        return decorated.find((decorated) => decorated.matches(target))!;
    }

    export class Convert {
        constructor(data: JsonObject<any>) {
            deserialize(this, data);
        }
    
        public serialize() {
            return serialize(this);
        }
    }

    export function Json(target: any) {
        if (!isDecorated(target)) { 
            decorated.push(new DecoratedElement(target));
        }
    }

    export function Property(jsonKey: string): Function;
    export function Property(target: any, propertyKey: string): void;
    export function Property(targetOrKey: any, propertyKey?: string): Function | void {
        if (typeof targetOrKey == 'string') {
            return function(target: any, propKey: string) {
                const element = decoratedOf(target);
                element.addProperty({ propertyKey: propKey, jsonKey: <string> targetOrKey });
            }
        } else {
            const element = decoratedOf(targetOrKey);
            element.addProperty({ propertyKey: <string> propertyKey, jsonKey: <string> propertyKey });
        }

    }

    export function Serialize(serializeKey: string): Function;
    export function Serialize(target: any, propertyKey: string): void;
    export function Serialize(targetOrSerializeKey: any, propertyKey?: string): Function | void {
        if (!propertyKey) {
            return function(target: any, propKey: string) {
                const element = decoratedOf(target);
                element.addSerailzable({ propertyKey: propKey, serializeKey: targetOrSerializeKey });
            }
        } else {
            const element = decoratedOf(targetOrSerializeKey);
            element.addSerailzable({ propertyKey, serializeKey: propertyKey });
        }
    }

    export function Default<T>(jsonKey: string, defaultValue: T): Function;
    export function Default<T>(defaultValue: T): Function;
    export function Default<T>(jsonKeyOrValue: string | T, defaultValue?: T): Function {
        if (jsonKeyOrValue && defaultValue) {
            return function(target: any, propertyKey: string) {
                const element = decoratedOf(target);
                element.addDefault({
                    jsonKey: <string> jsonKeyOrValue,
                    propertyKey,
                    value: defaultValue
                });
            }
        } else {
            return function(target: any, propertyKey: string) {
                const element = decoratedOf(target);
                element.addDefault({
                    propertyKey,
                    jsonKey: propertyKey,
                    value: <T> jsonKeyOrValue                
                });
            }
        }
    }

    export type Resolver<T, R> = (value: T) => R;
    export function Resolve<T, R>(jsonKey: string, resolve: Resolver<T, R>): Function;
    export function Resolve<T, R>(resolve: Resolver<T, R>): Function;
    export function Resolve<T, R>(jsonKeyOrResolver: string | Resolver<T, R>, resolve?: Resolver<T, R>): Function {
        if (jsonKeyOrResolver && resolve) {
            return function(target: any, propertyKey: string) {
                const element = decoratedOf(target);
                element.addResolver({
                    propertyKey,
                    jsonKey: <string> jsonKeyOrResolver,
                    resolve
                });
            }
        } else {
            return function(target: any, propertyKey: string) {
                const element = decoratedOf(target);
                element.addResolver({
                    propertyKey,
                    jsonKey: propertyKey,
                    resolve: <Resolver<T, R>> jsonKeyOrResolver
                });
            }
        }
    }

    export function Defer<T, R>(referenceKey: string, defer: Resolver<T, R>): Function {
        return function(target: any, propertyKey: string) {
            const element = decoratedOf(target);
            element.addDefered({
                propertyKey,
                referenceKey,
                defer
            });
        }
    }

    export function DeferAll<K extends string[], V extends unknown[], R = unknown>(referenceKeys: K, defer: (...args: V) => R): Function {
        return function(target: any, propertyKey: string) {
            const element = decoratedOf(target);
            element.addMassDefered({
                propertyKey,
                referenceKeys,
                // @ts-ignore
                defer
            });
        }
    }

    export function serialize(instance: any) {
        return decoratedOf(instance).serialize(instance);
    }

    export function deserialize(into: any, data: JsonObject<any>) {
        return decoratedOf(into).deserialize(data, into);
    }

    export interface GenerateClassOptions {
        name?: string,
        visibility?: 'public' | 'private' | 'static'
        formatter?: (key: string) => string,
        path?: string
    }
    
    const defaultClassChecks: Class<any>[] = [Date];
    function getTypeString(value: any, classes: Class<any>[] = [Date]) {
        for (let clat of classes.concat(defaultClassChecks))
            if (value instanceof clat) return clat.name;
        return typeof(value);
    }
    
    export function toClass(raw: JsonObject<any>, options?: GenerateClassOptions): string | void {
        let gen: string = `export class ${options?.name || "#NAME"} {\n\n`;
        for (let [key, value] of Object.entries(raw)) {
            gen += `\t${options?.visibility || "public"} ${options?.formatter ? options.formatter(key) : key}!: ${getTypeString(value)}; \n\n`;
        }
        gen += `}`;
        
        if (!options?.path) return gen;
        var save = path.join(callerDir(), options.path);
    
        fs.writeFileSync(save, gen);
    }

}



