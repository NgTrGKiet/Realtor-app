import { Body, Controller, Post, Param, ParseEnumPipe, UnauthorizedException, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto, SignInDto, generateProductKeyDto } from '../dtos/auth.dto';
import e from 'express';
import { UserType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { User } from '../decorators/user.decorator';
import { UserInfo } from '../interface/user.interface';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }
    @Post('signup/:userType')
    async signup(
        @Body() body: SignupDto,
        @Param('userType', new ParseEnumPipe(UserType)) userType: UserType
    ) {
        if (userType !== UserType.BUYER) {
            if (!body.productKey) {
                throw new UnauthorizedException();
            }

            const validProductKey = `${body.email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`;

            const isValidProductKey = await bcrypt.compare(
                validProductKey,
                body.productKey
            )

            if (!isValidProductKey) {
                throw new UnauthorizedException();
            }
        }

        return this.authService.signup(body, userType)

    }

    @Post('/signin')
    singin(
        @Body() body: SignInDto
    ) {
        return this.authService.signin(body);
    }

    @Post('/key')
    generateProductKey(
        @Body() { userType, email }: generateProductKeyDto
    ) {
        return this.authService.generateProductKey(email, userType)
    }

    @Get('/me')
    me(@User() user: UserInfo) {
        return user;
    }
}
