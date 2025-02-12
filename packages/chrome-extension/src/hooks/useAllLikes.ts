import useSWR from "swr";
import { fetchAllLikes } from "../utils/firebase";

export const useAllLikes = () => {
  const { data, mutate } = useSWR("allLikes", fetchAllLikes);

  return { data, mutate };
};
