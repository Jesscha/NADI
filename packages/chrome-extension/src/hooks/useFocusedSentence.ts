import { useAtom } from "jotai";
import { focusedSentenceAtom } from "../atoms";
import { useCallback, useEffect } from "react";
import { useSentencesWithLikeInfo } from "./useSentencesWithLikeInfo";

function useFocusedSentence() {
  const [selectedSentence, setSelectedSentence] = useAtom(focusedSentenceAtom);

  const { sentencesWithLikeInfo, mutateAllLikes } = useSentencesWithLikeInfo();

  const refreshRandom = useCallback(() => {
    if (sentencesWithLikeInfo && sentencesWithLikeInfo.length > 0) {
      const randomIndex = Math.floor(
        Math.random() * sentencesWithLikeInfo.length
      );
      setSelectedSentence(sentencesWithLikeInfo[randomIndex]);
    }
  }, [sentencesWithLikeInfo.length, setSelectedSentence]);

  useEffect(() => {
    refreshRandom();
  }, [refreshRandom]);

  return { refreshRandom, selectedSentence, mutateAllLikes };
}

export default useFocusedSentence;
