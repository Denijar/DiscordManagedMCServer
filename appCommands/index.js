const nacl = require("tweetnacl");
const AWS = require("aws-sdk");
var lambda = new AWS.Lambda();

const commands = {
  TAIT: "tait",
  DENISE: "denise",
  START_SERVER: "start",
  STOP_SERVER: "stop",
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

const minecraftServer = async (command) => {
  try {
    const params = {
      FunctionName: "minecraftServer",
      InvocationType: "Event",
      Payload: JSON.stringify({ command }),
    };
    await lambda.invoke(params).promise();
  } catch (error) {
    console.error(error);
    return false;
  }

  return true;
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
    case commands.START_SERVER:
      const started = await minecraftServer(commands.START_SERVER);
      if (started) {
        response.data.content = "Minecraft server starting...";
        break;
      }
      response.statusCode = 500;
      response.data.content = "Error starting Minecraft server";
      break;
    case commands.STOP_SERVER:
      const stopped = await minecraftServer(commands.STOP_SERVER);
      if (stopped) {
        response.data.content = "Minecraft server stopping...";
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
