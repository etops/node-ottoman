export = CbStoreAdapter;
/**
 * The Couchbase store adapter implements an Ottoman StoreAdapter suitable
 *   for using Ottoman with Couchbase Server.
 * @param bucket
 * @constructor
 */
declare function CbStoreAdapter(bucket: any, cb: any): void;
declare class CbStoreAdapter {
    /**
     * The Couchbase store adapter implements an Ottoman StoreAdapter suitable
     *   for using Ottoman with Couchbase Server.
     * @param bucket
     * @constructor
     */
    constructor(bucket: any, cb: any);
    couchbase: any;
    bucket: any;
    ddocs: {};
    gsis: {};
    debug: boolean;
    isNotFoundError(err: any): boolean;
    get(key: string, callback: any): void;
    store(key: string, data: any, cas: any, callback: any): void;
    remove(key: any, cas: any, callback: any): void;
    private _createViewIndex;
    private _createN1qlIndex;
    createIndex(type: string, modelName: string, name: string, fields: string[], callback: any): void;
    private _ensureMrIndices;
    private _ensureGsiIndices;
    ensureIndices(callback: any): void;
    private _searchViewIndex;
    private _searchN1qlIndex;
    searchIndex(type: string, modelName: string, name: string, options: any, callback: any): void;
    count(type: string, modelName: string, options: {
        filter: any;
    }, callback: any): void;
    find(type: string, modelName: string, options: {
        filter: any;
        limit: number;
        skip: number;
        sort: string | string[];
        namespace: string;
    }, callback: any): void;
}
