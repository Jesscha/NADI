import useSWR from "swr";
import { fetchUserLikedSentences } from "../utils/firebase";
import { useAtomValue } from "jotai";
import { userInfoAtom } from "../atoms";

export const useUserLikedSentences = () => {
  const userId = useAtomValue(userInfoAtom);

  const { data, mutate } = useSWR(["user-liked-sentences", userId], () =>
    userId ? fetchUserLikedSentences(userId.userId) : undefined
  );

  return {
    data,
    mutate,
  };
};
