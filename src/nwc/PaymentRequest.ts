import { NDKEvent, NostrEvent } from "@nostr-dev-kit/ndk";
import { NWC } from "./Nwc";

export class PaymentRequestEvent extends NDKEvent {
  invoice: string;
  nwc: NWC;
  event: NDKEvent;

  private constructor(nwc: NWC, invoice: string, event: NostrEvent) {
    super(undefined, event);
    this.nwc = nwc;
    this.invoice = invoice;
    this.event = new NDKEvent(undefined, event);
  }

  static async create(
    nwcOrUrl: NWC | string,
    invoice: string
  ): Promise<PaymentRequestEvent> {
    let nwc: NWC;
    if (typeof nwcOrUrl === "string") {
      nwc = new NWC(nwcOrUrl);
    } else {
      nwc = nwcOrUrl;
    }
    const event = await nwc.makeNWCRequestEvent(invoice);
    return new PaymentRequestEvent(nwc, invoice, event);
  }

  get responseFilter() {
    return {
      kind: 23195,
      tags: [
        ["e", this.id],
        ["p", this.pubkey],
      ],
    };
  }

  getResponseFilter() {
    return this.responseFilter;
  }

  get relayToListenTo() {
    return this.nwc.relayUrl;
  }
}
