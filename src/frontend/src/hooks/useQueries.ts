import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Lab,
  PathologyTest,
  SubAccount,
  SubAccountRate,
  Transaction,
} from "../backend.d.ts";
import { useActor } from "./useActor";

export function useGetAllTests() {
  const { actor, isFetching } = useActor();
  return useQuery<PathologyTest[]>({
    queryKey: ["tests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllSubAccounts(sessionToken: string) {
  const { actor, isFetching } = useActor();
  return useQuery<SubAccount[]>({
    queryKey: ["subaccounts", sessionToken],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllSubAccounts(sessionToken);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!sessionToken,
  });
}

export function useGetSubAccountById(subAccountId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<SubAccount | null>({
    queryKey: ["subaccount", String(subAccountId)],
    queryFn: async () => {
      if (!actor || subAccountId === null) return null;
      return actor.getSubAccountById(subAccountId);
    },
    enabled: !!actor && !isFetching && subAccountId !== null,
  });
}

export function useAddSampleData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.addSampleData();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tests"] });
    },
  });
}

export function useAdminLogin() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      username,
      password,
    }: { username: string; password: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.adminLogin(username, password);
    },
  });
}

export function useAdminLogout() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.adminLogout();
    },
  });
}

export function useAddPathologyTest(sessionToken: string) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      category,
      mrp,
      b2bRate,
    }: {
      name: string;
      category: string;
      mrp: number;
      b2bRate: number;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addPathologyTest(sessionToken, name, category, mrp, b2bRate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tests"] });
    },
  });
}

export function useUpdatePathologyTest(sessionToken: string) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      category,
      mrp,
      b2bRate,
    }: {
      id: bigint;
      name: string;
      category: string;
      mrp: number;
      b2bRate: number;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updatePathologyTest(
        sessionToken,
        id,
        name,
        category,
        mrp,
        b2bRate,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tests"] });
    },
  });
}

export function useDeletePathologyTest(sessionToken: string) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deletePathologyTest(sessionToken, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tests"] });
    },
  });
}

export function useCreateSubAccount(sessionToken: string) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      phone,
      pin,
      labId,
    }: {
      name: string;
      phone: string;
      pin: string;
      labId: bigint | null;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createSubAccount(sessionToken, name, phone, pin, labId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subaccounts"] });
    },
  });
}

export function useUpdateSubAccount(sessionToken: string) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      phone,
      pin,
      labId,
    }: {
      id: bigint;
      name: string;
      phone: string;
      pin: string;
      labId: bigint | null;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateSubAccount(sessionToken, id, name, phone, pin, labId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subaccounts"] });
    },
  });
}

export function useDeleteSubAccount(sessionToken: string) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteSubAccount(sessionToken, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subaccounts"] });
    },
  });
}

// ─── SubAccount Rate Hooks ────────────────────────────────────────────────────

export function useGetSubAccountRates(subAccountId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<SubAccountRate[]>({
    queryKey: ["subAccountRates", String(subAccountId)],
    queryFn: async () => {
      if (!actor || subAccountId === null) return [];
      return actor.getSubAccountRates(subAccountId);
    },
    enabled: !!actor && !isFetching && subAccountId !== null,
  });
}

export function useSetSubAccountTestRate(sessionToken: string) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      subAccountId,
      testId,
      b2bRate,
    }: {
      subAccountId: bigint;
      testId: bigint;
      b2bRate: number;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.setSubAccountTestRate(
        sessionToken,
        subAccountId,
        testId,
        b2bRate,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["subAccountRates", String(variables.subAccountId)],
      });
    },
  });
}

export function useDeleteSubAccountTestRate(sessionToken: string) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      subAccountId,
      testId,
    }: {
      subAccountId: bigint;
      testId: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteSubAccountTestRate(sessionToken, subAccountId, testId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["subAccountRates", String(variables.subAccountId)],
      });
    },
  });
}

// ─── Lab Hooks ────────────────────────────────────────────────────────────────

export function useGetAllLabs() {
  const { actor, isFetching } = useActor();
  return useQuery<Lab[]>({
    queryKey: ["labs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLabs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateLab(sessionToken: string) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      contact,
    }: { name: string; contact: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.createLab(sessionToken, name, contact);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labs"] });
    },
  });
}

export function useUpdateLab(sessionToken: string) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      contact,
    }: {
      id: bigint;
      name: string;
      contact: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateLab(sessionToken, id, name, contact);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labs"] });
    },
  });
}

export function useDeleteLab(sessionToken: string) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteLab(sessionToken, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labs"] });
      queryClient.invalidateQueries({ queryKey: ["subaccounts"] });
    },
  });
}

// ─── Transaction Hooks ────────────────────────────────────────────────────────

export function useGetAllTransactions(sessionToken: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Transaction[]>({
    queryKey: ["transactions", sessionToken],
    queryFn: async () => {
      if (!actor || !sessionToken) return [];
      try {
        return await actor.getAllTransactions(sessionToken);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!sessionToken,
  });
}

export function useAddTransaction(sessionToken: string) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      subAccountId,
      patientName,
      date,
      testIds,
      paidAmount,
      notes,
    }: {
      subAccountId: bigint;
      patientName: string;
      date: string;
      testIds: bigint[];
      paidAmount: number;
      notes: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addTransaction(
        sessionToken,
        subAccountId,
        patientName,
        date,
        testIds,
        paidAmount,
        notes,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useUpdateTransactionPaid(sessionToken: string) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      transactionId,
      paidAmount,
    }: {
      transactionId: bigint;
      paidAmount: number;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateTransactionPaid(
        sessionToken,
        transactionId,
        paidAmount,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useDeleteTransaction(sessionToken: string) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (transactionId: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteTransaction(sessionToken, transactionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useGetSubAccountTransactions(
  subAccountId: bigint | null,
  pin: string,
) {
  const { actor, isFetching } = useActor();
  return useQuery<Transaction[]>({
    queryKey: ["subAccountTransactions", String(subAccountId), pin],
    queryFn: async () => {
      if (!actor || subAccountId === null || !pin) return [];
      try {
        return await actor.getSubAccountTransactions(subAccountId, pin);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && subAccountId !== null && !!pin,
  });
}

export function useVerifySubAccountPin() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      subAccountId,
      pin,
    }: {
      subAccountId: bigint;
      pin: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.verifySubAccountPin(subAccountId, pin);
    },
  });
}
