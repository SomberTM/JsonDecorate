import { metadataElementsFor } from "../Metadata";
import { JsonObject } from "../util";
import { DecoratedElement } from "./Base";

export class DecoratedSerializable extends DecoratedElement {

    constructor(public propertyKey: string, public jsonKey: string, required: boolean = false) { super(required); }

    override serialize(json: JsonObject, serializable: JsonObject): JsonObject {
        if (this.required && typeof serializable[this.propertyKey] != 'undefined')
            json[this.jsonKey] = serializable[this.propertyKey];
        else if (!this.required)
            json[this.jsonKey] = serializable[this.propertyKey];
        return json;
    }

    override deserialize(fill: JsonObject, data: JsonObject): JsonObject<undefined> {
        return { };
    }

}

export function Serialize(serializeKey: string): Function;
export function Serialize(target: any, propertyKey: string): void;
export function Serialize(targetOrSerializeKey: any, propertyKey?: string): Function | void {
    if (typeof targetOrSerializeKey === 'string') {
        return function(target: any, propKey: string) {
            metadataElementsFor(target).push(new DecoratedSerializable(propKey, targetOrSerializeKey));
        }
    } else {
        metadataElementsFor(targetOrSerializeKey).push(new DecoratedSerializable(propertyKey!, propertyKey!));
    }
}