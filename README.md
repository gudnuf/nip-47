# NIP-47

This is a very basic library that helps you construct payment requests and listen to responses.

You are expected to handle the actual broadcasting of the event and the subscription for the payment response.

There are two things you will need to create an `PaymentRequestEvent`.

1. An NWC Url with a secret.

2. An invoice you want to pay.

## Usage

```
import { PaymentRequestEvent } from 'nip-47';

const paymentRequest = await PaymentRequestEvent.create(nwcUrl, invoice);

const responseFilter = paymentRequest.responseFilter'

const relay = paymentRequest.relayToListenTo;
```

Now, you should:

1. create a subscription on the `relay` to the `responseFilter`

2. broadcast the `paymentRequest`

3. hear the response and handle it

## TODO

- Add ability to broadcast payment request

- Create a subscription manager to wait for all incoming payment responses

- Add the `getInfo` method

- Create some methods for handling different response errors
