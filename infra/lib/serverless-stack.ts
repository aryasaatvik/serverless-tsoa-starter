import { Arn, ArnFormat, Duration, Stack, StackProps } from 'aws-cdk-lib';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { ApplicationLogLevel, Code, Function, Runtime, SystemLogLevel } from 'aws-cdk-lib/aws-lambda';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { join } from 'path';

export class ServerlessStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const lambdaRole = new Role(this, 'APILambdaRole', {
      roleName: 'APILambdaRole',
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
    });

    lambdaRole.addToPolicy(
      new PolicyStatement({
        actions: [
          'logs:CreateLogGroup',
          'logs:CreateLogStream',
          'logs:PutLogEvents'
        ],
        resources: [Arn.format({
          service: 'logs',
          resource: 'log-group',
          resourceName: `/aws/lambda/${id}*`,
          arnFormat: ArnFormat.COLON_RESOURCE_NAME,
        }, this)],
      }),
    );

    // uncomment to add secretsmanager and ssm permissions for accessing secrets at runtime
    // ran into issues with loading secrets before the lambda function was invoked
    // lambdaRole.addToPolicy(
    //   new PolicyStatement({
    //     actions: [
    //       'ssm:GetParameter',
    //       'secretsmanager:GetSecretValue',
    //       'kms:Decrypt',
    //     ],
    //     resources: [Arn.format({
    //       service: 'secretsmanager',
    //       resource: 'secret',
    //       resourceName: 'prod/SiloAPI*',
    //       arnFormat: ArnFormat.COLON_RESOURCE_NAME,
    //     }, this)],
    //   }),
    // );

    const secret = Secret.fromSecretNameV2(this, 'APISecrets', 'prod/API');

    // Lambda function
    const apiHandler = new Function(this, 'APIHandler', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'serverless.handler',
      role: lambdaRole,
      environment: {
        "WORKOS_CLIENT_ID": secret.secretValueFromJson('WORKOS_CLIENT_ID').unsafeUnwrap(),
        "WORKOS_API_KEY": secret.secretValueFromJson('WORKOS_API_KEY').unsafeUnwrap(),
        "WORKOS_REDIRECT_URI": secret.secretValueFromJson('WORKOS_REDIRECT_URI').unsafeUnwrap(),
        "PORT": secret.secretValueFromJson('PORT').unsafeUnwrap(),
        "COOKIE_SIGNING_KEY": secret.secretValueFromJson('COOKIE_SIGNING_KEY').unsafeUnwrap(),
      },
      timeout: Duration.seconds(30),
      memorySize: 512,
      code: Code.fromAsset(join(__dirname, '../../api/dist')),
      systemLogLevel: SystemLogLevel.DEBUG,
      applicationLogLevel: ApplicationLogLevel.TRACE,
      logFormat: 'JSON',
    });

    // API Gateway
    new LambdaRestApi(this, 'APIGateway', {
      handler: apiHandler,
    });
  }
}
