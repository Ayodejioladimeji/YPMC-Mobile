import { queryOptions, useQuery } from "@tanstack/react-query";

import { getUser } from "@/api/user";

const userQuery = (token: string) =>
  queryOptions({
    queryKey: ["user"],
    queryFn: () => getUser(token),
  });

export default function useUser(token: string) {
  return useQuery(userQuery(token));
}
