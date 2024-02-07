import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { resolve } from 'node:path';
import { AppModule } from './../src/app.module';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('Get /status should return a status message', async () => {
    const res = await request(app.getHttpServer())
    .get('/status');

    expect(res.statusCode === 200).toBeTruthy();
    expect(res.body.message === 'app is online!').toBeTruthy();
  });

  it('Post a xlsx sheet to /sheets/upload and should return a json object with mrrByYear and crByYear properties', async () => {
    const res = await request(app.getHttpServer())
    .post('/sheets/upload')
    .set('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    .attach('file', resolve(__dirname, 'mock_uploads', 'spreadsheet-xlsx.xlsx'));

    expect(res.statusCode === 200).toBeTruthy();
    expect(Array.isArray(res.body.mrrByYear)).toBeTruthy();
    expect(Array.isArray(res.body.crByYear)).toBeTruthy();
  }, 7500);

  it('Post a csv sheet to /sheets/upload and should return a json object with mrrByYear and crByYear properties', async () => {
    const res = await request(app.getHttpServer())
    .post('/sheets/upload')
    .set('content-type', 'multipart/form-data')
    .attach('file', resolve(__dirname, 'mock_uploads', 'spreadsheet-csv.csv'));

    expect(res.statusCode === 200).toBeTruthy();
    expect(Array.isArray(res.body.mrrByYear)).toBeTruthy();
    expect(Array.isArray(res.body.crByYear)).toBeTruthy();
  }, 7500);

  it('Post a txt file to /sheets/upload and should return a bad request', async () => {
    const res = await request(app.getHttpServer())
    .post('/sheets/upload')
    .set('content-type', 'multipart/form-data')
    .attach('file', resolve(__dirname, 'mock_uploads', 'spreadsheet-txt.txt'));

    expect(res.statusCode === 400).toBeTruthy();
  });
});
