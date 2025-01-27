import { useMemo } from "react";
import { SentenceWithLikeInfo } from "../type";
import { useAllLikes } from "./useAllLikes";
import { useAllSentences } from "./useAllSentences";
import { useAtomValue } from "jotai";
import { userInfoAtom } from "../atoms";

export const useSentencesWithLikeInfo = () => {
  const userInfo = useAtomValue(userInfoAtom);
  const { data: allSentences, mutate: mutateAllSentences } = useAllSentences();
  const { data: allLikes, mutate: mutateAllLikes } = useAllLikes();

  const sentencesWithLikeInfo: SentenceWithLikeInfo[] = useMemo(() => {
    if (!allSentences || !allLikes) return [];

    const sentenceIdToLikeCountMap = new Map();
    const sentenceIdToLikedUserCountMap = new Map();
    const sentenceIdToMyLikeCountMap = new Map();
    allLikes?.forEach((userLike) => {
      const isMe = userLike.userId === userInfo?.userId;
      Object.entries(userLike.likedSentences).forEach(
        ([sentenceId, likeCount]) => {
          if (sentenceIdToLikedUserCountMap.has(sentenceId)) {
            sentenceIdToLikedUserCountMap.set(
              sentenceId,
              sentenceIdToLikedUserCountMap.get(sentenceId) + 1
            );
          } else {
            sentenceIdToLikedUserCountMap.set(sentenceId, 1);
          }
          if (sentenceIdToLikeCountMap.has(sentenceId)) {
            sentenceIdToLikeCountMap.set(
              sentenceId,
              sentenceIdToLikeCountMap.get(sentenceId) + likeCount
            );
          } else {
            sentenceIdToLikeCountMap.set(sentenceId, likeCount);
          }
          if (isMe) {
            sentenceIdToMyLikeCountMap.set(sentenceId, likeCount);
          }
        }
      );
    });
    return allSentences?.map((sentence) => ({
      ...sentence,
      totalLikesCount: sentenceIdToLikeCountMap.get(sentence.id) || 0,
      likedUserCount: sentenceIdToLikedUserCountMap.get(sentence.id) || 0,
      myLikedCount: sentenceIdToMyLikeCountMap.get(sentence.id) || 0,
    })) satisfies SentenceWithLikeInfo[];
  }, [allLikes, allSentences, userInfo?.userId]);

  return { sentencesWithLikeInfo, mutateAllSentences, mutateAllLikes };
};
