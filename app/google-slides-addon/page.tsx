import IntegrationPage from '../components/integrations/IntegrationPage'
import { createIntegrationMetadata, integrationCatalog } from '../components/integrations/integration-catalog'

const config = integrationCatalog['google-slides-addon']
export const metadata = createIntegrationMetadata(config)

export default function GoogleSlidesAddonPage() {
  return <IntegrationPage config={config} />
}
