import * as fs from 'fs';
import {DataProvider} from "./DataProvider";

export class JsonDataProvider implements DataProvider {
    async loadData(filePath: string): Promise<any> {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(fileContent);
    }
}