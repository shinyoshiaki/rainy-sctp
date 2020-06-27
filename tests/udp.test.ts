import { createSocket } from "dgram";
import { createUdpTransport } from "../src/transport";

import { range } from "lodash";

import { sleep } from "../src/helper";
import { SCTP, WEBRTC_PPID, SCTP_STATE } from "../src";

test("udp", async (done) => {
  const port = 5555;

  const socket = createSocket("udp4");
  socket.bind(port);
  const server = SCTP.server(createUdpTransport(socket));
  server.onRecieve = (_, __, data) => {
    expect(data.toString()).toBe("ping");
    server.send(0, WEBRTC_PPID.STRING, Buffer.from("pong"));
  };

  const client = SCTP.client(
    createUdpTransport(createSocket("udp4"), {
      port,
      address: "127.0.0.1",
    })
  );
  client.onRecieve = (_, __, data) => {
    expect(data.toString()).toBe("pong");
    done();
  };

  await Promise.all([client.start(5000), server.start(5000)]);
  await Promise.all([waitForOutcome(client), waitForOutcome(server)]);

  client.send(0, WEBRTC_PPID.STRING, Buffer.from("ping"));
});

async function waitForOutcome(sctp: SCTP) {
  for (const _ of range(100)) {
    if (sctp.associationState === SCTP_STATE.ESTABLISHED) {
      break;
    }

    await sleep(100);
  }
}
