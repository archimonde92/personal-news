import { Crawlers } from "./crawlers";
import { connectMongo } from "./infra/database/mongo";
import { TelegrafInfra } from "./infra/telegraf";
import { sleep } from "./lib";
import { Blog } from "./models/blog";

const sendMessage = async (newBlogs: Blog[], type: "typescript" | "mongo") => {
    for (const blog of newBlogs) {
        if (type === "typescript") {
            await sleep(1000);
            await TelegrafInfra.sendMessage(`\n*${blog.title}*\n_${blog.date.toLocaleDateString("vi-VN")}_\n\nCheck it out: [Here](${blog.link})\nTags: _${blog.category.join(", ")}_\n\nSummary: \n_${blog.isSummarySuccess ? blog.translatedSummaryContentSnippet : blog.contentSnippet}_`);
        } else {
            await sleep(1000);
            await TelegrafInfra.sendMongoMessage(`\n*${blog.title}*\n_${blog.date.toLocaleDateString("vi-VN")}_\n\nCheck it out: [Here](${blog.link})\nTags: _${blog.category.join(", ")}_\n\nSummary: \n_${blog.isSummarySuccess ? blog.translatedSummaryContentSnippet : blog.contentSnippet}_`);
        }
    }
}

const main = async () => {
    await connectMongo();
    await TelegrafInfra.init();
    const newTypescriptBlogs = await Crawlers.TypescriptBlogCrawler.getNewBlogs();
    const newMongoBlogs = await Crawlers.MongoBlogCrawler.getNewBlogs();
    if (newTypescriptBlogs.length > 0) {
        await sendMessage(newTypescriptBlogs, "typescript");
    } else {
        console.log("No new typescript blogs");
    }
    if (newMongoBlogs.length > 0) {
        await sendMessage(newMongoBlogs, "mongo");
    } else {
        console.log("No new mongo blogs");
    }
    process.exit(0);
}

main();