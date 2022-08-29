import nacl = require('tweetnacl');
import AWS = require('aws-sdk');
import { TAIT, DENISE, START_SERVER, STOP_SERVER } from '../common/constants';

const lambda = new AWS.Lambda();

type Command =
    | typeof TAIT
    | typeof DENISE
    | typeof START_SERVER
    | typeof STOP_SERVER;

interface Body {
    type: number;
    data: {
        name: Command;
        content: string;
    };
}

interface Event {
    params: {
        header: {
            'x-signature-ed25519': string;
            'x-signature-timestamp': string;
        };
    };
    rawBody: string;
    'body-json': Body;
}

const verifySignature = (event: Event) => {
    const signature = event.params.header['x-signature-ed25519'];
    const timestamp = event.params.header['x-signature-timestamp'];
    const body = event.rawBody;

    return nacl.sign.detached.verify(
        Buffer.from(timestamp + body),
        Buffer.from(signature, 'hex'),
        Buffer.from(process.env.DISCORD_PUBLIC_KEY || '', 'hex')
    );
};

const pingPong = (body: Body) => {
    if (body.type === 1) {
        return true;
    }
    return false;
};

const minecraftServer = async (command: Command) => {
    try {
        const params = {
            FunctionName: 'minecraftServer',
            InvocationType: 'Event',
            Payload: JSON.stringify({ command }),
        };
        await lambda.invoke(params).promise();
    } catch (error) {
        console.error(error);
        return false;
    }

    return true;
};

exports.handler = async (event: Event) => {
    if (!verifySignature(event)) {
        return {
            statusCode: 401,
        };
    }

    if (pingPong(event['body-json'])) {
        return {
            statusCode: 200,
            type: 1,
        };
    }

    const response = {
        statusCode: 200,
        type: 4,
        data: {
            content: '',
        },
    };

    // gloss your eyes over the cheesy stuff here
    switch (event['body-json'].data.name) {
        case TAIT:
            response.data.content = 'Tait is my boy!';
            break;
        case DENISE:
            response.data.content = 'Denise is my bubby!';
            break;
        case START_SERVER:
            const started = await minecraftServer(START_SERVER);
            if (started) {
                response.data.content = 'Minecraft server starting...';
                break;
            }
            response.statusCode = 500;
            response.data.content = 'Error starting Minecraft server';
            break;
        case STOP_SERVER:
            const stopped = await minecraftServer(STOP_SERVER);
            if (stopped) {
                response.data.content = 'Minecraft server stopping...';
                break;
            }
            response.statusCode = 500;
            response.data.content = 'Error stopping Minecraft server';
            break;
        default:
            response.statusCode = 400;
            response.data.content = 'Unknown command';
    }

    return response;
};
