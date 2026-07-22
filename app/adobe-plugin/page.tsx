import IntegrationPage from '../components/integrations/IntegrationPage'
import { createIntegrationMetadata, integrationCatalog } from '../components/integrations/integration-catalog'

const config = integrationCatalog['adobe-plugin']
export const metadata = createIntegrationMetadata(config)

export default function AdobePluginPage() {
  return <IntegrationPage config={config} />
}
