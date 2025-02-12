import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { SentenceWidthMyLiked, UserInfo } from "../type";


// Create an atom that syncs with local storage
const userInfoAtom = atomWithStorage<UserInfo | null>("userInfo", null);
const focusedSentenceAtom = atom<SentenceWidthMyLiked | null>(null);

export { userInfoAtom, focusedSentenceAtom };
