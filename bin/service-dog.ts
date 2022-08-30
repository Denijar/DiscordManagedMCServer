#!/usr/bin/env node
import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { ServiceDogStack } from '../lib/service-dog-stack';

const app = new App();
new ServiceDogStack(app, 'ServiceDogStack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
    },
});
