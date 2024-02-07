import { Injectable } from '@nestjs/common';
import { CellValue, Workbook, Worksheet } from 'exceljs';
import { Readable } from 'node:stream';

@Injectable()
export class SheetsService {
    private readonly XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    private readonly CSV = 'text/csv';
    private readonly workbook: Workbook;
    private sheet: Express.Multer.File;
    private sheetData: { [key: string]: CellValue; }[];

    constructor() {
        this.XLSX;
        this.CSV;
        this.workbook = new Workbook();
        this.sheetData = [];
    }
    public setSheet(sheet: Express.Multer.File) {
        this.sheet = sheet;
    }
    public resetSheetData() {
        this.sheetData = [];
    }

    private crossRowAndColumn(props: string[], values: CellValue[] | { [key: string]: CellValue; }) {
        const object: { [key: string]: CellValue; } = {};

        for(let i = 0; i < props.length; i++) {
            if (props[i] === 'data_status' || props[i] === 'data_cancelamento' || props[i] === 'data_início') {
                object[props[i]] = new Date(values[i + 1] as string);
            } else if (props[i] === 'valor') {
                object[props[i]] = parseFloat(values[i + 1].toString().replace(',', '.'));
            } else {
                object[props[i]] = values[i + 1];
            }
        }

        return object;
    }
    private extractColumnsNames(workSheet: Worksheet) {
        const cellValues: string[] = [];
        
        workSheet.getRow(1).eachCell((cell) => {
            cellValues.push(cell.value.toString().toLocaleLowerCase().replaceAll(' ', '_'));
        });

        return cellValues;
    }
    private extractWorkSheetData(workSheet: Worksheet) {
        const cols = this.extractColumnsNames(workSheet);

        workSheet.eachRow((row, rowNum) => {
            if (rowNum === 1) return;
            this.sheetData.push(this.crossRowAndColumn(cols, row.values));
        });
    }

    private async readXlsxFile() {
        await this.workbook.xlsx.load(this.sheet.buffer);

        const workSheet = this.workbook.getWorksheet('Sheet1');

        this.extractWorkSheetData(workSheet);
    }
    private async readCsvFile() {
        const workSheet = await this.workbook.csv.read(Readable.from(this.sheet.buffer));

        this.extractWorkSheetData(workSheet);
    }
    async uploadSheet(file: Express.Multer.File) {
        this.setSheet(file);

        if (this.sheet.mimetype === this.XLSX) {
            await this.readXlsxFile();
        } else if (this.sheet.mimetype === this.CSV) {
            await this.readCsvFile();
        }
    }

    calculateMRR() {
        const mrrByYear: { ano: number, mrr: { mes: number; valor: number; }[] }[] = [];
        const monthlyActiveUsers = this.sheetData.filter((user) => {
            return (
                user.status.toString().toLocaleLowerCase() === 'ativa' &&
                user.cobrada_a_cada_x_dias === 30
            );
        }).sort((a, b) => {
            return (a.data_status as Date).getTime() - (b.data_status as Date).getTime();
        });

        let monthValueByYear = [];
        let initSubject = monthlyActiveUsers[0];
        let currYearMrr = {
            ano: (initSubject.data_status as Date).getFullYear(),
            mrr: monthValueByYear
        }
        let currMonthValue = {
            mes: (initSubject.data_status as Date).getMonth(),
            valor: initSubject.valor as number
        }

        for(let i = 1; i < monthlyActiveUsers.length; i++) {
            let user = monthlyActiveUsers[i];

            if ((user.data_status as Date).getFullYear() === currYearMrr.ano) {
                if ((user.data_status as Date).getMonth() === currMonthValue.mes) {
                    currMonthValue.valor +=(user.valor as number);
                } else {
                    monthValueByYear.push(currMonthValue);

                    currMonthValue = {
                        mes: (user.data_status as Date).getMonth(),
                        valor: user.valor as number,
                    }
                }
            } else {
                monthValueByYear.push(currMonthValue);
                mrrByYear.push(currYearMrr);

                monthValueByYear = [];
                currYearMrr = {
                    ano: (user.data_status as Date).getFullYear(),
                    mrr: monthValueByYear,
                }
                currMonthValue = {
                    mes: (user.data_status as Date).getMonth(),
                    valor: user.valor as number + mrrByYear.at(-1).mrr.at(-1).valor,
                }
            }
        }

        monthValueByYear.push(currMonthValue);
        mrrByYear.push(currYearMrr);

        return mrrByYear;
    }
    calculateCR() {
        const crByYear: { ano: number, cr: { mes: number; valor: number; }[] }[] = [];
        
        const monthlyCancels = this.sheetData.filter((user) => {
            return (
                user.cobrada_a_cada_x_dias === 30 &&
                (user.status as string).toLocaleLowerCase() === 'cancelada' ||
                (user.status as string).toLocaleLowerCase() === 'trial cancelado'
            );
        }).sort((a, b) => {
            return (a.data_cancelamento as Date).getTime() - (b.data_cancelamento as Date).getTime();
        });
        const monthlyUsers = this.sheetData.filter((user) => {
            return user.cobrada_a_cada_x_dias === 30;
        }).sort((a, b) => {
            return (a['data_início'] as Date).getTime() - (b['data_início'] as Date).getTime();
        });

        let monthlyCR = [];
        let initSubject = monthlyUsers[0];
        let currMonthCR = {
            mes: (initSubject['data_início'] as Date).getMonth(),
            valor: 0
        }
        let currYearCR = {
            ano: (initSubject['data_início'] as Date).getFullYear(),
            cr: monthlyCR
        }

        let ativos = 0;
        let cancelados = 0;
        let monthlyCancelsIndex = 0;

        for(let i = 0; i < monthlyUsers.length; i++) {
            let user = monthlyUsers[i];

            if ((user['data_início'] as Date).getFullYear() === currYearCR.ano) {
                if ((user['data_início'] as Date).getMonth() === currMonthCR.mes) {
                    ativos += 1;
                } else {
                    for(let j = monthlyCancelsIndex; j < monthlyCancels.length; j++) {
                        if ((monthlyCancels[j].data_cancelamento as Date).getMonth() !== currMonthCR.mes) {
                            monthlyCancelsIndex = j;
                            break;
                        }
                        cancelados += 1;
                    }
                    currMonthCR.valor = Number((cancelados / ativos).toFixed(4));
                    ativos = ativos - cancelados;
                    cancelados = 0;

                    monthlyCR.push(currMonthCR);

                    currMonthCR = {
                        mes: (user['data_início'] as Date).getMonth(),
                        valor: 0
                    }
                }
            } else {
                monthlyCR.push(currMonthCR);
                crByYear.push(currYearCR);

                monthlyCR = [];
                currYearCR = {
                    ano: (user['data_início'] as Date).getFullYear(),
                    cr: monthlyCR
                }
                currMonthCR = {
                    mes: (user['data_início'] as Date).getMonth(),
                    valor: 0
                }
            }
        }

        monthlyCR.push(currMonthCR);
        crByYear.push(currYearCR);

        return crByYear;
    }
}