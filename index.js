import { VertexAI } from "@google-cloud/vertexai";
import express from "express";
import dotenv from "dotenv";
const app = express();

app.use(express.json());
dotenv.config();
const port = process.env.PORT || 3000;
let generativeModelPreview;
let vertexAIRetrievalTool;
let chat;

vertexAIRetrievalTool = {
  retrieval: {
    vertexAiSearch: {
      datastore: 'projects/.../locations/.../collections/.../dataStores/...',
    },
    disableAttribution: false,
  },
};

const functionDeclarations = [
  {
    function_declarations: [
      {
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
    ],
  },
];

const rentMovie = (movie, days) => {
  const response = `You have rented the movie ${movie} for ${days} days. The total amount you have to pay is $${days * 2}`;
  return { result: response };
};


app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
  const vertexAI = new VertexAI({
    project: "lovees-project", //Feel free to change this to your project ID
    location: "us-central1"
  });
  console.log("vertexAI initialized");
  generativeModelPreview = vertexAI.preview.getGenerativeModel({
    model: "gemini-1.5-pro-002",
    tools: [ functionDeclarations, vertexAIRetrievalTool ],
  });
  
});

let responseToReturn;

app.post("/generate", async (req, res) => {
  chat = generativeModelPreview.startChat();
  const { prompt } = req.body;
  const { response } = await chat.sendMessage(prompt);
  // console.log(response.candidates[0]);
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
    let responseAfterFunctionCall = await chat.sendMessage(functionResponseParts);
    // console.log("responseAfterFunctionCall", responseAfterFunctionCall);
    responseToReturn = responseAfterFunctionCall.response.candidates[0].content.parts[0].text;
  } else {
    responseToReturn = response.candidates[0].content.parts[0].text;
  }
  res.send(responseToReturn);
})


