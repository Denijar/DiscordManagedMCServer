import 'dotenv/config';
import { join } from 'path';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export class ServiceDogStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        new NodejsFunction(this, 'appCommands', {
            runtime: lambda.Runtime.NODEJS_16_X,
            entry: join('resources', 'appCommands', 'index.ts'),
            environment: {
                DISCORD_PUBLIC_KEY: process.env.DISCORD_PUBLIC_KEY || '',
            },
        });

        new NodejsFunction(this, 'minecraftServer', {
            runtime: lambda.Runtime.NODEJS_16_X,
            entry: join('resources', 'minecraftServer', 'index.ts'),
            environment: {
                INSTANCE_ID: process.env.INSTANCE_ID || '',
            },
        });

        new NodejsFunction(this, 'postIpAddress', {
            runtime: lambda.Runtime.NODEJS_16_X,
            entry: join('resources', 'postIpAddress', 'index.ts'),
            environment: {
                BARKING_CHANNEL_ID: process.env.BARKING_CHANNEL_ID || '',
                DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN || '',
            },
        });
    }
}
