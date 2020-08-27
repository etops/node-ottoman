export = Schema;
declare function Schema(context: any): void;
declare class Schema {
    constructor(context: any);
    context: any;
    name: string;
    fields: any[];
    idField: string;
    indices: any[];
    indexFns: any[];
    queryFns: any[];
    preHandlers: {};
    postHandlers: {};
    namePath(typeOnly: any): string;
    _validate(mdlInst: any): void;
    validate(mdlInst: any, callback: any): void;
    indexName(fields: any): string;
    refKeyPrefix(fields: any): string;
    refKey(fields: any, values: any): string;
    refKeys(mdl: any): string[];
    addIndex(index: any): void;
    addDefIndexFn(name: any, indexDef: any): void;
    addRefDocIndexFn(name: any, indexDef: any): void;
    addIndexFn(name: any, indexDef: any): void;
    _tryAddDefQueryFn(name: any, queryDef: any): void;
    addQueryFn(name: any, queryDef: any): void;
    addField(field: any): void;
    setIdField(path: any): void;
    fieldVal(mdl: any, name: any): any;
    field(name: any): any;
    fieldType(path: any): Schema;
    applyDataToObject(obj: any, data: any): void;
    applyUserDataToObject(obj: any, data: any): void;
    applyDefaultsToObject(obj: any): void;
    applyPropsToObj(obj: any): void;
    execPreHandlers(event: any, mdlInst: any, callback: any): void;
    execPostHandlers(event: any, mdlInst: any, callback: any): void;
    addPreHandler(event: any, callback: any): void;
    addPostHandler(event: any, fn: any): void;
}
declare namespace Schema {
    export function coreTypeByName(type: any): any;
    export function isCoreType(type: any): boolean;
    export { stringCoreType as StringType };
    export { numberCoreType as NumberType };
    export { integerCoreType as IntegerType };
    export { boolCoreType as BooleanType };
    export { dateCoreType as DateType };
    export { mixedCoreType as MixedType };
    export { SchemaField as Field };
    export { ModelRef };
    export { ListField };
    export { FieldGroup };
    export { SchemaIndex as Index };
    export { ViewQueryFn };
    export { RefDocIndexFn };
    export { RefDocIndex };
    /**
     * A validator function validates a Schema field to ensure it
     * matches the expected traits.
     */
    export type Validator = Function;
}
declare var stringCoreType: CoreType;
declare var numberCoreType: CoreType;
declare var integerCoreType: CoreType;
declare var boolCoreType: CoreType;
declare var dateCoreType: CoreType;
declare var mixedCoreType: CoreType;
declare function SchemaField(): void;
declare class SchemaField {
    name: string;
    type: any;
    readonly: boolean;
    default: any;
    validator: any;
}
declare function ModelRef(name: any): void;
declare class ModelRef {
    constructor(name: any);
    name: any;
    inspect(): string;
}
declare function ListField(type: any): void;
declare class ListField {
    constructor(type: any);
    type: any;
    inspect(): string;
}
declare function FieldGroup(): void;
declare class FieldGroup {
    fields: any[];
    create(): {};
}
declare function SchemaIndex(): void;
declare class SchemaIndex {
    type: any;
    schema: any;
    fields: any[];
}
declare function ViewQueryFn(): void;
declare class ViewQueryFn {
    type: any;
    name: any;
    of: string;
    field: any;
    consistency: number;
}
declare function RefDocIndexFn(): void;
declare class RefDocIndexFn {
    type: string;
    consistency: number;
}
declare function RefDocIndex(): void;
declare class RefDocIndex {
    type: string;
}
/**
 * A validator function validates a Schema field to ensure it
 * matches the expected traits.
 *
 * @typedef {function} Schema.Validator
 *
 * @param {*} value
 *  The value of the property being validated.
 */
declare function CoreType(type: any): void;
declare class CoreType {
    /**
     * A validator function validates a Schema field to ensure it
     * matches the expected traits.
     *
     * @typedef {function} Schema.Validator
     *
     * @param {*} value
     *  The value of the property being validated.
     */
    constructor(type: any);
    type: any;
    inspect(): string;
}
