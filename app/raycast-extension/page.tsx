import IntegrationPage from '../components/integrations/IntegrationPage'
import { createIntegrationMetadata, integrationCatalog } from '../components/integrations/integration-catalog'

const config = integrationCatalog['raycast-extension']
export const metadata = createIntegrationMetadata(config)

export default function RaycastExtensionPage() {
  return <IntegrationPage config={config} />
}
