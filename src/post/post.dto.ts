export interface PostDto {
  id: number;
  userId: number;
  title: string;
  attachments: ArrayBuffer;
  content: string;
  createdAt: number;
  updatedAt: number;
  publishedAt: number;
}
