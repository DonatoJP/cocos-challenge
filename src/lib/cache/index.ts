import { CacheModule } from '@nestjs/cache-manager';

export const LoadCacheModule = () => CacheModule.register({ isGlobal: true });
