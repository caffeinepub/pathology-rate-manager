import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  PathologyTest,
  SubAccount,
  SubAccountRate,
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
    enabled: !!actor && !isFetching,
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
    mutationFn: async ({ name, phone }: { name: string; phone: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.createSubAccount(sessionToken, name, phone);
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
    }: { id: bigint; name: string; phone: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateSubAccount(sessionToken, id, name, phone);
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
