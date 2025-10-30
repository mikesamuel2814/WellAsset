--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (165f042)
-- Dumped by pg_dump version 16.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_unique;
ALTER TABLE IF EXISTS ONLY public.social_media DROP CONSTRAINT IF EXISTS social_media_pkey;
ALTER TABLE IF EXISTS ONLY public.site_settings DROP CONSTRAINT IF EXISTS site_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.site_settings DROP CONSTRAINT IF EXISTS site_settings_key_unique;
ALTER TABLE IF EXISTS ONLY public.properties DROP CONSTRAINT IF EXISTS properties_pkey;
ALTER TABLE IF EXISTS ONLY public.inquiries DROP CONSTRAINT IF EXISTS inquiries_pkey;
ALTER TABLE IF EXISTS ONLY public.agents DROP CONSTRAINT IF EXISTS agents_pkey;
ALTER TABLE IF EXISTS ONLY public.agents DROP CONSTRAINT IF EXISTS agents_email_unique;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.social_media;
DROP TABLE IF EXISTS public.site_settings;
DROP TABLE IF EXISTS public.properties;
DROP TABLE IF EXISTS public.inquiries;
DROP TABLE IF EXISTS public.agents;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: agents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agents (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    profile_image text
);


--
-- Name: inquiries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inquiries (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    message text NOT NULL,
    property_id character varying,
    status text DEFAULT 'unread'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: properties; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.properties (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    price numeric(12,2) NOT NULL,
    type text NOT NULL,
    location text NOT NULL,
    bedrooms integer NOT NULL,
    bathrooms integer NOT NULL,
    area integer NOT NULL,
    description text NOT NULL,
    features text[] NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    images text[] NOT NULL,
    agent_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    videos text[],
    title_bn text,
    location_bn text,
    description_bn text,
    features_bn text[],
    latitude numeric(10,7),
    longitude numeric(10,7)
);


--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_settings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    category text NOT NULL,
    updated_at timestamp without time zone DEFAULT now(),
    value_bn text
);


--
-- Name: social_media; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.social_media (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    platform text NOT NULL,
    url text NOT NULL,
    icon text,
    is_active boolean DEFAULT true NOT NULL,
    "order" integer DEFAULT 0 NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role text DEFAULT 'admin'::text NOT NULL
);


--
-- Data for Name: agents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.agents (id, name, email, phone, profile_image) FROM stdin;
eb542cee-094c-449a-a8e8-6e64eecf8178	Test Agent	agent@wellasset.com	+66-111-222-333	\N
\.


--
-- Data for Name: inquiries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inquiries (id, name, email, phone, message, property_id, status, created_at) FROM stdin;
d759ab31-913e-4e7d-bd01-17545c810140	Database Test User	dbtest@example.com	+66-999-888-777	Testing PostgreSQL inquiry persistence	7779ef59-8598-4f3e-948c-cd5effa9b044	resolved	2025-10-29 07:22:12.903935
4a12b38d-09fb-4879-916d-e806fed3c862					ee948475-425a-4f77-ab0c-4f2c5ae77a49	unread	2025-10-29 10:30:38.249228
387ba358-2211-459e-aa8f-c6e4129f89f6	Test User	test@example.com	01712345678	I am interested in this property and would like to schedule a viewing.	76077325-3697-449f-8983-263783c72af6	unread	2025-10-29 12:53:28.153954
d359e425-b126-41e7-b0c4-4c67843fc648	Test User	test@example.com	01712345678	I am interested in your services and would like more information.	\N	unread	2025-10-29 12:55:24.17794
\.


--
-- Data for Name: properties; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.properties (id, title, price, type, location, bedrooms, bathrooms, area, description, features, status, images, agent_id, created_at, videos, title_bn, location_bn, description_bn, features_bn, latitude, longitude) FROM stdin;
76077325-3697-449f-8983-263783c72af6	Modern Banani Penthouse	55000000.00	Condo	Banani, Dhaka	3	3	2800	Exquisite penthouse in the heart of Banani with floor-to-ceiling windows offering breathtaking city views. Premium finishes, chef's kitchen, and private terrace with panoramic views.	{"City View","Private Terrace","Modern Kitchen",Elevator,Gym,"24hr Security"}	active	{/attached_assets/stock_images/luxury_penthouse_int_4c8f5bae.jpg,/attached_assets/stock_images/luxury_penthouse_int_60708398.jpg,/attached_assets/stock_images/luxury_penthouse_int_4dc526ca.jpg,/attached_assets/stock_images/luxury_penthouse_int_e3d74300.jpg}	\N	2025-10-29 09:58:45.396877	{https://www.youtube.com/embed/dQw4w9WgXcQ}	আধুনিক বনানী পেন্টহাউস	বনানী, ঢাকা	বনানীর কেন্দ্রস্থলে মেঝে থেকে সিলিং পর্যন্ত জানালা সহ নিখুঁত পেন্টহাউস যা শ্বাসরুদ্ধকর শহরের দৃশ্য প্রদান করে। প্রিমিয়াম ফিনিশ, শেফের রান্নাঘর এবং প্যানোরামিক দৃশ্য সহ ব্যক্তিগত টেরেস।	{"শহরের দৃশ্য","ব্যক্তিগত টেরেস","আধুনিক রান্নাঘর",লিফট,জিম,"২৪ ঘন্টা নিরাপত্তা"}	\N	\N
ee948475-425a-4f77-ab0c-4f2c5ae77a49	Prime Commercial Space Motijheel	120000000.00	Commercial	Motijheel, Dhaka	0	4	6000	Premium office space in Dhaka's financial district with modern infrastructure, high-speed connectivity, and prestigious address. Perfect for corporate headquarters or financial institutions.	{"CBD Location","High-Speed Internet","Conference Rooms","Reception Area",Parking,"24/7 Security"}	active	{/attached_assets/stock_images/commercial_office_sp_c88656da.jpg,/attached_assets/stock_images/commercial_office_sp_b000228e.jpg,/attached_assets/stock_images/commercial_office_sp_33ca9099.jpg,/attached_assets/stock_images/commercial_office_sp_8dfe2fba.jpg}	\N	2025-10-29 09:58:45.396877	{https://www.youtube.com/embed/dQw4w9WgXcQ}	প্রাইম বাণিজ্যিক স্থান মতিঝিল	মতিঝিল, ঢাকা	আধুনিক অবকাঠামো, উচ্চ-গতির সংযোগ এবং মর্যাদাপূর্ণ ঠিকানা সহ ঢাকার আর্থিক জেলায় প্রিমিয়াম অফিস স্থান। কর্পোরেট সদর দপ্তর বা আর্থিক প্রতিষ্ঠানের জন্য নিখুঁত।	{"সিবিডি অবস্থান","উচ্চ-গতির ইন্টারনেট","সম্মেলন কক্ষ","অভ্যর্থনা এলাকা",পার্কিং,"২৪/৭ নিরাপত্তা"}	\N	\N
39600ceb-135f-4395-9249-ea5c9cd7b486	Stylish Bashundhara Apartment	25000000.00	Apartment	Bashundhara, Dhaka	2	2	1200	Chic apartment in Bashundhara Residential Area with modern design, high-quality finishes, and excellent amenities. Close to shopping malls, restaurants, and entertainment.	{"Swimming Pool","Fitness Center","24hr Security",Balcony,"Modern Kitchen","Parking Space"}	active	{/attached_assets/stock_images/stylish_modern_apart_0d636c23.jpg,/attached_assets/stock_images/stylish_modern_apart_50e05e21.jpg,/attached_assets/stock_images/stylish_modern_apart_7a16c134.jpg,/attached_assets/stock_images/stylish_modern_apart_b4e6046c.jpg}	\N	2025-10-29 09:58:45.396877	{https://www.youtube.com/embed/dQw4w9WgXcQ}	স্টাইলিশ বসুন্ধরা অ্যাপার্টমেন্ট	বসুন্ধরা, ঢাকা	আধুনিক ডিজাইন, উচ্চ-মানের ফিনিশ এবং চমৎকার সুবিধা সহ বসুন্ধরা আবাসিক এলাকায় আকর্ষণীয় অ্যাপার্টমেন্ট। শপিং মল, রেস্তোরাঁ এবং বিনোদনের কাছে।	{"সুইমিং পুল","ফিটনেস সেন্টার","২৪ ঘন্টা নিরাপত্তা",বারান্দা,"আধুনিক রান্নাঘর","পার্কিং স্পেস"}	\N	\N
d21993e8-182c-4b1e-9482-b88bd4458eb0	Elegant Uttara Mansion	95000000.00	Villa	Uttara, Dhaka	6	7	5500	Magnificent estate in Uttara with contemporary architecture, extensive grounds, guest house, and unparalleled privacy. Ideal for luxury family living with world-class amenities.	{"Large Estate","Guest House","Private Garden","Security Gate","Modern Architecture","Premium Location"}	active	{/attached_assets/stock_images/elegant_mansion_exte_208be3b2.jpg,/attached_assets/stock_images/elegant_mansion_exte_51479b37.jpg,/attached_assets/stock_images/elegant_mansion_exte_7d50ba20.jpg,/attached_assets/stock_images/elegant_mansion_exte_6bc4ba5c.jpg}	\N	2025-10-29 09:58:45.396877	{https://www.youtube.com/embed/dQw4w9WgXcQ}	মার্জিত উত্তরা প্রাসাদ	উত্তরা, ঢাকা	সমসাময়িক স্থাপত্য, বিস্তৃত মাঠ, গেস্ট হাউস এবং অতুলনীয় গোপনীয়তা সহ উত্তরায় দুর্দান্ত সম্পত্তি। বিশ্বমানের সুবিধা সহ বিলাসবহুল পারিবারিক জীবনযাপনের জন্য আদর্শ।	{"বড় সম্পত্তি","গেস্ট হাউস","ব্যক্তিগত বাগান","নিরাপত্তা গেট","আধুনিক স্থাপত্য","প্রিমিয়াম অবস্থান"}	\N	\N
8569041d-6b4f-4a24-a498-0810d274ecc2	Luxury Gulshan Villa	85000000.00	Villa	Gulshan-2, Dhaka	5	6	4200	Stunning luxury villa in prime Gulshan location with modern amenities, landscaped gardens, and 24/7 security. Features include infinity pool, home theater, and smart home technology throughout.	{"Swimming Pool","Home Theater","Smart Home",Garden,Security,Parking}	active	{/attached_assets/stock_images/luxury_modern_villa__345ef6d2.jpg,/attached_assets/stock_images/luxury_modern_villa__36307317.jpg,/attached_assets/stock_images/luxury_modern_villa__6c8990b4.jpg,/attached_assets/stock_images/luxury_modern_villa__ad3954af.jpg}	\N	2025-10-29 09:58:45.396877	{https://www.youtube.com/embed/dQw4w9WgXcQ}	বিলাসবহুল গুলশান ভিলা	গুলশান-২, ঢাকা	প্রাইম গুলশান এলাকায় আধুনিক সুবিধা, সুসজ্জিত বাগান এবং ২৪/৭ নিরাপত্তা সহ অত্যাশ্চর্য বিলাসবহুল ভিলা। বৈশিষ্ট্যগুলির মধ্যে রয়েছে ইনফিনিটি পুল, হোম থিয়েটার এবং সমস্ত স্মার্ট হোম প্রযুক্তি।	{"সুইমিং পুল","হোম থিয়েটার","স্মার্ট হোম",বাগান,নিরাপত্তা,পার্কিং}	\N	\N
06ecd239-3be9-4a1e-90cd-0f20113a6272	Contemporary Dhanmondi Townhouse	38000000.00	Townhouse	Dhanmondi, Dhaka	4	3	3200	Beautifully designed townhouse in prestigious Dhanmondi area with modern architecture, spacious rooms, and family-friendly layout. Close to schools, parks, and shopping centers.	{"Spacious Rooms","Modern Design","Covered Parking","Rooftop Access","Near Schools","Quiet Area"}	active	{/attached_assets/stock_images/modern_townhouse_ext_061cc794.jpg,/attached_assets/stock_images/modern_townhouse_ext_15530605.jpg,/attached_assets/stock_images/modern_townhouse_ext_3a004b3d.jpg,/attached_assets/stock_images/modern_townhouse_ext_96c4f448.jpg}	\N	2025-10-29 09:58:45.396877	{https://www.youtube.com/embed/dQw4w9WgXcQ}	সমসাময়িক ধানমন্ডি টাউনহাউস	ধানমন্ডি, ঢাকা	আধুনিক স্থাপত্য, প্রশস্ত কক্ষ এবং পরিবার-বান্ধব লেআউট সহ মর্যাদাপূর্ণ ধানমন্ডি এলাকায় সুন্দরভাবে ডিজাইন করা টাউনহাউস। স্কুল, পার্ক এবং শপিং সেন্টারের কাছে।	{"প্রশস্ত কক্ষ","আধুনিক ডিজাইন","আচ্ছাদিত পার্কিং","ছাদ প্রবেশাধিকার","স্কুলের কাছে","শান্ত এলাকা"}	\N	\N
058eb6d0-28d5-460a-a192-8b913109f598	Test Property with Coordinates	15000000.00	Villa	Gulshan, Dhaka	3	2	1500	Test property description	{}	active	{/@fs/home/runner/workspace/attached_assets/generated_images/Mansion_interior_property_image_9b6f3d6b.png}	\N	2025-10-30 06:36:19.60096	\N				\N	23.7808000	90.4164000
\.


--
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.site_settings (id, key, value, category, updated_at, value_bn) FROM stdin;
4b3de1c3-d0d2-435d-9148-b9bd9ff4e939	company_name	Well Asset Development Co., Ltd	general	2025-10-29 12:14:50.446395	\N
ebb14762-a185-451a-8f19-033e69e8181c	tagline	Luxury Real Estate in Dhaka	general	2025-10-29 12:14:50.446395	\N
78bc241c-9f36-4f19-9d0f-4ec633ae3345	email	info@wellasset.com	contact	2025-10-29 12:14:50.446395	\N
e039ed33-8111-467d-891d-8d340fc733be	office_address	House 42, Road 12, Gulshan-2, Dhaka 1212, Bangladesh	contact	2025-10-29 12:14:50.446395	\N
634bb794-fcce-4d4c-9b5d-d9a20cbdf8a5	office_hours	Saturday - Thursday: 9:00 AM - 6:00 PM	contact	2025-10-29 12:14:50.446395	\N
be3c6948-1cee-4603-8b9e-919b1bd9dac1	about_title	Leading Real Estate Development in Bangladesh	about	2025-10-29 12:14:50.446395	\N
ff5e2e26-04fc-4977-8ec3-965df5f4e586	mission	To transform the landscape of Dhaka by creating exceptional living and working spaces that enhance quality of life.	about	2025-10-29 12:14:50.446395	\N
a7956c85-2f5f-4eac-878e-e7eea05e1421	vision	To be the most trusted name in luxury real estate development in Bangladesh.	about	2025-10-29 12:14:50.446395	\N
2305c567-1eee-427e-bbcf-20f5160451cb	phone	+880 1234-567890	contact	2025-10-29 12:31:22.621	\N
0af7752b-efe9-44e7-bbcd-0b8744f3b3ef	about_description	Well Asset Development is a premier real estate company	about	2025-10-29 14:12:22.397	\N
5dbbcde6-7c93-49b0-9487-7a82d48e8dc5	office_longitude	90.4043	contact	2025-10-30 06:28:51.732289	৯০.৪০৪৩
1327bfa3-bff4-4d2f-816f-b08e2958564c	office_latitude	23.8103	contact	2025-10-30 06:38:13.898	২৩.৭৯৩৮
\.


--
-- Data for Name: social_media; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.social_media (id, platform, url, icon, is_active, "order") FROM stdin;
321ab611-0199-4c0c-8dbb-4e1a8e16005d	Facebook	https://facebook.com/wellasset	Facebook	t	1
8e9939d0-5c64-4898-b4ad-6972c61cba97	Instagram	https://instagram.com/wellasset	Instagram	t	2
81fd5588-53d2-4bc8-b952-a137ccadbb8e	LinkedIn	https://linkedin.com/company/wellasset	Linkedin	t	3
065c2911-b959-49d0-b6b2-b51307084768	Twitter	https://twitter.com/wellasset	Twitter	t	4
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, name, email, password, role) FROM stdin;
aa5ee2dc-93e0-4f8e-afb1-9f18763d6856	Admin User	pgtest@wellasset.com	$2b$10$705ecrZwKowD.1wiaNFQPOqfVEt3E5z1mF.aY3O2M93tyY3RACvpW	admin
b2349dee-850b-4a47-bfcd-f04c62620447	Admin User	test@admin.com	$2b$10$zBP4nZ9/9OA/9ShcH/jdDeRh5vYWbbm/ixpJ4CQlKN73g4ECYSXsC	admin
f05288a1-2a3b-4172-82ea-02a259157805	Admin User	admin@wellasset.com	$2b$10$pXdbp0pwE.N/xE05HEXN7.TyS/9Ou1foxiqcz.ShOvNoNDxUW/g/S	admin
37d39b78-f4df-4985-b8f6-31d1a67770cc	Admin User	testadmin@wellasset.com	$2b$10$yxUiUWlCnvWY/rig/lONJ.Mfj8xtWgnkeDMKdyGcYrEWN52.MGHlO	admin
\.


--
-- Name: agents agents_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agents
    ADD CONSTRAINT agents_email_unique UNIQUE (email);


--
-- Name: agents agents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agents
    ADD CONSTRAINT agents_pkey PRIMARY KEY (id);


--
-- Name: inquiries inquiries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inquiries
    ADD CONSTRAINT inquiries_pkey PRIMARY KEY (id);


--
-- Name: properties properties_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_pkey PRIMARY KEY (id);


--
-- Name: site_settings site_settings_key_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_key_unique UNIQUE (key);


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);


--
-- Name: social_media social_media_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.social_media
    ADD CONSTRAINT social_media_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

