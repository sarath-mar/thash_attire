# Thash Attire

Premium women's clothing brand — product showcase website with admin panel.

## Tech Stack

- **Frontend:** Nuxt 3, Vue 3, Vuetify 3, SCSS
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **State:** Nuxt composables (no Pinia)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in your Supabase credentials.

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run **`supabase/schema.sql`** in the SQL Editor
3. Create storage buckets: `products`, `product-videos`, `materials`, `banners`
4. Make one user an admin. Shop sign-ups stay `customer` and cannot open `/admin/login`.

### Make a user an admin

1. In the Supabase dashboard, open **Authentication → Users → Add user**.
2. If that shows **Database error creating new user**, open the **SQL Editor** and run the block below, then create the user again.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, COALESCE(NEW.email, ''), 'customer')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT INSERT, SELECT ON TABLE public.profiles TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.mark_storefront_customer() TO supabase_auth_admin;
```

3. Enter the admin email and a password, and turn on **Auto Confirm User**. The new user is still a customer.
4. Open **SQL Editor** and run this. The SQL Editor runs as the database owner, so it can change the role. Replace the email with the one you just created.

```sql
INSERT INTO profiles (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'your-admin@email.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin', email = EXCLUDED.email;
```

5. Sign in at `http://localhost:3000/admin/login` with that email and password.

A customer who already signed up on the shop can be promoted with the same SQL. Admin login uses a password, so set one for that user under **Authentication → Users** before they try `/admin/login`.

### 4. Run development server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Build Phases

- [x] Phase 1: Foundation + Public website + Admin login
- [ ] Phase 2: Admin layout, dashboard, product CRUD
- [ ] Phase 3: Categories, Materials, Inventory
- [ ] Phase 4: Sales, Customers, Expenses
- [ ] Phase 5: Banners, Reports, Settings, Export
