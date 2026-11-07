GOAL: Buyers and Sellers on one site. Sellers post products, Buyers browse, add to cart, checkout, pay with Paynow. Admin oversees everything. Confirmation emails go to Buyer + Seller + Admin.

---

1. ROLES & USERS
Use my existing Supabase Auth users + profiles table. Do not create a new auth system.
- Add columns to profiles if missing: full_name, phone, role, shop_name, shop_location, shop_description
- role = buyer / seller / admin
- On my existing signup page, just ADD a Role selector: [ Buyer | Seller ]. If Seller is chosen, show 2 extra fields: Shop Name, Shop Location. Save that to profiles. If user signs up with Google, default role = buyer, and let them upgrade to Seller later from a "Become a Seller" button on their profile/dashboard.
- Admin is me - I will set my own profile role to admin manually in Supabase.

2. DATABASE - Give me full SQL for my existing Supabase project
Create these tables with RLS enabled, without deleting existing tables:

products:
id (uuid PK, default gen_random_uuid()), seller_id (uuid FK to profiles.id), title (text), description (text), price (numeric), stock (int), category (text), image_url (text), location (text), delivery_options (text[]), is_active (boolean default true), created_at (timestamptz default now())

orders:
id (uuid PK), buyer_id (uuid FK profiles), seller_id (uuid FK profiles), total (numeric), status (text default 'pending' - pending/paid/cancelled/delivered), delivery_address (text), city (text), delivery_method (text - Pickup/Delivery), phone (text), buyer_name (text), paynow_reference (text), paynow_pollurl (text), created_at

order_items:
id (uuid PK), order_id (uuid FK orders.id), product_id (uuid FK products.id), quantity (int), price (numeric)

RLS Rules:
- products: Anyone (anon + authenticated) can SELECT where is_active = true. Seller can INSERT/UPDATE/DELETE only where seller_id = auth.uid(). Admin can do all.
- orders: Buyer can SELECT where buyer_id = auth.uid(). Seller can SELECT where seller_id = auth.uid(). Admin can SELECT all. Authenticated can INSERT their own orders.
- order_items: Same access as parent order.
- Also create Supabase Storage bucket 'product-images' public for product photos.

3. PAGES TO BUILD - Keep my current design/style, just add these pages

PUBLIC / BUYER:
- / (Update existing homepage to Marketplace Homepage): Hero banner, search bar, category filter (Electronics, Fashion, Home, Beauty, Food, Other), grid of ALL products where is_active = true from ALL sellers. Each card: image, title, price, shop name, location, Add to Cart button.
- /product/[id]: Full product page - large image, title, price, description, stock status, category, seller shop name + location, quantity selector, Add to Cart, Buy Now (goes to cart/checkout)
- /cart: Cart page - list items, product image, price, quantity +/- , remove, subtotal, delivery estimate, total, Checkout button. Cart must persist in localStorage, and cart icon in header must show count everywhere.
- /checkout: CHECKOUT FORM - Full Name, Phone, Email, Delivery Address, City, Delivery Method radio (Pickup / Delivery), Order Summary, Pay with Paynow button (EcoCash / OneMoney / Card). On submit: create order + order_items in Supabase with status pending, then call Paynow create API, then redirect buyer to Paynow browserurl.

SELLER DASHBOARD:
- /dashboard/seller: Protected - only role=seller or admin. Show stats: Total Products, Total Orders, Total Earnings (paid orders), Low Stock alert. Tabs/links to Products, Add Product, Orders.
- /dashboard/seller/products: Table of MY products only. Columns: Image, Title, Price, Stock, Category, Active, Edit, Delete, Toggle Active.
- /dashboard/seller/add-product: PRODUCT FORM - Product Name, Category dropdown, Price, Stock, Description (textarea), Photo Upload (upload to Supabase Storage 'product-images', save URL), Location, Delivery Options checkboxes (Pickup, Delivery in Gweru, Nationwide). Validation: all required except description. On submit insert into products with seller_id = current user.
- /dashboard/seller/edit-product/[id]: Same form pre-filled, only owner can edit.
- /dashboard/seller/orders: List orders where seller_id = me. Show: Order ID, Buyer Name, Phone, Product(s), Quantity, Total, Status, Delivery Address, Date. Button: Mark as Delivered.

ADMIN DASHBOARD:
- /dashboard/admin: Protected - only role=admin. Show stats: Total Users, Total Sellers, Total Products, Total Orders, Total Revenue. Tables: All Sellers (suspend/activate), All Products (deactivate/activate), All Orders (view all, change status).

4. CART & CHECKOUT LOGIC
- Add to Cart: if product already in cart, increase quantity, do not duplicate. Check stock, do not allow quantity > stock.
- Cart total = sum(price * quantity)
- Checkout: Must be logged in. If not logged in, redirect to /login then back to /checkout. Create ONE order per seller - if cart has products from 2 sellers, create 2 separate orders (one for each seller) so each seller gets their own order + email. This is critical for a marketplace.
- After order creation, clear cart.

5. PAYNOW INTEGRATION - ZIMBABWE
- Env vars: PAYNOW_ID, PAYNOW_KEY, NEXT_PUBLIC_APP_URL
- /api/paynow/create: Server route only. Takes order_id + amount + buyer email. Creates Paynow payment with reference = order_id, returnurl = /paynow/return?order_id=..., resulturl = /api/paynow/result. Returns browserurl + pollurl. Save pollurl + paynow_reference to order.
- /api/paynow/result: Paynow server-to-server webhook. Verify hash with PAYNOW_KEY. If status = Paid, update order status to paid, reduce product stock by quantity, then trigger emails. Return OK.
- /paynow/return: Page that polls /api/paynow/status?order_id=... and shows Success (Order Paid) or Pending/Failed message. Buyer should NOT be marked as paid just by landing here - only by result webhook / poll check.

6. EMAILS - Use Resend (RESEND_API_KEY)
After order status becomes paid, send 3 emails using one reusable function sendOrderEmails(order):
- TO BUYER: Subject "Your HatchLink Order #XXX is Confirmed" - list items, total, delivery method, delivery address, seller shop name.
- TO SELLER: Subject "New Sale on HatchLink - [Product Name]" - buyer name, phone, address, items, quantity, total, "Please prepare for pickup/delivery"
- TO ADMIN: Subject "New Paid Order on HatchLink" - order ID, buyer, seller, total, items.
- Emails must be HTML, clean, with HatchLink branding.

7. DESIGN & UX
- Mobile-first, fast, clean like Jumia. White background, dark navy header, teal/green primary buttons. Product cards with rounded corners, shadow.
- Header on all pages: Logo HatchLink, Search, Categories, Cart icon with count, Login/Signup OR User name + Dashboard + Sign Out (keep my existing Sign Out logic - onClick supabase.auth.signOut()).
- Forms must have validation, loading states, success/error messages. No placeholder fake data - use real Supabase data.
- All pages must be responsive.

8. OUTPUT I WANT
Give me in order, step by step, and WAIT for my confirmation after Step 1 before doing Step 2:
Step 1: Full Supabase SQL + Storage bucket setup + update to Signup (Role selector) + "Become a Seller" button
Step 2: Products + Seller Dashboard + Add/Edit Product Form + Product Upload
Step 3: Homepage Marketplace + Product Page + Cart
Step 4: Checkout + Paynow + Emails + Admin Dashboard

For each step give me: Exact files to create/edit in my repo with FULL code, no "...rest of code" placeholders. Tell me where to paste SQL, where to add env vars in Vercel.