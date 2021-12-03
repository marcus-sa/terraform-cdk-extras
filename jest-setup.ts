import 'cdktf/lib/testing/adapters/jest';
import { Testing } from 'cdktf';

Testing.setupJest();

test.linux = (name: string, fn?: jest.ProvidesCallback, timeout?: number) => {
  if (process.platform === 'linux') {
    it(name, fn, timeout);
  } else {
    it.skip(name, fn, timeout);
  }
};
