# AWS Lambda retries

An investigation into different kinds of retries you can do on AWS with Lambda.



## Build

```
yarn build
```

## Deploy

```
yarn deploy
```

## Test

Get the name of the lambda.
```
lambda=$(aws cloudformation list-stack-resources --stack-name "AsyncLambdaRetriesStack" | jq -r -c '.StackResourceSummaries | .[] | select(.ResourceType | contains("AWS::Lambda::Function")) | select(.LogicalResourceId | contains("taskhandler")) | .PhysicalResourceId')
```

To generate a failure which will retry 3 times use a false value in the payload.

```
aws lambda invoke --function-name $lambda --invocation-type Event --payload '{"value": false}' out.log
```

To generate a success which will not retry, put true in the payload.

```
aws lambda invoke --function-name $lambda --invocation-type Event --payload '{"value": true}' out.log
```
