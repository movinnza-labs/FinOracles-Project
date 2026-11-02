import * as migration_20261102_051244_initial from './20261102_051244_initial';

export const migrations = [
  {
    up: migration_20261102_051244_initial.up,
    down: migration_20261102_051244_initial.down,
    name: '20261102_051244_initial'
  },
];
