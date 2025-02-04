
type SentenceId = string;
type UserId = string;

export type SentenceBase = {
  id: SentenceId;
  authorId: UserId;
  content: string;
};

export type SentenceWidthMyLiked = SentenceBase & {
  myLikedCount: number;
};

export type SentenceWithLikeInfo = SentenceWidthMyLiked & {
  totalLikesCount: number;
  likedUserCount: number;
};

export type LikedCountBySentence = {
  [sentenceId: SentenceId]: number;
};

export type UserLikes = {
  likedSentences: LikedCountBySentence;
  userId: UserId;
};
