import { Stack, StackProps } from 'aws-cdk-lib/core';
import { AttributeType, TableV2 } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class DynamoStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const db = new TableV2(this, 'DynamoDBTable', {
      partitionKey: { name: 'id', type: AttributeType.STRING },
      tableName: `table-${this.region}`
    });
  }
}
