import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { APIGatewayEvent, APIGatewayEventRequestContext } from 'aws-lambda'
import { HttpResponse, PostPayload } from './interfaces'
import { generateUuid } from './utils'

const REGION = process.env.REGION ?? 'us-east-1'
const TABLE_NAME = process.env.TABLE_NAME ?? 'ExampleTable'

// Setup the base DDB client from the normal aws-sdk
const client = new DynamoDBClient( {
    region: REGION
} )

// Setup the abstracted client available from this:
// https://github.com/aws/aws-sdk-js-v3/blob/main/lib/lib-dynamodb/README.md
const docClient = DynamoDBDocumentClient.from( client )

//@ts-ignore ignoring that context is not used
export async function handler( event: APIGatewayEvent, context: APIGatewayEventRequestContext ): Promise<HttpResponse> {

    const response: HttpResponse = {
        statusCode: 400,
        body: JSON.stringify( 'Unknown Error, bad request' )
    }

    if ( !event.body ) {
        response.body = JSON.stringify( 'No payload in request' )
        return response
    }

    const payload: PostPayload = JSON.parse( event.body )

    try {
        await putItem( payload )
        response.statusCode = 201
        response.body = JSON.stringify( 'Item created' )

    } catch ( err ) {
        response.statusCode = 404
        response.body = JSON.stringify( err )
    }

    return response
}


async function putItem( payload: PostPayload ): Promise<void> {

    await docClient.send(
        new PutCommand( {
            TableName: TABLE_NAME,
            Item: {
                uuid: generateUuid(),
                value1: payload.value1,
                value2: payload.value2
            }
        } )
    )
}