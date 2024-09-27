import { BadRequestException, Body, Controller, Get, Param, Post } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { RequireLogin, UserInfo } from 'src/custom.decorator';
import { FriendAddDto } from './dto/friend-add.dto';

@Controller('friendship')
@RequireLogin()
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @Get('list')
  async frindship(@UserInfo('userId') userId: number) {
    return this.friendshipService.getFriendship(userId);
  }

  @Post('add')
  async add(@Body() friendAddDto: FriendAddDto, @UserInfo("userId") userId: number) {
    return this.friendshipService.add(friendAddDto, userId);
  }

  @Get('request_list')
  async list(@UserInfo("userId") userId: number) {
    return this.friendshipService.list(userId);
  }

  @Get('agree/:id')
  async agree(@Param('id') friendId: number, @UserInfo("userId") userId: number) {
    if(!friendId) {
      throw new BadRequestException('添加的好友id不能为空');
    }
    return this.friendshipService.agree(friendId, userId);
  }

  @Get('reject/:id')
  async reject(@Param('id') friendId: number, @UserInfo("userId") userId: number) {
    if(!friendId) {
      throw new BadRequestException('拒绝的好友id不能为空');
    }
    return this.friendshipService.reject(friendId, userId);
  }

  @Get('remove/:id')
  async remove(@Param('id') friendId: number, @UserInfo('userId') userId: number) {
    return 'succsss'
  }
}
