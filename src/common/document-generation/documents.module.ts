import { Module } from '@nestjs/common';
import { PdfGenerationService } from './document-generation.service';
import { DocumentService } from './document.service';

@Module({
  imports: [],
  controllers: [],
  providers: [PdfGenerationService, DocumentService],
  exports: [PdfGenerationService],
})
export class DocumentModule {}