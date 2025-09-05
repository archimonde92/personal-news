import { CheerioAPI } from "cheerio";
import { Blog } from "../models/blog";
import { CrawlerHelper } from "./helper";
import { CherrioAPIToBlogConverter } from "./types";

const mongoCrawlerConfig = {
    blogUrl: "https://www.mongodb.com/blog",
    imageUrl: "https://www.gtech.com.tr/wp-content/uploads/2020/09/mongodb-nedir-1.png",
    category: "MongoDB",
};

const mongoBlogConverterFromCherrioAPI: CherrioAPIToBlogConverter = async ($: CheerioAPI): Promise<Blog[]> => {
    const blogs: Blog[] = [];

    $(".card.reset.clickable").each((i, el) => {
        const title = $(el).find("h3").text().trim();
        const relativeLink = $(el).find("a").first().attr("href");
        const link = relativeLink?.startsWith("http") ? relativeLink : `https://www.mongodb.com${relativeLink}`;

        const date = $(el).find("div.absolute.bottom.left small").text().trim();
        const category = $(el).find("a.disp-block small").text().trim();
        let contentSnippet = $(el).find("p").text().trim();
        contentSnippet = CrawlerHelper.simplifyContentSnippet(contentSnippet);

        blogs.push({ title, link, date: new Date(date), category: [category], slug: CrawlerHelper.slugify(title), contentSnippet });
    });

    for (const blog of blogs) {
        const summaryContentSnippet = await CrawlerHelper.summaryContentSnippet(blog.contentSnippet);
        blog.contentSnippet = summaryContentSnippet;
    }
    
    return blogs;
}

const MongoBlogCrawler = {
    getNewBlogs: () => CrawlerHelper.getNewBlogs(mongoCrawlerConfig, mongoBlogConverterFromCherrioAPI),
}

export { mongoBlogConverterFromCherrioAPI, mongoCrawlerConfig, MongoBlogCrawler };
