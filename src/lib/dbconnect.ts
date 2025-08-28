import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Read credentials and region from your custom environment variables
const region = process.env.DYNAMODB_AWS_REGION;
const accessKeyId = process.env.DYNAMODB_AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.DYNAMODB_AWS_SECRET_ACCESS_KEY;

// Check if all required variables are present
if (!region || !accessKeyId || !secretAccessKey) {
  // In a production environment, you might want to throw an error
  // For local development, this helps identify missing variables
  console.warn("DynamoDB environment variables are not fully configured. The SDK might fall back to other credential sources.");
}

// Explicitly configure the DynamoDB client
const client = new DynamoDBClient({
  region,
  credentials: {
    accessKeyId: accessKeyId || '',
    secretAccessKey: secretAccessKey || '',
  },
});

const docClient = DynamoDBDocumentClient.from(client);

export default docClient;