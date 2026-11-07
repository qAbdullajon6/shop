import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';

import { Public } from '../../common/decorators';
import { DeliveryService } from './delivery.service';
import { DeliveryOptionDto } from './dto/delivery-option.dto';

@ApiTags('Delivery')
@Controller('delivery-options')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Public()
  @SkipThrottle()
  @Get()
  @ApiOperation({ summary: 'Mavjud yetkazib berish usullari' })
  @ApiOkResponse({ type: [DeliveryOptionDto] })
  findActive(): Promise<DeliveryOptionDto[]> {
    return this.deliveryService.findActive();
  }
}
