import { describe, expect, test } from "@jest/globals";
import { NWC } from "./Nwc";
import "websocket-polyfill";
import { getPublicKey } from "nostr-tools";
import * as crypto from "crypto";
import {PaymentRequestEvent} from "./PaymentRequest";

globalThis.crypto = crypto as any;

describe("PaymentRequestEvent", () => {
  const nwcUrl =
    "nostr+walletconnect://69effe7b49a6dd5cf525bd0905917a5005ffe480b58eeb8e861418cf3ae760d9?relay=wss://relay.getalby.com/v1&secret=92045836063d176fcb688621bf670f56ae5a0443c9c9aff5436280658ac56028&lud16=daim@getalby.com";

  describe(".create()", () => {
    test("should return a valid payment request event", async () => {
      const nwc = new NWC(nwcUrl);
      const invoice = "lnbc123456789";
      const event = await PaymentRequestEvent.create(nwc, invoice);
      expect(event.kind).toBe(23194);
      expect(event.tags).toStrictEqual([
        [
          "p",
          "69effe7b49a6dd5cf525bd0905917a5005ffe480b58eeb8e861418cf3ae760d9",
        ],
      ]);
    });

    test("should work with just an NWC url and invoice", () => {
      const invoice = "lnbc123456789";
      const event = PaymentRequestEvent.create(nwcUrl, invoice);
      expect(event).resolves.toBeInstanceOf(PaymentRequestEvent);
    });

    test("should be publishable by ndk", async () => {
      const nwc = new NWC(nwcUrl);
      const invoice = "lnbc123456789";
      const event = await PaymentRequestEvent.create(nwc, invoice);
      expect(typeof event.event.publish).toBe("function");
    })
  });

  describe(".getResponseFilter()", () => {
    test("should return a valid response filter", async () => {
      const nwc = new NWC(nwcUrl);
      const invoice = "lnbc123456789";
      const event = await PaymentRequestEvent.create(nwc, invoice);
      const responseFilter = event.getResponseFilter();
      const pubkey = getPublicKey(nwc.secret);
      expect(responseFilter).toStrictEqual({
        kinds: [23195],
        tags: [
          ["e", event.id],
          ["p", pubkey],
        ],
      });
    });
  });

  describe(".getRelayToListenTo()", () => {
    test("Should return the correct relay", async () => {
      const nwc = new NWC(nwcUrl);
      const invoice = "lnbc123456789";
      const event = await PaymentRequestEvent.create(nwc, invoice);
      const relay = event.relayToListenTo;
      expect(relay).toBe("wss://relay.getalby.com/v1");
    });
  });
});
