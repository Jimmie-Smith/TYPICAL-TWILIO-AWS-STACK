import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { join } from "path";
import { CfnOutput } from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";

export class TwilioAwsStackStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const handler = new Function(this, "connect-to-dynamo", {
      runtime: Runtime.NODEJS_16_X,
      memorySize: 512,
      handler: "connect-dynamo.handler",
      code: Code.fromAsset(join(__dirname, "./lambdas")),
    });

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

    handler.role?.attachInlinePolicy(new iam.Policy(this, 'List s3 buckets and Lambda functions', {
      statements: [listLambdasPolicy, listBucketPolicy]
    }))

    const table = new dynamodb.Table(this, "Table", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
    });

    console.log("Our DynamoDB Table Name: ", table.tableName);

    new CfnOutput(this, "Dynamo Table Name: ", { value: table.tableName });
    new CfnOutput(this, "FirstApp", { value: handler.functionArn });

  }
}
