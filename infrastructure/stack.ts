import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as destinations from '@aws-cdk/aws-lambda-destinations';
import * as eventSources from '@aws-cdk/aws-lambda-event-sources';
import * as sqs from '@aws-cdk/aws-sqs';

export class AsyncLambdaRetriesStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const retryQueue = new sqs.Queue(this, 'RetryQueue', { });
    const retryRequestLambda = new lambda.Function(this, 'retry-error', {
      runtime: lambda.Runtime.NODEJS_10_X,
      code: lambda.Code.fromAsset('dist/retryError'),
      handler: 'index.handler',
      environment: {
        queueUrl: retryQueue.queueUrl
      }
    });
    retryQueue.grantSendMessages(retryRequestLambda);

    const retryExecuteLambda = new lambda.Function(this, 'retry-execute', {
      runtime: lambda.Runtime.NODEJS_10_X,
      code: lambda.Code.fromAsset('dist/retryExecute'),
      handler: 'index.handler',
      environment: {
        queueUrl: retryQueue.queueUrl
      }
    });
    retryExecuteLambda.addEventSource(new eventSources.SqsEventSource(retryQueue));

    const taskLambda = new lambda.Function(this, 'task-execute', {
      runtime: lambda.Runtime.NODEJS_10_X,
      code: lambda.Code.fromAsset('dist/taskExecute'),
      handler: 'index.handler',
      onFailure: new destinations.LambdaDestination(retryRequestLambda),
      retryAttempts: 0,
    });
    taskLambda.grantInvoke(retryExecuteLambda);

  }
}

const app = new cdk.App();
new AsyncLambdaRetriesStack(app, 'AsyncLambdaRetriesStack');
app.synth();

