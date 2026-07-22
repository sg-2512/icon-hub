import IntegrationPage from '../components/integrations/IntegrationPage'
import { createIntegrationMetadata, integrationCatalog } from '../components/integrations/integration-catalog'

const config = integrationCatalog['webflow-extension']
export const metadata = createIntegrationMetadata(config)

export default function WebflowExtensionPage() {
  return <IntegrationPage config={config} />
}
