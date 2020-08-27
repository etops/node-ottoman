export = ModelInstance;
/**
 * Constructs a new model instance and for models with a default constructor,
 * applies the data in object passed to the instance.
 *
 * @param {Object} data
 * @constructor
 */
declare function ModelInstance(...args: any[]): void;
declare class ModelInstance {
    /**
     * Constructs a new model instance and for models with a default constructor,
     * applies the data in object passed to the instance.
     *
     * @param {Object} data
     * @constructor
     */
    constructor(...args: any[]);
    $: {};
    loaded(): boolean;
    id(): string;
    private _toCoo;
    toCoo(): any;
    toJSON(): any;
    private inspect;
    save(callback: Function): void;
    load(...args: any[]): void;
    remove(callback: Function): void;
}
declare namespace ModelInstance {
    function fromData(data: any): ModelInstance;
    function applyData(mdlInst: ModelInstance, data: any): void;
    function create(data: any, callback: Function, ...args: any[]): void;
    function namePath(typeOnly: any): string;
    function loadAll(items: ModelInstance[], callback: Function): void;
    function find(filter: any, options?: any, callback: Function): void;
    function count(filter: any, options?: any, callback: Function): void;
    function getById(id: string, options: any, callback: Function): void;
    function refByKey(key: string): ModelInstance;
    function plugin(pluginFn: any, options: any): ModelInstance;
    function ref(id: string): ModelInstance;
    function pre(event: "load" | "validate" | "save" | "remove", handler: Function): any;
    function post(event: "load" | "validate" | "save" | "remove", fn: Function): any;
}
