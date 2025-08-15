import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-unistorage'

const pinia = createPinia()
pinia.use(createPersistedState)

export default pinia
