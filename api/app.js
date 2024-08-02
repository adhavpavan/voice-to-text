const AWS = require('aws-sdk');
const express = require('express');
const app = express();
const port = 3002;
var cors = require("cors");

const {
  BedrockClient,
  ListFoundationModelsCommand,
  InvokeEndpointCommand
} = require('@aws-sdk/client-bedrock');

const {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand,
  InvokeModelCommand
} = require("@aws-sdk/client-bedrock-runtime");

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

// Basic route
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// Sample GET endpoint
app.post('/chat', async (req, res) => {
  const {message} = req.body
  console.log("-----body--------", req.body)
  const client = new BedrockRuntimeClient({ region: "us-west-2" });
  // Set the model ID, e.g., Llama 3 8B Instruct.
  const modelId = "meta.llama3-1-8b-instruct-v1:0";
  // const modelId = "meta.llama3-1-70b-instruct-v1:0";
  // const modelId = "meta.llama3-1-405b-instruct-v1:0";

  const AWS = require('aws-sdk');

  // Configure the AWS SDK
  AWS.config.update({
    region: 'us-west-2',
    accessKeyId: '',
    secretAccessKey: ''
  });
  // Embed the message in Llama 3's prompt format.
  const prompt = `
<|begin_of_text|>
<|start_header_id|>user<|end_header_id|>
${message}
<|eot_id|>
<|start_header_id|>assistant<|end_header_id|>
`;

  // Format the request payload using the model's native structure.
  const request = {
    prompt,
    // Optional inference parameters:
    max_gen_len: 1024,
    temperature: 0.5,
    top_p: 0.9,
  };
  const response = await client.send(
    new InvokeModelCommand({
      contentType: "application/json",
      body: JSON.stringify(request),
      modelId,
    }),
  );

  // Decode the native response body.
  /** @type {{ generation: string }} */
  const nativeResponse = JSON.parse(new TextDecoder().decode(response.body));

  // Extract and print the generated text.
  const responseText = nativeResponse.generation;
  console.log("-------------responseText-----------",responseText);

  res.json({ message: 'This is an example endpoint', payload: responseText });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
// Configure AWS SDK
