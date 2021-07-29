export interface PostCommentDto {
  id: number;
  userId: number;
  postId: number;
  attachments: ArrayBuffer;
  content: string;
  createdAt: number;
  updatedAt: number;
  publishedAt: number;
}
