import * as cheerio from "cheerio";

class CrawlerHelper {
    static slugify(title: string) {
        return title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
    }

    static async loadDataFromUrl(url: string) {
        const response = await fetch(url);
        const data = await response.text();
        return data;
    }

    static async loadDataFromUrlWithCheerio(url: string) {
        const data = await this.loadDataFromUrl(url);
        return cheerio.load(data);
    }

    static simplifyContentSnippet(contentSnippet: string) {
        return contentSnippet.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ")
    }

    static async summaryContentSnippet(contentSnippet: string) {
        return contentSnippet.slice(0, 800) + "...";
    }
}

export { CrawlerHelper };