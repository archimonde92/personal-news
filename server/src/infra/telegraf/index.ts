import { Telegraf } from "telegraf";
import { AppEnvConfig } from "../../config";
import { MongoBlogCrawler } from "../../crawlers/mongo_blog_crawler";
import { collections } from "../database/mongo";
import { sleep } from "../../lib";

class TelegrafInfra {
    static telegraf: Telegraf;
    static async init() {
        this.telegraf = new Telegraf(AppEnvConfig.app.TELEGRAM_BOT_TOKEN);
        this.telegraf.start(async (ctx) => {
            ctx.reply(`Hello, I'm a bot that sends you the interesting contents from the blogs. \n\nList intergrated blogs: \n- [MongoDB Blogs](${MongoBlogCrawler.MONGO_BLOG_URL})`, { parse_mode: "Markdown", link_preview_options: { is_disabled: true } });
        });

        this.telegraf.command("whoami", async (ctx) => {
            ctx.reply(`Id: *${ctx.message.from.id}*\nUsername: *${ctx.message.from.username}*`, { parse_mode: "Markdown" });
        });

        this.telegraf.command("subscribe", async (ctx) => {
            const follower = await collections.followers.findOne({ id: ctx.message.from.id.toString() });
            if (!follower) {
                await collections.followers.insertOne({ id: ctx.message.from.id.toString(), username: ctx.message.from.username || "", languageCode: ctx.message.from.language_code || "vi", subscribedBlogs: ["MongoDB"], createdAt: new Date(), updatedAt: new Date() });
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
                    MongoBlogCrawler.MONGO_IMAGE_URL,
                    {
                        caption: `${message}`,
                        parse_mode: "Markdown",
                    }
                );
                console.log(`Sent mongo message to ${follower.username} ...`);
            }
        }
    }
}

export { TelegrafInfra };