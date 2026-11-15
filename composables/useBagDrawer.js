const bagOpen = ref(false)

export function useBagDrawer() {
  function openBag() {
    bagOpen.value = true
  }

  function closeBag() {
    bagOpen.value = false
  }

  return { bagOpen, openBag, closeBag }
}
