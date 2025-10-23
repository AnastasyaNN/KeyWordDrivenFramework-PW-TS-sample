import {ObjectRepository} from "../objects/ObjectRepository";
import {PlaywrightController} from "../engine/PlaywrightController";

export class DomElementsKeywords {
    private objectRepo: ObjectRepository;

    constructor(private playwright: PlaywrightController) {
        this.objectRepo = new ObjectRepository();
    }

    async typeText(elementName: string, text: string) {
        const locator = this.objectRepo.getLocator(elementName);
        await this.playwright.page.locator(locator).fill(text);
    }

    async clickElement(elementName: string) {
        const locator = this.objectRepo.getLocator(elementName);
        await this.playwright.page.locator(locator).click();
    }

    async selectOption(elementName: string, value: string) {
        const locator = this.objectRepo.getLocator(elementName);
        await this.playwright.page.locator(locator).selectOption(value);
    }

    async checkCheckbox(elementName: string) {
        const locator = this.objectRepo.getLocator(elementName);
        await this.playwright.page.locator(locator).check();
    }

    async uploadFile(elementName: string, filePath: string) {
        const locator = this.objectRepo.getLocator(elementName);
        await this.playwright.page.locator(locator).setInputFiles(filePath);
    }
}