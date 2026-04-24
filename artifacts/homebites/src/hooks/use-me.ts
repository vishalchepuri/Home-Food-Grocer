import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";

export function useMe() {
  return useGetMe({ query: { queryKey: getGetMeQueryKey() } });
}
