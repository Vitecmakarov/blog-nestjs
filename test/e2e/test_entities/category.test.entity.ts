import { CategoriesEntity } from '../../../src/category/categories.entity';
import { CategoriesService } from '../../../src/category/categories.service';

export class CategoryTestEntity {
  constructor(private readonly categoriesService: CategoriesService) {}
  async create(user_id: string): Promise<CategoriesEntity> {
    return await this.categoriesService.create({
      user_id: user_id,
      title: 'title_test',
    });
  }
}
