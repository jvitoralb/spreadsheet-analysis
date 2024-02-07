import { Module } from '@nestjs/common';
import { SheetsController } from './sheets.controller';
import { SheetsService } from './sheets.service';

@Module({
  imports: [],
  controllers: [SheetsController],
  providers: [SheetsService],
})
export class SheetsModule { }
