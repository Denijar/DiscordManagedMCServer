const axios = require("axios");

const AWS = require("aws-sdk");
const ec2 = new AWS.EC2();

exports.handler = async (event) => {
  const instanceId = event.detail["instance-id"];

  let data;

  try {
    const params = {
      InstanceIds: [instanceId],
    };
    data = await ec2.describeInstances(params).promise();
  } catch (error) {
    console.error(error);
    return;
  }

  const ipAddress = data.Reservations[0].Instances[0].PublicIpAddress;

  try {
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
};
