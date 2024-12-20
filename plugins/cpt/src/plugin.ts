import {
  createPlugin,
  createComponentExtension,
} from '@backstage/core-plugin-api';

export const cptPlugin = createPlugin({
  id: 'cpt',
});

export const EntityCPTContent = cptPlugin.provide(
  createComponentExtension({
    name: 'EntityCPTContent',
    component: {
      lazy: () => import('./components/CPTComponent').then(m => m.CPTComponent),
    },
  }),
);
