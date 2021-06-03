import { constructorName } from "../util";
import { Metadata, metadataElementsFor } from "../Metadata";
import { DecoratedElement } from "./Base";
import { Json } from "./Json";

export class DecoratedProperty extends DecoratedElement {
    
    constructor(public propertyKey: string, public jsonKey: string, required: boolean = false) { super(required); }

}

export function Property(jsonKey: string): Function;
export function Property(target: any, propertyKey: string): void;
export function Property(targetOrJsonKey: any, propertyKey?: string): Function | void {
    if (typeof targetOrJsonKey === 'string') {
        return function(target: any, propKey: string) {
            metadataElementsFor(target).push(new DecoratedProperty(propKey, targetOrJsonKey));
        }
    } else {
        metadataElementsFor(targetOrJsonKey).push(new DecoratedProperty(propertyKey!, propertyKey!));
    }
}