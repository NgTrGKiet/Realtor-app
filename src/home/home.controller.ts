import { Controller, Get, Post, Put, Delete, Query, ParseIntPipe, Param, Body, UnauthorizedException } from '@nestjs/common';
import { HomeService } from './home.service';
import { CreateHomeDto, HomeResponseDto, InquireDto, UpdateHomeDto } from './dto/home.dto';
import { PropertyType, UserType } from '.prisma/client';
import { UserInfo } from 'src/user/interface/user.interface';
import { User } from 'src/user/decorators/user.decorator';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('home')
export class HomeController {

    constructor(private readonly homeService: HomeService) { }

    @Get()
    getHomes(
        @Query('city') city?: string,
        @Query('minPrice') minPrice?: string,
        @Query('maxPrice') maxPrice?: string,
        @Query('propertyType') propertyType?: PropertyType
    ): Promise<HomeResponseDto[]> {
        const price = minPrice || maxPrice ? {
            ...(minPrice && { gte: parseFloat(minPrice) }),
            ...(maxPrice && { lt: parseFloat(maxPrice) })
        } : undefined;

        const filter = {
            ...(city && { city }),
            ...(price && { price }),
            ...(propertyType && { propertyType })
        };
        return this.homeService.getHomes(filter);
    }

    @Get(':id')
    getHome(@Param('id', ParseIntPipe) id: number) {
        return this.homeService.getHomeById(id);
    }

    @Roles(UserType.REALTOR)
    @Post()
    createHome(@Body() body: CreateHomeDto, @User() user: UserInfo) {
        console.log(user);
        return this.homeService.createHome(body, user.id);
    }

    @Roles(UserType.REALTOR)
    @Put(':id')
    async updateHome(
        @Param("id", ParseIntPipe) id: number,
        @Body() body: UpdateHomeDto,
        @User() user: UserInfo
    ) {
        const realtor = await this.homeService.getRealtorByHomeId(id);
        if (realtor.id !== user.id) {
            throw new UnauthorizedException();
        }
        return this.homeService.updateHomeById(id, body);
    }

    @Roles(UserType.REALTOR)
    @Delete(':id')
    async deleteHome(
        @Param("id", ParseIntPipe) id: number,
        @User() user: UserInfo
    ) {
        const realtor = await this.homeService.getRealtorByHomeId(id);
        if (realtor.id !== user.id) {
            throw new UnauthorizedException();
        }
        return this.homeService.deleteHomeById(id)
    }

    @Roles(UserType.BUYER)
    @Post('/:id/inquire')
    inquire(
        @Param('id', ParseIntPipe) homeId: number,
        @User() user: UserInfo,
        @Body() { message }: InquireDto
    ) {
        return this.homeService.inquire(homeId, user, message)
    }

    async getHomeMessage(
        @Param('id', ParseIntPipe) id: number,
        @User() user: UserInfo
    ) {
        const realtor = await this.homeService.getRealtorByHomeId(id);

        if (realtor.id !== user.id) {
            throw new UnauthorizedException();
        }

        return this.homeService.getMessageByHome(id);
    }
}
