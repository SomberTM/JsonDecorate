import { metadataElementsFor } from "../Metadata";
import { JsonObject } from "../util";
import { DecoratedElement } from "./Base";

export class DecoratedDefault extends DecoratedElement {

    constructor(public propertyKey: string, 
                public jsonKey: string, 
                public defaultValue: any,
                required: boolean = false) 
                { super(required); }

    override serialize(json: JsonObject, serializable: JsonObject): JsonObject {
        if (this.required && typeof serializable[this.propertyKey] != 'undefined')
            json[this.jsonKey] = serializable[this.propertyKey] ?? this.defaultValue;
        else if (!this.required)
            json[this.jsonKey] = serializable[this.propertyKey] ?? this.defaultValue;
        return json;
    }

    override deserialize(fill: JsonObject, data: JsonObject): JsonObject<undefined> {
        if (this.required && typeof data[this.jsonKey] != 'undefined')
            fill[this.propertyKey] = data[this.jsonKey] ?? this.defaultValue;
        else if (!this.required)
            fill[this.propertyKey] = data[this.jsonKey] ?? this.defaultValue;
        return fill;
    }    

}

export function Default<T>(jsonKey: string, value: T): Function;
export function Default<T>(value: T): Function;
export function Default<T>(valueOrJsonKey: T | string, value?: T): Function {
    if (typeof value != 'undefined')
        return function(target: any, propertyKey: string) {
            metadataElementsFor(target).push(new DecoratedDefault(propertyKey, <string> valueOrJsonKey, value));
        };
    else return function (target: any, propertyKey: string) {
        metadataElementsFor(target).push(new DecoratedDefault(propertyKey, propertyKey, valueOrJsonKey));
    }

}