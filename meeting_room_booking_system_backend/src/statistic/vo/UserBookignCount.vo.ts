import { ApiProperty } from "@nestjs/swagger";

export class userBookignCount {

  @ApiProperty()
  userId: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  bookingCount: string;
}