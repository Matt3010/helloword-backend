import {Controller, Get, Req, Res, UseGuards} from '@nestjs/common';
import {AuthService} from './auth.service';
import {Request, Response} from 'express';
import {AuthGuard} from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(
      private readonly authService: AuthService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // initiates Google OAuth2 login flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response): Promise<void> {
    const user = req.user as any;
    const token: string = await this.authService.issueToken(user);
    return res.redirect(`http://localhost:4200/auth/google/callback?authToken=${token}&user=${JSON.stringify(user)}`);
  }
}
