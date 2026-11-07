import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { AddressResponseDto } from './dto/address-response.dto';

const TRANSFORM_OPTIONS = { excludeExtraneousValues: true };

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  private map(address: object): AddressResponseDto {
    return plainToInstance(AddressResponseDto, address, TRANSFORM_OPTIONS);
  }

  private async verifyOwnership(addressId: string, userId: string) {
    const address = await this.prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) throw new NotFoundException('Manzil topilmadi');
    if (address.user_id !== userId) throw new ForbiddenException('Ruxsat etilmagan');

    return address;
  }

  async findMyAddresses(userId: string): Promise<AddressResponseDto[]> {
    const addresses = await this.prisma.address.findMany({
      where: { user_id: userId },
      orderBy: [{ is_default: 'desc' }, { created_at: 'desc' }],
    });

    return addresses.map((a) => this.map(a));
  }

  async findMyAddress(userId: string, addressId: string): Promise<AddressResponseDto> {
    const address = await this.verifyOwnership(addressId, userId);
    return this.map(address);
  }

  async create(userId: string, dto: CreateAddressDto): Promise<AddressResponseDto> {
    const existingCount = await this.prisma.address.count({ where: { user_id: userId } });

    const shouldBeDefault = dto.is_default === true || existingCount === 0;

    const address = await this.prisma.$transaction(async (tx) => {
      if (shouldBeDefault) {
        await tx.address.updateMany({
          where: { user_id: userId },
          data: { is_default: false },
        });
      }

      return tx.address.create({
        data: {
          user_id: userId,
          title: dto.title ?? null,
          city: dto.city,
          district: dto.district ?? null,
          street: dto.street,
          zip_code: dto.zip_code ?? null,
          lat: dto.lat !== undefined ? dto.lat : null,
          lon: dto.lon !== undefined ? dto.lon : null,
          is_default: shouldBeDefault,
        },
      });
    });

    return this.map(address);
  }

  async update(
    userId: string,
    addressId: string,
    dto: UpdateAddressDto,
  ): Promise<AddressResponseDto> {
    const hasChanges =
      dto.title !== undefined ||
      dto.city !== undefined ||
      dto.district !== undefined ||
      dto.street !== undefined ||
      dto.zip_code !== undefined ||
      dto.lat !== undefined ||
      dto.lon !== undefined ||
      dto.is_default !== undefined;

    if (!hasChanges) {
      throw new BadRequestException('Yangilash uchun kamida bitta maydon yuborilishi kerak');
    }

    await this.verifyOwnership(addressId, userId);

    const address = await this.prisma.$transaction(async (tx) => {
      if (dto.is_default === true) {
        await tx.address.updateMany({
          where: { user_id: userId, id: { not: addressId } },
          data: { is_default: false },
        });
      }

      return tx.address.update({
        where: { id: addressId },
        data: {
          ...(dto.title !== undefined && { title: dto.title }),
          ...(dto.city !== undefined && { city: dto.city }),
          ...(dto.district !== undefined && { district: dto.district }),
          ...(dto.street !== undefined && { street: dto.street }),
          ...(dto.zip_code !== undefined && { zip_code: dto.zip_code }),
          ...(dto.lat !== undefined && { lat: dto.lat }),
          ...(dto.lon !== undefined && { lon: dto.lon }),
          ...(dto.is_default !== undefined && { is_default: dto.is_default }),
        },
      });
    });

    return this.map(address);
  }

  async remove(userId: string, addressId: string): Promise<void> {
    await this.verifyOwnership(addressId, userId);

    const ordersCount = await this.prisma.order.count({ where: { address_id: addressId } });
    if (ordersCount > 0) {
      throw new ConflictException("Bu manzil buyurtmalarda ishlatilgan, o'chirib bo'lmaydi");
    }

    await this.prisma.address.delete({ where: { id: addressId } });
  }

  async setDefault(userId: string, addressId: string): Promise<AddressResponseDto> {
    await this.verifyOwnership(addressId, userId);

    const address = await this.prisma.$transaction(async (tx) => {
      await tx.address.updateMany({
        where: { user_id: userId },
        data: { is_default: false },
      });

      return tx.address.update({
        where: { id: addressId },
        data: { is_default: true },
      });
    });

    return this.map(address);
  }

  async findUserAddresses(userId: string): Promise<AddressResponseDto[]> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');

    const addresses = await this.prisma.address.findMany({
      where: { user_id: userId },
      orderBy: [{ is_default: 'desc' }, { created_at: 'desc' }],
    });

    return addresses.map((a) => this.map(a));
  }
}
