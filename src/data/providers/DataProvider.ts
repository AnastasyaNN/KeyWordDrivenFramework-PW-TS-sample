export interface DataProvider {
    loadData(filePath: string): Promise<any>;
}
