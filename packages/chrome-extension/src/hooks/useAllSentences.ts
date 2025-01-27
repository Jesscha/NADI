import useSWR from "swr";
import { fetchAllSentences } from "../utils/firebase";

export const useAllSentences = () => {
  const { data, mutate } = useSWR(["all-sentences"], fetchAllSentences);

  return {
    data,
    mutate,
  };
};
