(function (root) {
  'use strict';

  var NM = (root.NM = root.NM || {});

  var DISKS = {
    number: {
      id: 'number',
      shortLabel: 'NUMBER',
      title: 'NUMBER MUNCHERS',
      subtitle: '1986 / 1990 MECC CLASSIC EDITION',
      modes: [
        { id: 'multiples', label: 'Multiples' },
        { id: 'factors', label: 'Factors' },
        { id: 'primes', label: 'Primes' },
        { id: 'equality', label: 'Equality' },
        { id: 'inequality', label: 'Inequality' },
        { id: 'challenge', label: 'Challenge (All 5 Mix)' }
      ]
    },
    word: {
      id: 'word',
      shortLabel: 'WORD',
      title: 'WORD MUNCHERS',
      subtitle: '1985 / 1990 MECC PHONICS & GRAMMAR EDITION',
      modes: [
        { id: 'short_vowels', label: 'Short Vowels (cat, bed, pig...)' },
        { id: 'long_vowels', label: 'Long Vowels (cake, tree, kite...)' },
        { id: 'special_vowels', label: 'Vowel Teams & R-Vowels (moon, star...)' },
        { id: 'grammar', label: 'Parts of Speech (Nouns, Verbs...)' },
        { id: 'synonyms', label: 'Synonyms & Antonyms' },
        { id: 'challenge', label: 'Word Challenge (All 5 Mix)' }
      ]
    },
    fraction: {
      id: 'fraction',
      shortLabel: 'FRACTION',
      title: 'FRACTION MUNCHERS',
      subtitle: '1987 MECC FRACTIONS EDITION',
      modes: [
        { id: 'types', label: 'Fraction Types (Proper, Reduced...)' },
        { id: 'equivalents', label: 'Equivalent Fractions' },
        { id: 'comparing', label: 'Comparing Fractions (< and >)' },
        { id: 'expressions', label: 'Fraction Expressions (+ and -)' },
        { id: 'challenge', label: 'Fraction Challenge (All 4 Mix)' }
      ]
    },
    super: {
      id: 'super',
      shortLabel: 'SUPER',
      title: 'SUPER MUNCHERS',
      subtitle: '1991 MECC TRIVIA CHALLENGE EDITION',
      modes: [
        { id: 'animals', label: 'Animals & Nature' },
        { id: 'space_geo', label: 'Space & Geography' },
        { id: 'science', label: 'Science & Human Body' },
        { id: 'culture', label: 'Music, Sports & Food' },
        { id: 'challenge', label: 'Super Challenge (All Trivia)' }
      ]
    }
  };

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function shuffle(arr) {
    var copy = arr.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  function normalizeDifficulty(difficulty) {
    if (difficulty === 'elementary' || difficulty === 'whiz') return difficulty;
    return 'classic';
  }

  function gcd(a, b) {
    var x = Math.abs(a);
    var y = Math.abs(b);
    while (y !== 0) {
      var t = y;
      y = x % y;
      x = t;
    }
    return x || 1;
  }

  function splitWords(csv) {
    return csv.split(',').map(function (w) { return w.trim(); }).filter(Boolean);
  }

  /* ==================== WORD MUNCHERS DATA ==================== */

  var VOWEL_POOLS = {
    short_a: {
      banner: 'Short \'a\' as in "cat"',
      soundLabel: 'short \'a\'',
      group: 'short',
      easy: splitWords('apple,ant,bag,bat,cap,cat,clap,crab,dad,flag,flat,hand,hat,jam,lamp,map,mat,nap,pan,rat,sand,van'),
      hard: splitWords('black,camp,glass,mask,plan,snap,stamp,tack,track,trap')
    },
    short_e: {
      banner: 'Short \'e\' as in "bed"',
      soundLabel: 'short \'e\'',
      group: 'short',
      easy: splitWords('bed,bell,belt,best,deck,desk,egg,elf,help,hen,jet,leg,men,mess,nest,net,pen,pet,red,rest,sled,step,tent,web,wet'),
      hard: splitWords('bench,bread,chest,dress,fence,fresh,head,lemon,melt,neck,said,smell,spell,test,vest,west')
    },
    short_i: {
      banner: 'Short \'i\' as in "pig"',
      soundLabel: 'short \'i\'',
      group: 'short',
      easy: splitWords('bib,big,chin,chip,dig,dip,dish,fin,fish,gift,hill,hit,kick,kid,king,lip,milk,mix,pig,pin,pink,rib,ring,rip,ship,sit,six,wig,win,zip'),
      hard: splitWords('brick,clip,crib,flip,grin,mist,quilt,skip,slip,spin,stick,swim,twin')
    },
    short_o: {
      banner: 'Short \'o\' as in "fox"',
      soundLabel: 'short \'o\'',
      group: 'short',
      easy: splitWords('box,clock,cob,cot,doll,dot,drop,fox,hop,hot,job,lock,mop,mom,nod,ox,pod,pop,pot,rock,shop,sock,spot,stop,top'),
      hard: splitWords('block,crop,doctor,octopus,olive,pond,robin,shock')
    },
    short_u: {
      banner: 'Short \'u\' as in "cup"',
      soundLabel: 'short \'u\'',
      group: 'short',
      easy: splitWords('bug,bump,bus,club,cub,cup,cut,drum,duck,dust,fun,gum,hug,jump,jug,luck,mug,nut,plug,pup,rug,run,sun,tub,tug,up'),
      hard: splitWords('brush,butter,flood,glove,lump,plum,puff,scrub,shrub,slug,snug,stuck,touch,truck')
    },
    long_a: {
      banner: 'Long \'a\' as in "cake"',
      soundLabel: 'long \'a\'',
      group: 'long',
      easy: splitWords('bake,cake,cape,cave,day,face,game,gate,grape,lake,late,made,mail,name,page,plate,play,rain,rake,safe,sail,same,tail,tape,train,tray,wave'),
      hard: splitWords('acorn,apron,baby,brave,chain,clay,crane,crate,eight,flame,frame,hay,paint,plane,skate,snail,snake,space,stage,whale')
    },
    long_e: {
      banner: 'Long \'e\' as in "tree"',
      soundLabel: 'long \'e\'',
      group: 'long',
      easy: splitWords('beach,bean,bee,clean,deep,eat,feet,green,heat,jeep,keep,key,leaf,meat,neat,peach,peas,queen,sea,seal,seat,see,seed,sheep,sleep,tea,team,teeth,tree,week'),
      hard: splitWords('beetle,cheese,creek,dream,eagle,field,freeze,heel,leap,peak,reach,sheet,speak,steam,street,sweet,teach,treat,weak,weed,wheel')
    },
    long_i: {
      banner: 'Long \'i\' as in "kite"',
      soundLabel: 'long \'i\'',
      group: 'long',
      easy: splitWords('bike,bite,cry,dice,dime,dive,drive,dry,five,fly,fry,hide,hike,ice,kite,lime,line,mice,mile,mine,nine,pie,pile,pine,ride,side,sky,smile,tie,time,vine,white,wide'),
      hard: splitWords('bright,child,climb,glide,high,knife,knight,light,mind,night,pride,prize,right,shine,sight,slice,slide,spy,wild,wipe,write')
    },
    long_o: {
      banner: 'Long \'o\' as in "boat"',
      soundLabel: 'long \'o\'',
      group: 'long',
      easy: splitWords('boat,bone,bowl,coat,cone,crow,float,goat,gold,grow,hole,home,hope,joke,low,mole,nose,note,oak,old,open,pony,road,robe,rope,rose,show,slow,snow,soap,toad,toe'),
      hard: splitWords('cold,flow,foam,ghost,glow,hold,loaf,most,oval,post,roast,soak,stone,stove,throat,toast,told,vote')
    },
    long_u: {
      banner: 'Long \'u\' as in "cube"',
      soundLabel: 'long \'u\'',
      group: 'long',
      easy: splitWords('cube,cute,duke,fume,fuse,huge,menu,mule,music,mute,pupil,unit,use'),
      hard: splitWords('bugle,cupid,fuel,human,humor,rescue,tulip,unicorn')
    },
    oo_moon: {
      banner: 'Vowel Team \'oo\' as in "moon"',
      soundLabel: 'long \'oo\'',
      group: 'special',
      easy: splitWords('boot,broom,cool,food,fool,goose,hoop,loop,moon,moose,noon,pool,roof,room,school,scoop,spoon,stool,tooth,zoo'),
      hard: splitWords('balloon,cartoon,igloo,kangaroo,raccoon,shampoo,smooth')
    },
    ou_cloud: {
      banner: 'Diphthong \'ou/ow\' as in "cloud"',
      soundLabel: '\'ou/ow\'',
      group: 'special',
      easy: splitWords('brown,cloud,clown,couch,count,cow,crowd,crown,down,found,frown,house,loud,mouse,mouth,out,owl,pound,round,shout,sound,town'),
      hard: splitWords('bounce,flower,ground,noun,powder,power,proud,south,tower')
    },
    ar_star: {
      banner: 'R-Vowel \'ar\' as in "star"',
      soundLabel: '\'ar\'',
      group: 'special',
      easy: splitWords('arm,art,bark,barn,car,card,cart,dark,farm,far,harp,jar,mark,park,part,shark,star,start,yard,yarn'),
      hard: splitWords('charm,chart,garden,large,march,sharp,smart,spark')
    },
    or_corn: {
      banner: 'R-Vowel \'or\' as in "corn"',
      soundLabel: '\'or\'',
      group: 'special',
      easy: splitWords('born,cord,cork,corn,fork,form,fort,horn,horse,north,porch,pork,port,short,sport,storm,thorn,torch,torn,worn'),
      hard: splitWords('morning,orbit,snort,stork,story')
    }
  };

  var GRAMMAR_POOLS = {
    nouns: {
      banner: 'Nouns (Person, Place, or Thing)',
      posLabel: 'a Noun',
      words: splitWords('actor,apple,artist,author,bakery,banana,basket,bicycle,blanket,brother,castle,cheese,child,city,cloud,cousin,desk,doctor,elephant,forest,friend,garden,guitar,harbor,helmet,island,jacket,kitchen,kitten,library,mountain,museum,nation,ocean,orange,palace,pencil,planet,pocket,rabbit,river,rocket,school,sister,spider,teacher,tiger,valley,village,window')
    },
    verbs: {
      banner: 'Verbs (Action Words)',
      posLabel: 'a Verb',
      words: splitWords('accept,achieve,admire,agree,appear,arrive,bake,believe,borrow,breathe,bring,build,carry,choose,climb,collect,create,decide,deliver,describe,discover,earn,enjoy,explain,explore,follow,forget,gather,grow,happen,imagine,improve,invent,learn,listen,notice,observe,prepare,protect,receive,remember,rescue,return,seem,share,solve,speak,teach,think,write')
    },
    adjectives: {
      banner: 'Adjectives (Describing Words)',
      posLabel: 'an Adjective',
      words: splitWords('angry,brave,bright,busy,calm,careful,cheerful,clever,cloudy,colorful,cozy,curious,damp,eager,enormous,famous,fierce,fluffy,fragile,fresh,gentle,giant,gloomy,graceful,greedy,happy,heavy,honest,hungry,itchy,jolly,kind,lazy,loud,lucky,messy,muddy,narrow,nervous,noisy,polite,proud,quiet,shiny,silly,sleepy,smooth,spicy,tiny,wise')
    },
    adverbs: {
      banner: 'Adverbs (How, When, or Where)',
      posLabel: 'an Adverb',
      words: splitWords('almost,already,always,angrily,bravely,brightly,calmly,carefully,cheerfully,clearly,closely,easily,everywhere,fondly,gently,gladly,happily,hardly,honestly,inside,kindly,lately,loudly,nearly,neatly,never,often,outside,politely,proudly,quickly,quietly,rarely,really,safely,seldom,softly,soon,strictly,suddenly,sweetly,tightly,today,tomorrow,truly,upstairs,usually,warmly,wisely,yesterday')
    }
  };

  var SYNONYM_SETS = [
    {
      banner: 'Synonyms of BIG',
      valid: splitWords('giant,huge,large,massive,enormous,gigantic,jumbo,mighty,vast,grand,colossal,immense,towering,bulky'),
      invalid: splitWords('tiny,small,little,mini,micro,short,narrow,thin,quiet,fast,slow,happy,sad,cold,hot,soft,hard,old,new,weak')
    },
    {
      banner: 'Synonyms of FAST',
      valid: splitWords('quick,rapid,speedy,swift,brisk,hasty,nimble,fleet,snappy,zippy,supersonic,dashing,lively,spry'),
      invalid: splitWords('slow,sluggish,lazy,tardy,creeping,crawling,heavy,sleepy,loud,quiet,tiny,huge,cold,warm,round,flat,dark,bright,tall,short')
    },
    {
      banner: 'Synonyms of HAPPY',
      valid: splitWords('glad,joyful,cheerful,merry,jolly,delighted,thrilled,pleased,upbeat,blissful,content,gleeful,festive,ecstatic'),
      invalid: splitWords('sad,gloomy,grumpy,angry,upset,worried,lonely,cranky,bored,tired,hungry,thirsty,tiny,giant,rapid,slow,loud,cold,dark,rough')
    },
    {
      banner: 'Synonyms of SMART',
      valid: splitWords('clever,bright,wise,sharp,brilliant,brainy,witty,keen,genius,astute,shrewd,gifted,alert,learned'),
      invalid: splitWords('foolish,silly,goofy,sleepy,clumsy,slow,noisy,tiny,giant,cold,warm,bumpy,sour,salty,heavy,soft,empty,wet,dry,dark')
    },
    {
      banner: 'Synonyms of COLD',
      valid: splitWords('chilly,icy,frosty,freezing,frigid,brisk,crisp,wintry,arctic,snowy,glacial,nippy,polar,bitter'),
      invalid: splitWords('hot,warm,boiling,sunny,fiery,steamy,cozy,tropical,loud,fast,huge,tiny,happy,sad,sweet,sour,bright,dark,sharp,soft')
    },
    {
      banner: 'Antonyms of HOT',
      valid: splitWords('cold,chilly,icy,freezing,frigid,frosty,cool,wintry,arctic,snowy,nippy,glacial,polar,brisk'),
      invalid: splitWords('warm,boiling,fiery,scorching,blazing,sunny,toasty,steamy,tropical,humid,burning,sizzling,loud,big,fast,happy,heavy,bright,clean,new')
    },
    {
      banner: 'Antonyms of BRAVE',
      valid: splitWords('afraid,scared,timid,fearful,shy,cowardly,nervous,anxious,frightened,jumpy,panicky,bashful,wary,meek'),
      invalid: splitWords('bold,fearless,daring,heroic,gallant,mighty,proud,strong,confident,valiant,gutsy,sturdy,tall,fast,cold,sweet,loud,clean,round,bright')
    },
    {
      banner: 'Antonyms of LOUD',
      valid: splitWords('quiet,silent,soft,hushed,muted,faint,gentle,calm,still,peaceful,whispered,low,mild,tranquil'),
      invalid: splitWords('noisy,booming,roaring,thunderous,shrill,blaring,crashing,deafening,rowdy,piercing,shouting,yelling,big,fast,cold,dark,sweet,round,tall,dry')
    }
  ];

  /* ==================== SUPER MUNCHERS TRIVIA DATA ==================== */

  var TRIVIA_TOPICS = {
    animals: [
      {
        banner: 'Mammals',
        validLabel: 'a Mammal',
        valid: splitWords('Whale,Dolphin,Bat,Elephant,Kangaroo,Platypus,Otter,Seal,Bear,Tiger,Giraffe,Monkey,Fox,Horse,Rabbit,Beaver,Wolf,Zebra'),
        invalid: [
          ['Eagle', 'a Bird'], ['Penguin', 'a Bird'], ['Owl', 'a Bird'], ['Ostrich', 'a Bird'],
          ['Shark', 'a Fish'], ['Salmon', 'a Fish'], ['Tuna', 'a Fish'], ['Goldfish', 'a Fish'],
          ['Turtle', 'a Reptile'], ['Snake', 'a Reptile'], ['Crocodile', 'a Reptile'], ['Iguana', 'a Reptile'],
          ['Frog', 'an Amphibian'], ['Toad', 'an Amphibian'], ['Salamander', 'an Amphibian'],
          ['Ant', 'an Insect'], ['Butterfly', 'an Insect'], ['Bee', 'an Insect'], ['Spider', 'an Arachnid'], ['Octopus', 'a Mollusk']
        ]
      },
      {
        banner: 'Birds',
        validLabel: 'a Bird',
        valid: splitWords('Eagle,Penguin,Ostrich,Owl,Robin,Hawk,Falcon,Flamingo,Pelican,Swan,Duck,Parrot,Crow,Pigeon,Sparrow,Peacock,Hummingbird,Stork'),
        invalid: [
          ['Bat', 'a Mammal'], ['Dolphin', 'a Mammal'], ['Whale', 'a Mammal'], ['Rabbit', 'a Mammal'], ['Otter', 'a Mammal'],
          ['Frog', 'an Amphibian'], ['Turtle', 'a Reptile'], ['Snake', 'a Reptile'], ['Lizard', 'a Reptile'],
          ['Shark', 'a Fish'], ['Trout', 'a Fish'], ['Salmon', 'a Fish'],
          ['Bee', 'an Insect'], ['Dragonfly', 'an Insect'], ['Butterfly', 'an Insect'], ['Beetle', 'an Insect'],
          ['Crab', 'a Crustacean'], ['Octopus', 'a Mollusk'], ['Lobster', 'a Crustacean'], ['Spider', 'an Arachnid']
        ]
      },
      {
        banner: 'Reptiles & Amphibians',
        validLabel: 'a Reptile or Amphibian',
        valid: splitWords('Turtle,Tortoise,Snake,Cobra,Alligator,Crocodile,Iguana,Gecko,Chameleon,Frog,Toad,Salamander,Newt,Viper,Python,Komodo'),
        invalid: [
          ['Whale', 'a Mammal'], ['Seal', 'a Mammal'], ['Bat', 'a Mammal'], ['Fox', 'a Mammal'], ['Beaver', 'a Mammal'],
          ['Penguin', 'a Bird'], ['Eagle', 'a Bird'], ['Duck', 'a Bird'], ['Owl', 'a Bird'],
          ['Shark', 'a Fish'], ['Salmon', 'a Fish'], ['Tuna', 'a Fish'], ['Eel', 'a Fish'],
          ['Ant', 'an Insect'], ['Grasshopper', 'an Insect'], ['Crab', 'a Crustacean'], ['Octopus', 'a Mollusk'],
          ['Starfish', 'an Echinoderm'], ['Jellyfish', 'a Cnidarian'], ['Lobster', 'a Crustacean']
        ]
      },
      {
        banner: 'Insects & Bugs',
        validLabel: 'an Insect',
        valid: splitWords('Ant,Bee,Wasp,Butterfly,Moth,Beetle,Ladybug,Grasshopper,Cricket,Dragonfly,Mosquito,Fly,Firefly,Termite,Flea,Cicada,Mantis,Hornet'),
        invalid: [
          ['Frog', 'an Amphibian'], ['Turtle', 'a Reptile'], ['Snake', 'a Reptile'], ['Lizard', 'a Reptile'],
          ['Mouse', 'a Mammal'], ['Bat', 'a Mammal'], ['Squirrel', 'a Mammal'], ['Hamster', 'a Mammal'],
          ['Sparrow', 'a Bird'], ['Robin', 'a Bird'], ['Owl', 'a Bird'], ['Wren', 'a Bird'],
          ['Minnow', 'a Fish'], ['Goldfish', 'a Fish'], ['Crab', 'a Crustacean'], ['Shrimp', 'a Crustacean'],
          ['Clam', 'a Mollusk'], ['Snail', 'a Mollusk'], ['Earthworm', 'an Annelid'], ['Starfish', 'an Echinoderm']
        ]
      }
    ],
    space_geo: [
      {
        banner: 'Solar System Planets',
        validLabel: 'a Solar System Planet',
        valid: splitWords('Mercury,Venus,Earth,Mars,Jupiter,Saturn,Uranus,Neptune'),
        invalid: [
          ['Sun', 'a Star'], ['Moon', 'Earth\'s Moon'], ['Titan', 'a Moon of Saturn'], ['Europa', 'a Moon of Jupiter'],
          ['Sirius', 'a Star'], ['Polaris', 'a Star'], ['Orion', 'a Constellation'], ['Andromeda', 'a Galaxy'],
          ['Halley', 'a Comet'], ['Ceres', 'a Dwarf Planet'], ['Pluto', 'a Dwarf Planet'], ['Eris', 'a Dwarf Planet'],
          ['Hubble', 'a Space Telescope'], ['Apollo', 'a Space Program'], ['Meteor', 'a Space Rock'], ['Milky Way', 'a Galaxy'],
          ['Nebula', 'a Gas Cloud'], ['Quasar', 'a Galactic Core'], ['Voyager', 'a Space Probe'], ['Eclipse', 'an Event']
        ]
      },
      {
        banner: 'U.S. States',
        validLabel: 'a U.S. State',
        valid: splitWords('Alaska,Arizona,California,Colorado,Florida,Georgia,Hawaii,Illinois,Maine,Michigan,Minnesota,Nevada,New York,Ohio,Oregon,Texas,Utah,Vermont,Virginia,Washington'),
        invalid: [
          ['Chicago', 'a City'], ['Miami', 'a City'], ['Boston', 'a City'], ['Seattle', 'a City'], ['Dallas', 'a City'],
          ['Denver', 'a City'], ['Atlanta', 'a City'], ['Detroit', 'a City'], ['Orlando', 'a City'], ['Houston', 'a City'],
          ['Canada', 'a Country'], ['Mexico', 'a Country'], ['Toronto', 'a Canadian City'], ['London', 'a City in England'],
          ['Paris', 'a City in France'], ['Puerto Rico', 'a Territory'], ['Guam', 'a Territory'], ['Ontario', 'a Canadian Province'],
          ['Quebec', 'a Canadian Province'], ['Brazil', 'a Country']
        ]
      },
      {
        banner: 'European Countries',
        validLabel: 'a European Country',
        valid: splitWords('France,Spain,Italy,Germany,Poland,Greece,Sweden,Norway,Ireland,Portugal,Austria,Belgium,Denmark,Finland,Hungary,Iceland,Switzerland,Scotland? no UK'),
        invalid: [
          ['Brazil', 'in South America'], ['Japan', 'in Asia'], ['Egypt', 'in Africa'], ['Canada', 'in North America'],
          ['India', 'in Asia'], ['Kenya', 'in Africa'], ['Peru', 'in South America'], ['Mexico', 'in North America'],
          ['China', 'in Asia'], ['Chile', 'in South America'], ['Australia', 'in Oceania'], ['Morocco', 'in Africa'],
          ['Thailand', 'in Asia'], ['Argentina', 'in South America'], ['Nigeria', 'in Africa'], ['Korea', 'in Asia'],
          ['Paris', 'a City, not a Country'], ['Rome', 'a City, not a Country'], ['Madrid', 'a City, not a Country'], ['Berlin', 'a City, not a Country']
        ]
      },
      {
        banner: 'World Oceans & Seas',
        validLabel: 'an Ocean or Sea',
        valid: splitWords('Pacific Ocean,Atlantic Ocean,Indian Ocean,Arctic Ocean,Southern Ocean,Red Sea,Black Sea,Dead Sea,Baltic Sea,Coral Sea,Bering Sea,Arabian Sea,North Sea,Java Sea'),
        invalid: [
          ['Nile River', 'a River'], ['Amazon River', 'a River'], ['Mississippi', 'a River'], ['Thames', 'a River'],
          ['Lake Superior', 'a Lake'], ['Lake Erie', 'a Lake'], ['Lake Huron', 'a Lake'], ['Lake Tahoe', 'a Lake'],
          ['Sahara', 'a Desert'], ['Gobi', 'a Desert'], ['Andes', 'a Mountain Range'], ['Alps', 'a Mountain Range'],
          ['Rockies', 'a Mountain Range'], ['Everest', 'a Mountain'], ['Greenland', 'an Island'], ['Madagascar', 'an Island'],
          ['Florida', 'a State'], ['Grand Canyon', 'a Canyon'], ['Niagara Falls', 'a Waterfall'], ['Tundra', 'a Biome']
        ]
      }
    ],
    science: [
      {
        banner: 'Chemical Elements',
        validLabel: 'a Chemical Element',
        valid: splitWords('Gold,Oxygen,Carbon,Iron,Helium,Silver,Copper,Neon,Zinc,Calcium,Sodium,Tin,Nickel,Argon,Cobalt,Hydrogen,Nitrogen,Lead'),
        invalid: [
          ['Water', 'a Compound (H2O)'], ['Salt', 'a Compound (NaCl)'], ['Sugar', 'a Compound'], ['Steel', 'an Alloy'],
          ['Bronze', 'an Alloy'], ['Brass', 'an Alloy'], ['Glass', 'a Mixture'], ['Plastic', 'a Polymer'],
          ['Wood', 'Organic Matter'], ['Paper', 'Processed Fiber'], ['Steam', 'Water Vapor'], ['Chalk', 'a Compound'],
          ['Quartz', 'a Mineral Compound'], ['Granite', 'a Rock'], ['Ammonia', 'a Compound'], ['Methane', 'a Compound'],
          ['Vinegar', 'a Solution'], ['Butter', 'a Food Mixture'], ['Rubber', 'a Polymer'], ['Brick', 'Baked Clay']
        ]
      },
      {
        banner: 'Human Organs & Bones',
        validLabel: 'a Human Organ or Bone',
        valid: splitWords('Heart,Brain,Lungs,Liver,Stomach,Kidneys,Skin,Femur,Skull,Ribs,Spine,Pelvis,Clavicle,Pancreas,Spleen,Tibia,Radius'),
        invalid: [
          ['Feather', 'found on Birds'], ['Gills', 'used by Fish'], ['Antlers', 'found on Deer'], ['Hoof', 'found on Horses'],
          ['Beak', 'found on Birds'], ['Shell', 'found on Turtles'], ['Scales', 'found on Reptiles/Fish'], ['Wings', 'found on Birds/Insects'],
          ['Antenna', 'found on Insects'], ['Tusks', 'found on Elephants'], ['Chloroplast', 'in Plant Cells'], ['Root', 'part of a Plant'],
          ['Petal', 'part of a Flower'], ['Bark', 'part of a Tree'], ['Stem', 'part of a Plant'], ['Fins', 'found on Fish'],
          ['Talon', 'a Bird Claw'], ['Stinger', 'on Insects'], ['Fur', 'Animal Coat'], ['Leaf', 'part of a Plant']
        ]
      },
      {
        banner: 'Gems & Minerals',
        validLabel: 'a Gem or Mineral',
        valid: splitWords('Diamond,Ruby,Emerald,Sapphire,Quartz,Topaz,Opal,Jade,Garnet,Amethyst,Turquoise,Feldspar,Mica,Pyrite,Calcite,Gypsum'),
        invalid: [
          ['Oak', 'a Tree'], ['Maple', 'a Tree'], ['Pine', 'a Tree'], ['Cotton', 'a Plant Fiber'],
          ['Wool', 'an Animal Fiber'], ['Silk', 'a Natural Fiber'], ['Plastic', 'Synthetic Material'], ['Nylon', 'Synthetic Fiber'],
          ['Paper', 'Made from Wood Pulp'], ['Rubber', 'Tree Sap / Polymer'], ['Bread', 'a Baked Food'], ['Honey', 'Made by Bees'],
          ['Milk', 'a Liquid Food'], ['Butter', 'a Dairy Food'], ['Leather', 'Tanned Hide'], ['Linen', 'Flax Fabric'],
          ['Cardboard', 'Thick Paper'], ['Wax', 'a Lipid/Ester'], ['Soap', 'a Cleanser'], ['Glue', 'an Adhesive']
        ]
      }
    ],
    culture: [
      {
        banner: 'Musical Instruments',
        validLabel: 'a Musical Instrument',
        valid: splitWords('Piano,Guitar,Violin,Trumpet,Flute,Drums,Clarinet,Saxophone,Cello,Harp,Banjo,Trombone,Tuba,Oboe,Harmonica,Accordion,Ukulele,Xylophone'),
        invalid: [
          ['Hammer', 'a Tool'], ['Wrench', 'a Tool'], ['Saw', 'a Tool'], ['Screwdriver', 'a Tool'],
          ['Blender', 'an Appliance'], ['Toaster', 'an Appliance'], ['Microscope', 'a Lab Tool'], ['Telescope', 'an Optical Tool'],
          ['Compass', 'a Navigation Tool'], ['Bicycle', 'a Vehicle'], ['Skateboard', 'Sports Gear'], ['Backpack', 'a Bag'],
          ['Lantern', 'a Light'], ['Umbrella', 'Rain Gear'], ['Paintbrush', 'an Art Tool'], ['Easel', 'an Art Stand'],
          ['Spatula', 'Kitchen Utensil'], ['Kettle', 'Cookware'], ['Shovel', 'a Digging Tool'], ['Ruler', 'a Measuring Tool']
        ]
      },
      {
        banner: 'Fruits',
        validLabel: 'a Fruit',
        valid: splitWords('Apple,Banana,Orange,Grape,Peach,Pear,Plum,Cherry,Mango,Lemon,Lime,Melon,Strawberry,Blueberry,Pineapple,Kiwi,Apricot,Fig'),
        invalid: [
          ['Carrot', 'a Root Vegetable'], ['Celery', 'a Stalk Vegetable'], ['Spinach', 'a Leafy Green'], ['Potato', 'a Tuber Vegetable'],
          ['Broccoli', 'a Florets Vegetable'], ['Cabbage', 'a Leafy Vegetable'], ['Onion', 'a Bulb Vegetable'], ['Garlic', 'a Bulb'],
          ['Radish', 'a Root Vegetable'], ['Lettuce', 'a Leafy Green'], ['Turnip', 'a Root Vegetable'], ['Beet', 'a Root Vegetable'],
          ['Asparagus', 'a Shoot Vegetable'], ['Kale', 'a Leafy Green'], ['Parsnip', 'a Root Vegetable'], ['Ginger', 'a Rhizome'],
          ['Mushroom', 'a Fungus'], ['Peanut', 'a Legume'], ['Almond', 'a Tree Nut/Seed'], ['Walnut', 'a Nut']
        ]
      },
      {
        banner: 'Olympic & Team Sports',
        validLabel: 'a Sport',
        valid: splitWords('Soccer,Baseball,Basketball,Tennis,Hockey,Swimming,Gymnastics,Volleyball,Golf,Skiing,Skating,Archery,Fencing,Rowing,Track,Cycling,Wrestling,Boxing'),
        invalid: [
          ['Chess', 'a Board Game'], ['Checkers', 'a Board Game'], ['Monopoly', 'a Board Game'], ['Crossword', 'a Word Puzzle'],
          ['Sudoku', 'a Number Puzzle'], ['Origami', 'Paper Folding'], ['Knitting', 'a Craft'], ['Painting', 'Visual Art'],
          ['Sculpting', 'Visual Art'], ['Baking', 'Cooking'], ['Gardening', 'Horticulture'], ['Reading', 'Literacy'],
          ['Spelling', 'Academics'], ['Piano', 'an Instrument'], ['Violin', 'an Instrument'], ['Astronomy', 'a Science'],
          ['Geology', 'a Science'], ['Poetry', 'Writing'], ['Camping', 'Outdoor Recreation'], ['Jigsaw', 'a Puzzle']
        ]
      }
    ]
  };

  // Fix typo in European Countries list cleanly at init time (replace 'Scotland? no UK' with 'United Kingdom')
  (function fixTriviaLists() {
    var euro = TRIVIA_TOPICS.space_geo[2].valid;
    for (var i = 0; i < euro.length; i++) {
      if (euro[i].indexOf('?') !== -1) euro[i] = 'United Kingdom';
    }
  })();

  /* ==================== FRACTION MUNCHERS ENGINE ==================== */

  function makeFractionObj(num, den) {
    return {
      display: num + '/' + den,
      num: num,
      den: den
    };
  }

  function createFractionRule(mode, level, tier) {
    var lvl = Math.max(1, Number(level) || 1);
    var cycle = ['types', 'equivalents', 'comparing', 'expressions'];
    var effectiveMode = mode === 'challenge'
      ? cycle[(lvl - 1) % cycle.length]
      : (mode || 'types');

    var subType = null;
    var targetNum = 1;
    var targetDen = 2;
    var comparator = null;
    var bannerText = '';
    var subHint = '';

    if (effectiveMode === 'types') {
      var typeChoices = ['proper', 'improper', 'whole', 'reduced'];
      subType = typeChoices[(lvl - 1) % typeChoices.length];
      if (subType === 'proper') {
        bannerText = 'Proper Fractions (< 1)';
        subHint = 'Munch fractions whose top (numerator) is smaller than bottom (denominator).';
      } else if (subType === 'improper') {
        bannerText = 'Improper Fractions (>= 1)';
        subHint = 'Munch fractions whose top is greater than or equal to the bottom.';
      } else if (subType === 'whole') {
        bannerText = 'Equal to Whole Numbers';
        subHint = 'Munch fractions where the top divides evenly by the bottom.';
      } else {
        bannerText = 'Fractions in Lowest Terms';
        subHint = 'Munch reduced fractions that cannot be simplified any further.';
      }
    } else if (effectiveMode === 'equivalents') {
      var eqTargets = tier === 'elementary'
        ? [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4]]
        : [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 6], [5, 6]];
      var pair = pick(eqTargets);
      targetNum = pair[0];
      targetDen = pair[1];
      bannerText = 'Equivalent to ' + targetNum + '/' + targetDen;
      subHint = 'Munch fractions that have the exact same value as ' + targetNum + '/' + targetDen + '.';
    } else if (effectiveMode === 'comparing') {
      var cmpTargets = tier === 'elementary'
        ? [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4]]
        : [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5]];
      var cPair = pick(cmpTargets);
      targetNum = cPair[0];
      targetDen = cPair[1];
      comparator = Math.random() < 0.5 ? 'lt' : 'gt';
      bannerText = (comparator === 'lt' ? 'Less Than ' : 'Greater Than ') + targetNum + '/' + targetDen;
      subHint = 'Munch fractions strictly ' + (comparator === 'lt' ? 'smaller' : 'larger') + ' than ' + targetNum + '/' + targetDen + '.';
    } else {
      effectiveMode = 'expressions';
      var exprTargets = tier === 'elementary'
        ? [[1, 2], [3, 4], [2, 3], [1, 1]]
        : [[1, 2], [3, 4], [2, 3], [5, 6], [3, 5], [4, 5], [1, 1]];
      var ePair = pick(exprTargets);
      targetNum = ePair[0];
      targetDen = ePair[1];
      bannerText = targetDen === 1 ? 'Equals 1' : ('Equals ' + targetNum + '/' + targetDen);
      subHint = 'Munch fraction problems whose answer equals ' + (targetDen === 1 ? '1' : (targetNum + '/' + targetDen)) + '.';
    }

    return {
      disk: 'fraction',
      mode: mode,
      effectiveMode: effectiveMode,
      subType: subType,
      targetNum: targetNum,
      targetDen: targetDen,
      comparator: comparator,
      bannerText: bannerText,
      subHint: subHint,
      difficulty: tier,
      level: lvl
    };
  }

  function isFractionValid(rule, num, den) {
    if (!Number.isInteger(num) || !Number.isInteger(den) || den <= 0) return false;
    if (rule.effectiveMode === 'types') {
      if (rule.subType === 'proper') return num > 0 && num < den;
      if (rule.subType === 'improper') return num >= den;
      if (rule.subType === 'whole') return num >= den && num % den === 0;
      return den > 1 && gcd(num, den) === 1;
    }
    if (rule.effectiveMode === 'equivalents') {
      return num * rule.targetDen === den * rule.targetNum;
    }
    if (rule.effectiveMode === 'comparing') {
      if (rule.comparator === 'lt') return num * rule.targetDen < rule.targetNum * den;
      return num * rule.targetDen > rule.targetNum * den;
    }
    if (rule.effectiveMode === 'expressions') {
      return num * rule.targetDen === den * rule.targetNum;
    }
    return false;
  }

  function makeFractionPayload(rule, wantValid, usedDisplays) {
    var tier = rule.difficulty;
    var maxDen = tier === 'elementary' ? 8 : (tier === 'whiz' ? 14 : 10);

    if (rule.effectiveMode === 'types') {
      for (var t = 0; t < 60; t++) {
        var d = randInt(2, maxDen);
        var n = 1;
        if (rule.subType === 'proper') {
          n = wantValid ? randInt(1, d - 1) : randInt(d, d + 6);
        } else if (rule.subType === 'improper') {
          n = wantValid ? randInt(d, d + 6) : randInt(1, d - 1);
        } else if (rule.subType === 'whole') {
          if (wantValid) {
            n = d * randInt(1, 4);
          } else {
            n = randInt(1, d * 2 + 2);
            if (n % d === 0) n += 1;
          }
        } else {
          if (wantValid) {
            n = randInt(1, d + 3);
            if (gcd(n, d) !== 1) continue;
          } else {
            var mult = randInt(2, 4);
            var baseD = randInt(2, 5);
            var baseN = randInt(1, baseD + 2);
            d = baseD * mult;
            n = baseN * mult;
          }
        }
        var f = makeFractionObj(n, d);
        if (isFractionValid(rule, f.num, f.den) === wantValid && (!usedDisplays || !usedDisplays.has(f.display))) {
          return {
            display: f.display,
            num: f.num,
            den: f.den,
            numericValue: f.num / f.den,
            isValid: wantValid
          };
        }
      }
      var fallbackNum = wantValid ? (rule.subType === 'proper' ? 1 : (rule.subType === 'reduced' ? 3 : 4)) : (rule.subType === 'proper' ? 5 : (rule.subType === 'reduced' ? 4 : 3));
      var fallbackDen = wantValid ? (rule.subType === 'proper' ? 2 : (rule.subType === 'reduced' ? 4 : 2)) : (rule.subType === 'proper' ? 4 : (rule.subType === 'reduced' ? 6 : 4));
      return {
        display: fallbackNum + '/' + fallbackDen,
        num: fallbackNum,
        den: fallbackDen,
        numericValue: fallbackNum / fallbackDen,
        isValid: isFractionValid(rule, fallbackNum, fallbackDen)
      };
    }

    if (rule.effectiveMode === 'equivalents') {
      for (var e = 0; e < 60; e++) {
        var nEq, dEq;
        if (wantValid) {
          var k = randInt(1, tier === 'elementary' ? 6 : 10);
          nEq = rule.targetNum * k;
          dEq = rule.targetDen * k;
        } else {
          dEq = randInt(2, maxDen);
          nEq = randInt(1, dEq);
          if (nEq * rule.targetDen === dEq * rule.targetNum) continue;
        }
        var dispEq = nEq + '/' + dEq;
        if (isFractionValid(rule, nEq, dEq) === wantValid && (!usedDisplays || !usedDisplays.has(dispEq))) {
          return { display: dispEq, num: nEq, den: dEq, numericValue: nEq / dEq, isValid: wantValid };
        }
      }
      var fbN = wantValid ? rule.targetNum * 2 : rule.targetNum + 1;
      var fbD = wantValid ? rule.targetDen * 2 : rule.targetDen + 1;
      if (!wantValid && fbN * rule.targetDen === fbD * rule.targetNum) fbN += 1;
      return { display: fbN + '/' + fbD, num: fbN, den: fbD, numericValue: fbN / fbD, isValid: isFractionValid(rule, fbN, fbD) };
    }

    if (rule.effectiveMode === 'comparing') {
      for (var c = 0; c < 80; c++) {
        var dC = randInt(2, maxDen);
        var nC = randInt(1, dC + 2);
        var validC = isFractionValid(rule, nC, dC);
        if (validC !== wantValid) continue;
        // Never use exact equal value as a distractor trap unless needed, or fine either way
        var dispC = nC + '/' + dC;
        if (!usedDisplays || !usedDisplays.has(dispC)) {
          return { display: dispC, num: nC, den: dC, numericValue: nC / dC, isValid: validC };
        }
      }
      var cmpFallbackN = wantValid ? (rule.comparator === 'lt' ? 1 : 9) : (rule.comparator === 'lt' ? 9 : 1);
      var cmpFallbackD = 10;
      return {
        display: cmpFallbackN + '/' + cmpFallbackD,
        num: cmpFallbackN,
        den: cmpFallbackD,
        numericValue: cmpFallbackN / cmpFallbackD,
        isValid: isFractionValid(rule, cmpFallbackN, cmpFallbackD)
      };
    }

    // Expressions (+ and -)
    var goalN = rule.targetNum;
    var goalD = rule.targetDen;
    for (var x = 0; x < 90; x++) {
      var multD = randInt(1, tier === 'elementary' ? 3 : 4);
      var commonD = goalD * multD;
      var desiredN = goalN * multD;
      if (!wantValid) {
        desiredN = Math.max(1, desiredN + pick([-2, -1, 1, 2]));
        if (desiredN * goalD === commonD * goalN) continue;
      }
      if (desiredN < 1) continue;

      var useAdd = desiredN >= 2 && (Math.random() < 0.55);
      var aN, bN, aD = commonD, bD = commonD, op;
      if (useAdd) {
        op = '+';
        aN = randInt(1, desiredN - 1);
        bN = desiredN - aN;
      } else {
        op = '-';
        bN = randInt(1, Math.max(2, commonD));
        aN = desiredN + bN;
      }

      // On classic/whiz, sometimes reduce one side cleanly (e.g. 2/4 -> 1/2)
      if (tier !== 'elementary' && Math.random() < 0.45) {
        var gA = gcd(aN, aD);
        if (gA > 1 && aD / gA >= 2) { aN /= gA; aD /= gA; }
        var gB = gcd(bN, bD);
        if (gB > 1 && bD / gB >= 2) { bN /= gB; bD /= gB; }
      }

      var resN = op === '+' ? (aN * bD + bN * aD) : (aN * bD - bN * aD);
      var resD = aD * bD;
      var gRes = gcd(resN, resD);
      resN /= gRes;
      resD /= gRes;

      if (isFractionValid(rule, resN, resD) !== wantValid) continue;
      var dispX = aN + '/' + aD + ' ' + op + ' ' + bN + '/' + bD;
      if (!usedDisplays || !usedDisplays.has(dispX)) {
        return {
          display: dispX,
          num: resN,
          den: resD,
          numericValue: resN / resD,
          isValid: wantValid
        };
      }
    }

    var safeN = wantValid ? goalN : goalN + 1;
    var safeD = goalD * 2;
    return {
      display: safeN + '/' + safeD + ' + ' + safeN + '/' + safeD,
      num: safeN,
      den: goalD,
      numericValue: safeN / goalD,
      isValid: isFractionValid(rule, safeN, goalD)
    };
  }

  /* ==================== UNIFIED CONTENT PACK API ==================== */

  function createWordRule(mode, level, tier) {
    var lvl = Math.max(1, Number(level) || 1);
    var cycle = ['short_vowels', 'long_vowels', 'special_vowels', 'grammar', 'synonyms'];
    var effectiveMode = mode === 'challenge'
      ? cycle[(lvl - 1) % cycle.length]
      : (mode || 'short_vowels');

    if (effectiveMode === 'short_vowels' || effectiveMode === 'long_vowels' || effectiveMode === 'special_vowels') {
      var keysByMode = {
        short_vowels: ['short_a', 'short_e', 'short_i', 'short_o', 'short_u'],
        long_vowels: ['long_a', 'long_e', 'long_i', 'long_o', 'long_u'],
        special_vowels: ['oo_moon', 'ou_cloud', 'ar_star', 'or_corn']
      };
      var keys = keysByMode[effectiveMode];
      var poolKey = keys[(lvl - 1 + randInt(0, keys.length - 1)) % keys.length];
      var pool = VOWEL_POOLS[poolKey];
      return {
        disk: 'word',
        mode: mode,
        effectiveMode: effectiveMode,
        poolKey: poolKey,
        bannerText: pool.banner,
        subHint: 'Munch words with the ' + pool.soundLabel + ' sound.',
        difficulty: tier,
        level: lvl
      };
    }

    if (effectiveMode === 'grammar') {
      var posKeys = ['nouns', 'verbs', 'adjectives', 'adverbs'];
      var posKey = posKeys[(lvl - 1 + randInt(0, posKeys.length - 1)) % posKeys.length];
      var posPool = GRAMMAR_POOLS[posKey];
      return {
        disk: 'word',
        mode: mode,
        effectiveMode: 'grammar',
        poolKey: posKey,
        bannerText: posPool.banner,
        subHint: 'Munch words that function as ' + posPool.posLabel + '.',
        difficulty: tier,
        level: lvl
      };
    }

    // synonyms
    var synIdx = (lvl - 1 + randInt(0, SYNONYM_SETS.length - 1)) % SYNONYM_SETS.length;
    var synSet = SYNONYM_SETS[synIdx];
    return {
      disk: 'word',
      mode: mode,
      effectiveMode: 'synonyms',
      synIndex: synIdx,
      bannerText: synSet.banner,
      subHint: 'Munch words matching: ' + synSet.banner + '.',
      difficulty: tier,
      level: lvl
    };
  }

  function createSuperRule(mode, level, tier) {
    var lvl = Math.max(1, Number(level) || 1);
    var cycle = ['animals', 'space_geo', 'science', 'culture'];
    var effectiveMode = mode === 'challenge'
      ? cycle[(lvl - 1) % cycle.length]
      : (mode || 'animals');
    var list = TRIVIA_TOPICS[effectiveMode] || TRIVIA_TOPICS.animals;
    var topicIdx = (lvl - 1 + randInt(0, list.length - 1)) % list.length;
    var topic = list[topicIdx];

    return {
      disk: 'super',
      mode: mode,
      effectiveMode: effectiveMode,
      topicIndex: topicIdx,
      bannerText: topic.banner,
      subHint: 'Munch items that belong in: ' + topic.banner + '. Eat 10 right in a row to become Super Muncher!',
      difficulty: tier,
      level: lvl
    };
  }

  function createLevelRule(disk, mode, level, difficulty) {
    var tier = normalizeDifficulty(difficulty);
    var lvl = Math.max(1, Number(level) || 1);

    if (disk === 'word') return createWordRule(mode, lvl, tier);
    if (disk === 'fraction') return createFractionRule(mode, lvl, tier);
    if (disk === 'super') return createSuperRule(mode, lvl, tier);

    if (NM.MathEngine && NM.MathEngine.createLevelRule) {
      var mathRule = NM.MathEngine.createLevelRule(mode, lvl, tier);
      mathRule.disk = 'number';
      return mathRule;
    }
    throw new Error('Unknown disk: ' + disk);
  }

  function buildPoolPairsForRule(rule) {
    var tier = rule.difficulty;

    if (rule.disk === 'word') {
      if (rule.effectiveMode === 'short_vowels' || rule.effectiveMode === 'long_vowels' || rule.effectiveMode === 'special_vowels') {
        var targetPool = VOWEL_POOLS[rule.poolKey];
        var validWords = tier === 'elementary'
          ? targetPool.easy.slice()
          : targetPool.easy.concat(targetPool.hard);

        var distractors = [];
        Object.keys(VOWEL_POOLS).forEach(function (k) {
          if (k === rule.poolKey) return;
          var p = VOWEL_POOLS[k];
          var src = tier === 'elementary' ? p.easy : p.easy.concat(p.hard);
          src.forEach(function (w) {
            distractors.push({
              display: w,
              isValid: false,
              explainWhy: '"' + w + '" has the ' + p.soundLabel + ' sound, not ' + targetPool.banner + '.'
            });
          });
        });

        return {
          valid: validWords.map(function (w) { return { display: w, isValid: true, explainWhy: '' }; }),
          invalid: distractors
        };
      }

      if (rule.effectiveMode === 'grammar') {
        var targetPos = GRAMMAR_POOLS[rule.poolKey];
        var invalidPos = [];
        Object.keys(GRAMMAR_POOLS).forEach(function (k) {
          if (k === rule.poolKey) return;
          var p = GRAMMAR_POOLS[k];
          p.words.forEach(function (w) {
            invalidPos.push({
              display: w,
              isValid: false,
              explainWhy: '"' + w + '" is ' + p.posLabel + ', not ' + targetPos.posLabel + '.'
            });
          });
        });
        return {
          valid: targetPos.words.map(function (w) { return { display: w, isValid: true, explainWhy: '' }; }),
          invalid: invalidPos
        };
      }

      var syn = SYNONYM_SETS[rule.synIndex];
      return {
        valid: syn.valid.map(function (w) { return { display: w, isValid: true, explainWhy: '' }; }),
        invalid: syn.invalid.map(function (w) {
          return {
            display: w,
            isValid: false,
            explainWhy: '"' + w + '" does not match ' + syn.banner + '.'
          };
        })
      };
    }

    if (rule.disk === 'super') {
      var list = TRIVIA_TOPICS[rule.effectiveMode] || TRIVIA_TOPICS.animals;
      var topic = list[rule.topicIndex] || list[0];
      return {
        valid: topic.valid.map(function (item) {
          return { display: item, isValid: true, explainWhy: '' };
        }),
        invalid: topic.invalid.map(function (pair) {
          return {
            display: pair[0],
            isValid: false,
            explainWhy: '"' + pair[0] + '" is ' + pair[1] + ', not ' + topic.validLabel + '.'
          };
        })
      };
    }

    return null;
  }

  function generateBoard(rule, cols, rows) {
    if (rule.disk === 'number' && NM.MathEngine) {
      return NM.MathEngine.generateBoard(rule, cols, rows);
    }

    var numCols = cols || 6;
    var numRows = rows || 5;
    var total = numCols * numRows;
    var validCount = randInt(11, 14);
    var invalidCount = total - validCount;
    var items = [];
    var usedDisplays = new Set();

    if (rule.disk === 'fraction') {
      for (var v = 0; v < validCount; v++) {
        var vf = makeFractionPayload(rule, true, usedDisplays);
        usedDisplays.add(vf.display);
        items.push(vf);
      }
      for (var iv = 0; iv < invalidCount; iv++) {
        var ivf = makeFractionPayload(rule, false, usedDisplays);
        usedDisplays.add(ivf.display);
        items.push(ivf);
      }
    } else {
      var pools = buildPoolPairsForRule(rule);
      var shuffledValid = shuffle(pools.valid);
      var shuffledInvalid = shuffle(pools.invalid);

      for (var i = 0; i < validCount; i++) {
        items.push(shuffledValid[i % shuffledValid.length]);
      }
      for (var j = 0; j < invalidCount; j++) {
        items.push(shuffledInvalid[j % shuffledInvalid.length]);
      }
    }

    var shuffled = shuffle(items);
    return shuffled.map(function (item, idx) {
      return {
        index: idx,
        col: idx % numCols,
        row: Math.floor(idx / numCols),
        display: item.display,
        num: item.num,
        den: item.den,
        numericValue: item.numericValue,
        isValid: Boolean(item.isValid),
        explainWhy: item.explainWhy || '',
        empty: false,
        powerUp: null
      };
    });
  }

  function generateSingleCell(rule, preferValidProbability) {
    if (rule.disk === 'number' && NM.MathEngine) {
      return NM.MathEngine.generateSingleCell(rule, preferValidProbability);
    }
    var prob = typeof preferValidProbability === 'number' ? preferValidProbability : 0.38;
    var wantValid = Math.random() < prob;

    if (rule.disk === 'fraction') {
      return makeFractionPayload(rule, wantValid, null);
    }

    var pools = buildPoolPairsForRule(rule);
    var chosen = wantValid ? pick(pools.valid) : pick(pools.invalid);
    return {
      display: chosen.display,
      isValid: Boolean(chosen.isValid),
      explainWhy: chosen.explainWhy || ''
    };
  }

  function explainMistake(rule, cell) {
    if (!cell) return 'That square is empty!';
    if (rule.disk === 'number' && NM.MathEngine) {
      return NM.MathEngine.explainMistake(rule, cell);
    }
    if (rule.disk === 'fraction') {
      var valText = cell.num + '/' + cell.den;
      if (rule.effectiveMode === 'types') {
        if (rule.subType === 'proper') return valText + ' is >= 1 (top >= bottom), so it is not a Proper Fraction.';
        if (rule.subType === 'improper') return valText + ' is < 1 (top < bottom), so it is not an Improper Fraction.';
        if (rule.subType === 'whole') return cell.num + ' does not divide evenly by ' + cell.den + '.';
        var g = gcd(cell.num, cell.den);
        return valText + ' simplifies by ' + g + ' to ' + (cell.num / g) + '/' + (cell.den / g) + ' - not in lowest terms.';
      }
      if (rule.effectiveMode === 'equivalents') {
        return valText + ' is not equal to ' + rule.targetNum + '/' + rule.targetDen + '.';
      }
      if (rule.effectiveMode === 'comparing') {
        var dirWord = rule.comparator === 'lt' ? 'less than ' : 'greater than ';
        return valText + ' is NOT ' + dirWord + rule.targetNum + '/' + rule.targetDen + '.';
      }
      var goalText = rule.targetDen === 1 ? '1' : (rule.targetNum + '/' + rule.targetDen);
      return cell.display + ' = ' + valText + ', which does not equal ' + goalText + '.';
    }
    return cell.explainWhy || ('"' + cell.display + '" does not match ' + rule.bannerText + '.');
  }

  var api = {
    DISKS: DISKS,
    VOWEL_POOLS: VOWEL_POOLS,
    GRAMMAR_POOLS: GRAMMAR_POOLS,
    SYNONYM_SETS: SYNONYM_SETS,
    TRIVIA_TOPICS: TRIVIA_TOPICS,
    createLevelRule: createLevelRule,
    generateBoard: generateBoard,
    generateSingleCell: generateSingleCell,
    explainMistake: explainMistake,
    isFractionValid: isFractionValid,
    gcd: gcd
  };

  NM.ContentPacks = api;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
