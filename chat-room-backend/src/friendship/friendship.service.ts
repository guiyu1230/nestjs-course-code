import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FriendAddDto } from './dto/friend-add.dto';

@Injectable()
export class FriendshipService {

  @Inject(PrismaService)
  private prismaService: PrismaService;

  async getFriendship(userId: number) {
    const friends = await this.prismaService.friendShip.findMany({
      where: {
        OR: [
          {
            userId: userId
          },
          {
            friendId: userId
          }
        ]
      }
    });

    const set = new Set<number>();
    for(let i = 0; i < friends.length; i++) {
      set.add(friends[i].userId)
      set.add(friends[i].friendId)
    }
    console.log(userId, friends, [...set])
    const friendIds = [...set].filter(item => item !== userId);

    // const res = [];
    // for(let i = 0; i < friendIds.length; i++) {
    const users = await this.prismaService.user.findMany({
      where: {
        id: {
          in: friendIds
        }
      },
      select: {
        id: true,
        username: true,
        nickName: true,
        email: true
      }
    })
    // }
    return users
  }

  async add(friendAddDto: FriendAddDto, userId: number) {
    return await this.prismaService.friendRequest.create({
      data: {
        fromUserId: userId,
        toUserId: friendAddDto.friendId,
        reason: friendAddDto.reason,
        status: 0
      }
    })
  }

  async list(userId: number) {
    return this.prismaService.friendRequest.findMany({
      where: {
        fromUserId: userId
      }
    })
  }

  async agree(friendId: number, userId: number) {
    await this.prismaService.friendRequest.updateMany({
      where: {
        fromUserId: friendId,
        toUserId: userId,
        status: 0
      },
      data: {
        status: 1
      }
    })

    const res = await this.prismaService.friendShip.findMany({
      where: {
        userId,
        friendId
      }
    })

    if(!res.length) {
      await this.prismaService.friendShip.create({
        data: {
          userId,
          friendId
        }
      })
    }
    return '添加成功';
  }

  async reject(friendId: number, userId: number) {
    await this.prismaService.friendRequest.updateMany({
      where: {
        fromUserId: friendId,
        toUserId: userId,
        status: 0
      },
      data: {
        status: 2
      }
    })
    return '已拒绝';
  }

  async remove(friendId: number, userId: number) {
    const userToFriend = await this.prismaService.friendShip.findMany({
      where: {
        userId,
        friendId
      }
    })
    const friendToUser = await this.prismaService.friendShip.findMany({
      where: {
        userId: friendId,
        friendId: userId
      }
    })

    if(userToFriend.length) {
      await this.prismaService.friendShip.deleteMany({
        where: {
          userId,
          friendId
        }
      })
    }
    if(friendToUser.length) {
      await this.prismaService.friendShip.deleteMany({
        where: {
          userId: friendId,
          friendId: userId
        }
      })
    }

    return '删除成功';
  }
}
