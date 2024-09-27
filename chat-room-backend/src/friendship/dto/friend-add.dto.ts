import { IsNotEmpty } from "class-validator";

export class FriendAddDto {

  @IsNotEmpty({
    message: "添加的好友id不能为空"
  })
  friendId: number;

  reason: string;
}