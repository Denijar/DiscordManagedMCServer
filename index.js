const nacl = require("tweetnacl");
const AWS = require("aws-sdk");
var ec2 = new AWS.EC2();

const commands = {
  TAIT: "tait",
  DENISE: "denise",
  START_INSTANCE: "start",
};

const verifySignature = (event) => {
  const signature = event.params.header["x-signature-ed25519"];
  const timestamp = event.params.header["x-signature-timestamp"];
  const body = event.rawBody;

  return nacl.sign.detached.verify(
    Buffer.from(timestamp + body),
    Buffer.from(signature, "hex"),
    Buffer.from(process.env.PUBLIC_KEY, "hex")
  );
};

const pingPong = (body) => {
  if (body.type === 1) {
    return true;
  }
  return false;
};

const startInstance = async () => {
  try {
    var params = {
      InstanceIds: [process.env.INSTANCE_ID],
    };
    await ec2.startInstances(params).promise();
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

exports.handler = async (event) => {
  if (!verifySignature(event)) {
    return {
      statusCode: 401,
    };
  }

  if (pingPong(event["body-json"])) {
    return {
      statusCode: 200,
      type: 1,
    };
  }

  // gloss your eyes over the cheesy stuff here
  switch (event["body-json"].data.name) {
    case commands.TAIT:
      return {
        statusCode: 200,

        type: 4,
        data: {
          content: "Tait is my boy!",
        },
      };
    case commands.DENISE:
      return {
        statusCode: 200,
        type: 4,
        data: {
          content: "Denise is my bubby!",
        },
      };
    case commands.START_INSTANCE:
      const success = await startInstance();
      return success
        ? {
            statusCode: 200,
            type: 4,
            data: {
              content: "Minecraft server started",
            },
          }
        : {
            statusCode: 500,
            type: 4,
            data: {
              content: "Error starting Minecraft server",
            },
          };
    default:
      return {
        statusCode: 400,
        type: 4,
        data: {
          content: "Unknown command",
        },
      };
  }
};
