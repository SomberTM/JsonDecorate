import { Metadata } from "../Metadata";
import { constructorName, JsonObject } from "../util";
import { Json } from "./Json";

export interface Serializable {
    propertyKey: string,
    jsonKey: string,
    serialize(json: JsonObject, serializable: JsonObject, required?: boolean): JsonObject;
    deserialize(fill: JsonObject, data: JsonObject, required?: boolean): JsonObject;
}

export abstract class DecoratedElement implements Serializable {

    jsonKey!: string;
    propertyKey!: string;

    constructor(public required: boolean) {}

    /**
     * Serializes this elements properties into a given object
     * @param json Object to serialize into
     * @param serializable Object to serialize / get data from
     * @param required Whether the value must be present in the serializable class (!= undefined)
     */
    serialize(json: JsonObject, serializable: JsonObject): JsonObject {
        if (this.required && typeof serializable[this.propertyKey] != 'undefined')
            json[this.jsonKey] = serializable[this.propertyKey];
        else if (!this.required)
            json[this.jsonKey] = serializable[this.propertyKey];;
        return json;
    }

    /**
     * Deserializes given data into an object with this elements properties
     * @param fill Object to populate / fill with given data
     * @param data Raw json object to deserialize from
     * @param required Whether the json value must be present (!= undefined) 
     */
    deserialize(fill: JsonObject, data: JsonObject): JsonObject {
        if (this.required && typeof data[this.jsonKey] != 'undefined')
            fill[this.propertyKey] = data[this.jsonKey];
        else if (!this.required)
            fill[this.propertyKey] = data[this.jsonKey];
        return fill;
    }

}
