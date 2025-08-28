import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Ensure your AWS credentials and region are configured in your environment variables
// AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export default docClient;