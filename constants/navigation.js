import { Routes } from './routes.js'

export const PublicNavItems = Object.freeze([
  { title: 'Home', to: Routes.HOME },
  { title: 'Shop', to: Routes.PRODUCTS },
  { title: 'About', to: Routes.ABOUT },
  { title: 'Contact', to: Routes.CONTACT },
])

export const AdminNavItems = Object.freeze([
  { title: 'Dashboard', icon: 'mdi-view-dashboard', to: Routes.ADMIN_DASHBOARD },
  { title: 'Products', icon: 'mdi-hanger', to: Routes.ADMIN_PRODUCTS },
  { title: 'Categories', icon: 'mdi-shape', to: Routes.ADMIN_CATEGORIES },
  { title: 'Materials', icon: 'mdi-fabric', to: Routes.ADMIN_MATERIALS },
  { title: 'Inventory', icon: 'mdi-package-variant', to: Routes.ADMIN_INVENTORY },
  { title: 'Sales', icon: 'mdi-cart-check', to: Routes.ADMIN_SALES },
  { title: 'Customers', icon: 'mdi-account-group', to: Routes.ADMIN_CUSTOMERS },
  { title: 'Expenses', icon: 'mdi-cash-minus', to: Routes.ADMIN_EXPENSES },
  { title: 'Banners', icon: 'mdi-image-multiple', to: Routes.ADMIN_BANNERS },
  { title: 'Reports', icon: 'mdi-chart-bar', to: Routes.ADMIN_REPORTS },
  { title: 'Settings', icon: 'mdi-cog', to: Routes.ADMIN_SETTINGS },
])
