import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, paginateScan } from '@aws-sdk/lib-dynamodb'
import { APIGatewayEvent, APIGatewayEventRequestContext } from 'aws-lambda'
import { HttpResponse } from './interfaces'

const REGION = process.env.REGION ?? 'us-east-1'
const TABLE_NAME = process.env.TABLE_NAME ?? 'ExampleTable'

// Setup the base DDB client from the normal aws-sdk
const client = new DynamoDBClient( {
    region: REGION
} )

// Setup the abstracted client available from this:
// https://github.com/aws/aws-sdk-js-v3/blob/main/lib/lib-dynamodb/README.md
const docClient = DynamoDBDocumentClient.from( client )



/**
 * If you DON't want to use async/await in the hander it can be NON-async.
 * Even though the getItem() and getAllItems() functions are async, since the handler is not
 * the function won't return until they are finished fulfilling their promises.
 */


//@ts-ignore ignoring that context is not used
export function handler( event: APIGatewayEvent, context: APIGatewayEventRequestContext ): HttpResponse {

    const response: HttpResponse = {
        statusCode: 400,
        body: JSON.stringify( 'Unknown Error, bad request' )
    }

    if ( event.queryStringParameters?.uuid ) {
        getItem( event.queryStringParameters.uuid )
            .then( ( item ): HttpResponse => {
                response.body = JSON.stringify( item )
                response.statusCode = 200
                return response
            } )
            .catch( ( err ): HttpResponse => {
                response.body = JSON.stringify( err )
                return response
            } )

    }
    else {
        getAllItems()
            .then( ( items ) => {
                response.body = JSON.stringify( items )
                response.statusCode = 200
                return response
            } )
            .catch( ( err ): HttpResponse => {
                response.body = JSON.stringify( err )
                return response
            } )
    }

    return response
}


async function getItem( uuid: string ) {

    const item = await docClient.send(
        new GetCommand( {
            TableName: TABLE_NAME,
            Key: { uuid: uuid }
        } )
    )

    if ( !item.Item ) {
        throw new Error( `No item found with uuid ${uuid}` )
    }

    return item.Item

}


async function getAllItems() {

    const items: Record<string, any>[] = []

    const paginatedItems = paginateScan( { client: docClient }, {
        TableName: TABLE_NAME
    } )

    for await ( let item of paginatedItems ) {
        if ( item.Items ) {
            items.push( ...item.Items )
        }
    }

    return items
}