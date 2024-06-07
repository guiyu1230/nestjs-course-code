import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-github2";

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor() {
    super({
      clientID: 'Ov23liTmpJmkCDuEdPyP',
      clientSecret: '176da8529be6b5ee373ac789de5996e950291a28',
      callbackURL: 'http://localhost:3000/callback',
      scope: ['public_profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    return profile;
  }
}