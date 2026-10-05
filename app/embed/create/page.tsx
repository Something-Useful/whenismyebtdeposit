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
      <EmbedCreate />
    </StaticPage>
  );
}
