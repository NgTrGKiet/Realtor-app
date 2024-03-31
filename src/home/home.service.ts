import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeResponseDto, UpdateHomeDto } from './dto/home.dto';
import { NotFoundError } from 'rxjs';
import { GetHomeParams, CreateHomeParams } from './interface/home.interface';

export const homeSelect = {
    id: true,
    address: true,
    city: true,
    price: true,
    propertyType: true,
    number_of_bathrooms: true,
    number_of_bedrooms: true,
}

@Injectable()
export class HomeService {
    constructor(private readonly prismaService: PrismaService) { }

    async getHomes(filter: GetHomeParams): Promise<HomeResponseDto[]> {
        const homes = await this.prismaService.home.findMany({
            select: {
                ...homeSelect,
                images: {
                    select: {
                        url: true
                    },
                    take: 1
                },
            },
            where: filter
        });

        if (!homes.length) {
            throw new NotFoundException();
        }
        return homes.map((home) => {
            const fetchHome = { ...home, image: home.images[0].url };
            delete fetchHome.images;
            return new HomeResponseDto(fetchHome);
        });
    }

    async getHomeById(id: number) {
        const home = await this.prismaService.home.findUnique({
            where: {
                id,
            },
            select: {
                ...homeSelect,
                images: {
                    select: {
                        url: true,
                    },
                },
                realtor: {
                    select: {
                        name: true,
                        email: true,
                        phone: true
                    }
                }
            }
        })

        if (!home) {
            throw new NotFoundException();
        }

        return new HomeResponseDto(home);
    }

    async createHome({
        address,
        numberOfBathrooms,
        numberOfBedrooms,
        city,
        landSize,
        price,
        propertyType,
        images,
    }: CreateHomeParams) {
        const home = await this.prismaService.home.create({
            data: {
                address,
                number_of_bathrooms: numberOfBathrooms,
                number_of_bedrooms: numberOfBedrooms,
                city,
                land_size: landSize,
                propertyType,
                price,
                realtor_id: 5
            }
        });

        const homeImages = images.map((image) => {
            return { ...image, home_id: home.id }
        });

        await this.prismaService.image.createMany({
            data: homeImages
        });

        return new HomeResponseDto(home);
    }

    async updateHomeById(id: number, data: UpdateHomeDto) {
        const home = await this.prismaService.home.findUnique({
            where: {
                id
            }
        });

        if (!home) {
            throw new NotFoundException();
        }

        const updateHome = await this.prismaService.home.update({
            where: {
                id,
            },
            data,
        });

        return new HomeResponseDto(updateHome);
    }

    async deleteHomeById(id: number) {
        await this.prismaService.image.deleteMany({
            where: {
                home_id: id
            }
        });

        await this.prismaService.home.delete({
            where: {
                id,
            }
        });
    }

    async getRealtorByHomeId(id: number) {
        const home = await this.prismaService.home.findUnique({
            where: {
                id,
            },
            select: {
                realtor: {
                    select: {
                        name: true,
                        id: true,
                        email: true,
                        phone: true
                    }
                }
            }
        });

        if (!home) {
            throw new NotFoundException();
        }

        return home.realtor;
    }
}
