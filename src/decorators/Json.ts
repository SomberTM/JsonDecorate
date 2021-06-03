import { Class, constructorName, constructorOf, JsonObject } from "../util";
import { Metadata } from "../Metadata";
import { DecoratedElement } from "./Base";
import { DecoratedDefered } from "./Defer";
import { DecoratedDeferAll } from "./DeferAll";

export class JsonElement  {

    public elements: DecoratedElement[] = [];

    constructor(private _constructor: Function, private _parent?: Function) { 
        this._constructor = constructorOf(_constructor);
        this._parent = _parent ? constructorOf(_parent) : undefined;
    }
    
    setParent(parent: Function) {
        this._parent = constructorOf(parent);
    }

    getJsonKey(propertyKey: string) {
        return this.elements.find((element) => element.propertyKey === propertyKey)?.jsonKey;
    }

    getPropertyKey(jsonKey: string) {
        return this.elements.find((element) => element.jsonKey === jsonKey)?.propertyKey;
    }

    serialize(serializable: JsonObject, fill?: JsonObject): JsonObject {
        const json: JsonObject = fill ?? Object.create({});

        if (this._parent)
            Metadata.get(constructorName(this._parent))?.serialize(serializable, json);

        for (let element of this.elements) {
            element.serialize(json, serializable);

            // * Check deep serializable elements
            const jv = json[element.jsonKey];
            if (jv instanceof Array) {
                for (let i = 0; i < jv.length; i++)
                    if (Metadata.has(constructorName(jv[i])))   
                        jv[i] = serialize(jv[i]);
            } else if (typeof jv === 'object' && jv !== null) {
                for (let [key, value] of Object.entries(jv))
                    if (Metadata.has(constructorName(<Object | Function>value)))
                        jv[key] = serialize(value);
            }
        } 

        return json;
    }

    deserialize(data: JsonObject, fill: JsonObject): JsonObject {
        if (this._parent)
            Metadata.get(constructorName(this._parent))?.deserialize(data, fill);

        for (let element of this.elements.filter((value) => !(value instanceof DecoratedDefered && value instanceof DecoratedDeferAll)))
            element.deserialize(fill, data);

        for (let element of this.elements.filter((value) => (value instanceof DecoratedDefered || value instanceof DecoratedDeferAll)))
            element.deserialize(fill, data);

        return fill;
    }

}

export function deserialize<T>(instance: T, data: JsonObject, required?: boolean): T {
    Json(constructorOf(instance));
    return <T> Metadata.get(constructorName(instance))!.deserialize(data, instance);
}

export function serialize<T>(clazz: T, fill?: JsonObject, required?: boolean): JsonObject {
    Json(constructorOf(clazz));
    return Metadata.get(constructorName(clazz))!.serialize(clazz, fill);
}

export function Json(target: Function) {
    let name: string;
    if (!Metadata.has( (name = constructorName(target)) )) 
        Metadata.set(name, new JsonElement(target));
}

export function ChildOf<T>(parent: Class<T>): Function {
    return function(target: Function) {
        let name: string;
        if (!Metadata.has( (name = constructorName(target)) )) 
            Metadata.set(name, new JsonElement(target, parent));    
        else Metadata.get(name)?.setParent(constructorOf(parent));
    }
}