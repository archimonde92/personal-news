import { collections } from "../infra/database/mongo";
import { Blog } from "../models/blog";
import { CrawlerHelper } from "./helper";


class MongoBlogCrawler {
    static MONGO_BLOG_URL = "https://www.mongodb.com/blog";
    static MONGO_IMAGE_URL = "https://www.gtech.com.tr/wp-content/uploads/2020/09/mongodb-nedir-1.png";
    static async run() {
        const $ = await CrawlerHelper.loadDataFromUrlWithCheerio(this.MONGO_BLOG_URL);
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

        //Check if there is any new blog

        return blogs;
    }

    static async checkNewBlog(blogs: Blog[]) {
        const sortedBlogs = blogs.sort((a, b) => b.date.getTime() - a.date.getTime());
        const blogCrawler = await collections.blog_crawlers.findOne({ name: "MongoDB" });
        if (!blogCrawler) {
            await collections.blog_crawlers.insertOne({ name: "MongoDB", lastestBlogDate: sortedBlogs[0].date, lastestBlogSlug: sortedBlogs[0].slug, updatedAt: new Date() });
            await collections.blogs.insertMany(sortedBlogs);
            return sortedBlogs;
        } else {
            const newBlogs = sortedBlogs.filter(blog => blog.date > blogCrawler.lastestBlogDate);
            if (newBlogs.length > 0) {
                await collections.blog_crawlers.updateOne({ name: "MongoDB" }, { $set: { lastestBlogDate: newBlogs[0].date, lastestBlogSlug: newBlogs[0].slug, updatedAt: new Date() } });
                await collections.blogs.insertMany(newBlogs);
                return newBlogs;
            }
            return [];
        }
    }

    static async getNewBlogs() {
        const blogs = await this.run();
        const newBlogs = await this.checkNewBlog(blogs);
        return newBlogs;
    }
}

export { MongoBlogCrawler };