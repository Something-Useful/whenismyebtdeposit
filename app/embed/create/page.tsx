import type { Metadata } from 'next';
import { StaticPage } from '@/components/StaticPage';
import { EmbedCreate } from '@/components/EmbedCreate';

export const metadata: Metadata = {
  title: 'Create your embed',
  description:
    'Generate a one-line snippet that adds the EBT deposit calculator to your website.',
};

export default function EmbedCreatePage() {
  return (
    <StaticPage title="Create your embed">
      <p style={{ margin: '0 0 28px', fontSize: 16.5, lineHeight: 1.55 }}>
        Answer two questions, paste the snippet into your site, and
        you&rsquo;re done.
      </p>
      <EmbedCreate />
    </StaticPage>
  );
}
