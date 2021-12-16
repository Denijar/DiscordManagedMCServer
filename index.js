const nacl = require("tweetnacl");

const verifySignature = (event) => {
  const signature = event.params.header["x-signature-ed25519"];
  const timestamp = event.params.header["x-signature-timestamp"];
  const body = event["rawBody"];

  return nacl.sign.detached.verify(
    Buffer.from(timestamp + body),
    Buffer.from(signature, "hex"),
    Buffer.from(process.env.PUBLIC_KEY, "hex")
  );
};

const pingPong = (body) => {
  if (body["type"] === 1) {
    return true;
  }
  return false;
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

  return {};
};
