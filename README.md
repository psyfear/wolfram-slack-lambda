# Wolfram Lambda

## Introduction

Wolfram Lambda is an example project that illustrates how to implement a simple slash command
integration for Slack using the [Serverless 1.0](https://serverless.com/) framework for AWS Lambda.

### Examples

![Examples](https://github.com/psyfear/wolfram-slack-lambda/blob/master/docs/examples.png)

## Development

### Setup

Install `serverless`:

    npm i serverless -g

Change the AWS profile inside `serverless.yml` as needed (see the `serverless` documentation on AWS Credentials for details), and adjust the `region` in `serverless.yml` if necessary.

Install package dependencies:

    npm i

Request an API key from [Wolfram Alpha](http://products.wolframalpha.com/api/). Add the API key to a `.env` file in the project root:

    echo "WOLFRAM_APP_ID=<APP_ID>" > .env

This file is not under source control and is only used for deployments.

### Deployment

    npm run deploy

### Testing locally

You can create custom webhook events in JSON files and run the function locally,
without deploying the lambda:

    npm start test/events/event-population.json

You can also test these events against the deployed version:

    serverless invoke -f wolfram -p test/events/event-population.json

## Installing in Slack

After a successful deployment to AWS, `serverless` prints the service information that
you can use to set up a custom integration in Slack:

    Service Information
      service: wolfram-lambda
      stage: dev
      region: us-west-2
      endpoints:
        POST - https://f5f6oyjmmb.execute-api.us-east-1.amazonaws.com/dev/wolfram

Navigate to [https://api.slack.com/slash-commands](https://api.slack.com/slash-commands),
follow instructions on how to create a Slack slash command

Configure the integration with the function URL from above.

![Configuration](https://github.com/psyfear/wolfram-slack-lambda/blob/master/docs/configuration.png)

## Debugging

See the logs of the deployed function:

    serverless logs -f wolfram
