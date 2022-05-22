const AWS = require("aws-sdk");
const ec2 = new AWS.EC2();

exports.handler = async (event) => {
  const instanceId = event.detail["instance-id"];

  const params = {
    InstanceIds: [instanceId],
  };

  const data = await ec2.describeInstances(params).promise();
  const ipAddress = data.Reservations[0].Instances[0].PublicIpAddress;

  return ipAddress;
};
