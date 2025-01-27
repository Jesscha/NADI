import { useAtomValue } from "jotai";
import { userInfoAtom } from "../atoms";
import useSWR from "swr";
import { getUserAuthoredCandidateSentences } from "../utils/firebase";

export const useMyAuthoredCandidates = () => {
  const userId = useAtomValue(userInfoAtom);
  const { data, mutate } = useSWR(["user-authored-sentences", userId], () =>
    userId ? getUserAuthoredCandidateSentences(userId.userId) : null
  );

  return {
    data,
    mutate,
  };
};
