import { Global, Module } from '@nestjs/common';
import { SupabaseModule } from '../../../services/supabase/supabase.module';
import { UploadService } from './services/upload.service';

@Global()
@Module({
  imports: [SupabaseModule],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
