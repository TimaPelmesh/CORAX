import { describe, expect, it } from 'vitest'
import type { NetworkTopology } from '../api'
import { CORAX_NODE_ID, layoutBounds, layoutTopology } from './networkMapLayout'

function sampleTopo(): NetworkTopology {
  return {
    nodes: [
      {
        id: 'network_device:1',
        kind: 'network_device',
        ref_id: 1,
        label: 'gw-core',
        device_type: 'router',
        ip_address: '192.168.1.1',
        vendor: 'Cisco',
        snmp_status: 'ok',
        role: 'gateway',
      },
      {
        id: 'network_device:2',
        kind: 'network_device',
        ref_id: 2,
        label: 'sw-access',
        device_type: 'switch',
        ip_address: '192.168.1.10',
        vendor: 'Cisco',
        snmp_status: 'ok',
        role: 'switch',
      },
      {
        id: 'network_device:3',
        kind: 'network_device',
        ref_id: 3,
        label: 'DNS · 192.168.1.2',
        device_type: 'server',
        ip_address: '192.168.1.2',
        vendor: null,
        snmp_status: 'unknown',
        role: 'dns',
      },
      {
        id: 'computer:1',
        kind: 'computer',
        ref_id: 1,
        label: 'pc-01',
        device_type: 'computer',
        ip_address: '192.168.1.50',
        vendor: null,
        snmp_status: 'online',
      },
    ],
    edges: [
      {
        id: 'link:corax-gw',
        source: CORAX_NODE_ID,
        target: 'network_device:1',
        link_type: 'lan',
        local_port: null,
        remote_port: null,
        confidence: 0.45,
      },
      {
        id: 'link:1',
        source: 'network_device:1',
        target: 'network_device:2',
        link_type: 'trace',
        local_port: null,
        remote_port: null,
        confidence: 0.62,
      },
      {
        id: 'link:2',
        source: 'network_device:2',
        target: 'computer:1',
        link_type: 'fdb',
        local_port: 'Gi1/0/8',
        remote_port: null,
        confidence: 0.75,
      },
    ],
  }
}

function manySwitches(count: number): NetworkTopology {
  const nodes: NetworkTopology['nodes'] = []
  const edges: NetworkTopology['edges'] = []
  for (let i = 1; i <= count; i++) {
    const id = `network_device:${i}`
    nodes.push({
      id,
      kind: 'network_device',
      ref_id: i,
      label: `sw-${i}`,
      device_type: 'switch',
      ip_address: `192.168.1.${i + 10}`,
      vendor: null,
      snmp_status: 'ok',
      role: 'switch',
    })
    edges.push({
      id: `link:c-${i}`,
      source: CORAX_NODE_ID,
      target: id,
      link_type: 'lan',
      local_port: null,
      remote_port: null,
      confidence: 0.4,
    })
  }
  return { nodes, edges }
}

describe('layoutTopology', () => {
  it('puts Corax above the gateway and DNS, switch below core', () => {
    const { nodes, edges } = layoutTopology(sampleTopo(), new Set())
    const corax = nodes.find((n) => n.id === CORAX_NODE_ID)
    const router = nodes.find((n) => n.id === 'network_device:1')
    const dns = nodes.find((n) => n.id === 'network_device:3')
    const sw = nodes.find((n) => n.id === 'network_device:2')
    const pc = nodes.find((n) => n.id === 'computer:1')
    expect(corax?.data.deviceType).toBe('corax')
    expect(corax?.position.y).toBeLessThan(router?.position.y ?? 9999)
    expect(corax?.position.y).toBeLessThan(dns?.position.y ?? 9999)
    expect(router?.position.y).toBeLessThan(sw?.position.y ?? 9999)
    expect(pc).toBeTruthy()
    expect(edges.some((e) => e.source === CORAX_NODE_ID && e.target === 'network_device:1')).toBe(true)
    const trace = edges.find((e) => e.source === 'network_device:1' && e.target === 'network_device:2')
    expect(trace?.label).toBe('трасса')
  })

  it('injects a Corax hub when the API omitted it', () => {
    const topo = sampleTopo()
    topo.edges = topo.edges.filter((e) => e.source !== CORAX_NODE_ID)
    const { nodes } = layoutTopology(topo, new Set())
    expect(nodes.some((n) => n.id === CORAX_NODE_ID)).toBe(true)
  })

  it('keeps a wide switch farm from stretching without bound', () => {
    const { nodes } = layoutTopology(manySwitches(24), new Set())
    const switches = nodes.filter((n) => n.id.startsWith('network_device:'))
    expect(switches).toHaveLength(24)
    const { width } = layoutBounds(switches)
    expect(width).toBeLessThan(8 * 200)
  })
})
