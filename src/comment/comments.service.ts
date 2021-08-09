import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ImageAction, CreateImageDto } from '../image/dto/images.dto';
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

  async create(data: CreatePostCommentDto): Promise<void> {
    const { post_id, user_id, images, ...postCommentData } = data;

    const postComment = this.postCommentsRepository.create(postCommentData);

    postComment.user = await this.usersService.getById(user_id);

    postComment.post = await this.postsService.getById(post_id);

    await Promise.all(
      images.map(async (image) => {
        postComment.images.push(await this.imagesService.create(image));
      }),
    );

    await this.postCommentsRepository.save(postComment);
  }

  async getAll(): Promise<CommentsEntity[]> {
    return await this.postCommentsRepository.find({
      relations: ['post', 'user', 'images'],
    });
  }

  async getById(id: string): Promise<CommentsEntity> {
    return await this.postCommentsRepository.findOne(id, {
      relations: ['post', 'user', 'images'],
    });
  }

  async getAllByUserId(id: string): Promise<CommentsEntity[]> {
    return await this.postCommentsRepository.find({
      where: { user: { id: id } },
      relations: ['post', 'user', 'images'],
    });
  }

  async getAllByPostId(id: string): Promise<CommentsEntity[]> {
    return await this.postCommentsRepository.find({
      where: { post: { id: id } },
      relations: ['post', 'user', 'images'],
    });
  }

  async update(id: string, data: UpdatePostCommentDto): Promise<void> {
    const { image_actions, ...dataToUpdate } = data;
    const comment = await this.postCommentsRepository.findOne(id);

    if (image_actions.length !== 0) {
      await Promise.all(
        image_actions.map(async (image_action) => {
          switch (image_action.action) {
            case ImageAction.ADD:
              const image = await this.imagesService.create(
                image_action.data as CreateImageDto,
              );
              comment.images.push(image);
              break;
            case ImageAction.DELETE:
              const id = image_action.data as string;
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
    await this.postCommentsRepository.save({ ...comment, ...dataToUpdate });
  }

  async remove(id: string): Promise<void> {
    const { images } = await this.postCommentsRepository.findOne(id);
    await Promise.all(
      images.map(async (image) => {
        await this.imagesService.remove(image.id);
      }),
    );
    await this.postCommentsRepository.delete(id);
  }
}
