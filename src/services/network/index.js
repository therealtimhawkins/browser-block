import Peer from "peerjs";

let peer

export const initPeer = (id) => {
  peer = new Peer(id);

  return peer
}
