import { Entity, OneToOne, JoinColumn } from 'typeorm';
import { BaseImagesEntity } from './base_images.entity';
import { PostsEntity } from '../../post/entity/posts.entity';

@Entity('posts_images')
export class PostsImagesEntity extends BaseImagesEntity {
  @OneToOne(() => PostsEntity, (post) => post.image, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'post_id', referencedColumnName: 'id' })
  post: PostsEntity;
}
