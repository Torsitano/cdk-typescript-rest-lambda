#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { CdkRestLambdaStack } from './stacks/CdkRestLambdaStack'


const devEnv = {
    account: '123456789012',
    region: 'us-east-1',
}

const app = new cdk.App()
new CdkRestLambdaStack( app, 'CdkRestLambdaStack', { env: devEnv } )