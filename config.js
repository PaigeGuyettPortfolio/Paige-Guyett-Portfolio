/* ==========================================================================
   PORTFOLIO CONFIGURATION — everything you will want to change lives here.

   1  SITE            your name and the small labels
   2  ANIMATION       speed and strength of all movement
   3  SCENE ORDER     the walkthrough sequence
   4  SCENES          photographs, hotspot locations, doors and transitions
   5  PANELS          biography, dogs, design values, stable stories
   6  PROJECTS        the three portfolio projects
   7  CONTACT         email, résumé, aspirations

   Images anywhere on this page can be written three ways:
     { src: 'images/my-photo.jpg', caption: '...' }    a file you have added
     { scene: 'foyer', crop: [x, y, w, h] }            a detail of a scene photo
     { slot: 'Floor plan, level one' }                 an empty, labelled frame
   Anything in [square brackets] is placeholder text waiting for your words.
   ========================================================================== */

window.PORTFOLIO = {

  /* 1 — SITE ------------------------------------------------------------- */
  site: {
    name: 'Paige Guyett',
    discipline: 'Interior Design Portfolio',
    showEditButton: true            // set false before sharing with visitors
  },

  /* 2 — ANIMATION -------------------------------------------------------- */
  animation: {
    /* Navigation between scenes */
    transitionSeconds: 1.3,  // total length of a walk between scenes
    pushAmount: 0.035,       // camera push toward the clicked area (0.035 = 3.5%)
    reducedSeconds: 0.5,     // plain crossfade for visitors who prefer reduced motion

    /* Environment: never affects the architecture */
    intensity: 1,            // grasses, foliage, daylight. 0 = still, 1 = as designed
    fogParallax: 1,          // how much the fog responds to the mouse
    settleSeconds: 1.6,      // how gently the environment fades in on arrival

    /* Framing */
    narrowBelow: 99          // narrower windows (phones) fill the height and can be dragged sideways
  },

  /* SOUND ---------------------------------------------------------------
     Off until a visitor turns it on. 0 = silent, 1 = as designed.          */
  sound: {
    master: 0.35,
    ambience: 1,       // wind, fire bed, room tone
    details: 1,        // birds, crackles, clock, dogs, horses, timber
    doorways: 0,       // latch, footsteps, gravel
    music: 0.6,        // the piano and bass that play inside the house
    musicRooms: ['foyer', 'living-room', 'kitchen'],
    fadeSeconds: 1.3,  // blend between scenes
    scenes: { exterior: 1, foyer: 1, 'living-room': 1, kitchen: 1, backyard: 1, stable: 1 }
  },

  /* 3 - SCENE ORDER ------------------------------------------------------ */
  order: ['exterior', 'foyer', 'living-room', 'kitchen', 'backyard', 'stable'],

  /* 4 - SCENES -----------------------------------------------------------
     Hotspot coordinates are pixels in the photograph (1672 x 941).
     shapes  the clickable outline(s) of the object
     marker  where the small indicator sits
     action  { panel: 'id' } | { go: 'scene-id' }
     Turn on Edit mode to see outlines and read coordinates under your cursor. */
  scenes: {

    exterior: {
      label: 'Exterior', image: 'images/01-exterior.webp', size: [1672, 941],
      focus: [927, 470], caption: '',
      welcome: { title: 'Paige Guyett', line: 'My Portfolio' },
      hotspots: [
        { id: 'front-door', label: 'Front door', sound: 'latch', marker: [927, 512],
          shapes: [[[881,581],[881,470],[893,441],[927,423],[961,441],[973,470],[973,581]]],
          action: { go: 'foyer' } }
      ]
    },

    foyer: {
      label: 'Foyer', image: 'images/02-foyer.webp', size: [1672, 941],
      focus: [1010, 470], focusNarrow: [1395, 470], captionTop: true, caption: 'Foyer',
      hotspots: [
        { id: 'dogs', label: 'Charlie and Dallas', marker: [1432, 672],
          shapes: [[[1232,800],[1242,640],[1250,535],[1285,560],[1345,590],[1420,650],[1432,700],[1450,610],[1490,596],[1540,620],[1552,690],[1540,764],[1430,764],[1350,740],[1320,822],[1236,815]]],
          action: { panel: 'dogs' } },
        { id: 'artwork', label: 'About Paige', marker: [1076, 312],
          shapes: [[[960,242],[1192,193],[1192,425],[960,432]]],
          action: { panel: 'about' } },
        { id: 'to-living', label: 'Into the living room', marker: [610, 300], exit: true,
          shapes: [[[345,660],[345,330],[400,262],[540,226],[680,262],[745,335],[745,660]]],
          action: { go: 'living-room' } }
      ]
    },

    'living-room': {
      label: 'Living Room', image: 'images/03-living-room.webp', size: [1672, 941],
      focus: [800, 470], focusNarrow: [420, 470], caption: 'Living Room',
      hotspots: [
        { id: 'fireplace', label: 'My Design Philosophy', marker: [252, 430],
          shapes: [[[60,373],[448,373],[448,456],[422,456],[422,668],[487,672],[487,745],[180,745],[175,456],[60,456]]],
          action: { panel: 'philosophy' } },
        { id: 'to-kitchen', label: 'Into the kitchen', marker: [1500, 470], exit: true,
          shapes: [[[1385,282],[1672,240],[1672,684],[1385,684]]],
          action: { go: 'kitchen' } }
      ]
    },

    kitchen: {
      label: 'Kitchen', image: 'images/04-kitchen.webp', size: [1672, 941],
      focus: [800, 470], focusNarrow: [780, 470], caption: 'Kitchen',
      hotspots: [
        { id: 'island-plant', label: 'My Design Process', marker: [826, 545],
          shapes: [[[715,560],[740,470],[700,420],[760,380],[850,355],[960,380],[1000,430],[930,470],[870,520],[862,600],[792,600]]],
          action: { panel: 'behind-the-design' } },
        { id: 'to-backyard', label: 'Out to the backyard', sound: 'latch', marker: [1383, 455], exit: true,
          shapes: [[[1282,252],[1484,252],[1484,678],[1282,678]]],
          action: { go: 'backyard' } }
      ]
    },

    backyard: {
      label: 'Backyard', image: 'images/05-backyard.webp', size: [1672, 941],
      focus: [1000, 450], caption: 'Backyard',
      hotspots: [
        { id: 'plants', label: 'Nature', marker: [1010, 610],
          shapes: [[[745,540],[1100,510],[1312,640],[1250,706],[1010,702]], [[1385,705],[1672,620],[1672,941],[1450,941]]],
          action: { panel: 'biophilic-design' } },
        { id: 'to-stable', label: 'Walk to the stable', sound: 'gravel', marker: [1400, 410], exit: true,
          shapes: [[[1120,500],[1122,445],[1195,395],[1312,380],[1320,350],[1365,328],[1408,350],[1505,345],[1620,440],[1612,500]], [[1016,941],[1200,700],[1372,650],[1440,625],[1320,585],[1228,545],[1330,516],[1400,510],[1290,572],[1490,640],[1460,680],[1300,750],[1200,941]]],
          action: { go: 'stable' } }
      ]
    },

    stable: {
      label: 'Stable', image: 'images/06-stable.webp', size: [1672, 941],
      focus: [836, 470], focusNarrow: [1341, 470], caption: 'Stable',
      hotspots: [
        { id: 'horse-1', label: 'Springwater Kitchen', marker: [1530, 430],
          shapes: [[[1452,500],[1490,420],[1515,312],[1600,362],[1640,370],[1640,520],[1470,522]]],
          action: { panel: 'project-1' } },
        { id: 'horse-2', label: 'The Cottage', marker: [1288, 459],
          shapes: [[[1228,480],[1250,420],[1312,410],[1312,520],[1240,525]]],
          action: { panel: 'project-2' } },
        { id: 'horse-3', label: 'The Creative Cruise', marker: [1150, 493],
          shapes: [[[1122,520],[1140,465],[1170,470],[1170,540],[1125,540]]],
          action: { panel: 'project-3' } },
        { id: 'stable-doors', label: 'Looking Ahead', marker: [835, 540],
          shapes: [[[718,642],[718,458],[770,412],[835,394],[900,412],[952,458],[952,642]]],
          action: { panel: 'stable-goal' } }
      ]
    }
  },

  /* 5 — PANELS ----------------------------------------------------------- */
  panels: {

    /* The foyer */
    dogs: {
      slim: true,
      eyebrow: 'Meet the dogs',
      title: 'Charlie and Dallas',
      image: { src: 'images/dogs-on-the-stairs.jpg', alt: 'Charlie and Dallas together on the stairs', ratio: '5 / 4', position: '46% 74%' },
      body: ['Charlie, my four-year-old Husky/Rottweiler mix, is my very first dog and my little shadow. Dallas, my three-year-old Dachshund, has a big personality packed into a little body and never fails to make me laugh.']
    },

    'stable-goal': {
      slim: true,
      eyebrow: 'Looking Ahead',
      title: 'Designing Stables',
      lede: 'One day, I hope to design horse stables.',
      image: { src: 'images/looking-ahead-stable.webp', alt: 'Watercolour of a stone horse stable with a central arched carriageway' },
      body: [
        'A stable has to work hard for the horses and the people who care for them, while still being a beautiful place to spend time.',
        'I would love to bring what I am learning about space planning, natural light, and natural materials into buildings designed around them.'
      ]
    },

    /* The stable: one template per horse. Replace the wording and slots when your projects are ready. */
    'project-1': {
      slim: true, plain: true,
      eyebrow: 'Project One',
      title: 'Springwater Kitchen',
      lede: 'A new kitchen for a new home, from 3D model to installation.',
      body: [
        'Designed for a home in a newly built subdivision in Springwater, this kitchen started from a completely blank slate. The design was modelled in SketchUp, then built and installed by Three Oaks Interiors.',
        'Oak accents bring warmth against clean quartz countertops, while a cabinet that sits directly on the counter and a pull-out garbage add thoughtful, everyday function.'
      ],
      facts: [['Location', 'Springwater'], ['Year', '2026'], ['Project', 'New-build kitchen'], ['Modelled in', 'SketchUp'], ['Built and installed by', 'Three Oaks Interiors']],
      uploads: [
        { src: 'images/project-1-kitchen-model.webp', alt: 'SketchUp model of the full kitchen', caption: 'The kitchen, modelled in SketchUp', wide: true },
        { src: 'images/project-1-island-model.webp', cutout: true, alt: 'SketchUp model showing both sides of the island', caption: 'Island design, both sides', wide: true },
        { src: 'images/project-1-finished-kitchen.jpg', alt: 'The finished kitchen with its oak island and quartz countertops', caption: 'The finished kitchen' },
        { src: 'images/project-1-range-wall.jpg', alt: 'White shaker cabinetry and oak-trimmed range hood', caption: 'Range wall' },
        { src: 'images/project-1-flatlay.webp', cutout: true, alt: 'Flatlay of white shaker door, stained oak, veined quartz, matte black pulls, flooring, stainless steel and grey fabric', caption: 'Colour and material flatlay', wide: true }
      ]
    },
    'project-2': {
      slim: true, plain: true,
      eyebrow: 'Project Two',
      title: 'The Cottage',
      sections: [
        { label: 'Context', text: 'Lucy is a 50-year-old woman living with multiple sclerosis and limited mobility on her left side following a car accident. She lives independently but is transitioning to full-time wheelchair use and will require occasional in-home care. She values her independence, enjoys creating art, and loves hosting family and friends. The design must support her physical needs while maintaining dignity, comfort, and a strong sense of personal identity.' },
        { label: 'Design Concept', text: 'The concept is a cozy, nature-inspired cottage designed for lifelong living, drawing from the surrounding landscape of Muskoka. The design brings the outdoors inside through natural materials, soft textures, and strong visual connections to nature. It creates a welcoming and empowering environment that supports Lucy’s evolving needs while allowing her to live independently and continue expressing herself through art and hosting.' }
      ],
      facts: [['Type', 'Residential'], ['Location', 'Muskoka'], ['Year', '2026'], ['Software', 'SketchUp, Gemini']],
      uploads: [
        { src: 'images/project-2-exterior.webp', alt: 'Exterior of the cottage among the trees', wide: true },
        { src: 'images/project-2-plan.webp', cutout: true, alt: 'Numbered floor plan of the cottage with legend', caption: 'Floor plan', wide: true },
        { src: 'images/project-2-entryway.webp', alt: 'Cottage entryway', caption: 'Entryway' },
        { src: 'images/project-2-kitchen.webp', alt: 'Cottage kitchen', caption: 'Kitchen' },
        { src: 'images/project-2-living.webp', alt: 'Cottage breakfast nook and living room', caption: 'Breakfast Nook/Living Room' },
        { src: 'images/project-2-bedroom.webp', alt: 'Cottage primary bedroom', caption: 'Primary Bedroom' },
        { src: 'images/project-2-palette.webp', cutout: true, alt: 'Colour and material palette for the cottage', caption: 'Colour and material palette', wide: true },
        { src: 'images/project-2-flatlay.webp', cutout: true, alt: 'Flatlay of cream stone, walnut, oak flooring, cream boucle, sage fabric, matte black metal and green paints', caption: 'Colour and material flatlay', wide: true }
      ]
    },
    'project-3': {
      slim: true, plain: true,
      eyebrow: 'Project Three',
      title: 'The Creative Cruise',
      sections: [
        { label: 'Context', text: 'This project involves the design of a commercial office space for ModuNest, a forward-thinking company specializing in 3D-printed housing. As workplace culture continues to shift, the primary goal was to create an environment that actively encourages employees to come into the office rather than work remotely. The existing workspace lacked energy, comfort, and a sense of identity, making it less appealing for daily use. This design responds by creating a destination-driven workplace that supports productivity, collaboration, and wellbeing, while reflecting ModuNest’s innovative and technology-driven approach.' },
        { label: 'Design Concept', text: 'The Cruise: Inspired by the experience of a luxury voyage, the office is designed as a journey rather than a static workspace. Different zones act as “decks” and “cabins,” offering a variety of spatial experiences from vibrant collaborative hubs to calm, focused retreats. Smooth transitions, sensory materials, and a cohesive flow create a workplace that feels immersive, energizing, and connected—encouraging creativity, exploration, and a strong sense of community.' }
      ],
      facts: [['Type', 'Commercial'], ['Location', 'Barrie'], ['Year', '2025'], ['Software', 'SketchUp, Twinmotion']],
      uploads: [
        { src: 'images/project-3-hero.webp', alt: 'ModuNest reception desk at the entry of the office', wide: true },
        { src: 'images/project-3-plan.webp', cutout: true, alt: 'Numbered floor plan of the office with legend', caption: 'Floor plan', wide: true },
        { src: 'images/project-3-zoning.webp', cutout: true, alt: 'Diagram of private and social zones', caption: 'Private and social zones', wide: true },
        { src: 'images/project-3-pool-deck.webp', alt: 'Pool Deck presentation space', caption: 'Pool Deck' },
        { src: 'images/project-3-bar.webp', alt: 'Office bar', caption: 'Bar' },
        { src: 'images/project-3-boardroom-1.webp', alt: 'Boardroom with an outdoor view', caption: 'Boardroom' },
        { src: 'images/project-3-boardroom-2.webp', alt: 'Boardroom seen from another angle', caption: 'Boardroom' },
        { src: 'images/project-3-outdoor.webp', alt: 'Outdoor Space', caption: 'Outdoor Space' },
        { src: 'images/project-3-lounge.webp', alt: 'Lounge', caption: 'Lounge' },
        { src: 'images/project-3-flatlay.webp', cutout: true, alt: 'Flatlay of teak decking, warm wood, curved white panel with warm light, teal fabric, brass, living green and paints', caption: 'Colour and material flatlay', wide: true }
      ]
    },

    /* Panels below are saved but not linked from any room right now. */
    /* The kitchen: Behind the Design.
       To add your work, replace a { slot: '...' } line with
       { src: 'images/your-file.jpg', caption: 'Your caption' }. */
    'behind-the-design': {
      slim: true, plain: true,
      eyebrow: 'Behind the Design',
      title: 'My Design Process',
      steps: [
        { title: 'Understanding the Space', image: { src: 'images/process-1-existing-plan.webp', alt: 'Floor plan showing the empty rooms before furniture' },
          text: 'My approach to interior design begins with understanding how a space will be used and how it should feel.' },
        { title: 'Space Planning', image: { src: 'images/process-2-furniture-plan.webp', alt: 'Floor plan with furniture layout', compare: 'images/process-1-existing-plan.webp', compareAlt: 'The same floor plan with empty rooms', compareLabels: ['Empty', 'Furnished'] },
          text: 'I love exploring how people move through and interact with a space. Thoughtful layouts can improve functionality, encourage connection, and make everyday routines feel effortless.' },
        { title: 'FF&E Selection', image: { src: 'images/process-3-material-flatlay.webp', alt: 'Flatlay of oak, stone, tile, linen, brass and paint samples' },
          text: 'Furniture, fixtures, finishes, and materials are where a design begins to develop its personality. I enjoy combining colours, textures, and collected pieces to create a cohesive and inviting atmosphere.' },
        { title: 'Bringing Ideas to Life', image: { src: 'images/process-4-kitchen-rendering.webp', alt: 'Rendering of a warm cream and oak kitchen' },
          text: 'Using tools such as SketchUp, Revit, AutoCAD, and Twinmotion, I translate ideas into drawings, models, and renderings that help communicate a design before it’s brought to life.' }
      ],
      closing: ['Through my studies and practical experience designing kitchens at Three Oaks Interiors, I’ve learned to appreciate both the creative and technical sides of the process.']
    },

    'space-planning': {
      slim: true,
      eyebrow: 'Behind the Design · 01',
      title: 'Space Planning',
      lede: 'The foundation of every design.',
      body: ['I love exploring how people move through and interact with a space.', 'Thoughtful layouts can improve functionality, encourage connection, and make everyday routines feel effortless.'],
      uploads: [{ slot: 'Floor plan · image to come' }, { slot: 'Floor plan · image to come' }]
    },

    'ffe-selection': {
      slim: true,
      eyebrow: 'Behind the Design · 02',
      title: 'FF&E Selection',
      lede: 'Bringing character into the details.',
      body: ['Furniture, fixtures, finishes, and materials are where a design begins to develop its personality.', 'I enjoy combining colours, textures, and collected pieces to create a cohesive and inviting atmosphere.'],
      uploads: [{ slot: 'Colour palette · image to come' }, { slot: 'FF&E selection · image to come' }, { slot: 'Material board · image to come', wide: true }]
    },

    'ideas-to-life': {
      slim: true,
      eyebrow: 'Behind the Design · 03',
      title: 'Bringing Ideas to Life',
      lede: 'From concept to visualization.',
      body: ['Using tools such as SketchUp, Revit, AutoCAD, and Twinmotion, I translate ideas into drawings, models, and renderings that help communicate a design before it’s brought to life.'],
      uploads: [{ slot: 'Rendering · image to come', wide: true }, { slot: '3D model · image to come', wide: true }]
    },

    /* The foyer */
    about: {
      slim: true, mode: 'spot',
      eyebrow: 'About Paige',
      title: 'Hi, I’m Paige Guyett',
      portrait: { src: 'images/paige-guyett.webp', alt: 'Portrait of Paige Guyett', ratio: '4 / 5', position: '50% 20%', fx: 'tilt' },
      body: [
        'I’m a third-year interior design student with a lifelong love of architecture, space planning, and creating spaces that feel as good as they look.',
        'My design style is inspired by places with character—from welcoming farmhouses and charming English cottages to breezy coastal retreats. I’m drawn to antique pieces, natural materials, and thoughtful details that give a space its own personality.',
        'Outside of design, you’ll usually find me travelling, spending time outdoors, learning something new, or making memories with family, friends, and my two dogs.',
        'I believe great design begins with understanding people. I love exchanging ideas, exploring possibilities, and helping others create spaces where they feel like they belong.'
      ]
    },

    charlie: {
      slim: true,
      eyebrow: 'Meet Charlie',
      title: 'Charlie',
      image: { src: 'images/dogs-on-the-stairs.jpg', size: [1500, 2000], crop: [120, 830, 760, 608], alt: 'Charlie, a black-and-tan Husky and Rottweiler mix, lying on the stairs' },
      lede: 'My Loyal Shadow',
      body: [
        'Charlie is my four-year-old female Husky/Rottweiler mix and my very first dog.',
        'She’s my girl, my constant companion, and my little shadow. Wherever I go, Charlie is usually right behind me.',
        'She’s always there for me, and I couldn’t imagine life without her.'
      ]
    },

    dallas: {
      slim: true,
      eyebrow: 'Meet Dallas',
      title: 'Dallas',
      image: { src: 'images/dogs-on-the-stairs.jpg', size: [1500, 2000], crop: [775, 1000, 560, 448], alt: 'Dallas, a small black-and-tan Dachshund, sitting on the stairs' },
      lede: 'The Little Troublemaker',
      body: [
        'Dallas is my three-year-old male Dachshund with a big personality packed into a little body.',
        'He’s mischievous, full of character, and never fails to make me laugh.',
        'Life is definitely more entertaining with Dallas around!'
      ]
    },

    /* The living room */
    philosophy: {
      slim: true, mode: 'leaves',
      eyebrow: 'The Living Room',
      title: 'My Design Philosophy',
      image: { src: 'images/biophilic-forest-walk.webp', alt: 'Paige walking a forest trail among autumn trees' },
      body: [
        'I believe a space should be a reflection of the people who use it. More than just beautiful, it should create a feeling—somewhere you feel comfortable, connected, and genuinely yourself.',
        'My approach to design brings together character, functionality, aesthetics, and sustainability. I’m drawn to natural light, meaningful collected pieces, organic materials, and spaces that encourage connection with both nature and the people around us.',
        'I believe the most memorable interiors engage more than just our sense of sight. From the warmth of sunlight through a window to the textures, scents, and atmosphere of a room, it’s these details that give a space its sense of belonging.',
        'Every design begins with understanding the people who will experience it. Their daily routines, needs, preferences, and personalities guide the choices that make each space uniquely theirs.'
      ]
    },

    'personal-connection': {
      slim: true,
      eyebrow: 'The Living Room',
      title: 'Personal Connection',
      image: { scene: 'living-room', crop: [600, 540, 800, 400], alt: 'The living room seating' },
      body: [
        'Every space should reflect the personality, lifestyle, and story of the people who call it home.',
        'I believe understanding someone’s daily life, personal preferences, and what makes them comfortable is essential to creating a meaningful interior.'
      ]
    },

    'inspired-by-nature': {
      slim: true,
      eyebrow: 'The Living Room',
      title: 'Inspired by Nature',
      image: { scene: 'living-room', crop: [780, 200, 620, 420], alt: 'The olive tree in the living room' },
      body: [
        'Natural light, organic materials, and meaningful connections to the outdoors create spaces that feel grounded and welcoming.',
        'I love the way these elements can influence the atmosphere of a room and the way people experience it.'
      ]
    },

    'beauty-with-purpose': {
      slim: true,
      eyebrow: 'The Living Room',
      title: 'Beauty with Purpose',
      image: { scene: 'living-room', crop: [480, 690, 640, 240], alt: 'The timber coffee table' },
      body: [
        'A space should be as functional as it is beautiful.',
        'I believe thoughtful space planning and intentional design choices can support everyday life without sacrificing character, comfort, or creativity.'
      ]
    },

    /* The backyard and stable */    'biophilic-design': {
      slim: true, nature: true,
      eyebrow: 'Rooted in Nature',
      title: 'Biophilic Design',
      body: [
        'I believe our connection to nature is essential to our wellbeing, yet it’s something we can easily lose in our everyday lives.',
        'Being outdoors brings me a sense of calm, happiness, and belonging—feelings I hope to bring into the spaces I design.',
        'Through biophilic design, I look for opportunities to strengthen the relationship between interiors and the natural world.',
        'Large windows, natural materials, and thoughtful connections to the outdoors can help create spaces that feel peaceful, inspiring, and grounded.'
      ]
    },

    connection: {
      slim: true,
      eyebrow: 'Rooted in Nature',
      title: 'Connection',
      image: { scene: 'backyard', crop: [905, 170, 767, 270], alt: 'Mountains and morning fog beyond the farmhouse' },
      lede: 'Bringing the outdoors in.',
      body: [
        'I believe interior spaces should help people maintain a meaningful connection with the natural world.',
        'Natural light, large windows, and views of the outdoors can create environments that feel calming, uplifting, and connected to their surroundings.'
      ]
    },

    materiality: {
      slim: true,
      eyebrow: 'Rooted in Nature',
      title: 'Materiality',
      image: { scene: 'backyard', crop: [430, 170, 400, 260], alt: 'Limestone and timber on the farmhouse wall' },
      lede: 'Inspired by the natural world.',
      body: [
        'I’m drawn to natural materials and the warmth, character, and atmosphere they bring to interiors.',
        'I enjoy incorporating these elements into my designs to create spaces that feel comfortable, grounded, and timeless.'
      ]
    },

    reimagine: {
      slim: true,
      eyebrow: 'Rooted in Nature',
      title: 'Reimagine',
      image: { scene: 'backyard', crop: [380, 500, 560, 340], alt: 'The timber dining table on the terrace' },
      lede: 'Finding beauty in what’s already there.',
      body: [
        'Sustainability is also about recognizing potential in what already exists.',
        'I love the idea of reclaiming furniture, restoring existing spaces, and giving overlooked materials a second life.',
        'Beautiful design doesn’t always require starting from scratch.'
      ]
    },

    'my-experience': {
      slim: true,
      eyebrow: 'Rooted in Nature',
      title: 'My Experience',
      image: { scene: 'backyard', crop: [165, 220, 400, 280], alt: 'Glazed doors looking into the farmhouse' },
      body: [
        'I’ve explored biophilic design throughout my school projects and incorporated natural materials into my kitchen designs at Three Oaks Interiors.',
        'As I continue developing as a designer, I hope to bring these ideas further into my professional work.'
      ]
    },

    horses: {
      eyebrow: 'A personal story',
      title: 'What horses teach you about a room',
      image: { scene: 'stable', crop: [1090, 290, 582, 340] },
      lede: '[One sentence on what animals have meant in your life.]',
      blocks: [
        { heading: 'My love of animals', text: '[Your first horse, your first ride, the barn where you spent your weekends. Write it as you would tell it.]' },
        { heading: 'What I carried into design', text: '[Horses notice everything: light, noise, a change underfoot. Say what that has taught you about designing for the living.]' }
      ]
    },

    contact: { kind: 'contact' }
  },

  /* 6 — PROJECTS ---------------------------------------------------------
     Add as many images to any list as you need. Sections with an empty list
     are left out of the presentation automatically.                        */
  projects: [
    {
      object: 'The sketchbook',
      title: '[Project One Title]',
      subtitle: '[Project type, such as a residential renovation]',
      hero: { scene: 'kitchen', crop: [200, 40, 1300, 680] },
      facts: [['Location', '[City]'], ['Area', '[000 sq ft]'], ['Studio', '[Course, year]']],
      description: '[Two or three sentences on the brief: who the client is, what the site is, and the problem the project solves.]',
      concept: '[The single idea behind the project, stated plainly.]',
      conceptQuote: '[A one-line version of your concept.]',
      research: '[What you studied: precedents, user needs, site history, codes.]',
      researchImages: [{ slot: 'Research diagram or precedent' }, { slot: 'Site analysis' }],
      floorPlans: [{ slot: 'Floor plan, level one', wide: true }, { slot: 'Furniture plan' }, { slot: 'Reflected ceiling plan' }],
      elevations: [{ slot: 'Interior elevation A' }, { slot: 'Interior elevation B' }],
      materials: [
        { name: '[Limestone]', note: '[Finish, source]', color: '#DCCDB4' },
        { name: '[Oak]', note: '[Finish, source]', color: '#A98559' },
        { name: '[Linen]', note: '[Finish, source]', color: '#E9E1D2' },
        { name: '[Aged leather]', note: '[Finish, source]', color: '#7A4A2B' },
        { name: '[Blackened steel]', note: '[Finish, source]', color: '#2F2D2A' }
      ],
      moodBoards: [{ slot: 'Mood board', wide: true }],
      renderings: [{ slot: 'Rendering, principal view', wide: true }, { slot: 'Rendering, detail' }, { slot: 'Rendering, evening' }],
      technical: [{ slot: 'Millwork section' }, { slot: 'Construction detail' }],
      finalImages: [{ slot: 'Final presentation board', wide: true }],
      process: [
        { stage: 'Discover', text: '[What you learned first.]' },
        { stage: 'Develop', text: '[How the idea changed.]' },
        { stage: 'Refine', text: '[What you cut, and why.]' },
        { stage: 'Deliver', text: '[How it was presented.]' }
      ],
      reflection: '[What worked, what you would change, and what this project taught you.]'
    },
    {
      object: 'Material samples',
      title: '[Project Two Title]',
      subtitle: '[Project type, such as hospitality or retail]',
      hero: { scene: 'kitchen', crop: [0, 180, 1000, 560] },
      facts: [['Location', '[City]'], ['Area', '[000 sq ft]'], ['Studio', '[Course, year]']],
      description: '[Two or three sentences on the brief: who the client is, what the site is, and the problem the project solves.]',
      concept: '[The single idea behind the project, stated plainly.]',
      conceptQuote: '[A one-line version of your concept.]',
      research: '[What you studied: precedents, user needs, site history, codes.]',
      researchImages: [{ slot: 'Research diagram or precedent' }, { slot: 'Site analysis' }],
      floorPlans: [{ slot: 'Floor plan', wide: true }, { slot: 'Furniture plan' }, { slot: 'Reflected ceiling plan' }],
      elevations: [{ slot: 'Interior elevation A' }, { slot: 'Interior elevation B' }],
      materials: [
        { name: '[Material one]', note: '[Finish, source]', color: '#C9B99D' },
        { name: '[Material two]', note: '[Finish, source]', color: '#6F6E4F' },
        { name: '[Material three]', note: '[Finish, source]', color: '#8A6A47' },
        { name: '[Material four]', note: '[Finish, source]', color: '#EFE8DB' }
      ],
      moodBoards: [{ slot: 'Mood board', wide: true }],
      renderings: [{ slot: 'Rendering, principal view', wide: true }, { slot: 'Rendering, detail' }, { slot: 'Rendering, evening' }],
      technical: [{ slot: 'Millwork section' }, { slot: 'Construction detail' }],
      finalImages: [{ slot: 'Final presentation board', wide: true }],
      process: [
        { stage: 'Discover', text: '[What you learned first.]' },
        { stage: 'Develop', text: '[How the idea changed.]' },
        { stage: 'Refine', text: '[What you cut, and why.]' },
        { stage: 'Deliver', text: '[How it was presented.]' }
      ],
      reflection: '[What worked, what you would change, and what this project taught you.]'
    },
    {
      object: 'Architectural drawings',
      title: '[Project Three Title]',
      subtitle: '[Project type, such as workplace or healthcare]',
      hero: { scene: 'kitchen', crop: [640, 60, 1032, 640] },
      facts: [['Location', '[City]'], ['Area', '[000 sq ft]'], ['Studio', '[Course, year]']],
      description: '[Two or three sentences on the brief: who the client is, what the site is, and the problem the project solves.]',
      concept: '[The single idea behind the project, stated plainly.]',
      conceptQuote: '[A one-line version of your concept.]',
      research: '[What you studied: precedents, user needs, site history, codes.]',
      researchImages: [{ slot: 'Research diagram or precedent' }, { slot: 'Site analysis' }],
      floorPlans: [{ slot: 'Floor plan', wide: true }, { slot: 'Furniture plan' }, { slot: 'Reflected ceiling plan' }],
      elevations: [{ slot: 'Interior elevation A' }, { slot: 'Interior elevation B' }],
      materials: [
        { name: '[Material one]', note: '[Finish, source]', color: '#B9A98E' },
        { name: '[Material two]', note: '[Finish, source]', color: '#5B4634' },
        { name: '[Material three]', note: '[Finish, source]', color: '#DCD3C1' },
        { name: '[Material four]', note: '[Finish, source]', color: '#38352F' }
      ],
      moodBoards: [{ slot: 'Mood board', wide: true }],
      renderings: [{ slot: 'Rendering, principal view', wide: true }, { slot: 'Rendering, detail' }, { slot: 'Rendering, evening' }],
      technical: [{ slot: 'Millwork section' }, { slot: 'Construction detail' }],
      finalImages: [{ slot: 'Final presentation board', wide: true }],
      process: [
        { stage: 'Discover', text: '[What you learned first.]' },
        { stage: 'Develop', text: '[How the idea changed.]' },
        { stage: 'Refine', text: '[What you cut, and why.]' },
        { stage: 'Deliver', text: '[How it was presented.]' }
      ],
      reflection: '[What worked, what you would change, and what this project taught you.]'
    }
  ],

  /* 7 — CONTACT ---------------------------------------------------------- */
  contact: {
    eyebrow: 'Let\u2019s connect',
    title: 'Contact Me',
    name: 'Paige Guyett',
    phone: '905 251 8836',
    phoneLink: '+19052518836',
    email: 'plguyett@gmail.com',
    location: 'Barrie, Ontario'
  }
};
