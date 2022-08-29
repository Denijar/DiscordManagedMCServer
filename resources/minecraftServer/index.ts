import AWS = require('aws-sdk')
import { START_SERVER, STOP_SERVER } from '../common/constants'

var ec2 = new AWS.EC2()

interface Event {
    command: typeof START_SERVER | typeof STOP_SERVER
}

const startInstance = async (instanceId: string) => {
    const params = {
        InstanceIds: [instanceId],
    }

    try {
        await ec2.startInstances(params).promise()
    } catch (error) {
        console.error(error)
    }
}

const stopInstance = async (instanceId: string) => {
    const params = {
        InstanceIds: [instanceId],
    }

    try {
        await ec2.stopInstances(params).promise()
    } catch (error) {
        console.error(error)
    }
}

exports.handler = async (event: Event) => {
    const instanceId = process.env.INSTANCE_ID
    if (!instanceId) {
        console.error('env variable INSTANCE_ID is undefined')
        return
    }

    switch (event.command) {
        case START_SERVER:
            await startInstance(instanceId)
            break
        case STOP_SERVER:
            await stopInstance(instanceId)
            break
    }

    return
}
