import { Controller, Get, Post, Put, Delete, Query, ParseIntPipe, Param, Body } from '@nestjs/common';
import { HomeService } from './home.service';
import { CreateHomeDto, HomeResponseDto, UpdateHomeDto } from './dto/home.dto';
import { PropertyType, UserType } from '.prisma/client';
import { UserInfo } from 'src/user/interface/user.interface';
import { User } from 'src/user/decorators/user.decorator';

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

    @Post()
    createHome(@Body() body: CreateHomeDto) {
        // console.log(user);
        return this.homeService.createHome(body);
    }

    @Put(':id')
    updateHome(
        @Param("id", ParseIntPipe) id: number,
        @Body() body: UpdateHomeDto
    ) {
        return this.homeService.updateHomeById(id, body);
    }

    @Delete(':id')
    deleteHome(
        @Param("id", ParseIntPipe) id: number,
    ) {
        return this.homeService.deleteHomeById(id)
    }
}
