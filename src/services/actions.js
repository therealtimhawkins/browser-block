export const makeTransaction = Peer => {
  Peer.sendData(
    {
      action: 'TRANSACTION',
      id: Peer.$store.getters.id,
      body: {
        pairedNodeIds: Peer.$store.getters.pairedNodeIds,
        links: Peer.$store.getters.links,
        message: `Transaction sent from ID=${Peer.$store.getters.id}`
      },
      history: [Peer.$store.getters.id]
    },
    Peer.$store.getters.pairedNodes
  )
}

export const networkUpdate = Peer => {
  Peer.sendData(
    {
      action: 'NETWORK_UPDATE',
      id: Peer.$store.getters.id,
      body: {
        pairedNodeIds: Peer.$store.getters.pairedNodeIds,
        links: Peer.$store.getters.links
      }
    },
    Peer.$store.getters.pairedNodes
  )
}

export const transferPair = (Peer, connRequest) => {
  Peer.sendData(
    {
      action: 'TRANSFER_PAIR',
      id: this.$store.getters.id,
      body: {
        request: connRequest
      }
    },
    Peer.$store.getters.pairedNodes
  )
}
