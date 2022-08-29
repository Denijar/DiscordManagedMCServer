import axios from "axios";
import { EC2 } from "aws-sdk";

interface Event {
    detail: {
        'instance-id': string,
    }
}

const ec2 = new EC2();

exports.handler = async (event: Event) => {
    const instanceId = event.detail["instance-id"];

    const params = {
        InstanceIds: [instanceId],
    };

    try {
        const data = await ec2.describeInstances(params).promise();

        const ipAddress = data.Reservations?.[0]?.Instances?.[0]?.PublicIpAddress;

        await axios.post(
            `https://discord.com/api/v10/channels/${process.env.BARKING_CHANNEL_ID}/messages`,
            {
                content: `Minecraft server address: ${ipAddress}`,
                tts: false,
            },
            {
                headers: {
                    Authorization: `Bot ${process.env.BOT_TOKEN}`,
                },
            }
        );
    } catch (error) {
        console.error(error);
    }

    return;
}
