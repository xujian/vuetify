export default {
  apis: [
    {
      path: '/calls',
      to: '/questions',
      method: 'get',
      data: [{
        name: 'uid',
        value: '$id'
      }],
      fields: [
      ]
    }
  ]
}
