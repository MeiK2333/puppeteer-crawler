import { logger } from './logger'

import { EventEmitter } from "events"
import puppeteer, { Page } from 'puppeteer'
import { Browser } from 'puppeteer'

export class BrowserHelper extends EventEmitter {
    browsers: Array<Browser>

    constructor() {
        super()
        this.browsers = []
    }

    async addBrowser(ws_endpoint: string): Promise<void> {
        const browser = await puppeteer.connect({
            browserWSEndpoint: ws_endpoint,
            defaultViewport: null,
        })
        logger.debug(`browser connected: ${ws_endpoint}`)
        this.browsers.push(browser)
        browser.on('disconnected', () => {
            logger.debug(`browser disconnected: ${ws_endpoint}`)
            this.browsers.splice(this.browsers.indexOf(browser), 1)
        })
    }

    async getIdleBrowser(): Promise<Browser> {
        let browser = null
        let min_pages = 2147483647
        for (let i = 0; i < this.browsers.length; i++) {
            const item = this.browsers[i]
            const len = (await item.pages()).length
            if (len < min_pages) {
                browser = item
                min_pages = len
            }
        }
        return browser
    }

    async getIdleBrowserPage(): Promise<Page> {
        const browser = await this.getIdleBrowser()
        if (browser === null) {
            return null
        }
        const page = await browser.newPage()
        return page
    }
}

export default new BrowserHelper()