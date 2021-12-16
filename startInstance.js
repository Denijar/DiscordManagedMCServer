const AWS = require("aws-sdk");
var ec2 = new AWS.EC2();

const startInstance = async () => {
  try {
    var params = {
      InstanceIds: [process.env.INSTANCE_ID],
    };
    await ec2.startInstances(params).promise();

    return {
      statusCode: 200,
      body: {
        message: "server started",
      },
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: {
        message: "error during script",
      },
    };
  }
};

export default startInstance;
