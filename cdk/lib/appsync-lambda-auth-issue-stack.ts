import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as appsync from '@aws-cdk/aws-appsync';
import { ServicePrincipal } from '@aws-cdk/aws-iam';

export class AppsyncLambdaAuthIssueStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const authorizerLambda = new lambda.Function(this, 'AppSyncAuthorizerHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'lambda-authorizer.handler',
      code: lambda.Code.fromAsset('src/authorizer'),
      memorySize: 1024
    });    

    // THIS IS WRONG IN MANY WAYS
    // const allowAppSyncPolicyStatement = new iam.PolicyStatement({
    //   effect: iam.Effect.ALLOW,
    //   actions: ['lambda:InvokeFunction'],
    //   resources: [
    //     'arn:aws:iam::*:role/aws-service-role/appsync.amazonaws.com/AWSServiceRoleForAppSync'
    //   ],
    // })
    // authorizerLambda.addToRolePolicy(allowAppSyncPolicyStatement);

    // ACCORDING TO THE DOC IN https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-appsync.LambdaAuthorizerConfig.html#handlerspan-classapi-icon-api-icon-experimental-titlethis-api-element-is-experimental-it-may-change-without-noticespan
    // THIS IS WHAT YOU SHOULD DO... ADD THE FOLLOWING RESOURCE-BASED POLICY TO THE LAMBDA:
    authorizerLambda.addPermission("appsync", {
      principal: new ServicePrincipal('appsync.amazonaws.com'),
      action: 'lambda:InvokeFunction',
    })

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
