import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-google-oauth20";
import { SocksProxyAgent } from "socks-proxy-agent";

const Agent = new SocksProxyAgent(
  'socks5://127.0.0.1:9909',
)


@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get('passport_google_clientID'),
      clientSecret: configService.get('passport_google_clientSecret'),
      callbackURL: configService.get('passport_google_callbackURL'),
      scope: ['email', 'profile'],
    });
    this._oauth2.setAgent(Agent);
  }

  validate(accessToken: string, refreshToken: string, profile: any) {
    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken
    }
    return user;
  }
}