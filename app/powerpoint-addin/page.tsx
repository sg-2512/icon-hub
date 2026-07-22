import IntegrationPage from '../components/integrations/IntegrationPage'
import { createIntegrationMetadata, integrationCatalog } from '../components/integrations/integration-catalog'

const config = integrationCatalog['powerpoint-addin']
export const metadata = createIntegrationMetadata(config)

export default function PowerPointAddinPage() {
  return <IntegrationPage config={config} />
}
