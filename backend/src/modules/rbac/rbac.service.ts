import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RbacService {
  private moderatorIds: string[];
  private adminIds: string[];

  constructor(readonly configService: ConfigService) {
    this.moderatorIds = configService.getOrThrow<string[]>('MODERATOR_CHAT_ID');
    this.adminIds = configService.getOrThrow<string[]>('ADMIN_CHAT_ID');
  }

  public isAdmin(userId: string) {
    return this.adminIds.includes(userId);
  }

  public isModerator(userId: string) {
    return this.moderatorIds.includes(userId);
  }

  public isGuest(userId: string) {
    return !this.isModerator(userId) || !this.isAdmin(userId);
  }
}
