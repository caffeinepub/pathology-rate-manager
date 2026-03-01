import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SubAccount {
    id: bigint;
    name: string;
}
export interface PathologyTest {
    id: bigint;
    mrp: number;
    name: string;
    b2bRate: number;
    category: string;
}
export interface backendInterface {
    addPathologyTest(sessionToken: string, name: string, category: string, mrp: number, b2bRate: number): Promise<bigint>;
    addSampleData(): Promise<void>;
    adminLogin(username: string, password: string): Promise<string>;
    adminLogout(): Promise<void>;
    createSubAccount(sessionToken: string, name: string): Promise<bigint>;
    deletePathologyTest(sessionToken: string, id: bigint): Promise<void>;
    deleteSubAccount(sessionToken: string, id: bigint): Promise<void>;
    getAllSubAccounts(sessionToken: string): Promise<Array<SubAccount>>;
    getAllTests(): Promise<Array<PathologyTest>>;
    getB2BTests(): Promise<Array<PathologyTest>>;
    getTestByCategory(category: string): Promise<Array<PathologyTest>>;
    getTotalSubAccountCount(): Promise<bigint>;
    getTotalTestCount(): Promise<bigint>;
    updatePathologyTest(sessionToken: string, id: bigint, name: string, category: string, mrp: number, b2bRate: number): Promise<void>;
}
