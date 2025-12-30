import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertSubmission } from "@shared/routes";

export function useSubmissions() {
  return useQuery({
    queryKey: [api.submissions.list.path],
    queryFn: async () => {
      const res = await fetch(api.submissions.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch submissions");
      return api.submissions.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertSubmission) => {
      const res = await fetch(api.submissions.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.submissions.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to submit solution");
      }
      
      return api.submissions.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.submissions.list.path] });
    },
  });
}
