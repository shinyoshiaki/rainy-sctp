import { SCTP } from "../src/sctp";
import { createSocket } from "dgram";
import { SCTP_STATE, WEBRTC_STRING } from "../src/const";
import { range } from "lodash";
import { sleep } from "../src/utils";
import { createUdpTransport } from "../src/transport";

(async () => {
  const socket = createSocket("udp4");
  socket.bind(5678);
  const transport = createUdpTransport(socket);

  const sctp = SCTP.server(transport);
  sctp.onRecieve = (...args) => {
    console.log(args[2].toString());
    console.log(args);
  };
  await sctp.start(5000);
  await waitForOutcome(sctp);
  setInterval(() => sctp.send(0, WEBRTC_STRING, Buffer.from("pong")), 1000);
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
