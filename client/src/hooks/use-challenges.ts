import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useChallenges() {
  return useQuery({
    queryKey: [api.challenges.list.path],
    queryFn: async () => {
      const res = await fetch(api.challenges.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch challenges");
      return api.challenges.list.responses[200].parse(await res.json());
    },
  });
}

export function useChallenge(id: number) {
  return useQuery({
    queryKey: [api.challenges.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.challenges.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) throw new Error("Challenge not found");
      if (!res.ok) throw new Error("Failed to fetch challenge");
      return api.challenges.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}
