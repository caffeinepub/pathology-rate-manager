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
    pin: string;
    name: string;
    labId?: bigint;
    phone: string;
}
export interface PathologyTest {
    id: bigint;
    mrp: number;
    name: string;
    b2bRate: number;
    category: string;
}
export interface Lab {
    id: bigint;
    contact: string;
    name: string;
}
export interface SubAccountRate {
    b2bRate: number;
    testId: bigint;
    subAccountId: bigint;
}
export interface Transaction {
    id: bigint;
    date: string;
    totalAmount: number;
    notes: string;
    patientName: string;
    testIds: Array<bigint>;
    paidAmount: number;
    subAccountId: bigint;
    dueAmount: number;
}
export interface backendInterface {
    addPathologyTest(sessionToken: string, name: string, category: string, mrp: number, b2bRate: number): Promise<bigint>;
    addSampleData(): Promise<void>;
    addTransaction(sessionToken: string, subAccountId: bigint, patientName: string, date: string, testIds: Array<bigint>, paidAmount: number, notes: string): Promise<bigint>;
    adminLogin(username: string, password: string): Promise<string>;
    adminLogout(): Promise<void>;
    createLab(sessionToken: string, name: string, contact: string): Promise<bigint>;
    createSubAccount(sessionToken: string, name: string, phone: string, pin: string, labId: bigint | null): Promise<bigint>;
    deleteLab(sessionToken: string, id: bigint): Promise<void>;
    deletePathologyTest(sessionToken: string, id: bigint): Promise<void>;
    deleteSubAccount(sessionToken: string, id: bigint): Promise<void>;
    deleteSubAccountTestRate(sessionToken: string, subAccountId: bigint, testId: bigint): Promise<void>;
    deleteTransaction(sessionToken: string, transactionId: bigint): Promise<void>;
    getAllLabs(): Promise<Array<Lab>>;
    getAllSubAccounts(sessionToken: string): Promise<Array<SubAccount>>;
    getAllTests(): Promise<Array<PathologyTest>>;
    getAllTransactions(sessionToken: string): Promise<Array<Transaction>>;
    getSubAccountById(subAccountId: bigint): Promise<SubAccount | null>;
    getSubAccountRates(subAccountId: bigint): Promise<Array<SubAccountRate>>;
    getSubAccountTransactions(subAccountId: bigint, pin: string): Promise<Array<Transaction>>;
    getTotalSubAccountCount(): Promise<bigint>;
    getTotalTestCount(): Promise<bigint>;
    setSubAccountTestRate(sessionToken: string, subAccountId: bigint, testId: bigint, b2bRate: number): Promise<void>;
    updateLab(sessionToken: string, id: bigint, name: string, contact: string): Promise<void>;
    updatePathologyTest(sessionToken: string, id: bigint, name: string, category: string, mrp: number, b2bRate: number): Promise<void>;
    updateSubAccount(sessionToken: string, id: bigint, name: string, phone: string, pin: string, labId: bigint | null): Promise<void>;
    updateTransactionPaid(sessionToken: string, transactionId: bigint, paidAmount: number): Promise<void>;
    verifySubAccountPin(subAccountId: bigint, pin: string): Promise<boolean>;
}
