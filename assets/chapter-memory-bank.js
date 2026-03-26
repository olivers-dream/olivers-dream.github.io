const STUDY_PORTAL_MEMORY_BANK = {
  'maths/chapter-01-real-numbers.html': {
    summary: 'Use Euclid, prime factorisation, and decimal-expansion rules to reason about HCF, LCM, and rational numbers.',
    memorize: [
      'Euclid division lemma: a = bq + r, with 0 <= r < b.',
      'Fundamental Theorem of Arithmetic: every integer > 1 has a unique prime factorisation.',
      'A rational number has a terminating decimal only when the denominator in lowest form is 2^m x 5^n.'
    ]
  },
  'maths/chapter-02-polynomials.html': {
    summary: 'Connect zeroes of a polynomial with its factors and coefficients, especially for linear and quadratic cases.',
    memorize: [
      'If p(a) = 0, then (x - a) is a factor of p(x).',
      'For ax^2 + bx + c, sum of zeroes = -b/a and product = c/a.',
      'Graphically, zeroes are the x-coordinates where the graph meets the x-axis.'
    ]
  },
  'maths/chapter-03-pair-of-linear-equations.html': {
    summary: 'Solve two linear equations by graph, substitution, and elimination, then classify the nature of solutions.',
    memorize: [
      'One solution when a1/a2 != b1/b2.',
      'No solution when a1/a2 = b1/b2 != c1/c2.',
      'Infinitely many solutions when a1/a2 = b1/b2 = c1/c2.'
    ]
  },
  'maths/chapter-04-quadratic-equations.html': {
    summary: 'Solve quadratics by factorisation and formula, then interpret the discriminant to know the nature of roots.',
    memorize: [
      'Quadratic formula: x = (-b +/- sqrt(b^2 - 4ac)) / 2a.',
      'Discriminant D = b^2 - 4ac decides the type of roots.',
      'If D > 0 roots are distinct, if D = 0 equal, if D < 0 no real roots.'
    ]
  },
  'maths/chapter-05-arithmetic-progressions.html': {
    summary: 'Model evenly increasing sequences using nth term and sum formulas.',
    memorize: [
      'nth term: a_n = a + (n - 1)d.',
      'Sum of first n terms: S_n = n/2 [2a + (n - 1)d].',
      'Common difference d = a_n - a_(n-1).'
    ]
  },
  'maths/chapter-06-triangles.html': {
    summary: 'Use similarity to prove proportionality results and compare areas of similar triangles.',
    memorize: [
      'Criteria of similarity: AAA, SAS, and SSS.',
      'If a line is parallel to one side of a triangle, it divides the other two sides proportionally.',
      'Areas of similar triangles are in the ratio of the squares of corresponding sides.'
    ]
  },
  'maths/chapter-07-coordinate-geometry.html': {
    summary: 'Find the point dividing a line segment internally and compute area from coordinates.',
    memorize: [
      'Section formula: ((mx2 + nx1)/(m+n), (my2 + ny1)/(m+n)).',
      'Midpoint formula is ((x1 + x2)/2, (y1 + y2)/2).',
      'Area of triangle = 1/2 |x1(y2-y3) + x2(y3-y1) + x3(y1-y2)|.'
    ]
  },
  'maths/chapter-08-introduction-to-trigonometry.html': {
    summary: 'Relate side ratios in a right triangle to define trig functions and use standard identities.',
    memorize: [
      'sin theta = perpendicular / hypotenuse, cos theta = base / hypotenuse.',
      'tan theta = perpendicular / base and cot theta = base / perpendicular.',
      'sin^2 theta + cos^2 theta = 1 and 1 + tan^2 theta = sec^2 theta.'
    ]
  },
  'maths/chapter-09-applications-of-trigonometry.html': {
    summary: 'Translate height-distance word problems into right triangles and choose the correct trig ratio.',
    memorize: [
      'Angle of elevation is measured upward from the horizontal.',
      'Angle of depression is measured downward from the horizontal.',
      'Draw the figure first, then choose tan, sin, or cos from known and required sides.'
    ]
  },
  'maths/chapter-10-circles.html': {
    summary: 'Use tangent properties to prove lengths and angle relations involving circles.',
    memorize: [
      'The tangent at any point of a circle is perpendicular to the radius through that point.',
      'Tangents drawn from an external point to a circle are equal.',
      'A circle can have only one tangent at a given point.'
    ]
  },
  'maths/chapter-11-areas-related-to-circles.html': {
    summary: 'Find areas and lengths of sectors, segments, and combined circular regions.',
    memorize: [
      'Circumference = 2pi r and area = pi r^2.',
      'Area of sector = (theta/360) x pi r^2.',
      'Length of arc = (theta/360) x 2pi r.'
    ]
  },
  'maths/chapter-12-surface-areas-and-volumes.html': {
    summary: 'Apply CSA, TSA, and volume formulas for combined solids and unit conversions.',
    memorize: [
      'Volume of cone = 1/3 pi r^2 h and cylinder = pi r^2 h.',
      'Volume of sphere = 4/3 pi r^3 and hemisphere = 2/3 pi r^3.',
      'Always keep units consistent before comparing or adding volumes.'
    ]
  },
  'maths/chapter-13-statistics.html': {
    summary: 'Compute mean, median, and mode for grouped data and interpret cumulative frequencies.',
    memorize: [
      'Mean from assumed mean method: xbar = a + (sum f_i u_i / sum f_i) x h.',
      'Median class contains the observation N/2.',
      'Mode formula for grouped data uses l, h, f1, f0, and f2 from the modal class.'
    ]
  },
  'maths/chapter-14-probability.html': {
    summary: 'Use experimental probability and connect favourable outcomes with total outcomes.',
    memorize: [
      'Probability of an event = number of favourable outcomes / total number of outcomes.',
      '0 <= P(E) <= 1 for every event.',
      'Probability of not-E = 1 - P(E).'
    ]
  },
  'science/chapter-01-chemical-reactions.html': {
    summary: 'Classify reactions, balance equations, and connect observable changes with oxidation-reduction ideas.',
    memorize: [
      'Signs of a chemical reaction: gas, precipitate, colour change, temperature change.',
      'Oxidation is addition of oxygen or loss of electrons; reduction is removal of oxygen or gain of electrons.',
      'Types to remember: combination, decomposition, displacement, double displacement, and redox.'
    ]
  },
  'science/chapter-02-acids-bases-salts.html': {
    summary: 'Track how acids, bases, and salts behave with indicators, metals, and neutralisation reactions.',
    memorize: [
      'Acids release H+ in water; bases release OH-.',
      'pH scale runs from 0 to 14, with 7 neutral.',
      'Baking soda, washing soda, bleaching powder, and plaster of Paris are key named salts.'
    ]
  },
  'science/chapter-03-metals-non-metals.html': {
    summary: 'Compare physical and chemical properties of metals and non-metals and place reactivity in order.',
    memorize: [
      'More reactive metals displace less reactive metals from salt solutions.',
      'Ionic compounds usually have high melting points and conduct in molten or aqueous state.',
      'Rusting is a corrosion process and galvanisation prevents it.'
    ]
  },
  'science/chapter-04-carbon-compounds.html': {
    summary: 'Use tetravalency, catenation, homologous series, and reactions of ethanol and ethanoic acid.',
    memorize: [
      'Carbon forms covalent bonds because it needs four electrons and cannot gain or lose four easily.',
      'General formula of alkanes: C_nH_2n+2.',
      'Soaps work better than detergents in soft water, but soaps form scum in hard water.'
    ]
  },
  'science/chapter-05-life-processes.html': {
    summary: 'Follow the basic processes that keep organisms alive: nutrition, respiration, transport, and excretion.',
    memorize: [
      'Photosynthesis needs carbon dioxide, water, sunlight, and chlorophyll.',
      'In humans, alveoli are the site of gas exchange and nephrons are the unit of excretion.',
      'Xylem transports water and minerals; phloem transports food.'
    ]
  },
  'science/chapter-06-control-coordination.html': {
    summary: 'Compare nervous control with hormonal control in plants and animals.',
    memorize: [
      'Neuron is the structural and functional unit of the nervous system.',
      'Reflex action is fast, automatic, and often mediated through the spinal cord.',
      'Auxins, gibberellins, cytokinins, abscisic acid, and ethylene are major plant hormones.'
    ]
  },
  'science/chapter-07-how-do-organisms-reproduce.html': {
    summary: 'Distinguish asexual and sexual reproduction and connect reproduction with DNA copying and variation.',
    memorize: [
      'Binary fission, budding, fragmentation, and spore formation are asexual methods.',
      'Fertilisation combines male and female gametes to form a zygote.',
      'Condoms and oral pills are contraceptive methods; STDs spread through unsafe sexual contact.'
    ]
  },
  'science/chapter-08-heredity-evolution.html': {
    summary: 'Track how traits pass from parents to offspring and how variation contributes to evolution.',
    memorize: [
      'Genes are units of heredity present on chromosomes.',
      'Dominant traits express in heterozygous condition; recessive need both alleles.',
      'Acquired traits are not inherited, but variations in DNA can pass to offspring.'
    ]
  },
  'science/chapter-09-light-reflection-refraction.html': {
    summary: 'Use image rules, sign conventions, and refractive behaviour for mirrors and lenses.',
    memorize: [
      'Mirror formula: 1/f = 1/v + 1/u.',
      'Lens formula: 1/f = 1/v - 1/u under the NCERT sign convention.',
      'Refractive index n = speed of light in vacuum / speed of light in medium.'
    ]
  },
  'science/chapter-10-human-eye-colourful-world.html': {
    summary: 'Explain vision defects and scattering using the eye, atmosphere, and dispersion concepts.',
    memorize: [
      'Myopia is corrected by a concave lens; hypermetropia by a convex lens.',
      'Atmospheric refraction causes twinkling of stars and advanced sunrise.',
      'Tyndall effect is scattering of light by colloidal particles.'
    ]
  },
  'science/chapter-11-electricity.html': {
    summary: 'Apply Ohm law, resistors in series-parallel, heating effect, and electric power formulas.',
    memorize: [
      'Ohm law: V = IR.',
      'Series: R = R1 + R2 + ... ; Parallel: 1/R = 1/R1 + 1/R2 + ...',
      'Power P = VI = I^2R = V^2/R.'
    ]
  },
  'science/chapter-12-magnetic-effects.html': {
    summary: 'Connect electric current with magnetic fields, force on conductors, and domestic electric safety.',
    memorize: [
      'Right-hand thumb rule gives the direction of magnetic field around a current-carrying conductor.',
      'Fleming left-hand rule gives the direction of force in a motor.',
      'Fuse and earthing protect circuits and users from overcurrent and leakage.'
    ]
  },
  'science/chapter-13-our-environment.html': {
    summary: 'Follow food chains, trophic levels, biomagnification, and the role of decomposers.',
    memorize: [
      'Only about 10% of energy passes from one trophic level to the next.',
      'Biodegradable wastes decompose naturally; non-biodegradable ones persist.',
      'Ozone protects from UV radiation; its depletion is harmful.'
    ]
  },
  'geography/chapter-01-resources-and-development.html': {
    summary: 'Classify resources, understand sustainable development, and connect land use with soil conservation.',
    memorize: [
      'Resources are classified by origin, exhaustibility, ownership, and status of development.',
      'Sustainable development meets present needs without damaging future needs.',
      'Alluvial, black, red-yellow, laterite, arid, and forest soils are the main Indian soil groups.'
    ]
  },
  'geography/chapter-02-forest-and-wildlife.html': {
    summary: 'Relate biodiversity conservation with community participation and threats to ecosystems.',
    memorize: [
      'Biodiversity includes flora, fauna, and the ecological balance between them.',
      'Reserved, protected, and unclassed forests are the main legal categories.',
      'Chipko and similar movements highlight community-based conservation.'
    ]
  },
  'geography/chapter-03-water-resources.html': {
    summary: 'Track why water needs conservation and how multipurpose projects both help and create conflicts.',
    memorize: [
      'Fresh water is unevenly distributed in space and time.',
      'Rainwater harvesting is a local, sustainable conservation method.',
      'Large dams provide irrigation and power but can also displace people and damage ecosystems.'
    ]
  },
  'geography/chapter-04-agriculture.html': {
    summary: 'Connect farming types, cropping seasons, major crops, and modern agricultural challenges.',
    memorize: [
      'Kharif crops are sown with monsoon; rabi crops are grown in winter.',
      'Rice needs high temperature and rainfall; wheat prefers cool growing season.',
      'Primitive subsistence, intensive subsistence, and commercial farming are the key farming types.'
    ]
  },
  'geography/chapter-05-minerals-and-energy.html': {
    summary: 'Locate important mineral belts and compare conventional with non-conventional energy sources.',
    memorize: [
      'Minerals occur in veins, beds, and strata depending on geological processes.',
      'Coal, petroleum, and natural gas are conventional exhaustible energy resources.',
      'Solar, wind, tidal, geothermal, and biogas are non-conventional resources.'
    ]
  },
  'geography/chapter-06-manufacturing-industries.html': {
    summary: 'Explain industrial location, pollution control, and the importance of manufacturing to the economy.',
    memorize: [
      'Raw material, labour, power, capital, transport, and market affect industrial location.',
      'Agro-based and mineral-based industries are major broad groups.',
      'Industrial pollution can affect air, water, land, and noise levels.'
    ]
  },
  'geography/chapter-07-lifelines-of-national-economy.html': {
    summary: 'See transport, communication, and trade as the connecting network of the national economy.',
    memorize: [
      'Roadways give door-to-door service; railways suit bulky and long-distance transport.',
      'Pipelines transport petroleum, gas, and slurry efficiently.',
      'International trade is called the economic barometer of a country.'
    ]
  },
  'civics/chapter-01-power-sharing.html': {
    summary: 'Use Belgium and Sri Lanka to compare accommodation with majoritarianism in divided societies.',
    memorize: [
      'Prudential reason: power sharing reduces conflict.',
      'Moral reason: power sharing is the spirit of democracy.',
      'Power can be shared among organs, levels, social groups, and political parties.'
    ]
  },
  'civics/chapter-02-federalism.html': {
    summary: 'Compare unitary and federal systems and trace how India became more federal in practice.',
    memorize: [
      'Federalism has two or more levels of government with constitutional division of powers.',
      'Union, State, and Concurrent Lists divide legislative subjects in India.',
      'Decentralisation means transferring power to local governments like panchayats and municipalities.'
    ]
  },
  'civics/chapter-03-gender-religion-caste.html': {
    summary: 'Recognise how social divisions enter politics without reducing all political issues to identity alone.',
    memorize: [
      'Gender division is a social expectation issue, not a biological destiny.',
      'Communal politics can take different forms, from everyday bias to violence.',
      'Caste can produce discrimination but also political mobilisation for justice.'
    ]
  },
  'civics/chapter-04-political-parties.html': {
    summary: 'Explain why parties are necessary, what functions they perform, and how party systems differ.',
    memorize: [
      'Parties contest elections, form policies, make laws, and shape public opinion.',
      'India has a multi-party system because social and regional diversity is high.',
      'Challenge areas: lack of internal democracy, dynastic succession, money power, and weak participation.'
    ]
  },
  'civics/chapter-05-outcomes-of-democracy.html': {
    summary: 'Judge democracy by accountability, rights, equality, and dignity rather than only by election rituals.',
    memorize: [
      'Democracy is better at producing accountable government and public debate.',
      'Economic inequality may persist even in democracies.',
      'Dignity and freedom are major moral outcomes of democratic life.'
    ]
  },
  'history/chapter-01-rise-of-nationalism-europe.html': {
    summary: 'Track how liberal-national ideas, revolutions, and unification movements changed Europe.',
    memorize: [
      'Liberalism meant freedom for the individual and equality before law.',
      'Giuseppe Mazzini promoted a unified democratic republic.',
      'Germany and Italy unified through a mix of nationalism, diplomacy, and war.'
    ]
  },
  'history/chapter-02-nationalism-in-india.html': {
    summary: 'Follow the making of nationalism through mass movements, symbols, and the limits of unity.',
    memorize: [
      'Rowlatt Act, Jallianwala Bagh, and Khilafat shaped the Non-Cooperation Movement.',
      'Civil Disobedience began with the Salt March in 1930.',
      'Different groups joined nationalism for different reasons, so unity had limits.'
    ]
  },
  'history/chapter-03-making-of-global-world.html': {
    summary: 'Explain how trade, migration, empire, and war shaped the modern global economy.',
    memorize: [
      'Silk Routes linked Asia, Europe, and Africa long before modern globalisation.',
      'Indentured labour moved from India and China after slavery declined.',
      'The Great Depression deeply disrupted trade, farming, and employment.'
    ]
  },
  'history/chapter-04-age-of-industrialisation.html': {
    summary: 'Compare pre-factory production with industrial capitalism and the changing world of labour.',
    memorize: [
      'Proto-industrialisation existed before factories through merchant-controlled home production.',
      'Industrial growth was uneven and many handmade goods survived alongside factories.',
      'Advertisements became important in creating demand in mass markets.'
    ]
  },
  'history/chapter-05-print-culture-modern-world.html': {
    summary: 'Show how print expanded reading, shaped opinion, and sometimes triggered fear and control.',
    memorize: [
      'Printing began in China, later spread to Europe, and exploded after Gutenberg.',
      'Cheap print encouraged reading mania, debate, and reform ideas.',
      'Authorities censored print when they feared dissent, satire, or revolution.'
    ]
  },
  'economics/chapter-01-development.html': {
    summary: 'Compare income with broader development goals and distinguish average income from distribution.',
    memorize: [
      'Development goals differ for different people and groups.',
      'Per capita income is a useful average, but it hides inequality.',
      'IMR, literacy, and net attendance ratio are key social indicators.'
    ]
  },
  'economics/chapter-02-sectors-of-indian-economy.html': {
    summary: 'Differentiate primary, secondary, and tertiary sectors and identify disguised unemployment.',
    memorize: [
      'Primary sector uses natural resources directly; secondary makes goods; tertiary provides services.',
      'Disguised unemployment means more workers are engaged than actually needed.',
      'GDP is the value of all final goods and services produced within a year.'
    ]
  },
  'economics/chapter-03-money-and-credit.html': {
    summary: 'Explain how money solves barter problems and how credit can help or trap borrowers.',
    memorize: [
      'Modern money acts as medium of exchange, store of value, and unit of account.',
      'Banks accept deposits and give loans, creating credit in the economy.',
      'Cheap and fair formal credit is safer than high-interest informal loans.'
    ]
  },
  'economics/chapter-04-globalisation-indian-economy.html': {
    summary: 'Connect production networks, liberalisation, and the mixed effects of globalisation on workers and firms.',
    memorize: [
      'MNCs spread production across countries to cut cost and expand markets.',
      'Liberalisation removed many barriers to trade and investment in India after 1991.',
      'Globalisation benefits are uneven; some producers gain while many small workers remain insecure.'
    ]
  },
  'economics/chapter-05-consumer-rights.html': {
    summary: 'Use consumer rights and redressal systems to respond to defective goods and unfair trade practices.',
    memorize: [
      'Consumer rights include safety, information, choice, representation, and redressal.',
      'ISI, Agmark, and Hallmark help identify quality and standards.',
      'Consumer courts exist at district, state, and national levels.'
    ]
  },
  'first_flight/chapter-01-a-letter-to-god.html': {
    summary: 'Lencho\'s faith drives the story, but irony exposes the gap between human help and his expectations.',
    memorize: [
      'Lencho trusts God completely after the hailstorm ruins his crop.',
      'The postmaster and employees collect money out of sympathy and kindness.',
      'Irony: Lencho calls the helpers a bunch of crooks because the amount is short.'
    ]
  },
  'first_flight/chapter-02-nelson-mandela.html': {
    summary: 'Mandela links freedom with responsibility and turns his life story into a lesson on justice and dignity.',
    memorize: [
      'Apartheid denied Black South Africans political and human rights.',
      'Mandela says courage is triumph over fear, not absence of fear.',
      'He learns that both oppressor and oppressed are robbed of humanity.'
    ]
  },
  'first_flight/chapter-03-two-stories-about-flying.html': {
    summary: 'Both stories show that fear can be overcome by pressure, instinct, and trust.',
    memorize: [
      'The young seagull flies only when hunger forces him to leap.',
      'In the black aeroplane story, the narrator is guided through a storm by a mysterious pilot.',
      'Theme: confidence often comes only after action begins.'
    ]
  },
  'first_flight/chapter-04-from-the-diary-of-anne-frank.html': {
    summary: 'Anne\'s diary becomes a private friend and reveals the thoughts of an observant, growing mind.',
    memorize: [
      'Anne names her diary Kitty and writes to it as a close companion.',
      'Mr Keesing punishes Anne for talking, but she answers with witty essays.',
      'Diary writing captures both personal emotion and social setting.'
    ]
  },
  'first_flight/chapter-05-glimpses-of-india.html': {
    summary: 'The chapter celebrates India through food, landscapes, and local culture in three distinct travel pieces.',
    memorize: [
      'A Baker from Goa shows tradition and the Portuguese-era bakery culture.',
      'Coorg highlights evergreen forests, coffee estates, and Kodavu bravery.',
      'Tea from Assam traces Rajvir and Pranjol\'s journey and the history of tea.'
    ]
  },
  'first_flight/chapter-06-mijbil-the-otter.html': {
    summary: 'The otter Mij becomes both a pet and a way for the author to explore affection, curiosity, and grief.',
    memorize: [
      'Mij is playful, intelligent, and learns routines quickly.',
      'The author is deeply attached to Mij after losing his dog and wife.',
      'Traveling with Mij creates humour and chaos, especially at the airport.'
    ]
  },
  'first_flight/chapter-07-madam-rides-the-bus.html': {
    summary: 'Valli\'s bus ride becomes a lesson in curiosity, independence, and emotional growth.',
    memorize: [
      'Valli plans her trip carefully by collecting information and saving money.',
      'She refuses small temptations like peppermint to preserve her fare.',
      'The dead cow on the return journey changes her mood and maturity.'
    ]
  },
  'first_flight/chapter-08-the-sermon-at-benares.html': {
    summary: 'Buddha teaches Kisa Gotami that suffering is universal and wisdom begins with accepting impermanence.',
    memorize: [
      'Kisa Gotami seeks medicine for her dead son but cannot find a house untouched by death.',
      'The sermon teaches that all beings are mortal.',
      'Peace comes from understanding and detachment, not denial.'
    ]
  },
  'first_flight/chapter-09-the-proposal.html': {
    summary: 'The farce turns a marriage proposal into comic argument, exposing vanity and social absurdity.',
    memorize: [
      'Lomov comes to propose, but quarrels over Oxen Meadows and dogs derail the moment.',
      'Natalya and Lomov are both emotional, proud, and argumentative.',
      'Chekhov uses exaggeration and sudden mood swings for humour.'
    ]
  },
  'footprints/chapter-01-a-triumph-of-surgery.html': {
    summary: 'The story shows how overindulgence harms both pets and people, while discipline restores health.',
    memorize: [
      'Tricki becomes ill because his owner overfeeds him.',
      'Dr Herriot treats Tricki mainly through diet, exercise, and routine.',
      'Mrs Pumphrey\'s affection is genuine but misguided.'
    ]
  },
  'footprints/chapter-02-the-thiefs-story.html': {
    summary: 'Trust and kindness reform Hari Singh more effectively than punishment could.',
    memorize: [
      'Anil is simple, trusting, and generous toward Hari Singh.',
      'Hari steals but then feels guilty and returns the money.',
      'Education becomes the turning point in Hari\'s moral change.'
    ]
  },
  'footprints/chapter-03-the-midnight-visitor.html': {
    summary: 'Ausable defeats danger through calm wit rather than physical action.',
    memorize: [
      'Ausable appears ordinary, but he is a sharp secret agent.',
      'He invents the story of a balcony to trick Max.',
      'Suspense comes from dialogue and psychology rather than violence.'
    ]
  },
  'footprints/chapter-04-a-question-of-trust.html': {
    summary: 'Horace Danby is fooled because he underestimates another criminal and overestimates his own cleverness.',
    memorize: [
      'Horace is a thief with a strange respectability and a weakness for rare books.',
      'The woman pretends to be the owner and manipulates him expertly.',
      'Theme: crime and trust do not mix, even among criminals.'
    ]
  },
  'footprints/chapter-05-footprints-without-feet.html': {
    summary: 'Griffin\'s scientific brilliance is corrupted by selfishness and cruelty.',
    memorize: [
      'Griffin discovers how to make himself invisible.',
      'Instead of serving humanity, he uses science for theft and revenge.',
      'The story warns that intelligence without ethics is dangerous.'
    ]
  },
  'footprints/chapter-06-the-making-of-a-scientist.html': {
    summary: 'Richard Ebright\'s growth shows how curiosity, discipline, and guidance create a scientist.',
    memorize: [
      'Ebright begins with butterfly collection and later shifts to experiments.',
      'His mother encourages reading, learning, and independent effort.',
      'Winning is less important than asking better scientific questions.'
    ]
  },
  'footprints/chapter-07-the-necklace.html': {
    summary: 'Misdirected pride and obsession with status turn a simple mistake into years of hardship.',
    memorize: [
      'Matilda longs for luxury and social display.',
      'The necklace is lost, replaced at huge cost, and later revealed to be imitation.',
      'Irony drives the story: appearance matters more to Matilda than reality.'
    ]
  },
  'footprints/chapter-08-bholi.html': {
    summary: 'Education gives Bholi voice, self-respect, and the courage to reject humiliation.',
    memorize: [
      'Bholi is neglected at home but transformed by school and her teacher.',
      'At the wedding she refuses a greedy, insulting groom.',
      'The story shows education as empowerment, especially for girls.'
    ]
  },
  'footprints/chapter-09-the-book-that-saved-the-earth.html': {
    summary: 'The play mocks blind faith in appearances and celebrates literature, wit, and human unpredictability.',
    memorize: [
      'Think-Tank mistakes nursery rhymes for coded Earth communication.',
      'The Martians are intelligent yet foolishly arrogant.',
      'Humour comes from misunderstanding simple books and harmless culture.'
    ]
  },
  'words_expressions/unit-01-a-letter-to-god.html': {
    summary: 'Build vocabulary, tone, and response writing around faith, irony, and sympathy in Lencho\'s story.',
    memorize: [
      'Faith, harvest, hailstorm, and charity are the key thematic words.',
      'Lencho\'s certainty contrasts with the post office workers\' human kindness.',
      'Written responses should mention both faith and irony.'
    ]
  },
  'words_expressions/unit-02-nelson-mandela.html': {
    summary: 'Use Mandela\'s chapter to sharpen word choice around freedom, courage, oppression, and dignity.',
    memorize: [
      'Freedom, apartheid, courage, and reconciliation are central vocabulary anchors.',
      'Mandela\'s message links personal growth with public responsibility.',
      'Answers should connect historical context with universal human values.'
    ]
  },
  'words_expressions/unit-03-two-stories-flying.html': {
    summary: 'Practice narrative comparison through fear, risk, and sudden change in both flying stories.',
    memorize: [
      'Fear, instinct, courage, and mystery are high-value comparison words.',
      'Both plots move from hesitation to action.',
      'A short comparison answer should mention different settings but similar emotional arc.'
    ]
  },
  'words_expressions/unit-04-diary-of-anne-frank.html': {
    summary: 'Use the diary chapter to strengthen first-person voice, reflection, and everyday humour.',
    memorize: [
      'Diary, companion, reflection, and chatterbox are useful vocabulary points.',
      'Anne\'s voice is intimate, witty, and observant.',
      'Good answers show why the diary matters emotionally, not just factually.'
    ]
  },
  'words_expressions/unit-05-glimpses-of-india.html': {
    summary: 'Combine description, travel writing, and cultural details from Goa, Coorg, and Assam.',
    memorize: [
      'Tradition, scenery, plantation, and hospitality are recurring word fields.',
      'Each section presents a different slice of Indian identity.',
      'Strong answers use sensory details: smell of bread, green hills, tea gardens.'
    ]
  },
  'words_expressions/unit-06-mijbil-the-otter.html': {
    summary: 'Develop animal-description vocabulary and personal response through Mij\'s behaviour.',
    memorize: [
      'Playful, affectionate, curious, and intelligent suit Mij well.',
      'The text mixes humour with tenderness.',
      'Character answers should show how the pet changes the narrator\'s emotional world.'
    ]
  },
  'words_expressions/unit-07-madam-rides-the-bus.html': {
    summary: 'Sharpen descriptive and analytical language around childhood curiosity, planning, and maturity.',
    memorize: [
      'Curious, determined, independent, and observant are key traits for Valli.',
      'The bus ride is both an adventure and a lesson.',
      'A complete answer should mention preparation, excitement, and final emotional change.'
    ]
  },
  'words_expressions/unit-08-sermon-at-benares.html': {
    summary: 'Use this unit to strengthen reflective writing on grief, wisdom, and universal truth.',
    memorize: [
      'Mortality, detachment, grief, and wisdom are the core vocabulary anchors.',
      'Kisa Gotami learns through experience, not direct lecture alone.',
      'Answers should connect the incident with Buddha\'s teaching on impermanence.'
    ]
  },
  'words_expressions/unit-09-the-proposal.html': {
    summary: 'Focus on dramatic irony, argument, and exaggeration while working with this comic play.',
    memorize: [
      'Proposal, quarrel, absurd, and pretension are useful keywords.',
      'The comic effect comes from overreaction and trivial disputes.',
      'Drama answers should note tone, stage-like conflict, and humour.'
    ]
  },
  'worksheets/maths/worksheet-01-real-numbers.html': {
    summary: 'Revise HCF, LCM, prime factorisation, and terminating-decimal conditions through direct problem practice.',
    memorize: [
      'Euclid division lemma drives HCF steps.',
      'Unique prime factorisation must be written correctly.',
      'Only denominators of the form 2^m x 5^n give terminating decimals.'
    ]
  },
  'worksheets/maths/worksheet-02-polynomials.html': {
    summary: 'Practice linking zeroes, factors, and coefficient relationships in quick algebra questions.',
    memorize: [
      'If p(a) = 0 then (x - a) is a factor.',
      'For ax^2 + bx + c, sum of zeroes = -b/a.',
      'For ax^2 + bx + c, product of zeroes = c/a.'
    ]
  },
  'worksheets/maths/worksheet-03-pair-of-linear-equations.html': {
    summary: 'Solve pairs of equations fast and identify whether they meet once, never, or always.',
    memorize: [
      'Unique solution when a1/a2 != b1/b2.',
      'No solution when a1/a2 = b1/b2 != c1/c2.',
      'Infinite solutions when a1/a2 = b1/b2 = c1/c2.'
    ]
  },
  'worksheets/maths/worksheet-04-quadratic-equations.html': {
    summary: 'Use factorisation and discriminant logic to finish quadratic questions accurately.',
    memorize: [
      'x = (-b +/- sqrt(b^2 - 4ac)) / 2a.',
      'Discriminant D = b^2 - 4ac.',
      'Sign of D tells whether roots are distinct, equal, or unreal.'
    ]
  },
  'worksheets/maths/worksheet-05-arithmetic-progressions.html': {
    summary: 'Focus on nth-term and sum-based AP questions without missing the common difference.',
    memorize: [
      'a_n = a + (n - 1)d.',
      'S_n = n/2 [2a + (n - 1)d].',
      'd is constant throughout an AP.'
    ]
  },
  'worksheets/maths/worksheet-06-triangles.html': {
    summary: 'Apply triangle similarity and proportionality results in proof-style and ratio-style questions.',
    memorize: [
      'Similarity criteria: AAA, SAS, SSS.',
      'A line parallel to one side divides the other two sides proportionally.',
      'Area ratio of similar triangles = square of side ratio.'
    ]
  },
  'worksheets/maths/worksheet-07-coordinate-geometry.html': {
    summary: 'Revise section formula, midpoint, and triangle area through coordinate drills.',
    memorize: [
      'Internal division formula uses m and n with both coordinates.',
      'Midpoint = average of x-values and y-values.',
      'Triangle area formula must be used with absolute value.'
    ]
  },
  'worksheets/maths/worksheet-08-introduction-to-trigonometry.html': {
    summary: 'Practice trig ratios, reciprocal relations, and identities until the side labels become automatic.',
    memorize: [
      'sin, cos, tan come from perpendicular, base, and hypotenuse.',
      'cosec, sec, and cot are reciprocals.',
      'sin^2 theta + cos^2 theta = 1.'
    ]
  },
  'worksheets/maths/worksheet-09-applications-of-trigonometry.html': {
    summary: 'Translate heights and distances quickly into right triangles and use the right ratio.',
    memorize: [
      'Angle of elevation points upward from the horizontal.',
      'Angle of depression points downward from the horizontal.',
      'Draw the figure before substituting values.'
    ]
  },
  'worksheets/maths/worksheet-10-circles.html': {
    summary: 'Use tangent facts and equal lengths to solve short reasoning questions.',
    memorize: [
      'Tangent is perpendicular to the radius at the point of contact.',
      'Tangents from one external point are equal.',
      'Only one tangent can be drawn at a point on a circle.'
    ]
  },
  'worksheets/maths/worksheet-11-areas-related-to-circles.html': {
    summary: 'Switch confidently between full-circle formulas and sector formulas.',
    memorize: [
      'Area = pi r^2 and circumference = 2pi r.',
      'Sector area = (theta/360) x pi r^2.',
      'Arc length = (theta/360) x 2pi r.'
    ]
  },
  'worksheets/maths/worksheet-12-surface-areas-and-volumes.html': {
    summary: 'Keep formulas and units straight while combining solids and hollow shapes.',
    memorize: [
      'Cone, cylinder, sphere, and hemisphere formulas must be chosen carefully.',
      'Use consistent units before comparing volumes.',
      'Combined solids often need addition or subtraction of volumes.'
    ]
  },
  'worksheets/maths/worksheet-13-statistics.html': {
    summary: 'Practice grouped-data questions with class boundaries, frequencies, and median-mode formulas.',
    memorize: [
      'Median class contains N/2.',
      'Assumed mean method saves time in grouped-data mean.',
      'Mode formula depends on the modal class and adjacent frequencies.'
    ]
  },
  'worksheets/maths/worksheet-14-probability.html': {
    summary: 'Keep favourable outcomes, total outcomes, and complementary events precise in probability drills.',
    memorize: [
      'P(E) = favourable outcomes / total outcomes.',
      'Probability lies between 0 and 1.',
      'P(not E) = 1 - P(E).'
    ]
  }
};

if (typeof window !== 'undefined') {
  window.STUDY_PORTAL_MEMORY_BANK = STUDY_PORTAL_MEMORY_BANK;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = STUDY_PORTAL_MEMORY_BANK;
}
