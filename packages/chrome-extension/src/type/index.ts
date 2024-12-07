export type Sentence = {
  authorId: string;
  content: string;
};

export type SentenceWidthIdAndLikes = Sentence & {
  id: string;
  likeCount: number;
};

export type MySentence = Sentence & {
  id: string;
  authorId: string;
  content: string;
  totalLikesCount: number;
  isCandidate: boolean;
  likeUserCount: number;
  myLikedCount: number;
};

export type Likes = {
  [sentenceId: string]: number;
};

export type UserLikes = {
  userLikes: Likes;
  userId: string;
};
