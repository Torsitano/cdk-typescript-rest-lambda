import { Aws, Duration, Stack, StackProps } from 'aws-cdk-lib'
import { EndpointType, LambdaIntegration, MethodLoggingLevel, RestApi } from 'aws-cdk-lib/aws-apigateway'
import { AttributeType, BillingMode, Table, TableEncryption } from 'aws-cdk-lib/aws-dynamodb'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'


export class CdkRestLambdaStack extends Stack {
    constructor ( scope: Construct, id: string, props?: StackProps ) {
        super( scope, id, props )


        const tableName = 'ExampleTable'

        const lambdaEnv = {
            NODE_OPTIONS: '--enable-source-maps',
            REGION: Aws.REGION,
            TABLE_NAME: tableName
        }


        // Create two Lambdas, one for GET and one for POST
        const getLambda = new NodejsFunction( this, 'getLambda', {
            entry: './src/lambda/get.ts',
            handler: 'handler',
            runtime: Runtime.NODEJS_16_X,
            environment: lambdaEnv,
            timeout: Duration.seconds( 30 ),
            memorySize: 128,
            bundling: {
                sourceMap: true
            }
        } )

        const postLambda = new NodejsFunction( this, 'postLambda', {
            entry: './src/lambda/post.ts',
            handler: 'handler',
            runtime: Runtime.NODEJS_16_X,
            environment: lambdaEnv,
            timeout: Duration.seconds( 30 ),
            memorySize: 128,
            bundling: {
                sourceMap: true
            }
        } )

        // Setup API Gateway

        const apiGateway = new RestApi( this, 'apiGw', {
            restApiName: 'ExampleLambdaApiGateway',
            deployOptions: {
                stageName: 'default',
                loggingLevel: MethodLoggingLevel.INFO
            },
            endpointConfiguration: {
                types: [ EndpointType.REGIONAL ]
            },
            deploy: true
        } )

        // Setup methods on the API GW
        const apiGatewayResource = apiGateway.root.addResource( 'lambda-integration' )
        apiGatewayResource.addMethod( 'GET', new LambdaIntegration( getLambda ) )
        apiGatewayResource.addMethod( 'POST', new LambdaIntegration( postLambda ) )

        // Adding an API key to prevent unauthorized use
        const apiKey = apiGateway.addApiKey( 'apiExampleKey', {
            apiKeyName: 'ApiExampleKey'
        } )

        const apiPlan = apiGateway.addUsagePlan( 'exampleUsagePlan', {
            name: 'ExampleUsagePlan',
            apiStages: [ {
                api: apiGateway,
                stage: apiGateway.deploymentStage
            } ]
        } )

        apiPlan.addApiKey( apiKey )


        // Setup Dynamo DB Table

        const dynamoTable = new Table( this, 'exampleTable', {
            partitionKey: { name: 'uuid', type: AttributeType.STRING },
            encryption: TableEncryption.DEFAULT,
            tableName: tableName,
            billingMode: BillingMode.PROVISIONED,
            readCapacity: 5,
            writeCapacity: 5
        } )

        // Allow the Lambdas to access the table
        dynamoTable.grantReadData( getLambda.role! )
        dynamoTable.grantWriteData( postLambda.role! )



    }
}
