import { Controller, FileTypeValidator, HttpCode, Inject, ParseFilePipe, ParseFilePipeBuilder, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express'
import { SheetsService } from './sheets.service';

@Controller('sheets')
export class SheetsController {
    constructor(
        private readonly service: SheetsService
    ) { }

    @Post('upload')
    @HttpCode(200)
    @UseInterceptors(FileInterceptor('file'))
    async postSheets(@UploadedFile(new ParseFilePipeBuilder().addFileTypeValidator({
        fileType: /(application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet|text\/csv)/
    }).build()) file: Express.Multer.File) {
        await this.service.uploadSheet(file);

        const mrrByYear = this.service.calculateMRR();
        const crByYear = this.service.calculateCR();

        this.service.resetSheetData();
        
        return {
            mrrByYear,
            crByYear,
        }
    }
}