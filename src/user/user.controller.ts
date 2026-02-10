import { Body, Controller, Delete, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { profileDTO } from './UserDTO/profile.dto';
import { AuthGuard } from '../guard/auth.guard';


@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
  constructor(
    private readonly userService: UserService
  ) {}

  // GET /users/me
  @Get('me')
  getMyProfile(@Req() req) {
    const token = req.cookies['token'];
    return this.userService.getProfile(token);
  }

  //PUT /users/me
  @Patch('me')
  updateMyProfile(@Req() req, @Body() profileDTO: profileDTO) {
   return this.userService.updateProfile(req, profileDTO);
  }

  // DELETE /users/me
  @Delete('me')
  deleteMyAccount(@Req() req) {
    const userId = req.cookies['userId'];
    return this.userService.deactivateAccount(userId);
  }
}    