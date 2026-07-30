import IntegrationPage from '../components/integrations/IntegrationPage'
import { createIntegrationMetadata, integrationCatalog } from '../components/integrations/integration-catalog'

const config = integrationCatalog['penpot-plugin']
export const metadata = createIntegrationMetadata(config)

export default function PenpotPluginPage() {
  return <IntegrationPage config={config} />
}
