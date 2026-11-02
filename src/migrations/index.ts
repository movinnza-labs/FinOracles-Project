import * as migration_20261102_060202_initial from './20261102_060202_initial';

export const migrations = [
  {
    up: migration_20261102_060202_initial.up,
    down: migration_20261102_060202_initial.down,
    name: '20261102_060202_initial'
  },
];
