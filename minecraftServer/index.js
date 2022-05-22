const AWS = require("aws-sdk");

var ec2 = new AWS.EC2();

const commands = {
  START_INSTANCE: "start",
  STOP_INSTANCE: "stop",
};

const startInstance = async () => {
  try {
    const params = {
      InstanceIds: [process.env.INSTANCE_ID],
    };
    await ec2.startInstances(params).promise();
  } catch (error) {
    console.error(error);
  }
};

const stopInstance = async () => {
  try {
    const params = {
      InstanceIds: [process.env.INSTANCE_ID],
    };
    await ec2.stopInstances(params).promise();
  } catch (error) {
    console.error(error);
  }
};

exports.handler = async (event) => {
  switch (event.command) {
    case commands.START_INSTANCE:
      await startInstance();
      break;
    case commands.STOP_INSTANCE:
      await stopInstance();
      break;
  }

  return;
};
