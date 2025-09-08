import { chatCompletion } from "@huggingface/inference";
import { AppEnvConfig } from "../config";
import { ConvertErrorToString, GetJSONStringify } from "../lib";


class Summarizer {
    static async summarize(inputMessage: string) {
        try {
            const model = "google/gemma-2-2b-it";

            const prompt = `
            Summarize the following text into Vietnamese.  
            Requirements:  
            - Only return the summary, no explanations or additional text.  
            - The summary should be about 50 words long.  

    
            ${inputMessage}
            `;

            const out = await chatCompletion({
                accessToken: AppEnvConfig.app.HF_TOKEN,
                model,
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                parameters: {
                    max_new_tokens: 300,
                    temperature: 0.0
                }
            });
            return out.choices[0].message.content || ("Xảy ra lỗi khi tóm tắt: " + GetJSONStringify(out.choices));
        } catch (error) {
            console.error(error);
            return "Xảy ra lỗi khi tóm tắt: " + ConvertErrorToString(error);
        }

    }
}

export default Summarizer;