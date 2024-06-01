#!/usr/bin/env node
import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { S3CloudFrontStack } from '../lib/s3-cf-stack';
import { DynamoStack } from '../lib/dynamo-stack';
import { ServerlessStack } from '../lib/serverless-stack';

const app = new App();

const env = {
  region: process.env.CDK_DEFAULT_REGION,
  account: process.env.CDK_DEFAULT_ACCOUNT,
};

new S3CloudFrontStack(app, 'S3CloudFrontStack', { env });
new DynamoStack(app, 'DynamoStack', { env });
new ServerlessStack(app, 'ServerlessStack', { env });