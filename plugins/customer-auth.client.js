export default defineNuxtPlugin(() => {
  const { initCustomerAuth } = useCustomerAuth()
  initCustomerAuth()
})
