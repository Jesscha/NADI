import { useMyAuthoredCandidates } from "./useMyAuthroedCandidates";
import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { userInfoAtom } from "../atoms";
import { useSentencesWithLikeInfo } from "./useSentencesWithLikeInfo";

export function useDashboard() {
  const userInfo = useAtomValue(userInfoAtom);
  const { sentencesWithLikeInfo } = useSentencesWithLikeInfo();

  const { data: myAuthoredCandidates } = useMyAuthoredCandidates();

  const myLikedSentences = useMemo(() => {
    return sentencesWithLikeInfo?.filter(
      (sentence) => sentence.myLikedCount > 0
    );
  }, [sentencesWithLikeInfo]);

  const myAuthoredPassedSentences = useMemo(() => {
    return sentencesWithLikeInfo?.filter(
      (sentence) => sentence.authorId === userInfo?.userId
    );
  }, [userInfo?.userId, sentencesWithLikeInfo]);

  return {
    myLikedSentences,
    myAuthoredPassedSentences,
    myAuthoredCandidates,
  };
}
