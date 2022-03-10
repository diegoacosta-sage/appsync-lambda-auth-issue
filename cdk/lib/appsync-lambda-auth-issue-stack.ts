import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as appsync from '@aws-cdk/aws-appsync';

export class AppsyncLambdaAuthIssueStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const allowAppSyncPolicyStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['lambda:InvokeFunction'],
      resources: [
        'arn:aws:iam::*:role/aws-service-role/appsync.amazonaws.com/AWSServiceRoleForAppSync'
      ],
    })

    const authorizerLambda = new lambda.Function(this, 'AppSyncAuthorizerHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'lambda-authorizer.handler',
      code: lambda.Code.fromAsset('src/authorizer'),
      memorySize: 1024
    });

    authorizerLambda.addToRolePolicy(allowAppSyncPolicyStatement);

    const api = new appsync.GraphqlApi(this, 'Api', {
      name: 'cdk-appsync-api',
      schema: appsync.Schema.fromAsset('graphql/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.LAMBDA,
          lambdaAuthorizerConfig: {
            handler: authorizerLambda
          }
        },
      },
      xrayEnabled: false,
      logConfig: {
        fieldLogLevel: appsync.FieldLogLevel.ALL
      }
    });

    const sayHelloLambda = new lambda.Function(this, 'AppSyncSayHelloHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'main.handler',
      code: lambda.Code.fromAsset('src/sayHello'),
      memorySize: 1024
    });

    // Set the new Lambda function as a data source for the AppSync API
    const lambdaDs = api.addLambdaDataSource('lambdaDatasource', sayHelloLambda);

    lambdaDs.createResolver({
      typeName: "Query",
      fieldName: "sayHello"
    });

    new cdk.CfnOutput(this, "GraphQLAPIURL", {
      value: api.graphqlUrl
    });
  }
}
