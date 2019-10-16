export const makeTransaction = Peer => {
  Peer.sendData({
    action: 'TRANSACTION',
    id: Peer.$store.getters.id,
    body: {
      pairedNodeIds: Peer.$store.getters.pairedNodeIds,
      links: Peer.$store.getters.links,
      message: `Transaction sent from ID=${Peer.$store.getters.id}`
    },
    history: [Peer.$store.getters.id]
  })
}
