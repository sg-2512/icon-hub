import IntegrationPage from '../components/integrations/IntegrationPage'
import { createIntegrationMetadata, integrationCatalog } from '../components/integrations/integration-catalog'

const config = integrationCatalog['storybook-addon']
export const metadata = createIntegrationMetadata(config)

export default function StorybookAddonPage() {
  return <IntegrationPage config={config} />
}
