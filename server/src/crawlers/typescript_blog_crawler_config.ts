import { CheerioAPI } from "cheerio";
import { Blog } from "../models/blog";
import { CrawlerHelper } from "./helper";
import { CherrioAPIToBlogConverter } from "./types";

const typescriptCrawlerConfig = {
    blogUrl: "https://devblogs.microsoft.com/typescript/",
    imageUrl: "https://cdn.thenewstack.io/media/2022/01/10b88c68-typescript-logo.png",
    category: "Typescript",
};

const typescriptBlogConverterFromCherrioAPI: CherrioAPIToBlogConverter = async ($: CheerioAPI): Promise<Blog[]> => {
    const blogs: Blog[] = [];

    $(".masonry-card.post-card").each((_, el) => {
        const $el = $(el);
    
        const title = $el.find("h3 a").text().trim();
        const link = $el.find("h3 a").attr("href")?.trim() || "";
    
        const rawDate = $el.find(".card-top > .d-flex > div").first().text().trim();
        const date = rawDate ? new Date(rawDate) : new Date();
    
        const category = $el
          .find(".post-category, .category, .some-category-selector")
          .map((_, cat) => $(cat).text().trim())
          .get();
    
        // Snippet
        let contentSnippet = $el.find("p.excerpt-body").text().trim();
        contentSnippet = CrawlerHelper.simplifyContentSnippet(contentSnippet);
        blogs.push({ title, link, date: new Date(date), category, slug: CrawlerHelper.slugify(title), contentSnippet });
        
      });

    for (const blog of blogs) {
        const summaryContentSnippet = await CrawlerHelper.summaryContentSnippet(blog.contentSnippet);
        blog.contentSnippet = summaryContentSnippet;
    }
    
    return blogs;
}

const TypescriptBlogCrawler = {
    getBlogs: () => CrawlerHelper.runCrawler(typescriptCrawlerConfig, typescriptBlogConverterFromCherrioAPI),
    getNewBlogs: () => CrawlerHelper.getNewBlogs(typescriptCrawlerConfig, typescriptBlogConverterFromCherrioAPI),
}

export { typescriptCrawlerConfig, typescriptBlogConverterFromCherrioAPI, TypescriptBlogCrawler };
