import { Routes } from './routes.js'

export const PublicNavItems = Object.freeze([
  { title: 'Home', to: Routes.HOME },
  { title: 'Shop', to: Routes.PRODUCTS },
  { title: 'About', to: Routes.ABOUT },
  { title: 'Contact', to: Routes.CONTACT },
])

export const AdminNavItems = Object.freeze([
  {
    title: 'Dashboard',
    icon: 'mdi-view-dashboard-outline',
    to: Routes.ADMIN_DASHBOARD,
  },
  {
    title: 'Products',
    icon: 'mdi-hanger',
    to: Routes.ADMIN_PRODUCTS,
    children: [
      { title: 'All Products', icon: 'mdi-format-list-bulleted', to: Routes.ADMIN_PRODUCTS },
      { title: 'Add Product', icon: 'mdi-plus-circle-outline', to: Routes.ADMIN_PRODUCT_CREATE },
      { title: 'Categories', icon: 'mdi-shape-outline', to: Routes.ADMIN_CATEGORIES },
    ],
  },
  {
    title: 'Inventory',
    icon: 'mdi-package-variant-closed',
    to: Routes.ADMIN_INVENTORY,
  },
  {
    title: 'Materials',
    icon: 'mdi-scissors-cutting',
    to: Routes.ADMIN_MATERIALS,
    children: [
      { title: 'All Materials', icon: 'mdi-format-list-bulleted', to: Routes.ADMIN_MATERIALS },
      { title: 'Purchases', icon: 'mdi-cart-outline', to: Routes.ADMIN_MATERIAL_PURCHASES },
    ],
  },
  {
    title: 'Customers',
    icon: 'mdi-account-group-outline',
    to: Routes.ADMIN_CUSTOMERS,
  },
  {
    title: 'Sales',
    icon: 'mdi-cart-check',
    to: Routes.ADMIN_SALES,
  },
  {
    title: 'Expenses',
    icon: 'mdi-cash-minus',
    to: Routes.ADMIN_EXPENSES,
  },
  {
    title: 'Banners',
    icon: 'mdi-image-multiple-outline',
    to: Routes.ADMIN_BANNERS,
  },
  {
    title: 'Reports',
    icon: 'mdi-chart-bar',
    to: Routes.ADMIN_REPORTS,
  },
  {
    title: 'Settings',
    icon: 'mdi-cog-outline',
    to: Routes.ADMIN_SETTINGS,
  },
])
