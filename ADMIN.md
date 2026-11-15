# Thash Attire — Admin

Sign in at `/admin/login`. The account must have `role = 'admin'` on `profiles`.

Admin data lives in Supabase. The public homepage does not use most of it yet. See **Website connection** at the bottom.

## Add data in this order

1. **Categories** — `/admin/categories`
   - Name, description, image URL, sort order.
   - A product cannot be saved without a category.

2. **Materials** — `/admin/materials`
   - **Product materials:** fabric and trims used on a dress.
   - **Common materials:** packaging and shared items (`/admin/materials/common`).
   - Fields: name, unit (meter, piece, kg, roll, yard), supplier, minimum stock.
   - Stock and unit cost come from **Purchases**, not from the material form.

3. **Purchases** — `/admin/materials/purchases`
   - Record quantity, unit cost, date, supplier.
   - This raises stock and updates the average unit cost used in product costing.

4. **Products** — `/admin/products/create`
   - Name, SKU, category, description, status.
   - Images (up to 8) and an optional video.
   - Materials: pick a product material and the quantity needed for one piece. Cost is quantity × average unit cost.
   - Stitching, packaging, and other cost. Total cost and margin update as you type.
   - Selling price and target margin.
   - Stock and low-stock threshold.
   - **Showcase model** is on by default. That product stays hidden from the public catalog until you turn it off.
   - Featured and Trending flags are saved. The current homepage does not use them.
   - Optional: create the first showcase sample. That records sample cost and marks the sample as already created.

5. **Offers** — `/admin/offers/create`
   - Combo only: pick existing products, quantities, and one combo price.
   - Used when staff create an order as “Combo Offer”. The homepage does not show offers.

6. **Customers** — `/admin/customers`
   - Name, phone, email, address, notes.
   - A customer who signs up on the site is linked by phone or email when they place a real catalog order.

7. **Orders** — `/admin/orders/create`
   - Pick or create a customer.
   - Normal product or combo offer.
   - Quantity, discount, payment method, payment status, delivery date, address, notes.
   - Open an order to move its status. The customer order panel reads these records.

8. **Expenses** — `/admin/expenses`
   - Category, description, amount, date. Used in reports only.

9. **Banners** — `/admin/banners`
   - Image, title, subtitle, button, dates, order, active/inactive.
   - Active banners replace the homepage hero photos.

10. **Reviews** — `/admin/reviews`
    - Quote, customer name, city, sort order.
    - Only active reviews show. If none are active, the homepage reviews block is hidden.

11. **Inventory** — `/admin/inventory`
    - Read-only stock for products, product materials, and common materials.
    - Change product stock on the product form. Change material stock by recording a purchase.

12. **Reports** — `/admin/reports`
    - Sales, profit, and expenses from orders and expense entries.

13. **Settings** — `/admin/settings`
    - The form is on screen only. Save does not write to the database.
    - WhatsApp number and Instagram URL come from `.env`, not from Settings.

## What each screen is for

- **Dashboard:** counts, recent orders, low stock, sales chart.
- **Product detail:** view cost, materials, stock, then edit or duplicate.
- **Duplicate:** Products → open a product → duplicate. SKU gets `-COPY`, stock starts at 0, showcase sample can be created again.

## Website connection

The homepage reads admin data:

- **Hero photos** — active banners whose dates include today. If none exist, the page keeps the standby photos.
- **Lookbook** — up to 3 products marked **Featured**. Featured means “show this dress in the lookbook.” If none are featured, the 3 newest published products are used.
- **Trending** — dresses marked Trending. The row is hidden when none are marked.
- **Offers** — active combo offers inside their dates. The block is hidden when there is no offer. Add set puts those dresses in the bag at the combo price.
- **Reviews** — added in **Admin → Reviews**. The reviews block is hidden when none are active.
- **Settings** — the form on that page is not saved. WhatsApp, Instagram, and the contact email on the shop come from `.env`.
- **All products and search** — the same published products. A search result opens that dress.
- **Add to cart / Buy now** — uses the real product id and selling price.
- **Checkout** — a signed-in customer places an order that shows in **Orders**. Guests are asked to sign in first. The order API does not accept a guest order.
- **Orders drawer** — that customer’s saved orders.

A product is published only when status is **Active** and **Showcase model** is off.

Before reviews or combo checkout work on an existing database, run `supabase/storefront_content.sql` once in the Supabase SQL Editor.
