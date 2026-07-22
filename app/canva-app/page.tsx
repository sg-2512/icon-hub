import IntegrationPage from '../components/integrations/IntegrationPage'
import { createIntegrationMetadata, integrationCatalog } from '../components/integrations/integration-catalog'

const config = integrationCatalog['canva-app']
export const metadata = createIntegrationMetadata(config)

export default function CanvaAppPage() {
  return <IntegrationPage config={config} />
}
