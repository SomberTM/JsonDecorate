import { metadataElementsFor } from "../Metadata";
import { JsonObject } from "../util";
import { DecoratedElement } from "./Base";

type Resolver<T = any, R = any> = (value: T) => R;
export class DecoratedResolver<T, R> extends DecoratedElement {
 
    constructor(public propertyKey: string, public jsonKey: string, public resolver: Resolver<T, R>, required: boolean = false) { super(required); }

    override serialize(json: JsonObject, serializable: JsonObject): JsonObject {
        if (this.required && typeof serializable[this.propertyKey] != 'undefined')
            json[this.jsonKey] = serializable[this.propertyKey];
        else if (!this.required)
            json[this.jsonKey] = serializable[this.propertyKey];
        return json;
    }

    override deserialize(fill: JsonObject, data: JsonObject): JsonObject {
        if (this.required && typeof data[this.jsonKey] != 'undefined')
            fill[this.propertyKey] = this.resolver(data[this.jsonKey]);
        else if (!this.required)
            fill[this.propertyKey] = this.resolver(data[this.jsonKey]);
        return fill;
    }

}

export function Resolve<T, R>(jsonKey: string, resolver: Resolver<T, R>): Function;
export function Resolve<T, R>(resolver: Resolver<T, R>): Function;
export function Resolve<T, R>(resolverOrJsonKey: Resolver<T, R> | string, resolver?: Resolver<T, R>): Function {
    if (typeof resolverOrJsonKey === 'string' && resolver) {
        return function(target: any, propertyKey: string) {
            metadataElementsFor(target).push(new DecoratedResolver(propertyKey, <string> resolverOrJsonKey, resolver));
        }
    } else {
        return function(target: any, propertyKey: string) {
            metadataElementsFor(target).push(new DecoratedResolver(propertyKey, propertyKey, <Resolver<T, R>>resolverOrJsonKey));
        }
    }
}