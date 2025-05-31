import { Module } from '@nestjs/common';
import { RbacService } from '@/modules/rbac/rbac.service';

@Module({ providers: [RbacService], exports: [RbacService] })
export class RbacModule {}
