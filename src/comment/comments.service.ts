import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ImageAction } from '../image/dto/images.dto';
import { CreatePostCommentDto, UpdatePostCommentDto } from './dto/comments.dto';

import { CommentsEntity } from './comments.entity';

import { PostsService } from '../post/posts.service';
import { UsersService } from '../user/users.service';
import { ImagesService } from '../image/images.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentsEntity)
    private readonly postCommentsRepository: Repository<CommentsEntity>,
    private readonly postsService: PostsService,
    private readonly usersService: UsersService,
    private readonly imagesService: ImagesService,
  ) {}

  async create(dataDto: CreatePostCommentDto): Promise<void> {
    const { post_id, user_id, images, ...post_comment_data } = dataDto;

    const postComment = this.postCommentsRepository.create(post_comment_data);

    postComment.user = await this.usersService.getById(user_id);
    if (!postComment.user) {
      throw new NotFoundException('User with this id is not exist');
    }

    postComment.post = await this.postsService.getById(post_id);
    if (!postComment.post) {
      throw new NotFoundException('Post with this id is not exist');
    }

    postComment.images = await Promise.all(
      images.map(async (image) => {
        return await this.imagesService.create(image);
      }),
    );

    await this.postCommentsRepository.save(postComment);
  }

  async getAll(): Promise<CommentsEntity[]> {
    return await this.postCommentsRepository.find({
      relations: ['user', 'post', 'images'],
    });
  }

  async getById(id: string): Promise<CommentsEntity> {
    return await this.postCommentsRepository.findOne(id, {
      relations: ['user', 'post', 'images'],
    });
  }

  async getAllByUserId(id: string): Promise<CommentsEntity[]> {
    return await this.postCommentsRepository.find({
      where: { user: { id: id } },
      relations: ['user', 'post', 'images'],
    });
  }

  async getAllByPostId(id: string): Promise<CommentsEntity[]> {
    return await this.postCommentsRepository.find({
      where: { post: { id: id } },
      relations: ['user', 'post', 'images'],
    });
  }

  async update(id: string, dataDto: UpdatePostCommentDto): Promise<void> {
    const { image_actions, ...data_to_update } = dataDto;
    const comment = await this.postCommentsRepository.findOne(id, {
      relations: ['images'],
    });

    if (!comment) {
      throw new NotFoundException('Comment with this id is not exist');
    }

    if (image_actions.length !== 0) {
      await Promise.all(
        image_actions.map(async (image_action) => {
          switch (image_action.type) {
            case ImageAction.ADD:
              const image = await this.imagesService.create(image_action.data);
              comment.images.push(image);
              break;
            case ImageAction.DELETE:
              const id = image_action.id;
              comment.images = comment.images.filter((image) => {
                return image.id !== id;
              });
              await this.imagesService.remove(id);
              break;
            default:
              return;
          }
        }),
      );
    }
    await this.postCommentsRepository.save({ ...comment, ...data_to_update });
  }

  async remove(id: string): Promise<void> {
    const comment = await this.postCommentsRepository.findOne(id, {
      relations: ['images'],
    });

    if (!comment) {
      throw new NotFoundException('Comment with this id is not exist');
    }
    if (comment.images.length !== 0) {
      await Promise.all(
        comment.images.map(async (image) => {
          await this.imagesService.remove(image.id);
        }),
      );
    }
    await this.postCommentsRepository.delete(id);
  }
}
