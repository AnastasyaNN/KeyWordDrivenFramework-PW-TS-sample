import { PlaywrightController } from '../engine/PlaywrightController';
import { ObjectRepository } from '../objects/ObjectRepository';
import { expect } from '@playwright/test';

export class AssertionKeywords {
    private objectRepo: ObjectRepository;

    constructor(private playwright: PlaywrightController) {
        this.objectRepo = new ObjectRepository();
    }

    async verifyPageTitle(expectedTitle: string) {
        await expect(this.playwright.page).toHaveTitle(RegExp(`${expectedTitle}`));
    }

    async verifyTextPresent(elementName: string, expectedText: string) {
        const locator = this.objectRepo.getLocator(elementName);
        await expect(this.playwright.page.locator(locator)).toContainText(expectedText);
    }

    async verifyElementVisible(elementName: string) {
        const locator = this.objectRepo.getLocator(elementName);
        await expect(this.playwright.page.locator(locator)).toBeVisible();
    }

    async verifyElementNotVisible(elementName: string) {
        const locator = this.objectRepo.getLocator(elementName);
        await expect(this.playwright.page.locator(locator)).toBeHidden();
    }

    async verifyUrlContains(expectedText: string) {
        await expect(this.playwright.page).toHaveURL(new RegExp(expectedText));
    }

    async verifyTitleContains(expectedText: string) {
        await expect(this.playwright.page).toHaveTitle(new RegExp(expectedText));
    }
}