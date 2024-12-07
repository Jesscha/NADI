import useSWR from "swr";
import { useAtomValue } from "jotai";
import { userIdAtom } from "../atoms";
import { DEV_USER_ID } from "../constants";
import { MySentence, SentenceWidthIdAndLikes } from "../type";
import {
  getLikedSentencesByUser,
  getMySentencesByUser,
} from "../utils/dashboard";

export function useDashboard() {
  const userId = useAtomValue(userIdAtom);
  const currentUserId = userId?.userId || DEV_USER_ID;

  const { data: likedSentences = [], mutate: mutateLikedSentences } = useSWR<
    SentenceWidthIdAndLikes[]
  >(`liked-sentences-${currentUserId}`, () =>
    getLikedSentencesByUser(currentUserId)
  );

  const { data: mySentences = [], mutate: mutateMySentences } = useSWR<
    MySentence[]
  >(`my-sentences-${currentUserId}`, () => getMySentencesByUser(currentUserId));

  return {
    likedSentences,
    mySentences,
    mutateLikedSentences,
    mutateMySentences,
  };
}
