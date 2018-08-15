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
      ]
    }
  ]
}
