import { Crawlers } from "./crawlers";
import { connectMongo } from "./infra/database/mongo";
import { TelegrafInfra } from "./infra/telegraf";
import { sleep } from "./lib";

const main = async () => {
    await connectMongo();
    await TelegrafInfra.init();
    const newBlogs = await Crawlers.MongoBlogCrawler.getNewBlogs();
    if (newBlogs.length > 0) {
        for (const blog of newBlogs) {
            await sleep(1000);
            await TelegrafInfra.sendMongoMessage(`\n*${blog.title}*\n_${blog.date.toLocaleDateString("vi-VN")}_\n\nCheck it out: [Here](${blog.link})\nTags: _${blog.category.join(", ")}_\n\nSummary: \n_${blog.contentSnippet}_`);
        }
    } else {
        console.log("No new blogs");
    }
    process.exit(0);
}

main();