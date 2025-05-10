import { GoogleGenAI } from "@google/genai";
import express from "express";
import dotenv from "dotenv";
const app = express();

app.use(express.json());
dotenv.config();
const port = process.env.PORT || 3000;

const vertexAI = new GoogleGenAI({
  vertexai: true,
  project: "lovees-project", //Feel free to change this to your project ID
  location: "us-central1",
})

let vertexAIRetrievalTool;
let chat;

vertexAIRetrievalTool = {
  vertexAiSearch: {
    datastore: 'projects/lovees-project/locations/global/collections/default_collection/dataStores/test-s3-lovee',
  },
  disableAttribution: false,
};

const functionDeclaration = {
  name: "rentmovie",
  description:
    "This function is to be called when the user wants to rent a movie. The user can provide the name of the movie and the number of days they want to rent the movie for. The function will return the total amount the user has to pay for renting the movie for the specified number of days. You should get the number of days from user input.",
  parameters: {
    type: "object",
    properties: {
      movie: {
        type: "string",
        description: "name of the movie",
      },
      days: {
        type: "number",
        description: "number of days the user wants to rent the movie for",
      },
    },
    required: ["movie", "days"],
  }
}

const rentMovie = (movie, days) => {
  const response = `You have rented the movie ${movie} for ${days} days. The total amount you have to pay is $${days * 2}`;
  return { result: response };
};


app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
});

let responseToReturn;

app.post("/generate", async (req, res) => {
  chat = vertexAI.chats.create({
    model: "gemini-2.5-flash-preview-04-17",
    config: {
      tools: [{
          retrieval: vertexAIRetrievalTool,
          functionDeclarations: [functionDeclaration],
      }],
    }
  });
  const { prompt } = req.body;
  const response = await chat.sendMessage({message: prompt});
  // console.log(response);
  // console.log(response.candidates[0].content.parts[0]);
  if (response.candidates[0].content.parts[0].functionCall?.name === "rentmovie") {
    const { movie, days } = response.candidates[0].content.parts[0].functionCall.args;
    const functionResponseParts = [
      {
        functionResponse: {
          name: "rentmovie",
          response: rentMovie(movie, days),
        },
      },
    ];
    let responseAfterFunctionCall = await chat.sendMessage({message: functionResponseParts});
    // console.log("responseAfterFunctionCall", responseAfterFunctionCall);
    responseToReturn = responseAfterFunctionCall.candidates[0].content.parts[0].text;
  } else {
    responseToReturn = response.text;
  }
  res.send(responseToReturn);
})


