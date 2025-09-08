import * as cheerio from "cheerio";
import { Blog } from "../models/blog";
import { collections } from "../infra/database/mongo";
import { CherrioAPIToBlogConverter, CrawlerConfig } from "./types";
import Summarizer from "./summerizer";


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
        console.log("Loading data from url: ", url);
        const data = await this.loadDataFromUrl(url);
        return cheerio.load(data);
    }

    static simplifyContentSnippet(contentSnippet: string) {
        return contentSnippet.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ")
    }

    static async summaryContentSnippet(contentSnippet: string) {
        return contentSnippet.slice(0, 800) + "...";
    }

    static async checkNewBlog(blogs: Blog[], category: string) {
        const sortedBlogs = blogs.sort((a, b) => b.date.getTime() - a.date.getTime());
        const blogCrawler = await collections.blog_crawlers.findOne({ name: category });
        if (!blogCrawler) {
            await collections.blog_crawlers.insertOne({ name: category, lastestBlogDate: sortedBlogs[0].date, lastestBlogSlug: sortedBlogs[0].slug, updatedAt: new Date() });
            for (const blog of sortedBlogs) {
                const summaryContentSnippet = await Summarizer.summarize(blog.contentSnippet);
                if (summaryContentSnippet.startsWith("Xảy ra lỗi khi tóm tắt")) {
                    blog.isSummarySuccess = false;
                } else {
                    blog.translatedSummaryContentSnippet = summaryContentSnippet || "";
                    blog.isSummarySuccess = true;
                }
            }
            await collections.blogs.insertMany(sortedBlogs);
            return sortedBlogs;
        } else {
            const newBlogs = sortedBlogs.filter(blog => blog.date > blogCrawler.lastestBlogDate);
            if (newBlogs.length > 0) {
                await collections.blog_crawlers.updateOne({ name: category }, { $set: { lastestBlogDate: newBlogs[0].date, lastestBlogSlug: newBlogs[0].slug, updatedAt: new Date() } });
                for (const blog of newBlogs) {
                    const summaryContentSnippet = await Summarizer.summarize(blog.contentSnippet);
                    if (summaryContentSnippet.startsWith("Xảy ra lỗi khi tóm tắt")) {
                        blog.isSummarySuccess = false;
                    } else {
                        blog.translatedSummaryContentSnippet = summaryContentSnippet || "";
                        blog.isSummarySuccess = true;
                    }
                }
                await collections.blogs.insertMany(newBlogs);
                return newBlogs;
            }
            return [];
        }
    }

    static async runCrawler(config: CrawlerConfig, converter: CherrioAPIToBlogConverter) {
        const $ = await CrawlerHelper.loadDataFromUrlWithCheerio(config.blogUrl);
        const blogs: Blog[] = await converter($);
        return blogs;
    }

    static async getNewBlogs(config: CrawlerConfig, converter: CherrioAPIToBlogConverter) {
        console.log("Getting new blogs of ", config.category);
        const blogs = await this.runCrawler(config, converter);
        console.log("Checking new blogs of ", config.category);
        const newBlogs = await CrawlerHelper.checkNewBlog(blogs, config.category);
        console.log("New blogs of ", config.category, " count: ", newBlogs.length);
        return newBlogs;
    }

}

export { CrawlerHelper };