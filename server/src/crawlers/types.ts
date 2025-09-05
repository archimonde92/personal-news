import { CheerioAPI } from "cheerio";
import { Blog } from "../models/blog";

type CrawlerConfig = {
    blogUrl: string;
    imageUrl: string;
    category: string;
}


type CherrioAPIToBlogConverter = ($: CheerioAPI) => Promise<Blog[]>;

export { CrawlerConfig, CherrioAPIToBlogConverter };