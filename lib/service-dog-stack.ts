import 'dotenv/config';
import { join } from 'path';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Rule } from 'aws-cdk-lib/aws-events';
import {
    addLambdaPermission,
    LambdaFunction,
} from 'aws-cdk-lib/aws-events-targets';

export class ServiceDogStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const appCommands = new NodejsFunction(this, 'appCommands', {
            functionName: 'appCommands',
            runtime: lambda.Runtime.NODEJS_16_X,
            entry: join('resources', 'appCommands', 'index.ts'),
            environment: {
                DISCORD_PUBLIC_KEY: process.env.DISCORD_PUBLIC_KEY || '',
            },
        });

        const minecraftServer = new NodejsFunction(this, 'minecraftServer', {
            functionName: 'minecraftServer',
            runtime: lambda.Runtime.NODEJS_16_X,
            entry: join('resources', 'minecraftServer', 'index.ts'),
            environment: {
                INSTANCE_ID: process.env.INSTANCE_ID || '',
            },
        });

        const postIpAddress = new NodejsFunction(this, 'postIpAddress', {
            functionName: 'postIpAddress',
            runtime: lambda.Runtime.NODEJS_16_X,
            entry: join('resources', 'postIpAddress', 'index.ts'),
            environment: {
                BARKING_CHANNEL_ID: process.env.BARKING_CHANNEL_ID || '',
                DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN || '',
            },
        });

        appCommands.addToRolePolicy(
            new PolicyStatement({
                actions: ['lambda:InvokeFunction', 'lambda:InvokeAsync'],
                resources: [minecraftServer.functionArn],
            })
        );

        minecraftServer.addToRolePolicy(
            new PolicyStatement({
                actions: ['ec2:StartInstances', 'ec2:StopInstances'],
                resources: [
                    `arn:aws:ec2:${process.env.CDK_DEFAULT_REGION}:${process.env.CDK_DEFAULT_ACCOUNT}:instance/${process.env.INSTANCE_ID}`,
                ],
            })
        );

        postIpAddress.addToRolePolicy(
            new PolicyStatement({
                actions: ['ec2:DescribeInstances'],
                resources: ['*'],
            })
        );

        const EC2RunningRule = new Rule(this, 'EC2Running', {
            ruleName: 'EC2Running',
            eventPattern: {
                source: ['aws.ec2'],
                detailType: ['EC2 Instance State-change Notification'],
                detail: {
                    state: ['running'],
                    'instance-id': [process.env.INSTANCE_ID],
                },
            },
        });

        EC2RunningRule.addTarget(new LambdaFunction(postIpAddress));
    }
}
