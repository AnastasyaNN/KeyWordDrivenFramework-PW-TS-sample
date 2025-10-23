import * as path from 'path';
import { JsonDataProvider } from './providers/JsonDataProvider';
import {DataProvider} from "./providers/DataProvider";

export class DataLoader {
    private providers: Map<string, DataProvider> = new Map();

    constructor() {
        this.registerProviders();
    }

    private registerProviders() {
        this.providers.set('json', new JsonDataProvider());
    }

    async loadData(dataSource: string): Promise<any> {
        const extension = this.getDataSourceType(dataSource);
        const provider = this.providers.get(extension);

        if (!provider) {
            throw new Error(`Неподдерживаемый тип источника данных: ${extension}`);
        }

        return provider.loadData(path.join(__dirname, '../data/test-data', dataSource));
    }

    private getDataSourceType(dataSource: string): string {
        const ext = path.extname(dataSource).toLowerCase().slice(1);
        return ext || 'json'; // по умолчанию JSON
    }
}