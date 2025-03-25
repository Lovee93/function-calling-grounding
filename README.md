In this example we use a Vertex AI Agent Datastore that contains information about movies. We pass in this tool for retrieving information about movies and get recommendations from a provided source. 
What we also do is pass in the function declaration that allows us to rent a movie. This is called function calling and it allows us to perform actions real time by calling external APIs.

And hence, we first need to create a Vertex AI Agent Datastore. You can either learn more via the [Guide Me button available on official documentation](https://cloud.google.com/generative-ai-app-builder/docs/try-enterprise-search) or follow these steps:

- Go to the [Create data store](https://console.cloud.google.com/gen-app-builder/data-stores/create) page.
- In the Select a data source pane, select Cloud Storage.
- In the Import data from Cloud Storage pane, select Structured data (JSONL). Make sure File is selected.
- In the `gs://` field, enter the following value:

  `cloud-samples-data/gen-app-builder/search/kaggle_movies/movie_metadata.ndjson`
  This Cloud Storage bucket contains an NDJSON-formatted file of movies made available by [Kaggle](https://www.kaggle.com/datasets/rounakbanik/the-movies-dataset?select=movies_metadata.csv).

- Click Continue.

- Assign key properties as follows:

  Field name | Key property </br>
  homepage | uri </br>
  overview | description

- And, click Continue.

- In the Configure your data store pane, select global (Global) as the location for your data store.

- Enter a name for your data store. Note the `ID` that is generated. You'll need this later.

- Click Create.

- Once your datastore is available you need to populate that datastore's path in `vertexAIRetrievalTool` in `index.js`. If you are confused about the collection or the path, just open the datastore in console and you can refer to its path in the url in the browser. 

Just run `npm i`
And `npm run dev` for dev mode with hotreloading. 
