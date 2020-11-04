import SQS from "aws-sdk/clients/sqs";
import { ExecuteRequest } from "./execute-request";
import { Retryable } from "./retryable";

const sqs = new SQS({apiVersion: "2012-11-05"});
const queueUrl = process.env.queueUrl;

interface LambdaDestinationEvent { 
  requestContext: { functionArn: string }; 
  requestPayload: Retryable;
};

export async function handler(event: LambdaDestinationEvent) {
  console.log(JSON.stringify(event, null, 2));

  const retryCount = event.requestPayload.retryCount || 0;
  console.log(`Try ${retryCount} failed`);
  if (retryCount === 2) {
    console.log(`Event failed after ${retryCount} tries`);
    return;
  }

  const delaySeconds = retryCount*5+5;
  console.log(`retrying with delay ${delaySeconds} seconds`);

  const messageBody = createMessageBody(event, retryCount+1);
  return queueRetry(messageBody, delaySeconds);
}

const createMessageBody = (event: LambdaDestinationEvent, nextTry: number) => {
  const executeRequest: ExecuteRequest = {
    functionArn: event.requestContext.functionArn,
    requestPayload: { ...event.requestPayload, retryCount: nextTry }
  };
  return JSON.stringify(executeRequest);
}

const queueRetry = (messageBody: string, delaySeconds: number) => sqs.sendMessage({
  MessageBody: messageBody,
  DelaySeconds: delaySeconds,
  QueueUrl: queueUrl!,
}).promise();

