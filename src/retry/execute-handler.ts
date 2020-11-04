import Lambda from "aws-sdk/clients/lambda";
import { ExecuteRequest } from "./execute-request";

const lambda = new Lambda({apiVersion: "2015-03-31"});

export async function handler(event: { Records: any[] }) {
  console.log(JSON.stringify(event, null, 2));
  return Promise.all(event.Records.map(parseRecord).map(invokeFunction));
}

const parseRecord = (record: any): ExecuteRequest => JSON.parse(record.body);

const invokeFunction = ({ functionArn, requestPayload }: ExecuteRequest) => lambda.invokeAsync({
  FunctionName: functionArnToName(functionArn),
  InvokeArgs: JSON.stringify(requestPayload)
}).promise();

const functionArnToName = (functionArn: string) => functionArn.split(":")[6];


