import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostDto } from './dto/post.dto';
import { PostEntity } from './post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private postsRepository: Repository<PostEntity>,
  ) {}

  async create(data: PostDto): Promise<void> {
    const user = this.postsRepository.create(data);
    await this.postsRepository.save(user);
  }

  async getById(id: string): Promise<PostEntity> {
    return await this.postsRepository.findOne(id);
  }

  async update(id: string, data: Partial<PostDto>): Promise<void> {
    await this.postsRepository.update({ id }, data);
    await this.postsRepository.findOne({ id });
  }

  async remove(id: string): Promise<void> {
    await this.postsRepository.delete(id);
  }
}
