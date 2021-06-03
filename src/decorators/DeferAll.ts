import { metadataElementsFor } from "../Metadata";
import { JsonObject } from "../util";
import { DecoratedElement } from "./Base";

export type DefarAllFunc<T extends unknown[], R> = (...args: T) => R;

export class DecoratedDeferAll<T extends unknown[], R> extends DecoratedElement {

    constructor(public propertyKey: string, public referenceKeys: string[], public defer: DefarAllFunc<T, R>, required: boolean = false) { super(required); }

    override serialize(json: JsonObject, serializable: JsonObject): JsonObject {
        return { };
    }

    override deserialize(fill: JsonObject): JsonObject {
        let values: any[] = [];
        for (let key of this.referenceKeys) {
            if (this.required && typeof fill[key] != 'undefined')
                values.push(fill[key]);
            else if (!this.required)
                values.push(fill[key]);
        }
        //@ts-ignore
        fill[this.propertyKey] = this.defer(...values);
        return fill;
    }

}

export function DeferAll<K extends string[], V extends unknown[], R = unknown>(referenceKeys: K, defer: DefarAllFunc<V, R>): Function {
    return function(target: any, propertyKey: string) {
        metadataElementsFor(target).push(new DecoratedDeferAll(propertyKey, referenceKeys, defer));
    }
}