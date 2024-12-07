import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { SentenceWidthIdAndLikes } from "../type";

type UserInfo = {
  location: "local" | "google";
  userId: string;
};

// Create an atom that syncs with local storage
const userIdAtom = atomWithStorage<UserInfo | null>("userId", null);
const sentenceAtom = atom<SentenceWidthIdAndLikes | null>(null);

export { userIdAtom, sentenceAtom };
