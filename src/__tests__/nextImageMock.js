/* eslint-disable @next/next/no-img-element */
const React = require('react')
module.exports = ({ src = '', alt = '', ...rest }) => React.createElement('img', { src, alt, ...rest })

// Dummy test
describe('nextImageMock', () => {
  it('is a mock', () => {
    expect(true).toBe(true)
  })
})
