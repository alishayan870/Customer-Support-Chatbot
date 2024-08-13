// File for route chat

import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = `You are connected to TD Bank's Virtual Assistant. I'm here to help you with:
1. Account balance inquiries
2. Transaction history
3. Funds transfers between accounts
4. Bill payments setup and management
5. Finding TD Bank locations and operating hours
6. Assistance with locked accounts or lost cards
7. Users can access oue services through our website or mobile app.
8. If asked about technical issues,guide users to our troubleshooting page or suggest contacting our technical support team.
9. Always maintain user privacy and do not share personal information.
10. If your unsure about any information, it's okay to say you don't know and offer to connect the user with a human representative.

Your goal is to provide accurate information, assist with common inquiresm and ensure a positive experience. 
Please enter your request or type 'help' for more options. Always ensure your personal information is secure when interacting online.`


// POST function to handle incoming requests
export async function POST(req) {
    const openai = new OpenAI() // Create a new instance of the OpenAI client
    const data = await req.json() // Parse the JSON body of the incoming request
  
    // Create a chat completion request to the OpenAI API
    const completion = await openai.chat.completions.create({
      messages: [{role: 'system', content: systemPrompt}, ...data], // Include the system prompt and user messages
      model: 'gpt-4o-mini', // Specify the model to use
      stream: true, // Enable streaming responses
    })
  
    // Create a ReadableStream to handle the streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
        try {
          // Iterate over the streamed chunks of the response
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
            if (content) {
              const text = encoder.encode(content) // Encode the content to Uint8Array
              controller.enqueue(text) // Enqueue the encoded text to the stream
            }
          }
        } catch (err) {
          controller.error(err) // Handle any errors that occur during streaming
        } finally {
          controller.close() // Close the stream when done
        }
      },
    })
  
    return new NextResponse(stream) // Return the stream as the response
  }