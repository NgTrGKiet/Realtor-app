import { Body, ConflictException, Injectable, HttpException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { UserType } from '@prisma/client';
import * as jwt from 'jsonwebtoken'

interface LoginParams {
    email?: string;
    password?: string;
    name?: string;
    phone?: string;
}

@Injectable()
export class AuthService {
    constructor(private readonly prismService: PrismaService) { }

    async signup(
        { name, password, phone, email }: LoginParams,
        userType: UserType
    ) {
        try {
            const userExists = await this.prismService.user.findUnique({
                where: {
                    email
                }
            });

            if (userExists) {
                throw new ConflictException();
            }

            const hashPassword = await bcrypt.hash(password, 10);

            // console.log({ hashPassword })
            const user = await this.prismService.user.create({
                data: {
                    email,
                    name,
                    phone,
                    password: hashPassword,
                    user_type: userType
                }
            });

            return {
                data: {
                    token: this.generateJWT(name, user.id),
                    name,
                    id: user.id
                }
            }
        } catch (err) {
            throw err;
        }
    }

    async signin(
        { email, password }: LoginParams
    ) {
        try {
            const user = await this.prismService.user.findFirst({
                where: {
                    email
                }
            })
            if (!user) {
                throw new HttpException('Invalid credentials', 400);
            }

            const hashPassword = user.password;

            const isValidPassword = await bcrypt.compare(password, hashPassword);

            if (!isValidPassword) {
                throw new HttpException('Invalid credentials', 400);
            }
            return {
                data: {
                    token: this.generateJWT(user.name, user.id),
                    name: user.name,
                    id: user.id
                }
            }

        } catch (err) {
            throw err;
        }
    }

    private generateJWT(name: string, id: number) {
        return jwt.sign({
            name,
            id,
        },
            process.env.JSON_TOKEN_KEY,
            {
                expiresIn: 3600000
            })
    }

    generateProductKey(email: string, userType: UserType) {
        const string = `${email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`;
        return bcrypt.hash(string, 10);
    }
}
