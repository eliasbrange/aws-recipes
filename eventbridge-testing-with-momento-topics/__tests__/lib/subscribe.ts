import 'dotenv/config';
import { TopicClient, TopicConfigurations, CredentialProvider, TopicItem, TopicSubscribe } from '@gomomento/sdk';
import { ReplaySubject, firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';
import * as _ from 'lodash';

const topicClient = new TopicClient({
  configuration: TopicConfigurations.Default.latest(),
  credentialProvider: CredentialProvider.fromEnvironmentVariable({
    environmentVariableName: 'MOMENTO_API_KEY',
  }),
});
const CACHE_NAME = process.env.CACHE_NAME || '';
const TOPIC_NAME = process.env.TOPIC_NAME || '';

export const subscribe = async () => {
  const messages = new ReplaySubject(100);

  console.log('Subscribing to Momento Topic');
  const subscription = await topicClient.subscribe(CACHE_NAME, TOPIC_NAME, {
    onError: (error) => {
      throw error;
    },
    onItem: (item: TopicItem) => {
      try {
        const message = JSON.parse(item.valueString());
        console.log('Received message from Momento Topic', message);
        messages.next(message);
      } catch (error) {
        console.log('Error parsing message from Momento Topic', item);
      }
    },
  });

  if (!(subscription instanceof TopicSubscribe.Subscription)) {
    throw new Error('Failed to subscribe to topic');
  }

  const unsubscribe = async () => {
    console.log('Unsubscribing to Momento Topic');
    subscription.unsubscribe();
  };

  const waitForMessageMatching = async (expected: object) => {
    const predicate = (message: unknown) => {
      if (typeof message !== 'object' || message === null) {
        return false;
      }

      return _.isMatch(message, expected);
    };

    const data = messages.pipe(filter((message) => predicate(message)));
    return firstValueFrom(data);
  };

  return {
    unsubscribe,
    waitForMessageMatching,
  };
};
