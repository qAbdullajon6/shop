import { Module } from '@nestjs/common';

import { CategoryAttributesController } from './category-attributes.controller';
import { CategoryAttributesService } from './category-attributes.service';

@Module({
  controllers: [CategoryAttributesController],
  providers: [CategoryAttributesService],
  exports: [CategoryAttributesService],
})
export class CategoryAttributesModule {}
