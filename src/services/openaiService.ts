import OpenAI from 'openai';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { ChatRequest, Message } from '../types';
import { performWebSearch, webSearchFunction } from './webSearchService';

const client = new OpenAI({
  apiKey: env.OPENAI_API_KEY
});


// Helper function to map custom Message to ChatCompletionMessageParam
function mapToChatCompletionMessageParam(msg: Message): any {
  // Adjust the mapping if the OpenAI client expects other property names
  const base = {
      role: msg.role,
      content: msg.content,
  };

  // Add tool call properties if available and applicable
  if (msg.role === 'assistant' && msg.tool_calls) {
      return {
          ...base,
          tool_calls: msg.tool_calls,
      };
  }
  if (msg.role === 'tool' && msg.tool_call_id) {
      return {
          ...base,
          tool_call_id: msg.tool_call_id,
      };
  }
  return base;
}


/**
 * Gets a chat completion from OpenAI
 */
export async function getChatCompletion(
  request: ChatRequest
): Promise<string> {
  try {

    // Map messages to the expected type
    const messages = request.messages.map(mapToChatCompletionMessageParam);

    // Set up tools if web search is enabled
    const tools = [{
      type: "function" as const,
      function: webSearchFunction
    }];
    
    
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      tools,
      tool_choice: "auto",
    });

    const response = completion.choices[0].message;
    
    // Check if the model wants to call the web search function
    if (response.tool_calls && response.tool_calls.length > 0) {
      const toolCall = response.tool_calls[0];
      
      if (toolCall.function.name === "web_search") {
        // Parse the search query from the function arguments
        const args = JSON.parse(toolCall.function.arguments);
        const searchQuery = args.query;
        const numResults = args.num_results || 5;
        
        logger.info(`Model requested web search for: "${searchQuery}"`);
        
        // Perform the web search
        const searchResults = await performWebSearch({ 
          query: searchQuery, 
          numResults 
        });
        
        // Create a copy of messages to avoid mutating the original
        const updatedMessages: any[] = [...messages];
        
        // Add the assistant's message with the tool call to the conversation
        updatedMessages.push({
          role: "assistant",
          content: "",
          tool_calls: [
            {
              id: toolCall.id,
              type: "function",
              function: {
                name: toolCall.function.name,
                arguments: toolCall.function.arguments
              }
            }
          ]
        });
        
        // Add the function response to the conversation
        updatedMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: searchResults
        });

        logger.info("Getting final response with search results");
        const finalCompletion = await client.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: updatedMessages,
          temperature: 0.7,
        });
        
        return finalCompletion.choices[0].message.content || '';
      }
    }
    
    // If no function call, return the original response
    return response.content || '';
  } catch (error) {
    logger.error('Error getting chat completion:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to get response from OpenAI'
    );
  }
}
