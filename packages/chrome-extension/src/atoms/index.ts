import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { SentenceWidthIdAndLikes } from "../type";

type UserInfo = {
  location: "local" | "google";
  userId: string;
};

// Create an atom that syncs with local storage
const userInfoAtom = atomWithStorage<UserInfo | null>("userInfo", null);
const focusedSentenceAtom = atom<SentenceWidthIdAndLikes | null>(null);

export { userInfoAtom, focusedSentenceAtom };
