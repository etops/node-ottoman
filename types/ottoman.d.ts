export = ottoman;
declare var ottoman: Ottoman;
/**
 * The core manager class for the ODM.
 *
 * @constructor
 */
declare function Ottoman(options: any): void;
declare class Ottoman {
    /**
     * The core manager class for the ODM.
     *
     * @constructor
     */
    constructor(options: any);
    namespace: any;
    store: any;
    models: any;
    types: any;
    delayedBind: {};
    plugins: any[];
    bucket: any;
    plugin(pluginFn: any, options: any): Ottoman;
    nsPrefix(): string;
    isTypeDef(type: any): boolean;
    isModel(model: any): boolean;
    typeByName(type: string): import("./modelinstance") | TypeDef | any;
    typeByNameAndNamespace(type: string, namespace: string): import("./modelinstance") | TypeDef | any;
    private _parseFieldType;
    private _makeField;
    private _createSchema;
    private _findModelsByRefDocIndex;
    private _findModelsByDefIndex;
    private _findModelByIndex;
    private _countModels;
    private _normFilter;
    private _findModels;
    private _findModelsByQuery;
    private _buildModel;
    private _delayBind;
    private _buildAndRegisterModel;
    _applyPlugins(model: any): Ottoman;
    private _buildAndRegisterTypeDef;
    type(name: string, options: any): TypeDef;
    model(name: string, schemaDef: any, options: {
        index: any;
        queries: any;
        id: string;
        store: import("./storeadapter");
    }): any;
    validate(mdlInst: import("./modelinstance"), callback: any): void;
    _ensureModelIndices(model: any, callback: any): void;
    ensureIndices(callback: Function): void;
    getModel(name: string, prefixed: boolean): any;
    fromCoo(data: any, type: string): import("./modelinstance");
    toCoo(obj: import("./modelinstance")): any;
}
declare namespace Ottoman {
    const loadAll: (items: import("./modelinstance")[], callback: Function) => void;
}
/**
 * The data definition for a typedef object.  Typedef's are
 * simply aliases for other types.
 *
 * @constructor
 * @private
 * @ignore
 */
declare function TypeDef(): void;
declare class TypeDef {
}
