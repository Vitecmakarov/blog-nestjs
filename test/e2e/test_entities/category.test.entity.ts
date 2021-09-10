import { CategoriesEntity } from '../../../src/category/entity/categories.entity';
import { CategoriesService } from '../../../src/category/service/categories.service';
import { MakeRandomString } from './random.string';

export class CategoryTestEntity {
  constructor(private readonly categoriesService: CategoriesService) {}
  async create(user_id: string): Promise<CategoriesEntity> {
    return await this.categoriesService.create({
      user_id: user_id,
      title: MakeRandomString(14),
    });
  }
}
