import { constructorOf, JsonObject } from "./util";

interface DecoratedProperty {
    propertyKey: string,
    jsonKey: string
}

interface SerializableProperty {
    propertyKey: string,
    serializeKey: string
}

type DefaultDecoratedProperty<T> = {
    value: T
} & DecoratedProperty;

type DecoratedPropertyResolver<T, R> = {
    resolve: (value: T) => R;
} & DecoratedProperty;

type DeferedDecoratedProperty<T, R> = {
    propertyKey: string,
    referenceKey: string,
    defer: (deferedValue: T) => R;
};

type MassDeferedDecoratedProperty<T, R> = {
    propertyKey: string,
    referenceKeys: string[]
    defer: (...deferedValues: T[]) => R
}

export default class DecoratedElement {

    private _constructor: Function;

    private readonly properties: DecoratedProperty[] = [];
    private readonly serailzable: SerializableProperty[] = [];
    private readonly defaults: DefaultDecoratedProperty<any>[] = [];
    private readonly resolvers: DecoratedPropertyResolver<any, any>[] = [];
    private readonly defered: DeferedDecoratedProperty<any, any>[] = [];
    private readonly massDefered: MassDeferedDecoratedProperty<any, any>[] = [];

    /**
     * Should only be instantiated when a class is decorated
     * @param target The target classes constructor
     */
    constructor(target: Function) {
        this._constructor = constructorOf(target);
    }

    public matches(target: Function): boolean {
        return this._constructor.name == constructorOf(target).name;
    }

    public addProperty(property: DecoratedProperty) {
        this.properties.push(property);
    }

    public addSerailzable(serialize: SerializableProperty) {
        this.serailzable.push(serialize);
    }

    public addDefault<T>(defaultProperty: DefaultDecoratedProperty<T>) {
        this.defaults.push(defaultProperty);
    }

    public addResolver<T, R>(resolver: DecoratedPropertyResolver<T, R>) {
        this.resolvers.push(resolver);
    }

    public addDefered<T, R>(defered: DeferedDecoratedProperty<T, R>) {
        this.defered.push(defered);
    }

    public addMassDefered<T, R>(defered: MassDeferedDecoratedProperty<T, R>) {
        this.massDefered.push(defered);
    }

    public serialize(clazz: any) {
        if (!this.matches(constructorOf(clazz)))
            throw new Error("Cannot serialize class for this element");
        const json = Object.create({});

        for (let property of this.properties) 
            if (clazz[property.propertyKey])
                json[property.jsonKey] = clazz[property.propertyKey];

        for (let def of this.defaults) 
            json[def.jsonKey] = clazz[def.propertyKey] || def.value;

        for (let resolved of this.resolvers) 
            if (clazz[resolved.propertyKey])
                json[resolved.jsonKey] = clazz[resolved.propertyKey];
        
        // for (let defered of this.defered) 
        //     if (clazz[defered.propertyKey])
        //         json[defered.propertyKey] = clazz[defered.propertyKey];

        // for (let mass of this.massDefered) 
        //     if (clazz[mass.propertyKey])
        //         json[mass.propertyKey] = clazz[mass.propertyKey];
        
        for (let serializable of this.serailzable) 
            if(clazz[serializable.propertyKey] != undefined) 
                json[serializable.serializeKey] = clazz[serializable.propertyKey];

        return json;
    }

    public deserialize(data: JsonObject<any>, into?: JsonObject<any>) {
        // @ts-ignore
        let construct = into || new this._constructor();

        for (let property of this.properties) 
            if (data[property.jsonKey])
                construct[property.propertyKey] = data[property.jsonKey];

        for (let def of this.defaults) 
            construct[def.propertyKey] = data[def.jsonKey] || def.value;

        for (let resolved of this.resolvers) 
            if (data[resolved.jsonKey])
                construct[resolved.propertyKey] = resolved.resolve(data[resolved.jsonKey]);

        for (let defered of this.defered) 
            if (construct[defered.referenceKey])    
                construct[defered.propertyKey] = defered.defer(construct[defered.referenceKey]);

        for (let mass of this.massDefered) {
            let values: any[] = [];
            for (let ref of mass.referenceKeys) {
                if (construct[ref])
                    values.push(construct[ref]);
            }
            construct[mass.propertyKey] = mass.defer(...values);
        }

        if (!into) return construct;
    }
}