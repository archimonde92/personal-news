import { Telegraf } from "telegraf";
import { AppEnvConfig } from "../../config";
import { MongoBlogCrawler, mongoCrawlerConfig } from "../../crawlers/mongo_blog_crawler_config";
import { collections } from "../database/mongo";
import { sleep } from "../../lib";
import { typescriptCrawlerConfig } from "../../crawlers/typescript_blog_crawler_config";

class TelegrafInfra {
    static telegraf: Telegraf;
    static async init() {
        this.telegraf = new Telegraf(AppEnvConfig.app.TELEGRAM_BOT_TOKEN);
        this.telegraf.start(async (ctx) => {
            ctx.reply(`Hello, I'm a bot that sends you the interesting contents from the blogs. \n\nList intergrated blogs: \n- [MongoDB Blogs](${mongoCrawlerConfig.blogUrl}) \n- [Typescript Blogs](${typescriptCrawlerConfig.blogUrl})`, { parse_mode: "Markdown", link_preview_options: { is_disabled: true } });
        });

        this.telegraf.command("whoami", async (ctx) => {
            ctx.reply(`Id: *${ctx.message.from.id}*\nUsername: *${ctx.message.from.username}*`, { parse_mode: "Markdown" });
        });

        this.telegraf.command("subscribe", async (ctx) => {
            const follower = await collections.followers.findOne({ id: ctx.message.from.id.toString() });
            if (!follower) {
                await collections.followers.insertOne({ id: ctx.message.from.id.toString(), username: ctx.message.from.username || "", languageCode: ctx.message.from.language_code || "vi", subscribedBlogs: ["MongoDB", "Typescript"], createdAt: new Date(), updatedAt: new Date() });
            }
            ctx.reply(`You are now subscribed to the blogs.`, { parse_mode: "Markdown" });
        });

        this.telegraf.telegram.setMyCommands([
            { command: "whoami", description: "Show your id and username" },
            { command: "subscribe", description: "Subscribe to the blogs" },
        ]);
        this.telegraf.launch();
        console.log("Telegraf started");
        return this.telegraf;
    }

    static async sendMessage(message: string) {
        const followers = await collections.followers.find({ subscribedBlogs: "MongoDB" }).toArray();
        for (const follower of followers) {
            await this.telegraf.telegram.sendMessage(follower.id, message, { parse_mode: "Markdown" });
            console.log(`Sent message to ${follower.username} ...`);
        }
    }

    static async sendMongoMessage(message: string) {
        const followers = await collections.followers.find({ subscribedBlogs: "MongoDB" }).toArray();
        for (const follower of followers) {
            if (follower.subscribedBlogs.includes("MongoDB")) {
                await sleep(1000)
                await this.telegraf.telegram.sendPhoto(
                    follower.id,
                    mongoCrawlerConfig.imageUrl,
                    {
                        caption: `${message}`,
                        parse_mode: "Markdown",
                    }
                );
                console.log(`Sent mongo message to ${follower.username} ...`);
            }
        }
    }

    static async sendTypescriptMessage(message: string) {
        const followers = await collections.followers.find({ subscribedBlogs: "Typescript" }).toArray();
        for (const follower of followers) {
            if (follower.subscribedBlogs.includes("Typescript")) {
                await sleep(1000)
                await this.telegraf.telegram.sendPhoto(
                    follower.id,
                    typescriptCrawlerConfig.imageUrl,
                    {
                        caption: `${message}`,
                        parse_mode: "Markdown",
                    }
                );
                console.log(`Sent typescript message to ${follower.username} ...`);
            }
        }
    }
}

export { TelegrafInfra };