export function constructorOf(target: Object | Function): Function {
    if (target instanceof Function) return target;
    else return target.constructor;
}

export function constructorName(target: Object | Function): string {
    return constructorOf(target)['name'];
}

export type Class<T> = { new (...args: any[]): T };
export type JsonObject<ValueType = any> = { [key: string]: ValueType, [key: number]: ValueType };

export type CacheEntries<K, V> = ReadonlyArray<readonly [K, V]> | null;
export type CacheFunction<K, V, R> = (value: V, key: K, cache: Cache<K, V>) => R;
export interface CacheConstructor {
    new (): Cache<unknown, unknown>;
    new <K, V>(entries?: CacheEntries<K, V>): Cache<K, V>;
}

export class Cache<K, V> extends Map<K, V> {

    private _array: V[] | null;
    private _keys: K[] | null;

    public constructor(entries?: CacheEntries<K, V>) {
       super(entries);
       this._array = null;
       this._keys = null;
    }

    public get(key: K): V | undefined {
        return super.get(key);
    }

    public set(key: K, value: V): this {
        this._array = null;
        this._keys = null;
        return super.set(key, value);
    }

    public has(key: K): boolean {
        return super.has(key);
    }

    public delete(key: K): boolean {
        this._array = null;
        this._keys = null;
        return super.delete(key);
    }

    public deleteAll(fn: CacheFunction<K, V, boolean>): boolean {
        let status: boolean = true;
        for (let [key, value] of this)
            if (fn(value, key, this))
                if (!this.delete(key)) status = false;
        return status;
    }

    public clear(): void {
        super.clear();
    }

    public empty(): boolean {
        return this.size === 0;
    }

    public array(): V[] {
        if (!this._array || this._array.length !== this.size) this._array = [...this.values()];
        return this._array;
    }

    public keyArray(): K[] {
        if (!this._keys || this._keys.length !== this.size) this._keys = [...this.keys()];
        return this._keys; 
    }

    public first(): V | undefined;
    public first(amount: number): V[] | undefined;
    public first(amount?: number): V | V[] | undefined {
        if (this.empty() || (amount && amount === 0)) return undefined;
        const cached: V[] = this.array();
        if (!amount) return cached[0];
        if (amount < 0) return this.last(-amount);
        return Array.from({ length: Math.min(amount, this.size) }, (_, i) => cached[i]);
    }

    public firstKey(): K | undefined;
    public firstKey(amount: number): K[] | undefined;
    public firstKey(amount?: number): K | K[] | undefined {
        if (this.empty() || (amount && amount === 0)) return undefined;
        const cached: K[] = this.keyArray();
        if (!amount) return cached[0];
        if (amount < 0) return this.lastKey(-amount);
        return Array.from({ length: Math.min(amount, this.size) }, (_, i) => cached[i]);
    }

    public last(): V | undefined;
    public last(amount: number): V[] | undefined;
    public last(amount?: number): V | V[] | undefined {
        if (this.empty() || (amount && amount === 0)) return undefined;
        const cached: V[] = this.array();
        if (!amount) return cached[cached.length-1];
        if (amount < 0) return this.first(-amount);
        return cached.slice(-amount);
    }

    public lastKey(): K | undefined;
    public lastKey(amount: number): K[] | undefined;
    public lastKey(amount?: number): K | K[] | undefined {
        if (this.empty() || (amount && amount === 0)) return undefined;
        const cached: K[] = this.keyArray();
        if (!amount) return cached[cached.length-1];
        if (amount < 0) return this.lastKey(-amount);
        return cached.slice(-amount);
    }

    public randomIndex(): number;
    public randomIndex(ref: any[]): number;
    public randomIndex(ref?: any[]): number { return Math.floor(Math.random() * (!ref ? this.size : ref.length)); }

    public random(): V;
    public random(elements: number): V[];
    public random(elements: number, duplicates?: boolean): V[];
    public random(elements?: number, duplicates: boolean = false): V | V[] {
        const cached: V[] = this.array();
        if (!elements) return cached[this.randomIndex()];
        return Array.from({ length: Math.min(elements, this.size) }, () => duplicates ? cached[this.randomIndex()] : cached.splice(this.randomIndex(cached), 1)[0]);
    }

    public randomKey(): K;
    public randomKey(elements: number): K[];
    public randomKey(elements: number, duplicates?: boolean): K[];
    public randomKey(elements?: number, duplicates: boolean = false): K | K[] {
        const cached: K[] = this.keyArray();
        if (!elements) return cached[this.randomIndex()];
        return Array.from({ length: Math.min(elements, this.size) }, () => duplicates ? cached[this.randomIndex()] : cached.splice(this.randomIndex(cached), 1)[0]);
    }

    public find(fn: CacheFunction<K, V, boolean>): V | undefined {
        for (const [key, value] of this)
            if (fn(value, key, this)) return value;
        return undefined;
    }

    public findKey(fn: CacheFunction<K, V, boolean>): K | undefined {
        for (const [key, value] of this)
            if (fn(value, key, this)) return key;
        return undefined;
    }

    public filter(fn: CacheFunction<K, V, boolean>): this {
        const filtered: this = <this> new Cache<K, V>();
        for (const [key, value] of this)
            if (fn(value, key, this)) filtered.set(key, value);
        return filtered;
    }

    public split(fn: CacheFunction<K, V, boolean>): [this, this] {
        const split: [this, this] = [
            <this> new Cache<K, V>(),
            <this> new Cache<K, V>()
        ];

        for (const [key, value] of this)
            if (fn(value, key, this))
                split[0].set(key, value);
            else
                split[1].set(key, value);

        return split;
    }   

    public map<T>(fn: CacheFunction<K, V, T>): T[] {
        const keys = this.keyArray();
        return Array.from({ length: this.size }, (_, i) => fn(this.get(keys[i])!, keys[i], this));
    }

    public forEach(fn: CacheFunction<K, V, void>): void {
        const entries = this.entries();
        for (const [key, value] of entries)
            fn(value, key, this);
    }

    public some(fn: CacheFunction<K, V, boolean>): boolean {
        for (const [key, value] of this)
            if (fn(value, key, this)) return true;
        return false;
    }

    public every(fn: CacheFunction<K, V, boolean>): boolean {
        for (const [key, value] of this)
            if (!fn(value, key, this)) return false;
        return true;
    }

}