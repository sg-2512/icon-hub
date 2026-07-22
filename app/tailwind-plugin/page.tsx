import IntegrationPage from '../components/integrations/IntegrationPage'
import { createIntegrationMetadata, integrationCatalog } from '../components/integrations/integration-catalog'

const config = integrationCatalog['tailwind-plugin']
export const metadata = createIntegrationMetadata(config)

export default function TailwindPluginPage() {
  return <IntegrationPage config={config} />
}
