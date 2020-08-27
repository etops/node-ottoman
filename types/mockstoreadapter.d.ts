export = MockStoreAdapter;
declare function MockStoreAdapter(): void;
declare class MockStoreAdapter {
    data: {};
    indexes: {};
    debug: boolean;
    clear(): void;
    isNotFoundError(err: any): boolean;
    get(key: any, callback: any): void;
    store(key: any, data: any, cas: any, callback: any): void;
    remove(key: any, cas: any, callback: any): void;
    createIndex(type: any, modelName: any, name: any, fields: any, callback: any): void;
    ensureIndices(callback: any): void;
    searchIndex(type: any, modelName: any, name: any, options: any, callback: any): void;
    count(type: any, modelName: any, options: any, callback: any): void;
    find(type: any, modelName: any, options: any, callback: any): void;
}
