import { middlewares } from './middlewares.js';

describe('middlewares', () => {
  it('should work', () => {
    expect(middlewares()).toEqual('middlewares');
  })
})
