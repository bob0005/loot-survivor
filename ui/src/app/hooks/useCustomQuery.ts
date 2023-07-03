import { use, useEffect, useMemo, useRef, useCallback } from "react";
import { useQuery } from "@apollo/client";
import { useQueriesStore, QueryKey } from "./useQueryStore";
import { AdventurerQuery, BattleQuery, ItemQuery } from "./graphql/types";

type Variables = Record<
  string,
  string | number | number[] | boolean | null | undefined
>;

// type Queries = | AdventurerQuery | BattleQuery

const useCustomQuery = (
  queryKey: QueryKey,
  query: any,
  variables?: Variables,
  shouldPoll?: boolean
  // skip?: boolean
) => {
  const { updateData } = useQueriesStore();

  const { data, startPolling, stopPolling, loading, refetch, error } = useQuery(
    query,
    {
      variables: variables,
      // skip: skip,
    }
  );

  const refetchWrapper = useCallback(async () => {
    try {
      await refetch();
    } catch (error) {
      console.error("Error refetching:", error);
    }
  }, [refetch]);

  useEffect(() => {
    console.log(data, loading, queryKey, variables);
    if (data) {
      updateData(queryKey, data, loading, refetchWrapper);
    }
  }, [data, updateData, loading, queryKey, refetchWrapper, variables]);

  useEffect(() => {
    if (shouldPoll) {
      startPolling(5000);
    } else {
      stopPolling();
    }
  }, [shouldPoll, startPolling, stopPolling]);

  // useEffect(() => {
  //   refetch();
  // }, []);
};

export default useCustomQuery;
