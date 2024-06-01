import { Stack, StackProps } from 'aws-cdk-lib/core';
import { CloudFrontWebDistribution, OriginAccessIdentity } from 'aws-cdk-lib/aws-cloudfront';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class S3CloudFrontStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, 'S3Bucket', {
      bucketName: `bucket-${this.region}`,
      versioned: true,
    });

    const oai = new OriginAccessIdentity(this, 'CloudFrontOAI', {
      comment: `oai-${this.region}`
    });

    const distribution = new CloudFrontWebDistribution(this, 'CloudFrontDistribution', {
      comment: `distribution-${this.region}`,
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: bucket,
            originAccessIdentity: oai,
          },
          behaviors: [{ isDefaultBehavior: true }],
        },
      ],
    });
  }
}
