import {Browser, BrowserContext, Page} from 'playwright/test';
import {chromium, firefox, webkit} from 'playwright';
import {BrowserType} from "@playwright/test";

export class PlaywrightController {
    private browser: Browser;
    private context: BrowserContext;
    public page: Page;

    async launchBrowser(browserKey: BrowserKey = BrowserKey.chromium) {
        let launchOptions: any = {
            headless: true,
            timeout: 30000,
            args: [
                '--test-type',
                '--ignore-certificate-errors'
            ]
        }
        let browserContextOptions: any = {
            viewport: {width: 1920, height: 1080}
        }
        try {
            let browserType: BrowserType = this.getBrowserType(browserKey);
            this.browser = await browserType.launch(launchOptions);
            this.context = await this.browser.newContext(browserContextOptions);
            this.page = await this.context.newPage();
        } catch (error) {
            console.log(`Возникла ошибка: ${JSON.stringify(error)}`)
            await this.browser?.close();
            throw error
        }
    }

    async closeBrowser() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    async takeScreenshot(name: string) {
        const screenshotPath = `screenshots/${name}-${Date.now()}.png`;
        await this.page.screenshot({path: screenshotPath});
        return screenshotPath;
    }

    private getBrowserType(browserKey: BrowserKey): BrowserType {
        switch (browserKey) {
            case BrowserKey.chromium:
                return chromium
            case BrowserKey.firefox:
                return firefox;
            case BrowserKey.webkit:
                return webkit;
            default:
                throw new Error(`Неподдерживаемый тип браузера: ${browserKey}`);
        }
    }
}

enum BrowserKey {
    chromium,
    firefox,
    webkit
}