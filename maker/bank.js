// Cheet's Press calendar maker: the word and color bank.
// Seasons: 'win' (Dec-Feb), 'spr' (Mar-May), 'sum' (Jun-Aug), 'fal' (Sep-Nov).

const SEASON = m => (m === 11 || m <= 1) ? 'win' : m <= 4 ? 'spr' : m <= 7 ? 'sum' : 'fal';

// Which scene kinds (1-8, see engine.js) each season cycles through, one per week row.
const SETS = {
  win: [4, 5, 6, 7, 5],
  spr: ['1s', '4s', '3', '2s', '5'],
  sum: ['1u', '2u', '3', '5', '1u'],
  fal: [1, 2, 3, 5, 2]
};

// Palette tweaks so the fall/winter scenes also work for spring and summer.
const GREEN_OAKS = [['#2f5a22', '#4a7d2c', '#7fae3c'], ['#2f5a22', '#4a7d2c', '#7fae3c'], ['#2f5a22', '#4a7d2c', '#7fae3c']];
const VARIANTS = {
  '1s': { kind: 1, sky: ['#3f86d0', '#9fd0f0', '#eaf6d8'], ridges: ['#9ab8d8', '#7fa7a0', '#6f9a52', '#7cab47', '#a7cf5e', '#4c6e2a'], pines: '#2f5a35',
    oaks: [['#2f6a22', '#4c9a2f', '#8cc94a'], ['#c25a8a', '#f08fb8', '#ffd0e4'], ['#2f6a22', '#4c9a2f', '#8cc94a']], grass: '#5f9a2f', leafCols: ['#ffd0e4', '#ffffff', '#f7a8c8'] },
  '1u': { kind: 1, sky: ['#2a7fd0', '#8ccbf2', '#fff1c4'], ridges: ['#9cb5cf', '#86a39a', '#7f9a55', '#a09a45', '#d8b65a', '#6a5426'], pines: '#2f4d35',
    oaks: GREEN_OAKS, grass: '#a88a34', noLeaves: 1 },
  '2s': { kind: 2, ridges: ['#b78fa4', '#8f8a6a', '#6f7f3e', '#6f8a2e', '#9fb84a', '#3f4a1a'], oaks: GREEN_OAKS, grass: '#6a8a20', leafCols: ['#ffd0e4', '#ffffff'] },
  '2u': { kind: 2, oaks: GREEN_OAKS, grass: '#a07a28', noLeaves: 1 },
  '4s': { kind: 4, bigOak: 0, sky: ['#a8cde8', '#dcecf2', '#fbf6e6'], ridges: ['#bccddb', '#a0b6c5', '#86a39a', '#6f9a6a', '#b9d6a0', '#4f7a4a'], pines: '#2f5a45',
    oaks: [['#2f6a32', '#4c8a4a', '#8cbf7a'], ['#2f6a32', '#4c8a4a', '#8cbf7a'], ['#2f6a32', '#4c8a4a', '#8cbf7a']], grass: '#9cc77a' }
};

// Week titles and one-line descriptions, by scene style and season ('*' = any season).
const NAMES = {
  '1': [['Acorn Week', 'Leaves are dropping and Cheet has the zoomies.'], ['Leaf Pile Week', 'Crunchy leaves everywhere and a dog who must run through all of them.'], ['Oak Shadow Week', 'Long shadows, quail in a line, and a chihuahua on patrol.']],
  '1s': [['Blossom Week', 'Petals in the wind and Cheet chasing every one.'], ['Wildflower Week', 'Green hills, quail on parade, and a very busy little dog.'], ['Green Hills Week', 'Everything is green again and Cheet has the zoomies.']],
  '1u': [['Long Day Week', 'Big sky, warm grass, and the longest walks of the year.'], ['Sunny Meadow Week', 'Quail in the shade and Cheet looking for a cool spot.'], ['Picnic Week', 'Blue sky, green oaks, and a dog who wants your sandwich.']],
  '2': [['Turkey Trot Week', 'Golden hour, and the wild turkeys own the meadow.'], ['Golden Hour Week', 'Turkeys on parade and the sun going down slow.']],
  '2s': [['Turkey Strut Week', 'Spring turkeys puffed up and showing off in the meadow.'], ['Spring Gobble Week', 'Golden evenings and a lot of very loud turkeys.']],
  '2u': [['Golden Evening Week', 'Warm light, long evenings, and turkeys crossing the field.'], ['Sundown Stroll Week', 'The heat breaks and the turkeys come out to walk.']],
  '3': [['Last Light Week', 'A red-tailed hawk rides the wind over the river.'], ['Hawk Sunset Week', 'A hawk circles the ridge while the sky turns pink.'], ['Ridge Glow Week', 'Purple hills, a pink sky, and a hawk on patrol.'], ['River Sunset Week', 'The river turns gold and a hawk heads home.']],
  '4': [['Frost Week', 'Fog in the low spots, deer at breakfast, quail on parade.'], ['Frosty Morning Week', 'White grass, cold noses, and deer out early.'], ['Quail Parade Week', 'A line of quail marches past the deer every morning.']],
  '4s': [['Misty Morning Week', 'Morning fog, a deer at breakfast, and quail on parade.'], ['Fawn Week', 'Soft green mornings and deer out in the meadow.'], ['Morning Fog Week', 'The fog lifts and the whole meadow wakes up.']],
  '5': [['River & Stars Week', 'An otter in the river and meteors over the ridge.'], ['Otter Night Week', 'An otter swims by while Cheet keeps watch.'], ['Starry River Week', 'Shooting stars, a quiet river, and one curious otter.'], ['Meteor Watch Week', 'Look up. The sky is busy this week.']],
  '6': [['Solstice Snow Week', 'Snow on the pines and a buck walking through.'], ['First Snow Week', 'Fresh snow, deer tracks, and Cheet in her sweater.'], ['Snowy Pines Week', 'Everything is white and Cheet is not impressed.']],
  '7': [['Cold Moon Week', 'A full moon, a great horned owl, and lights on the pine.'], ['Owl Moon Week', 'Big moon, quiet snow, and an owl in the old oak.'], ['Cabin Lights Week', 'Smoke from the chimney and lights on the tree.'], ['Full Moon Week', 'A bright moon over the cabin and an owl keeping watch.']],
  '8': [['Countdown Week', 'Fireworks over the hills and a fox out for a trot.'], ['Fireworks Week', 'The sky lights up and a fox trots by.']],
  '8ny': [['New Year Week', 'Fireworks to start the year and a fox out for a trot.']],
  '8j': [['Fourth of July Week', 'Fireworks over the hills and a fox who is not scared at all.']]
};

// Made-up fun days. s = seasons it fits ('*' = any).
const FUN = [
  ['Cheet Zoomies Day', 'Find an open patch of grass and run one full-speed lap, Cheet style. Ears up the whole way.', '*'],
  ['Tiny Dog, Big Hike Day', 'Take the longest walk a small dog would agree to. Carrying someone for part of it still counts.', '*'],
  ['Pajama Bird Watch', 'Stay in your pajamas, sit by a window, and count every bird you see before lunch.', '*'],
  ['Cocoa Night', 'Everybody gets a warm drink. Extra marshmallows go to whoever tells the best animal story.', 'win,fal'],
  ['Hug a Tree Day', 'Find the biggest tree around and see if your arms reach all the way. They will not. Hug it anyway.', '*'],
  ['Thank a Tree Day', 'Pick a tree you walk past all the time and tell it thanks. Out loud.', '*'],
  ['Sock Swap Day', 'Wear two socks that do not match. Extra points if one has an animal on it.', '*'],
  ['Fox Sock Day', 'Wear your wildest socks. Foxes approve.', 'win,fal'],
  ['Quail Parade Day', 'Walk in a line with everyone at home, quail style. The leader has to bob their head.', '*'],
  ['Deer Track Detective Day', 'Look for hoofprints in mud, dirt or frost and follow them as far as they go.', '*'],
  ['Leftover Hike Day', 'Pack a leftover sandwich and eat it somewhere with a big view.', '*'],
  ['Acorn Count Day', 'Pick one oak and count the acorns under it. Everybody guesses first. The worst guess makes the snacks.', 'fal'],
  ['Leaf Pile Day', 'Rake one big pile of leaves. Then jump in it. Then rake it again.', 'fal'],
  ['Hawk Watch Day', 'Look up for ten whole minutes and count every hawk riding the wind.', '*'],
  ['River Rock Day', 'Find the flattest rock you can and try to skip it. Or just find a cool rock and keep it.', 'spr,sum,fal'],
  ['Otter Float Day', 'Lie on your back like an otter and do nothing for five minutes. That is the whole day.', '*'],
  ['Cloud Animal Day', 'Lie on the grass and find three animals in the clouds.', 'spr,sum,fal'],
  ['Wildflower Hunt', 'Find five different colors of wildflowers. Look, take a picture, and leave them growing.', 'spr'],
  ['Puddle Stomp Day', 'Find one good puddle and stomp it. Rain boots optional.', 'win,spr'],
  ['Baby Bird Day', 'Listen for chirping nests. Keep your distance and see if you can spot a parent bringing food.', 'spr'],
  ['Kite Day', 'Fly a kite, or anything that catches the wind. A plastic bag on a string counts.', 'spr,sum'],
  ['Mud Pie Bakery Day', 'Open a mud pie bakery. Prices are paid in pinecones.', 'spr,sum'],
  ['Garden Snack Day', 'Eat one thing that grew in a garden. Bonus if you picked it yourself.', 'spr,sum'],
  ['Shade Nap Day', 'Find the best shady spot around and take a nap there, like a dog would.', 'sum'],
  ['Lemonade Stand Day', 'Make lemonade and sell it to your own family for one hug a cup.', 'sum'],
  ['Firefly Night', 'Go outside after dark and look for tiny lights. No fireflies? Count stars instead.', 'sum'],
  ['Sprinkler Run Day', 'Run through the sprinkler at least three times. Dogs may join.', 'sum'],
  ['Watermelon Seed Day', 'Eat watermelon outside and have a seed-spitting contest.', 'sum'],
  ['Star Count Night', 'Step outside after dark and count stars until you lose track. Then start over.', '*'],
  ['Owl Listening Night', 'Go outside after dark, stay quiet, and listen for an owl. Five hoots means hello.', 'win,fal'],
  ['First Sweater Day', 'Put on your favorite sweater. If there is a dog in the house, it gets one too.', 'win,fal'],
  ['Snow Angel Day', 'Make a snow angel. No snow? Make one in the leaves or the grass.', 'win'],
  ['Pinecone Pick Day', 'Collect the three best pinecones you can find and line them up on a windowsill.', 'win,fal'],
  ['Soup Day', 'Make a big pot of soup and share it with someone.', 'win,fal'],
  ['Window Fog Drawing Day', 'Breathe on a cold window and draw an animal in the fog.', 'win'],
  ['Feed the Birds Day', 'Put out some seeds and see who shows up first.', 'win,fal,spr'],
  ['Cozy Blanket Day', 'Build a blanket nest on the couch and stay in it as long as you can.', 'win'],
  ['Board Game Night', 'Pick a game, pick a snack, and play until someone wins twice.', '*'],
  ['Thank-You Note Day', 'Write a short thank-you note to someone. Mail it or leave it where they will find it.', '*'],
  ['Backward Breakfast Day', 'Eat dinner food for breakfast. Or breakfast food for dinner.', '*'],
  ['Tiny Treasure Hunt', 'Hide a small treat somewhere in the house and leave clues for someone to find it.', '*'],
  ['Animal Sound Dinner', 'At dinner, everybody has to say one sentence as their favorite animal.', '*'],
  ['Silly Hat Day', 'Wear the silliest hat you own. A bowl counts.', '*'],
  ['Dog Trick Day', 'Teach a dog a new trick, or teach a person one. Sit and shake both count.', '*'],
  ['Picnic on the Floor Day', 'Spread a blanket inside and eat lunch on the floor like a picnic.', '*'],
  ['Moon Check Night', 'Look at the moon tonight and draw what shape it is. Check again next week.', '*'],
  ['Slow Walk Day', 'Walk around the block as slowly as you can and notice three new things.', '*'],
  ['Sunrise Coffee Day', 'Get up early once this week and watch the sun come up with something warm to drink.', '*'],
  ['Map It Day', 'Draw a map of your street or yard and mark where the animals like to hang out.', '*'],
  ['Story Swap Night', 'Everybody tells one true story from when they were little.', '*'],
  ['Clean Paw Day', 'Give the dog a bath, or at least wipe its paws. Then give yourself a treat.', '*'],
  ['Sunset Wave Day', 'Step outside at sunset and wave the day goodbye.', '*'],
  ['Turkey Strut Day', 'Puff up your chest and strut across the yard like a wild turkey.', 'spr,fal'],
  ['Bug Safari Day', 'Lift a rock or a log, gently, and see who lives underneath. Put it back after.', 'spr,sum'],
  ['Fresh Air Lunch Day', 'Eat lunch outside, even if it is just on the front step.', '*'],
  ['Hammock Day', 'Find a hammock or a comfy chair outside and read one chapter of anything.', 'spr,sum'],
  ['Berry Day', 'Eat berries. Any kind. Bonus if they stain your fingers.', 'sum'],
  ['Corn Dog Day', 'Corn dogs for dinner. A real dog gets a little bite.', 'sum'],
  ['Apple Crunch Day', 'Find the crunchiest apple you can. Everybody votes on whose is loudest.', 'fal'],
  ['Pumpkin Count Day', 'Count every pumpkin you see on porches this week.', 'fal'],
  ['Scarecrow Day', 'Make a tiny scarecrow out of whatever is around and give it a name.', 'fal'],
  ['Warm Socks Day', 'Put your socks in the dryer for five minutes, then put them on right away.', 'win,fal'],
  ['Icicle Day', 'Look for icicles or frost and see who finds the longest one.', 'win'],
  ['Spring Cleaning Dance', 'Clean one room with loud music on. Dancing is required.', 'spr'],
  ['Seed Planting Day', 'Plant a seed in a cup and put it in a sunny window. Name it.', 'spr'],
  ['Rainbow Hunt Day', 'After rain, look for a rainbow. No rain? Find something of every rainbow color.', 'spr'],
  ['Frog Song Night', 'Listen after dark for frogs singing. Try to sing back.', 'spr,sum'],
  ['Shell or Stone Day', 'Find one small stone or shell and keep it in your pocket all day for luck.', '*'],
  ['Paper Airplane Day', 'Fold a paper airplane and see whose flies the farthest.', '*'],
  ['Wave at a Neighbor Day', 'Wave at every neighbor you see today. Dogs count as neighbors.', '*'],
  ['Chihuahua Appreciation Day', 'Tell the smallest dog you know that it is very brave.', '*']
];

// Real dates. Fixed ones plus the ones that move around each year.
function nthDow(y, m, dow, n) { // n-th (1-based) weekday of month; n=-1 means last
  if (n > 0) { const d = new Date(y, m, 1); const off = (dow - d.getDay() + 7) % 7; return 1 + off + (n - 1) * 7; }
  const last = new Date(y, m + 1, 0); const off = (last.getDay() - dow + 7) % 7; return last.getDate() - off;
}
function easter(y) { const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, mm = Math.floor((a + 11 * h + 22 * l) / 451), mo = Math.floor((h + l - 7 * mm + 114) / 31), day = ((h + l - 7 * mm + 114) % 31) + 1; return [mo - 1, day]; }
const SOLAR = { // equinoxes and solstices (US Pacific dates)
  2026: { 2: 20, 5: 21, 8: 22, 11: 21 }, 2027: { 2: 20, 5: 21, 8: 23, 11: 21 }, 2028: { 2: 19, 5: 20, 8: 22, 11: 21 }, 2029: { 2: 20, 5: 20, 8: 22, 11: 21 } };
function holidays(y, m) {
  const H = {}; const add = (d, n, t, short) => { H[d] = [n, t, short]; };
  const fixed = { '0-1': ['New Year’s Day', 'Pick one small thing to do more of this year. Write it down and stick it next to this calendar.'],
    '1-14': ['Valentine’s Day', 'Tell three people (or dogs) why you like them.'],
    '2-17': ['St. Patrick’s Day', 'Wear something green and look for a four-leaf clover.'],
    '6-4': ['Fourth of July', 'Watch the fireworks from somewhere safe. Keep the dogs inside and cozy, they hate the noise.'],
    '9-31': ['Halloween', 'Dress up. Dogs can dress up too, if they agree.'],
    '10-11': ['Veterans Day', 'Thank someone who served.'],
    '11-24': ['Christmas Eve', 'Count the lights on the way home and pick your favorite house.'],
    '11-25': ['Christmas', 'Merry Christmas! Open the good present first.'],
    '11-31': ['New Year’s Eve', 'Count down from ten at midnight. Or at nine, which is a small dog’s bedtime.'] };
  for (const k in fixed) { const [mm, dd] = k.split('-').map(Number); if (mm === m) add(dd, ...fixed[k]); }
  if (m === 0) add(nthDow(y, 0, 1, 3), 'Martin Luther King Jr. Day', 'Do one kind thing for someone in your neighborhood.');
  if (m === 1) add(nthDow(y, 1, 1, 3), 'Presidents’ Day', 'Hold a family vote on what is for dinner. Majority wins.');
  const [em, ed] = easter(y); if (em === m) add(ed, 'Easter', 'Hide eggs, or hide a treat for the dog to sniff out.');
  if (m === 4) { add(nthDow(y, 4, 0, 2), 'Mother’s Day', 'Make Mom breakfast, or at least the coffee.'); add(nthDow(y, 4, 1, -1), 'Memorial Day', 'Take a quiet minute to remember the people who gave everything.'); }
  if (m === 5) add(nthDow(y, 5, 0, 3), 'Father’s Day', 'Let Dad pick the music all day. Yes, all day.');
  if (m === 8) add(nthDow(y, 8, 1, 1), 'Labor Day', 'No chores today. Rest like a dog in the sun.');
  if (m === 10) add(nthDow(y, 10, 4, 4), 'Thanksgiving', 'Before anybody touches the pie, say one thing you are thankful for.');
  const sol = SOLAR[y] && SOLAR[y][m];
  if (sol && !H[sol]) add(sol, ['', '', 'First day of spring', '', '', 'First day of summer', '', '', 'First day of fall', '', '', 'First day of winter'][m],
    ['', '', 'Day and night are the same length today. Go look for the first flowers.', '', '', 'The longest day of the year. Stay outside until it gets dark.', '', '', 'Day and night are even again. Go find a leaf that already turned.', '', '', 'The shortest day of the year. Light a candle and get cozy.'][m]);
  return H;
}

function todoForCustomer(label) {
  const L = label.toLowerCase(); const who = label.replace(/['’]s\s+(birthday|bday|b-day)\b.*$/i, '').trim();
  if (/birthday|bday|b-day/.test(L)) return who && who.toLowerCase() !== L ? `Happy birthday, ${who}! The birthday star picks dinner, the music, and the animal everybody has to act like.` : 'Happy birthday! The birthday star picks dinner, the music, and the animal everybody has to act like.';
  if (/anniversary/.test(L)) return 'Happy anniversary! Tell the story of how it started, even if everyone has heard it before.';
  if (/trip|vacation|camp/.test(L)) return 'Trip day! Pack snacks, pack patience, and take one picture of the best view.';
  if (/school|class/.test(L)) return 'Big day. Lay out clothes the night before and eat a good breakfast.';
  if (/gotcha|adopt/.test(L)) return 'Happy gotcha day! Extra treats and an extra-long walk.';
  return 'A day to remember. Make it a good one.';
}

module.exports = { SEASON, SETS, VARIANTS, NAMES, FUN, holidays, todoForCustomer };
