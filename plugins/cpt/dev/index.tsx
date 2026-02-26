import { createDevApp } from '@backstage/dev-utils';
import { cptPlugin, EntityCPTContent } from '../src/plugin';

createDevApp()
  .registerPlugin(cptPlugin)
  .addPage({
    element: <EntityCPTContent />,
    title: 'Root Page',
    path: '/cpt',
  })
  .render();

