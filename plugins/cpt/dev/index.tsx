import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { cptPlugin, CptPage } from '../src/plugin';

createDevApp()
  .registerPlugin(cptPlugin)
  .addPage({
    element: <CptPage />,
    title: 'Root Page',
    path: '/cpt',
  })
  .render();
