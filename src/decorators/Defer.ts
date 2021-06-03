import { metadataElementsFor } from "../Metadata";
import { JsonObject } from "../util";
import { DecoratedElement } from "./Base";

type Defered<T = any, R = any> = (deferedValue: T) => R;
export class DecoratedDefered<T, R> extends DecoratedElement {

    constructor(public propertyKey: string, public referenceKey: string, public defer: Defered<T, R>, required: boolean = false) { super(required); }

    // * To serialize a defered property decorate with @Serialize
    override serialize(json: JsonObject, serializable: JsonObject): JsonObject {
        return { };
    }

    override deserialize(fill: JsonObject): JsonObject {
        if (this.required && typeof fill[this.referenceKey] != 'undefined')
            fill[this.propertyKey] = this.defer(fill[this.referenceKey]);
        else if (!this.required)
            fill[this.propertyKey] = this.defer(fill[this.referenceKey]);
        return fill;
    }

}

export function Defer<T, R>(referenceKey: string, defer: Defered<T, R>): Function {
    return function(target: any, propertyKey: string) {
        metadataElementsFor(target).push(new DecoratedDefered(propertyKey, referenceKey, defer));
    }
}