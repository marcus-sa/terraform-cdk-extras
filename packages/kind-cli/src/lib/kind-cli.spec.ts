import { kindCli } from './kind-cli';

describe('kindCli', () => {
  it('should work', () => {
    expect(kindCli()).toEqual('kind-cli');
  });
});
