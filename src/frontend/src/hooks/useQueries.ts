import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PathologyTest, SubAccount } from "../backend.d.ts";
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
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("No actor");
      return actor.createSubAccount(sessionToken, name);
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
