import { describe, expect, test } from "@jest/globals";
import { NWC } from "./Nwc";
import "websocket-polyfill";
import { nip04 } from "nostr-tools";
import * as crypto from "crypto";

globalThis.crypto = crypto as any;

describe("NWC", () => {
  const nwcUrl =
    "nostr+walletconnect://69effe7b49a6dd5cf525bd0905917a5005ffe480b58eeb8e861418cf3ae760d9?relay=wss://relay.getalby.com/v1&secret=92045836063d176fcb688621bf670f56ae5a0443c9c9aff5436280658ac56028&lud16=daim@getalby.com";

  describe("parseWalletConnectUrl", () => {
    test("should return the correct url options", () => {
      const options = NWC.parseWalletConnectUrl(nwcUrl);

      expect(options).toStrictEqual({
        walletPubkey:
          "69effe7b49a6dd5cf525bd0905917a5005ffe480b58eeb8e861418cf3ae760d9",
        secret:
          "92045836063d176fcb688621bf670f56ae5a0443c9c9aff5436280658ac56028",
        relayUrl: "wss://relay.getalby.com/v1",
      });
    });
  });

  const nwc = new NWC(nwcUrl);
  describe("constructor", () => {
    test("should set the correct options on the NWC class", () => {
      expect(nwc.options).toStrictEqual({
        walletPubkey:
          "69effe7b49a6dd5cf525bd0905917a5005ffe480b58eeb8e861418cf3ae760d9",
        secret:
          "92045836063d176fcb688621bf670f56ae5a0443c9c9aff5436280658ac56028",
        relayUrl: "wss://relay.getalby.com/v1",
      });

      expect(nwc.relayUrl).toBe("wss://relay.getalby.com/v1");
      expect(nwc.walletPubkey).toBe(
        "69effe7b49a6dd5cf525bd0905917a5005ffe480b58eeb8e861418cf3ae760d9"
      );
      expect(nwc.secret).toBe(
        "92045836063d176fcb688621bf670f56ae5a0443c9c9aff5436280658ac56028"
      );
    });
  });

  describe("makeNWCRequestEvent", () => {
    const invoice = "lnbc123456789";

    test("should return a valid event", async () => {
      const event = await nwc.makeNWCRequestEvent(invoice);
      expect(event.kind).toBe(23194);
      expect(event.tags).toStrictEqual([
        [
          "p",
          "69effe7b49a6dd5cf525bd0905917a5005ffe480b58eeb8e861418cf3ae760d9",
        ],
      ]);
      const expectedContent = {
        method: "pay_invoice",
        params: {
          invoice,
        },
      };

      const decryptedContent = await nip04.decrypt(
        nwc.secret,
        nwc.walletPubkey,
        event.content
      );
      expect(decryptedContent).toStrictEqual(JSON.stringify(expectedContent));
    });

    test("should return a signed event", async () => {
      const event = await nwc.makeNWCRequestEvent(invoice);

      expect(event.sig).toBeDefined();
    });

    test("should throw an error if no invoice is provided", async () => {
      await expect(nwc.makeNWCRequestEvent("")).rejects.toThrow();
    });
  });
});
