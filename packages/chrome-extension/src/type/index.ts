export type SentenceBase = {
  id: string;
  authorId: string;
  content: string;
};

export type SentenceWidthIdAndLikes = SentenceBase & {
  id: string;
  myLikedCount: number;
};

export type SentenceWithLikeInfo = SentenceBase & {
  totalLikesCount: number;
  likedUserCount: number;
  myLikedCount: number;
};

export type Likes = {
  [sentenceId: string]: number;
};

export type UserLikes = {
  likedSentences: Likes;
  userId: string;
};
