import { SEARCHABLE_ICON_COUNT } from '../../data/library-catalog'
import { createPageMetadata } from '../../lib/seo'
import FramerTemplateClient from './FramerTemplateClient'

export const metadata = createPageMetadata({
  title: 'ICON/FOLIO — Free Framer Template by IconSearch',
  description:
    'A dynamic, icon-first portfolio template with a searchable icon lab, live style controls, and playful editorial layouts.',
  path: '/framer-template',
})

export default function FramerTemplatePage() {
  return (
    <FramerTemplateClient
      iconCount={SEARCHABLE_ICON_COUNT.toLocaleString('en-US')}
    />
  )
}
