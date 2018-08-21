export default {
  apis: [
    {
      path: '/calls',
      to: '/api/server/get_app_node_graph',
      method: 'post',
      params: [
        {
          name: 'time_type',
          value: '$time',
          default: 4
        },
        {
          name: 'node_name_list',
          value: '$apps',
          default: []
        },
        {
          name: 'version',
          value: '$channel',
          default: 1
        }
      ],
      fields: [
      ],
      converts: {
        default: (input) => {
          let result = {
            nodes: [],
            links: []
          }
          input.list.forEach((n) => {
            result.nodes.push({
              id: n.id,
              name: n.node_name,
              level: n.node_level - 1,
              order: n.node_pos
            })
            n.next_nodes.forEach((t, i) => {
              result.links.push({
                source: n.node_name,
                target: t.node_name,
                calls: t.call_count,
                time: t.average_time,
                healthy: t.success_rate
              })
            })
          })
          return result
        } // root
      }
    }
  ]
}
