#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { EventbridgeTestingWithAppsyncEventsStack } from "../lib/eventbridge-testing-with-appsync-events-stack";

const app = new cdk.App();
new EventbridgeTestingWithAppsyncEventsStack(
  app,
  "EventbridgeTestingWithAppsyncEventsStack",
  {},
);
