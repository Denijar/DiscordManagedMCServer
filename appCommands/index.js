const nacl = require("tweetnacl");
const AWS = require("aws-sdk");
var ec2 = new AWS.EC2();

const commands = {
  TAIT: "tait",
  DENISE: "denise",
  START_INSTANCE: "start",
  STOP_INSTANCE: "stop",
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
    const params = {
      InstanceIds: [process.env.INSTANCE_ID],
    };
    await ec2.startInstances(params).promise();
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

const stopInstance = async () => {
  try {
    const params = {
      InstanceIds: [process.env.INSTANCE_ID],
    };
    await ec2.stopInstances(params).promise();
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

  const response = {
    statusCode: 200,
    type: 4,
    data: {},
  };

  // gloss your eyes over the cheesy stuff here
  switch (event["body-json"].data.name) {
    case commands.TAIT:
      response.data.content = "Tait is my boy!";
      break;
    case commands.DENISE:
      response.data.content = "Denise is my bubby!";
      break;
    case commands.START_INSTANCE:
      const started = await startInstance();
      if (started) {
        response.data.content = "Minecraft server started";
        break;
      }
      response.statusCode = 500;
      response.data.content = "Error starting Minecraft server";
      break;
    case commands.STOP_INSTANCE:
      const stopped = await stopInstance();
      if (stopped) {
        response.data.content = "Minecraft server stopped";
        break;
      }
      response.statusCode = 500;
      response.data.content = "Error stopping Minecraft server";
      break;
    default:
      response.statusCode = 400;
      response.data.content = "Unknown command";
  }

  return response;
};
