import { DocumentData } from "firebase/firestore";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

type UserInfo = {
  location: "local" | "google";
  userId: string;
};

// Create an atom that syncs with local storage
const userIdAtom = atomWithStorage<UserInfo | null>("userId", null);
const sentenceAtom = atom<DocumentData | null>(null);

export { userIdAtom, sentenceAtom };
