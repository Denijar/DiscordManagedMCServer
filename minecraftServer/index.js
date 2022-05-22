const AWS = require("aws-sdk");

var ec2 = new AWS.EC2();

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
