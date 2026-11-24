import * as migration_20261102_061756_initial from './20261102_061756_initial';
import * as migration_20261120_121017_seo_fields from './20261120_121017_seo_fields';
import * as migration_20261120_121500_seo_content from './20261120_121500_seo_content';
import * as migration_20261123_042000_seo_content_expansion from './20261123_042000_seo_content_expansion';

// Content migrations use the Local API, which reads every column in the current config, so all
// schema changes for the SEO update live in 20261120_121017_seo_fields and run before them.
export const migrations = [
  {
    up: migration_20261102_061756_initial.up,
    down: migration_20261102_061756_initial.down,
    name: '20261102_061756_initial',
  },
  {
    up: migration_20261120_121017_seo_fields.up,
    down: migration_20261120_121017_seo_fields.down,
    name: '20261120_121017_seo_fields',
  },
  {
    up: migration_20261120_121500_seo_content.up,
    down: migration_20261120_121500_seo_content.down,
    name: '20261120_121500_seo_content',
  },
  {
    up: migration_20261123_042000_seo_content_expansion.up,
    down: migration_20261123_042000_seo_content_expansion.down,
    name: '20261123_042000_seo_content_expansion',
  },
];
