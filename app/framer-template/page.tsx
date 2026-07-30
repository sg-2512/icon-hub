import type { Metadata } from 'next'
import { SEARCHABLE_ICON_COUNT } from '../../data/library-catalog'
import FramerTemplateClient from './FramerTemplateClient'

export const metadata: Metadata = {
  title: 'ICON/FOLIO — Free Framer Template by IconSearch',
  description:
    'A dynamic, icon-first portfolio template with a searchable icon lab, live style controls, and playful editorial layouts.',
  alternates: {
    canonical: '/framer-template',
  },
  openGraph: {
    title: 'ICON/FOLIO — Free Framer Template',
    description:
      'A playful portfolio and icon playground, shared free by IconSearch.',
    url: '/framer-template',
    type: 'website',
  },
}

export default function FramerTemplatePage() {
  return (
    <FramerTemplateClient
      iconCount={SEARCHABLE_ICON_COUNT.toLocaleString('en-US')}
    />
  )
}
