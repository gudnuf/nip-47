import { nip04, nip19, finishEvent } from "nostr-tools";
import { NDKEvent, NostrEvent } from "@nostr-dev-kit/ndk";

const Kinds = {
  NwcInfo: 13194,
  NwcRequest: 23194,
  NwcResponse: 23195,
};

// from alby/js-sdk -- NostrWebLNOptions
interface NWCOptions {
  relayUrl: string;
  walletPubkey: string;
  secret: string;
}

// much of this comes from alby/js-sdk/src/webln/NostrWebLNProvider.ts
export class NWC {
  // relay: Relay;
  relayUrl: string;
  secret: string;
  walletPubkey: string;
  options: NWCOptions;
  subscribers: Record<string, (payload: unknown) => void>;

  // from nostr-tools/nip47
  static parseWalletConnectUrl(walletConnectUrl: string) {
    walletConnectUrl = walletConnectUrl
      .replace("nostrwalletconnect://", "http://")
      .replace("nostr+walletconnect://", "http://"); // makes it possible to parse with URL in the different environments (browser/node/...)
    const url = new URL(walletConnectUrl);
    const options = {} as NWCOptions;
    options.walletPubkey = url.host;
    const secret = url.searchParams.get("secret");
    const relayUrl = url.searchParams.get("relay");
    if (secret) {
      options.secret = secret;
    }
    if (relayUrl) {
      options.relayUrl = relayUrl;
    }
    return options;
  }

  constructor(nostrWalletConnectUrl: string) {
    this.options = NWC.parseWalletConnectUrl(nostrWalletConnectUrl);
    if (
      !this.options.relayUrl ||
      !this.options.secret ||
      !this.options.walletPubkey
    ) {
      throw new Error(
        "invalid connection string. Requires relay, secret, and walletPubkey"
      );
    }
    this.relayUrl = this.options.relayUrl;

    this.secret = (
      this.options.secret.toLowerCase().startsWith("nsec")
        ? nip19.decode(this.options.secret).data
        : this.options.secret
    ) as string;

    this.walletPubkey = (
      this.options.walletPubkey.toLowerCase().startsWith("npub")
        ? nip19.decode(this.options.walletPubkey).data
        : this.options.walletPubkey
    ) as string;
    this.subscribers = {};

    if (globalThis.WebSocket === undefined) {
      console.error(
        "WebSocket is undefined. Make sure to `import websocket-polyfill` for nodejs environments"
      );
    }
  }

  async makeNWCRequestEvent(invoice: string) {
    if (!invoice) throw new Error("invoice is required");

    const content = {
      method: "pay_invoice",
      params: {
        invoice,
      },
    };

    const encryptedContent = await nip04.encrypt(
      this.secret,
      this.walletPubkey,
      JSON.stringify(content)
    );

    const eventTemplate = {
      kind: Kinds.NwcRequest,
      created_at: Math.round(Date.now() / 1000),
      content: encryptedContent,
      tags: [["p", this.walletPubkey]],
    };

    return finishEvent(eventTemplate, this.secret) as NostrEvent;
  }
}
