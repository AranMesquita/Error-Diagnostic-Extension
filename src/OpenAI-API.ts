import { getAiModel, getApiKey, getMaxTokens } from "./API-Config-functions";
import { Configuration, OpenAIApi } from "openai";

/**
* Make a request to Open AI's API.
* @param prompt - The prompt to be sent to send to Open AI's API.
* @param model - Used to change the model Open AI api the will interact with, deafult set to gpt-3.5-turbo.
* @returns A Promise which resolves into a string, which is The response that Open AI gives based on the prompt the user provides.
*/
// eslint-disable-next-line @typescript-eslint/naming-convention
export const OpenAI_API_request = async (prompt: string, storage: any, model: string = getAiModel(storage)): Promise<string> =>{
    if (prompt === undefined){
        return "typeof prompt === 'undefined'";
    }
    
    const configuration = new Configuration({
        //organization: "org-LvN7GToZ1MWYoJWbwM12I29O",
        apiKey: getApiKey(storage),
    });
    const openai = new OpenAIApi(configuration);
    
    let response: any = await openai.createCompletion({
      model: model, // gpt-3.5-turbo --> 4,096 tokens
      prompt: `${prompt}`,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      max_tokens: getMaxTokens(storage), // 4,097 tokens
      temperature: 0,
    });
    
    response = response.data.choices[0].text;
    return typeof response === 'string' ? response : "returned response from Open AI's API was not a string";
};

/**
* Make a request to Open AI's API to wrap string text in HTML and provide a style tag to style the HTML.
* @param prompt - The prompt to be sent to send to Open AI's API, to be wraped in HTML.
* @returns A Promise which resolves into a string, which is The response that Open AI gives based on the given prompt.
*/
export const wrapApiResponseInHTML = async (prompt: string, storage: any): Promise<string> => {
    let responseFromApi: string = await OpenAI_API_request(`Wrap this text in HTML and CSS the same way ChatGPT wraps it's responses in HTML and CSS, here is the text: ${prompt}`, storage);
    responseFromApi += await OpenAI_API_request(`Write a style tag for this HTML, styling the HTML the same way ChatGPT styles it's responses, make sure that the background color is set to 'background-color: #000000;' with in the style tag, here is the HTML: ${responseFromApi}`, storage);
    return responseFromApi;
};
