/** @typedef {import('pear-interface')} */ /* global Pear */
// Pear.updates(() => Pear.reload())


import b4a from 'b4a'
import Autobase from 'autobase'
import Corestore from 'corestore'
import Hyperswarm from 'hyperswarm'
import crypto from 'hypercore-crypto'
const {teardown, updates} = Pear

const swarm = new Hyperswarm()
const store = new Corestore("./storage")
await store.ready()
console.log('corestore ready')


const list = []

// const local = store.get({name: 'local-writer'})
// await local.ready()
// console.log('local corestore ready')
//
let autobase = null;
// let autobase = new Autobase(store, local.key)
// await autobase.ready()
// console.log('corestore ready')

function open(store) {
    console.log('opening store...', store.get('test'))
    return store.get('test')
}

async function apply(nodes, view, host) {
    for (const {value} of nodes) {
        if (value.addWriter()) {
            await host.addWriter(value.addWriter, {indexer: true})
            continue
        }
        await view.append(value)
    }
}

document.querySelector('#key-form').addEventListener('submit', async (ev) => {
    ev.preventDefault()
    console.log('submitted connection key')
    const connectionKey = document.querySelector('#connection-key').value
    autobase = new Autobase(store, connectionKey, {apply, open})
    await autobase.ready()

    console.log('autobase ready, writable? ', autobase.writable)
    const topic = autobase.key
    console.log('autobase connected to ',topic.toString('hex'))
    const discovery = swarm.join(topic, {server: true, client: true})
    discovery.flushed()
    console.log('discovered connection key and connected the swarm to the autobase topic')
    autobase.on('append', async () => {
        console.log('appending to autobase')
        // refresh frontend?
    })
    autobase.on('ready', async () => {
        console.log('autobase ready')
    })
    swarm.on('connection', (peer) => {
        console.log('swarming with peer', peer)
        store.replicate(peer)
    })

})

//
// teardown(() => swarm.destroy())
// updates(() => Pear.reload())

