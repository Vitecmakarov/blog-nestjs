import { UserEntity } from '../user/user.entity';
import { PostEntity } from '../post/post.entity';

export interface ResponseToClient {
  statusCode: number;
  message: string;
  data?: UserEntity | PostEntity | UserEntity[];
}
