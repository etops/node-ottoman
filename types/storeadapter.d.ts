export = StoreAdapter;
/**
 * A store adapter is the low-level provider of database functionality for
 *   Ottoman's internal storage system.
 *
 * @constructor
 */
declare function StoreAdapter(): void;
declare class StoreAdapter {
}
declare namespace StoreAdapter {
    export { SearchConsistency, StoreAdapter };
}
declare namespace SearchConsistency {
    const NONE: number;
    const LOCAL: number;
    const GLOBAL: number;
}
/**
 * ~GetCallback
 */
type StoreAdapter = (err: Error, value: any, cas: any) => any;
