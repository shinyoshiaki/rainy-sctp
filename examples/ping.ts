import { createSocket } from "dgram";

import { range } from "lodash";
import { sleep } from "../src/utils";
import { createUdpTransport } from "../src/transport";
import { SCTP, WEBRTC_PPID, SCTP_STATE } from "../src";

(async () => {
  const transport = createUdpTransport(createSocket("udp4"), {
    port: 5678,
    address: "127.0.0.1",
  });

  const sctp = SCTP.client(transport);
  sctp.onRecieve = (...args) => {
    console.log(args[2].toString());
    console.log(args);
  };
  await sctp.start(5000);
  await waitForOutcome(sctp);
  let sec = 0;
  setInterval(
    () => sctp.send(0, WEBRTC_PPID.STRING, Buffer.from("ping " + sec++)),
    1000
  );
})();

async function waitForOutcome(sctp: SCTP) {
  const final = [SCTP_STATE.ESTABLISHED];
  for (const _ of range(100)) {
    if (final.includes(sctp.associationState)) {
      break;
    }

    await sleep(100);
  }
}
