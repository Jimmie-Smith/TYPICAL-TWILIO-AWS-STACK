import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { join } from "path";
import { CfnOutput } from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
// import * as apigateway from "aws-cdk-lib/aws-apigateway";

export class TwilioAwsStackStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const handler = new Function(this, "connect-to-dynamo", {
      runtime: Runtime.NODEJS_16_X,
      memorySize: 512,
      handler: "connect-dynamo.handler",
      code: Code.fromAsset(join(__dirname, "./lambdas")),
    });

    const smsHandler = new Function(this, "sms-connect-to-dynamo", {
      runtime: Runtime.NODEJS_16_X,
      memorySize: 512,
      handler: "sms-connect-dynamo.handler",
      code: Code.fromAsset(join(__dirname, "./lambdas")),
    });
    // const api = new apigateway.RestApi(this, 'callerInfoAPI');

    // const dynamoLambdaIntegration = new apigateway.HttpIntegration('http://amazon.com');

//Adding Our HTTP API Gateway Endpoint to Access DynamoDB

// api.root.addMethod('ANY', dynamoLambdaIntegration);

// const items = api.root.addResource('items');
// items.addMethod('GET', dynamoLambdaIntegration);
// items.addMethod('PUT', dynamoLambdaIntegration);

// const callSid = items.addResource('{callSid}');
// callSid.addMethod('GET', dynamoLambdaIntegration);
// callSid.addMethod('DELETE', dynamoLambdaIntegration);

// Then we add integrations to our Lambda at the top




    const listBucketPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['s3:*'],
      resources: ['*'],
    })

    const listLambdasPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['lambda:*'],
      resources: ['*'],
    })

    handler.role?.attachInlinePolicy(new iam.Policy(this, 'Allow anything for s3 buckets and Lambda functions', {
      statements: [listLambdasPolicy, listBucketPolicy]
    }))

    smsHandler.role?.attachInlinePolicy(new iam.Policy(this, 'Sms allow anything for s3 buckets and Lambda functions', {
      statements: [listLambdasPolicy, listBucketPolicy]
    }))

    const table = new dynamodb.Table(this, "Table", {
      partitionKey: { name: "callSid", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "phoneNumber", type: dynamodb.AttributeType.STRING },
    });

    new CfnOutput(this, "Dynamo Table Name: ", { value: table.tableName });
    new CfnOutput(this, "Twilio Voice Lambda: ", { value: handler.functionArn });
    new CfnOutput(this, "Twilio SMS Lambda: ", { value: handler.functionArn });

  }
}
