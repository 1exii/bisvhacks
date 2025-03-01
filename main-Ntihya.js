

import { GoogleGenerativeAI } from "@google/generative-ai";

// Use your API key directly for testing, or setup environment variables.
const API_KEY = "AIzaSyDmfRVY5ZTU8FnsY6zgasvTGhgdCdrBcec"; // Replace with your key
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

let messages = { history: [] };

async function sendMessage() {
    const userMessage = document.querySelector(".chat-window input").value;

    if (userMessage.length) {

        try {
            document.querySelector(".chat-window input").value = "";
            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend", `
                <div class="user">
                    <p>${userMessage}</p>
                </div>
            `);

            const chat = model.startChat(messages);
            let result = await chat.sendMessage(userMessage);

            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend", `
                <div class="model">
                    <p>${result.response.text()}</p>
                </div>
            `);

            messages.history.push({
                role: "user",
                parts: [{ text: userMessage }],
            }); // You might want to push the message into the array.

            messages.history.push({
                 role: "model",
                 parts: [{ text: result.response.text() }],
            });

            console.log(result.response.text()); // Log only once

        }
        catch(error){
            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend", `
            <div class="error">
                <p>The message could not be sent. Please try again.</p>
            </div>
            `);
        }

    }
}

// Attach event listener to the button
document.querySelector(".chat-window .input-area button").addEventListener("click", sendMessage);
