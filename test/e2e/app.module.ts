import { promisify } from 'util';
import { config } from 'dotenv';

import * as rimraf from 'rimraf';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from '../../src/auth/auth.module';
import { UsersModule } from '../../src/user/users.module';
import { CategoriesModule } from '../../src/category/categories.module';
import { PostsModule } from '../../src/post/posts.module';
import { CommentsModule } from '../../src/comment/comments.module';
import { ImagesModule } from '../../src/image/images.module';

import { Repository } from 'typeorm';

import { UsersEntity } from '../../src/user/entity/users.entity';
import { UsersGradesEntity } from '../../src/user/entity/users.grades.entity';
import { CategoriesEntity } from '../../src/category/entity/categories.entity';
import { PostsEntity } from '../../src/post/entity/posts.entity';
import { PostsGradesEntity } from '../../src/post/entity/posts.grades.entity';
import { ImagesEntity } from '../../src/image/entity/images.entity';
import { CommentsEntity } from '../../src/comment/entity/comments.entity';
import { CommentsGradesEntity } from '../../src/comment/entity/comments.grades.entity';

import { UsersService } from '../../src/user/service/users.service';
import { CategoriesService } from '../../src/category/service/categories.service';
import { PostsService } from '../../src/post/service/posts.service';
import { ImagesService } from '../../src/image/service/images.service';
import { CommentsService } from '../../src/comment/service/comments.service';

import { UserTestEntity } from './test_entities/user.test.entity';
import { CategoryTestEntity } from './test_entities/category.test.entity';
import { PostTestEntity } from './test_entities/post.test.entity';
import { CommentTestEntity } from './test_entities/comment.test.entity';
import { ImageTestDto } from './test_entities/image.test.dto';

import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../../src/auth/guards/jwt-auth.guard';
import { JwtModule } from '@nestjs/jwt';

config({ path: `./env/.env.${process.env.NODE_ENV}` });

export class Application {
  public app: INestApplication;

  private usersEntityRepository: Repository<UsersEntity>;
  private usersGradesEntityRepository: Repository<UsersGradesEntity>;
  private categoriesEntityRepository: Repository<CategoriesEntity>;
  private postsEntityRepository: Repository<PostsEntity>;
  private postsGradesEntityRepository: Repository<PostsGradesEntity>;
  private imagesEntityRepository: Repository<ImagesEntity>;
  private commentsEntityRepository: Repository<CommentsEntity>;
  private commentsGradesEntityRepository: Repository<CommentsGradesEntity>;

  public usersService: UsersService;
  public categoriesService: CategoriesService;
  public postsService: PostsService;
  public imagesService: ImagesService;
  public commentsService: CommentsService;

  public userTestEntity: UserTestEntity;
  public categoryTestEntity: CategoryTestEntity;
  public postTestEntity: PostTestEntity;
  public commentTestEntity: CommentTestEntity;
  public imageTestDto: ImageTestDto;

  public async initializeApp() {
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'mysql',
          host: 'localhost',
          port: 3308,
          username: 'user',
          password: 'us777199',
          database: 'nestjs_blog_test',
          entities: ['./**/*.entity.ts'],
          synchronize: true,
        }),
        JwtModule.register({
          secret: `${process.env.JWT_SECRET}`,
          signOptions: { expiresIn: `${process.env.TOKEN_LIFETIME}s` },
        }),
        ThrottlerModule.forRoot({
          ttl: 60,
          limit: 10,
        }),
        UsersModule,
        PostsModule,
        CategoriesModule,
        CommentsModule,
        ImagesModule,
        AuthModule,
      ],
      providers: [
        {
          provide: APP_GUARD,
          useClass: JwtAuthGuard,
        },
        {
          provide: APP_GUARD,
          useClass: ThrottlerGuard,
        },
      ],
    }).compile();

    this.app = module.createNestApplication();

    this.imagesEntityRepository = module.get(getRepositoryToken(ImagesEntity));
    this.categoriesEntityRepository = module.get(getRepositoryToken(CategoriesEntity));
    this.usersEntityRepository = module.get(getRepositoryToken(UsersEntity));
    this.usersGradesEntityRepository = module.get(getRepositoryToken(UsersGradesEntity));
    this.postsEntityRepository = module.get(getRepositoryToken(PostsEntity));
    this.postsGradesEntityRepository = module.get(getRepositoryToken(PostsGradesEntity));
    this.commentsEntityRepository = module.get(getRepositoryToken(CommentsEntity));
    this.commentsGradesEntityRepository = module.get(getRepositoryToken(CommentsGradesEntity));

    this.usersService = module.get(UsersService);
    this.imagesService = module.get(ImagesService);
    this.categoriesService = module.get(CategoriesService);
    this.postsService = module.get(PostsService);
    this.commentsService = module.get(CommentsService);

    this.userTestEntity = new UserTestEntity(this.usersService);
    this.categoryTestEntity = new CategoryTestEntity(this.categoriesService);
    this.postTestEntity = new PostTestEntity(this.postsService);
    this.commentTestEntity = new CommentTestEntity(this.commentsService);
    this.imageTestDto = new ImageTestDto();

    await this.app.init();
  }

  public async clearDatabase() {
    await this.postsEntityRepository.query(`DELETE FROM posts_categories;`);
    await this.categoriesEntityRepository.query(`DELETE FROM categories;`);
    await this.imagesEntityRepository.query(`DELETE FROM images;`);
    await this.commentsGradesEntityRepository.query(`DELETE FROM comments_grades;`);
    await this.commentsEntityRepository.query(`DELETE FROM comments;`);
    await this.postsGradesEntityRepository.query(`DELETE FROM posts_grades;`);
    await this.postsEntityRepository.query(`DELETE FROM posts;`);
    await this.usersGradesEntityRepository.query(`DELETE FROM users_grades;`);
    await this.usersEntityRepository.query(`DELETE FROM users;`);
  }

  public async closeApplication() {
    await this.app.close();
    const deleteTestImagesDir = promisify(rimraf);
    await deleteTestImagesDir(process.env.PWD + process.env.IMAGES_DIR);
  }
}
