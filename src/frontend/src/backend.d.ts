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
    phone: string;
}
export interface PathologyTest {
    id: bigint;
    mrp: number;
    name: string;
    b2bRate: number;
    category: string;
}
export interface SubAccountRate {
    b2bRate: number;
    testId: bigint;
    subAccountId: bigint;
}
export interface backendInterface {
    addPathologyTest(sessionToken: string, name: string, category: string, mrp: number, b2bRate: number): Promise<bigint>;
    addSampleData(): Promise<void>;
    adminLogin(username: string, password: string): Promise<string>;
    adminLogout(): Promise<void>;
    createSubAccount(sessionToken: string, name: string, phone: string): Promise<bigint>;
    deletePathologyTest(sessionToken: string, id: bigint): Promise<void>;
    deleteSubAccount(sessionToken: string, id: bigint): Promise<void>;
    deleteSubAccountTestRate(sessionToken: string, subAccountId: bigint, testId: bigint): Promise<void>;
    getAllSubAccounts(sessionToken: string): Promise<Array<SubAccount>>;
    getAllTests(): Promise<Array<PathologyTest>>;
    getB2BTests(): Promise<Array<PathologyTest>>;
    getSubAccountRates(subAccountId: bigint): Promise<Array<SubAccountRate>>;
    getTestByCategory(category: string): Promise<Array<PathologyTest>>;
    getTotalSubAccountCount(): Promise<bigint>;
    getTotalTestCount(): Promise<bigint>;
    /**
     * / NEW FUNCTIONALITY
     */
    setSubAccountTestRate(sessionToken: string, subAccountId: bigint, testId: bigint, b2bRate: number): Promise<void>;
    updatePathologyTest(sessionToken: string, id: bigint, name: string, category: string, mrp: number, b2bRate: number): Promise<void>;
    updateSubAccount(sessionToken: string, id: bigint, name: string, phone: string): Promise<void>;
}
