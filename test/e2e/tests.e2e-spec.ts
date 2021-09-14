import { classToPlain } from 'class-transformer';

import * as bcrypt from 'bcrypt';
import * as request from 'supertest';

import { Application } from './app.module';

import { CreateUserDto } from '../../src/user/dto/create.user.dto';
import { UpdateUserDto } from '../../src/user/dto/update.user.dto';
import { UpdatePasswordDto } from '../../src/user/dto/update.password.dto';
import { UpdateUserGradesDto } from '../../src/user/dto/update.user.grades.dto';

import { CreateCategoryDto } from '../../src/category/dto/create.category.dto';
import { UpdateCategoryDto } from '../../src/category/dto/update.category.dto';

import { CreateCommentDto } from '../../src/comment/dto/create.coment.dto';
import { UpdateCommentDto } from '../../src/comment/dto/update.comment.dto';
import { UpdateCommentGradesDto } from '../../src/comment/dto/update.comment.grades.dto';

import { CreatePostDto } from '../../src/post/dto/create.post.dto';
import { UpdatePostDto } from '../../src/post/dto/update.post.dto';
import { UpdatePostGradesDto } from '../../src/post/dto/update.post.grades.dto';
import { UpdatePostCategoryAction } from '../../src/post/dto/update.post.category.dto';
import { PostCategoryAction } from '../../src/post/enums/posts.enums';
import { CategoriesEntity } from '../../src/category/entity/categories.entity';

const application = new Application();
let authToken: string;

beforeAll(async () => {
  await application.initializeApp();
}, 15000);

afterEach(async () => {
  await application.clearDatabase();
});

afterAll(async () => {
  await application.closeApplication();
});

describe('Auth module', () => {
  it('POST /auth/login', async () => {
    const userEntity = await application.userTestEntity.create();

    await request
      .agent(application.app.getHttpServer())
      .delete(`/users/${userEntity.id}`)
      .set('Accept', 'application/json')
      .expect(401);

    const { body } = await request
      .agent(application.app.getHttpServer())
      .post('/auth/login')
      .set('Accept', 'application/json')
      .send({ mobile: userEntity.mobile, password: 'password_test' })
      .expect(201);
    expect(body).toEqual({
      access_token: expect.any(String),
    });

    const [userDataAfterLogin] = await application.usersService.getAll();
    expect(userDataAfterLogin.last_login).toEqual(expect.any(Date));

    authToken = body.access_token;

    await request
      .agent(application.app.getHttpServer())
      .delete(`/users/${userEntity.id}`)
      .set('Authorization', 'Bearer ' + authToken)
      .expect(200);
  });
});

describe('Users module', () => {
  it('POST /users/register', async () => {
    const dataBeforeInsert = classToPlain(application.usersService.getAll());
    await expect(dataBeforeInsert).resolves.toEqual([]);

    const userDto = new CreateUserDto(
      'first_name_test',
      'last_name_test',
      'mobile_test',
      'email_test',
      'password_test',
    );

    const expectedObj = {
      id: expect.any(String),
      first_name: userDto.first_name,
      last_name: userDto.last_name,
      mobile: userDto.mobile,
      email: userDto.email,
      grades: [],
      avatar: null,
      profile_desc: null,
      rating: 0,
      register_at: expect.any(Date),
      last_login: null,
    };

    await request
      .agent(application.app.getHttpServer())
      .post('/users/register')
      .set('Accept', 'application/json')
      .send(userDto)
      .expect(201);

    const promiseUser = application.usersService.getAll();

    const dataAfterInsert = classToPlain(promiseUser);
    await expect(dataAfterInsert).resolves.toEqual([expectedObj]);

    const [user] = await promiseUser;

    const isPasswordSavedCorrectly = await bcrypt.compare(userDto.password, user.password);
    if (!isPasswordSavedCorrectly) {
      throw new Error('Password is not saved correctly');
    }
  });

  it('POST /users/:id/grades', async () => {
    const first_estimator = await application.userTestEntity.create();
    const second_estimator = await application.userTestEntity.create();
    const evaluated_user = await application.userTestEntity.create();

    const firstUserGrade = new UpdateUserGradesDto(first_estimator.id, 4);
    const secondUserGrade = new UpdateUserGradesDto(second_estimator.id, 2);

    const changeFirstUserGrade = new UpdateUserGradesDto(first_estimator.id, 2);

    const expectedObj = {
      id: evaluated_user.id,
      first_name: evaluated_user.first_name,
      last_name: evaluated_user.last_name,
      mobile: evaluated_user.mobile,
      email: evaluated_user.email,
      avatar: null,
      profile_desc: evaluated_user.profile_desc,
      register_at: expect.any(Date),
      last_login: null,
    };

    await request
      .agent(application.app.getHttpServer())
      .post(`/users/${evaluated_user.id}/grades`)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + authToken)
      .send(firstUserGrade)
      .expect(201);

    const dataAfterFirstGradeInsert = classToPlain(
      application.usersService.getById(evaluated_user.id),
    );
    await expect(dataAfterFirstGradeInsert).resolves.toEqual({
      grades: [
        {
          id: expect.any(String),
          grade: 4,
        },
      ],
      rating: 4,
      ...expectedObj,
    });

    await request
      .agent(application.app.getHttpServer())
      .post(`/users/${evaluated_user.id}/grades`)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + authToken)
      .send(secondUserGrade)
      .expect(201);

    const dataAfterSecondGradeInsert = classToPlain(
      application.usersService.getById(evaluated_user.id),
    );
    await expect(dataAfterSecondGradeInsert).resolves.toEqual({
      grades: [
        {
          id: expect.any(String),
          grade: expect.any(Number),
        },
        {
          id: expect.any(String),
          grade: expect.any(Number),
        },
      ],
      rating: 3,
      ...expectedObj,
    });

    await request
      .agent(application.app.getHttpServer())
      .post(`/users/${evaluated_user.id}/grades`)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + authToken)
      .send(changeFirstUserGrade)
      .expect(201);

    const dataAfterFirstGradeUpdate = classToPlain(
      application.usersService.getById(evaluated_user.id),
    );
    await expect(dataAfterFirstGradeUpdate).resolves.toEqual({
      grades: [
        {
          id: expect.any(String),
          grade: 2,
        },
        {
          id: expect.any(String),
          grade: 2,
        },
      ],
      rating: 2,
      ...expectedObj,
    });
  });

  it('GET /users/:id', async () => {
    const userEntity = await application.userTestEntity.create();
    const categoryEntity = await application.categoryTestEntity.create(userEntity.id);
    const postEntity = await application.postTestEntity.create(userEntity.id, [categoryEntity.id]);
    await application.commentTestEntity.create(userEntity.id, postEntity.id);

    const expectedResponseObj = {
      id: userEntity.id,
      first_name: userEntity.first_name,
      last_name: userEntity.last_name,
      mobile: userEntity.mobile,
      email: userEntity.email,
      grades: [],
      avatar: null,
      profile_desc: userEntity.profile_desc,
      rating: userEntity.rating,
      register_at: expect.any(String),
      last_login: userEntity.last_login,
    };

    const { body } = await request
      .agent(application.app.getHttpServer())
      .get(`/users/${userEntity.id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(body).toEqual(expectedResponseObj);
  });

  it('GET /users/:id/avatar', async () => {
    const userEntity = await application.userTestEntity.create();
    const imageDto = await application.imageTestDto.create();

    await application.usersService.update(userEntity.id, {
      avatar: imageDto,
    });

    const response = await request
      .agent(application.app.getHttpServer())
      .get(`/users/${userEntity.id}/avatar`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /octet-stream/)
      .expect(200);
    expect(response.body).toEqual(expect.any(Buffer));
  });

  it('PATCH /users/:id/profile', async () => {
    const userEntity = await application.userTestEntity.create();
    const imageDto = await application.imageTestDto.create();

    const userDto = new UpdateUserDto(
      'first_name_test_changed',
      'last_name_test_changed',
      'this is test description',
      imageDto,
    );

    const expectedObj = {
      id: userEntity.id,
      first_name: userDto.first_name,
      last_name: userDto.last_name,
      mobile: userEntity.mobile,
      email: userEntity.email,
      grades: [],
      avatar: {
        id: expect.any(String),
        path: expect.any(String),
        extension: expect.any(String),
        size: expect.any(Number),
        upload_timestamp: expect.any(Date),
      },
      profile_desc: userDto.profile_desc,
      rating: userEntity.rating,
      register_at: expect.any(Date),
      last_login: null,
    };

    await request
      .agent(application.app.getHttpServer())
      .patch(`/users/${userEntity.id}/profile`)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + authToken)
      .send(userDto)
      .expect(200);

    const dataAfterUpdate = classToPlain(application.usersService.getById(userEntity.id));
    await expect(dataAfterUpdate).resolves.toEqual(expectedObj);
  });

  it('PATCH /users/:id/password', async () => {
    const userEntity = await application.userTestEntity.create();
    const userDto = new UpdatePasswordDto('new_password');

    await request
      .agent(application.app.getHttpServer())
      .patch(`/users/${userEntity.id}/password`)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + authToken)
      .send(userDto)
      .expect(200);

    const userEntityAfterPassChange = await application.usersService.getById(userEntity.id);

    const isPasswordChanged = await bcrypt.compare(
      userDto.password,
      userEntityAfterPassChange.password,
    );
    if (!isPasswordChanged) {
      throw new Error('Password is not changed');
    }
  });

  it('DELETE /users/:id', async () => {
    const userEntity = await application.userTestEntity.create();
    const categoryEntity = await application.categoryTestEntity.create(userEntity.id);
    const postEntity = await application.postTestEntity.create(userEntity.id, [categoryEntity.id]);
    await application.commentTestEntity.create(userEntity.id, postEntity.id);

    await request
      .agent(application.app.getHttpServer())
      .delete(`/users/${userEntity.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + authToken)
      .expect(200);

    const dataAfterDelete = application.usersService.getAll();
    await expect(dataAfterDelete).resolves.toEqual([]);
  });
});

describe('Categories module', () => {
  it('POST /categories/create', async () => {
    const dataBeforeInsert = classToPlain(application.categoriesService.getAll());
    await expect(dataBeforeInsert).resolves.toEqual([]);

    const userEntity = await application.userTestEntity.create();

    const categoryDto = new CreateCategoryDto(userEntity.id, 'title_test');

    const expectedObj = {
      id: expect.any(String),
      title: categoryDto.title,
      user: {
        id: userEntity.id,
        first_name: userEntity.first_name,
        last_name: userEntity.last_name,
        mobile: userEntity.mobile,
        email: userEntity.email,
        profile_desc: userEntity.profile_desc,
        rating: userEntity.rating,
        register_at: userEntity.register_at,
        last_login: userEntity.last_login,
      },
      posts: [],
    };

    await request
      .agent(application.app.getHttpServer())
      .post('/categories/create')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + authToken)
      .send(categoryDto)
      .expect(201);

    const dataAfterInsert = classToPlain(application.categoriesService.getAll());
    await expect(dataAfterInsert).resolves.toEqual([expectedObj]);
  });

  it('GET (/categories/all, /categories/:id, /categories/user/:id, /categories/title/:title)', async () => {
    const userEntity = await application.userTestEntity.create();
    const categoryEntity = await application.categoryTestEntity.create(userEntity.id);
    const postEntity = await application.postTestEntity.create(userEntity.id, [categoryEntity.id]);

    const expectedResponseObj = {
      id: categoryEntity.id,
      title: categoryEntity.title,
      posts: [
        {
          id: postEntity.id,
          title: postEntity.title,
          content: postEntity.content,
          rating: postEntity.rating,
          created_at: expect.any(String),
          updated_at: expect.any(String),
        },
      ],
      user: {
        id: userEntity.id,
        first_name: userEntity.first_name,
        last_name: userEntity.last_name,
        mobile: userEntity.mobile,
        email: userEntity.email,
        profile_desc: userEntity.profile_desc,
        rating: userEntity.rating,
        register_at: expect.any(String),
        last_login: userEntity.last_login,
      },
    };

    let response = await request
      .agent(application.app.getHttpServer())
      .get(`/categories/all`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body).toEqual([expectedResponseObj]);

    response = await request
      .agent(application.app.getHttpServer())
      .get(`/categories/${categoryEntity.id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body).toEqual(expectedResponseObj);

    response = await request
      .agent(application.app.getHttpServer())
      .get(`/categories/user/${userEntity.id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body).toEqual([expectedResponseObj]);

    response = await request
      .agent(application.app.getHttpServer())
      .get(`/categories/title/${categoryEntity.title}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body).toEqual([expectedResponseObj]);
  });

  it('PATCH /categories/:id', async () => {
    const userEntity = await application.userTestEntity.create();
    const categoryEntity = await application.categoryTestEntity.create(userEntity.id);

    const categoryDto = new UpdateCategoryDto('title_changed');

    const expectedObj = {
      id: categoryEntity.id,
      title: categoryDto.title,
      posts: [],
      user: {
        id: userEntity.id,
        first_name: userEntity.first_name,
        last_name: userEntity.last_name,
        mobile: userEntity.mobile,
        email: userEntity.email,
        profile_desc: userEntity.profile_desc,
        rating: userEntity.rating,
        register_at: expect.any(Date),
        last_login: userEntity.last_login,
      },
    };

    await request
      .agent(application.app.getHttpServer())
      .patch(`/categories/${categoryEntity.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + authToken)
      .send(categoryDto)
      .expect(200);

    const dataAfterUpdate = classToPlain(application.categoriesService.getAll());
    await expect(dataAfterUpdate).resolves.toEqual([expectedObj]);
  });

  it('DELETE /categories/category/:id', async () => {
    const userEntity = await application.userTestEntity.create();
    const categoryEntity = await application.categoryTestEntity.create(userEntity.id);
    await application.postTestEntity.create(userEntity.id, [categoryEntity.id]);

    await request
      .agent(application.app.getHttpServer())
      .delete(`/categories/${categoryEntity.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + authToken)
      .expect(200);

    const dataAfterUpdate = classToPlain(application.categoriesService.getAll());
    await expect(dataAfterUpdate).resolves.toEqual([]);
  });
});

describe('Posts module', () => {
  it('POST /posts/create', async () => {
    const dataBeforeInsert = classToPlain(application.postsService.getAll());
    await expect(dataBeforeInsert).resolves.toEqual([]);

    const userEntity = await application.userTestEntity.create();
    const categoryEntity = await application.categoryTestEntity.create(userEntity.id);

    const imageDto = await application.imageTestDto.create();
    const postDto = new CreatePostDto(
      userEntity.id,
      [categoryEntity.id],
      'title_test',
      'content_test',
      imageDto,
    );

    const expectedObj = {
      id: expect.any(String),
      title: postDto.title,
      content: postDto.content,
      user: {
        id: userEntity.id,
        first_name: userEntity.first_name,
        last_name: userEntity.last_name,
        mobile: userEntity.mobile,
        email: userEntity.email,
        profile_desc: userEntity.profile_desc,
        rating: userEntity.rating,
        register_at: userEntity.register_at,
        last_login: userEntity.last_login,
      },
      categories: [
        {
          id: categoryEntity.id,
          title: categoryEntity.title,
        },
      ],
      grades: [],
      comments: [],
      image: {
        id: expect.any(String),
        path: expect.any(String),
        size: expect.any(Number),
        extension: expect.any(String),
        upload_timestamp: expect.any(Date),
      },
      rating: 0,
      created_at: expect.any(Date),
      updated_at: expect.any(Date),
    };

    await request
      .agent(application.app.getHttpServer())
      .post('/posts/create')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + authToken)
      .send(postDto)
      .expect(201);

    const dataAfterInsert = classToPlain(application.postsService.getAll());
    await expect(dataAfterInsert).resolves.toEqual([expectedObj]);
  });

  it('POST /posts/:id/grades', async () => {
    const first_estimator = await application.userTestEntity.create();
    const second_estimator = await application.userTestEntity.create();

    const userEntity = await application.userTestEntity.create();
    const categoryEntity = await application.categoryTestEntity.create(userEntity.id);
    const evaluated_post = await application.postTestEntity.create(userEntity.id, [
      categoryEntity.id,
    ]);

    const firstUserGrade = new UpdatePostGradesDto(first_estimator.id, 4);
    const secondUserGrade = new UpdatePostGradesDto(second_estimator.id, 2);

    const changeFirstUserGrade = new UpdatePostGradesDto(first_estimator.id, 2);

    const expectedObj = {
      id: evaluated_post.id,
      title: evaluated_post.title,
      content: evaluated_post.content,
      user: {
        id: userEntity.id,
        first_name: userEntity.first_name,
        last_name: userEntity.last_name,
        mobile: userEntity.mobile,
        email: userEntity.email,
        profile_desc: userEntity.profile_desc,
        rating: userEntity.rating,
        register_at: userEntity.register_at,
        last_login: userEntity.last_login,
      },
      categories: [
        {
          id: categoryEntity.id,
          title: categoryEntity.title,
        },
      ],
      image: null,
      comments: [],
      created_at: expect.any(Date),
      updated_at: expect.any(Date),
    };

    await request
      .agent(application.app.getHttpServer())
      .post(`/posts/${evaluated_post.id}/grades`)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + authToken)
      .send(firstUserGrade)
      .expect(201);

    const dataAfterFirstGradeInsert = classToPlain(
      application.postsService.getById(evaluated_post.id),
    );
    await expect(dataAfterFirstGradeInsert).resolves.toEqual({
      grades: [
        {
          id: expect.any(String),
          grade: 4,
        },
      ],
      rating: 4,
      ...expectedObj,
    });

    await request
      .agent(application.app.getHttpServer())
      .post(`/posts/${evaluated_post.id}/grades`)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + authToken)
      .send(secondUserGrade)
      .expect(201);

    const dataAfterSecondGradeInsert = classToPlain(
      application.postsService.getById(evaluated_post.id),
    );
    await expect(dataAfterSecondGradeInsert).resolves.toEqual({
      grades: [
        {
          id: expect.any(String),
          grade: expect.any(Number),
        },
        {
          id: expect.any(String),
          grade: expect.any(Number),
        },
      ],
      rating: 3,
      ...expectedObj,
    });

    await request
      .agent(application.app.getHttpServer())
      .post(`/posts/${evaluated_post.id}/grades`)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + authToken)
      .send(changeFirstUserGrade)
      .expect(201);

    const dataAfterFirstGradeUpdate = classToPlain(
      application.postsService.getById(evaluated_post.id),
    );
    await expect(dataAfterFirstGradeUpdate).resolves.toEqual({
      grades: [
        {
          id: expect.any(String),
          grade: 2,
        },
        {
          id: expect.any(String),
          grade: 2,
        },
      ],
      rating: 2,
      ...expectedObj,
    });
  });

  it('GET (/posts/all, /posts/:id, /posts/:id/image, /posts/category/:id)', async () => {
    const userEntity = await application.userTestEntity.create();
    const categoryEntity = await application.categoryTestEntity.create(userEntity.id);
    const postEntity = await application.postTestEntity.create(userEntity.id, [categoryEntity.id]);
    const commentEntity = await application.commentTestEntity.create(userEntity.id, postEntity.id);

    const expectedResponseObj = {
      id: postEntity.id,
      title: postEntity.title,
      user: {
        id: userEntity.id,
        first_name: userEntity.first_name,
        last_name: userEntity.last_name,
        mobile: userEntity.mobile,
        email: userEntity.email,
        profile_desc: userEntity.profile_desc,
        rating: userEntity.rating,
        register_at: expect.any(String),
        last_login: userEntity.last_login,
      },
      categories: [
        {
          id: categoryEntity.id,
          title: categoryEntity.title,
        },
      ],
      grades: [],
      comments: [
        {
          id: commentEntity.id,
          content: commentEntity.content,
          likes_count: commentEntity.likes_count,
          dislikes_count: commentEntity.dislikes_count,
          created_at: expect.any(String),
          updated_at: expect.any(String),
        },
      ],
      image: null,
      rating: postEntity.rating,
      content: postEntity.content,
      created_at: expect.any(String),
      updated_at: expect.any(String),
    };

    let response = await request
      .agent(application.app.getHttpServer())
      .get('/posts/all')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body).toEqual([expectedResponseObj]);

    response = await request
      .agent(application.app.getHttpServer())
      .get(`/posts/${postEntity.id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body).toEqual(expectedResponseObj);

    response = await request
      .agent(application.app.getHttpServer())
      .get(`/posts/category/${categoryEntity.id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body).toEqual([expectedResponseObj]);
  });

  it('GET /posts/:id/image', async () => {
    const userEntity = await application.userTestEntity.create();
    const categoryEntity = await application.categoryTestEntity.create(userEntity.id);
    const imageDto = await application.imageTestDto.create();
    const postEntity = await application.postTestEntity.create(
      userEntity.id,
      [categoryEntity.id],
      imageDto,
    );

    const response = await request
      .agent(application.app.getHttpServer())
      .get(`/posts/${postEntity.id}/image`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /octet-stream/)
      .expect(200);
    expect(response.body).toEqual(expect.any(Buffer));
  });

  it('PATCH /posts/:id', async () => {
    const userEntity = await application.userTestEntity.create();
    const firstCategoryEntity = await application.categoryTestEntity.create(userEntity.id);
    const secondCategoryEntity = await application.categoryTestEntity.create(userEntity.id);
    const postEntity = await application.postTestEntity.create(userEntity.id, [
      firstCategoryEntity.id,
    ]);

    const addCategoryAction = new UpdatePostCategoryAction(
      PostCategoryAction.ADD,
      secondCategoryEntity.id,
    );

    const deleteCategoryAction = new UpdatePostCategoryAction(
      PostCategoryAction.DELETE,
      firstCategoryEntity.id,
    );

    const imageDto = await application.imageTestDto.create();
    const postDto = new UpdatePostDto(
      [addCategoryAction, deleteCategoryAction],
      'title_test',
      'content_test',
      imageDto,
    );

    const expectedObj = {
      id: postEntity.id,
      title: postDto.title,
      content: postDto.content,
      user: {
        id: userEntity.id,
        first_name: userEntity.first_name,
        last_name: userEntity.last_name,
        mobile: userEntity.mobile,
        email: userEntity.email,
        profile_desc: userEntity.profile_desc,
        rating: userEntity.rating,
        register_at: expect.any(Date),
        last_login: userEntity.last_login,
      },
      categories: [
        {
          id: secondCategoryEntity.id,
          title: secondCategoryEntity.title,
        },
      ],
      grades: [],
      comments: [],
      image: {
        id: expect.any(String),
        path: expect.any(String),
        extension: expect.any(String),
        size: expect.any(Number),
        upload_timestamp: expect.any(Date),
      },
      rating: 0,
      created_at: expect.any(Date),
      updated_at: expect.any(Date),
    };

    await request
      .agent(application.app.getHttpServer())
      .patch(`/posts/${postEntity.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + authToken)
      .send(postDto)
      .expect(200);

    const dataAfterUpdate = classToPlain(application.postsService.getAll());
    await expect(dataAfterUpdate).resolves.toEqual([expectedObj]);
  });

  it('DELETE /posts/:id', async () => {
    const userEntity = await application.userTestEntity.create();
    const categoryEntity = await application.categoryTestEntity.create(userEntity.id);
    const postEntity = await application.postTestEntity.create(userEntity.id, [categoryEntity.id]);
    await application.commentTestEntity.create(userEntity.id, postEntity.id);

    await request
      .agent(application.app.getHttpServer())
      .delete(`/posts/${postEntity.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + authToken)
      .expect(200);

    const dataAfterUpdate = classToPlain(application.postsService.getAll());
    await expect(dataAfterUpdate).resolves.toEqual([]);

    const [categoriesAfterPostDelete] = await application.categoriesService.getAll();
    await expect(categoriesAfterPostDelete).toEqual(expect.any(CategoriesEntity));
  });
});

describe('Comments module', () => {
  it('POST /comments/create', async () => {
    const dataBeforeInsert = classToPlain(application.commentsService.getAll());
    await expect(dataBeforeInsert).resolves.toEqual([]);

    const userEntity = await application.userTestEntity.create();
    const categoryEntity = await application.categoryTestEntity.create(userEntity.id);
    const postEntity = await application.postTestEntity.create(userEntity.id, [categoryEntity.id]);

    const commentDto = new CreateCommentDto(userEntity.id, postEntity.id, 'content_test');

    const expectedObj = {
      id: expect.any(String),
      content: commentDto.content,
      user: {
        id: userEntity.id,
        first_name: userEntity.first_name,
        last_name: userEntity.last_name,
        mobile: userEntity.mobile,
        email: userEntity.email,
        profile_desc: userEntity.profile_desc,
        rating: userEntity.rating,
        register_at: expect.any(Date),
        last_login: userEntity.last_login,
      },
      post: {
        id: postEntity.id,
        title: postEntity.title,
        content: postEntity.content,
        rating: postEntity.rating,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      },
      grades: [],
      likes_count: 0,
      dislikes_count: 0,
      created_at: expect.any(Date),
      updated_at: expect.any(Date),
    };

    await request
      .agent(application.app.getHttpServer())
      .post('/comments/create')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + authToken)
      .send(commentDto)
      .expect(201);

    const dataAfterInsert = classToPlain(application.commentsService.getAll());
    await expect(dataAfterInsert).resolves.toEqual([expectedObj]);
  });

  it('POST /comments/:id/grades', async () => {
    const first_estimator = await application.userTestEntity.create();
    const second_estimator = await application.userTestEntity.create();

    const userEntity = await application.userTestEntity.create();
    const categoryEntity = await application.categoryTestEntity.create(userEntity.id);
    const postEntity = await application.postTestEntity.create(userEntity.id, [categoryEntity.id]);
    const evaluated_comment = await application.commentTestEntity.create(
      userEntity.id,
      postEntity.id,
    );

    const firstUserGrade = new UpdateCommentGradesDto(first_estimator.id, 1);
    const secondUserGrade = new UpdateCommentGradesDto(second_estimator.id, -1);

    const changeFirstUserGrade = new UpdateCommentGradesDto(first_estimator.id, -1);

    const expectedObj = {
      id: evaluated_comment.id,
      content: evaluated_comment.content,
      user: {
        id: userEntity.id,
        first_name: userEntity.first_name,
        last_name: userEntity.last_name,
        mobile: userEntity.mobile,
        email: userEntity.email,
        profile_desc: userEntity.profile_desc,
        rating: userEntity.rating,
        register_at: expect.any(Date),
        last_login: userEntity.last_login,
      },
      post: {
        id: postEntity.id,
        title: postEntity.title,
        content: postEntity.content,
        rating: postEntity.rating,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      },
      created_at: expect.any(Date),
      updated_at: expect.any(Date),
    };

    await request
      .agent(application.app.getHttpServer())
      .post(`/comments/${evaluated_comment.id}/grades`)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + authToken)
      .send(firstUserGrade)
      .expect(201);

    const dataAfterFirstGradeInsert = classToPlain(
      application.commentsService.getById(evaluated_comment.id),
    );
    await expect(dataAfterFirstGradeInsert).resolves.toEqual({
      grades: [
        {
          id: expect.any(String),
          grade: 1,
        },
      ],
      likes_count: 1,
      dislikes_count: 0,
      ...expectedObj,
    });

    await request
      .agent(application.app.getHttpServer())
      .post(`/comments/${evaluated_comment.id}/grades`)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + authToken)
      .send(secondUserGrade)
      .expect(201);

    const dataAfterSecondGradeInsert = classToPlain(
      application.commentsService.getById(evaluated_comment.id),
    );
    await expect(dataAfterSecondGradeInsert).resolves.toEqual({
      grades: [
        {
          id: expect.any(String),
          grade: expect.any(Number),
        },
        {
          id: expect.any(String),
          grade: expect.any(Number),
        },
      ],
      likes_count: 1,
      dislikes_count: 1,
      ...expectedObj,
    });

    await request
      .agent(application.app.getHttpServer())
      .post(`/comments/${evaluated_comment.id}/grades`)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + authToken)
      .send(changeFirstUserGrade)
      .expect(201);

    const dataAfterFirstGradeUpdate = classToPlain(
      application.commentsService.getById(evaluated_comment.id),
    );
    await expect(dataAfterFirstGradeUpdate).resolves.toEqual({
      grades: [
        {
          id: expect.any(String),
          grade: -1,
        },
        {
          id: expect.any(String),
          grade: -1,
        },
      ],
      likes_count: 0,
      dislikes_count: 2,
      ...expectedObj,
    });
  });

  it('GET /comments/post/:id', async () => {
    const userEntity = await application.userTestEntity.create();
    const categoryEntity = await application.categoryTestEntity.create(userEntity.id);
    const postEntity = await application.postTestEntity.create(userEntity.id, [categoryEntity.id]);
    const commentEntity = await application.commentTestEntity.create(userEntity.id, postEntity.id);

    const expectedResponseObj = {
      id: commentEntity.id,
      content: commentEntity.content,
      user: {
        id: userEntity.id,
        first_name: userEntity.first_name,
        last_name: userEntity.last_name,
        mobile: userEntity.mobile,
        email: userEntity.email,
        profile_desc: userEntity.profile_desc,
        rating: userEntity.rating,
        register_at: expect.any(String),
        last_login: userEntity.last_login,
      },
      post: {
        id: postEntity.id,
        title: postEntity.title,
        content: postEntity.content,
        rating: postEntity.rating,
        created_at: expect.any(String),
        updated_at: expect.any(String),
      },
      grades: [],
      likes_count: 0,
      dislikes_count: 0,
      created_at: expect.any(String),
      updated_at: expect.any(String),
    };

    const response = await request
      .agent(application.app.getHttpServer())
      .get(`/comments/post/${postEntity.id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body).toEqual([expectedResponseObj]);
  });

  it('PATCH /comments/:id', async () => {
    const userEntity = await application.userTestEntity.create();
    const categoryEntity = await application.categoryTestEntity.create(userEntity.id);
    const postEntity = await application.postTestEntity.create(userEntity.id, [categoryEntity.id]);
    const commentEntity = await application.commentTestEntity.create(userEntity.id, postEntity.id);

    const commentDto = new UpdateCommentDto('content_test');

    const expectedObj = {
      id: commentEntity.id,
      content: commentDto.content,
      user: {
        id: userEntity.id,
        first_name: userEntity.first_name,
        last_name: userEntity.last_name,
        mobile: userEntity.mobile,
        email: userEntity.email,
        profile_desc: userEntity.profile_desc,
        rating: userEntity.rating,
        register_at: expect.any(Date),
        last_login: userEntity.last_login,
      },
      post: {
        id: postEntity.id,
        title: postEntity.title,
        content: postEntity.content,
        rating: postEntity.rating,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      },
      grades: [],
      likes_count: 0,
      dislikes_count: 0,
      created_at: expect.any(Date),
      updated_at: expect.any(Date),
    };

    await request
      .agent(application.app.getHttpServer())
      .patch(`/comments/${commentEntity.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + authToken)
      .send(commentDto)
      .expect(200);

    const dataAfterUpdate = classToPlain(application.commentsService.getAll());
    expect(dataAfterUpdate).resolves.toEqual([expectedObj]);
  });

  it('DELETE /comments/:id', async () => {
    const userEntity = await application.userTestEntity.create();
    const categoryEntity = await application.categoryTestEntity.create(userEntity.id);
    const postEntity = await application.postTestEntity.create(userEntity.id, [categoryEntity.id]);
    const commentEntity = await application.commentTestEntity.create(userEntity.id, postEntity.id);

    await request
      .agent(application.app.getHttpServer())
      .delete(`/comments/${commentEntity.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + authToken)
      .expect(200);

    const dataAfterUpdate = classToPlain(application.commentsService.getAll());
    await expect(dataAfterUpdate).resolves.toEqual([]);
  });
});
