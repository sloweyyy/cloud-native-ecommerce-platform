// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';

export const REPO_URL = 'https://github.com/sloweyyy/cloud-native-ecommerce-platform';

// https://astro.build/config
export default defineConfig({
  site: 'https://cloud-native-ecommerce-platform.vercel.app',
  integrations: [
    // mermaid must be registered BEFORE starlight so ```mermaid fences are turned
    // into <pre class="mermaid"> before Expressive Code treats them as code blocks.
    mermaid({
      theme: 'default',
      autoTheme: true,
      mermaidConfig: {
        flowchart: { curve: 'basis', htmlLabels: true },
        sequence: { mirrorActors: false, showSequenceNumbers: true },
      },
    }),
    starlight({
      title: 'Cloud-Native E-Commerce',
      description:
        'Engineering documentation for a .NET 10 microservices e-commerce platform: Clean Architecture services, CQRS, gRPC, RabbitMQ, Ocelot, Kubernetes, Istio and Terraform on AWS.',
      logo: { src: './src/assets/logo.svg', replacesTitle: false },
      favicon: '/favicon.svg',
      social: [{ icon: 'github', label: 'GitHub', href: REPO_URL }],
      editLink: { baseUrl: `${REPO_URL}/edit/main/website/` },
      lastUpdated: false,
      customCss: [
        '@fontsource-variable/inter',
        '@fontsource-variable/jetbrains-mono',
        './src/styles/custom.css',
      ],
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
      sidebar: [
        {
          label: 'Start here',
          items: [
            { label: 'Overview', link: '/' },
            { slug: 'getting-started' },
            { slug: 'known-gaps' },
          ],
        },
        {
          label: 'Architecture',
          items: [{ slug: 'architecture' }, { slug: 'request-flows' }, { slug: 'api-gateway' }],
        },
        {
          label: 'Services',
          items: [
            { slug: 'services/catalog' },
            { slug: 'services/basket' },
            { slug: 'services/discount' },
            { slug: 'services/ordering' },
          ],
        },
        {
          label: 'Building blocks',
          items: [
            { slug: 'building-blocks/mediator' },
            { slug: 'building-blocks/logging' },
            { slug: 'building-blocks/event-bus' },
          ],
        },
        {
          label: 'Infrastructure',
          items: [
            { slug: 'infrastructure/docker-compose' },
            { slug: 'infrastructure/kubernetes' },
            { slug: 'infrastructure/service-mesh' },
            { slug: 'infrastructure/aws' },
          ],
        },
        {
          label: 'Operations',
          items: [{ slug: 'observability' }, { slug: 'ci-cd' }, { slug: 'testing' }],
        },
        {
          label: 'Frontend',
          items: [{ slug: 'micro-frontends' }],
        },
        {
          label: 'Project',
          items: [{ slug: 'roadmap' }],
        },
      ],
    }),
  ],
});
