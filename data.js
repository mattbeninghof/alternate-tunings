// Alternate Tuning Guide data
// Source: Bill Sethares, "Alternate Tuning Guide" (sethares.engr.wisc.edu/alternatetunings/alltunings.pdf)
// midi arrays run from string 6 (lowest, leftmost) to string 1. null = string not used.
// Octaves are chosen to sit as close to standard tuning as the book's description allows.

window.TUNING_DATA = (function () {
  const STANDARD = [40, 45, 50, 55, 59, 64];

  const CATEGORIES = [
    {
      id: 'open',
      name: 'Open Tunings',
      intro: 'When the strings of a tuning form a simple chord, the tuning is called open; the strings of the Open C tuning form a C major chord, the strings of the Open G tuning form a G major chord. Invariably, this makes it easy to play in the natural key of the tuning. But it is a mistake to restrict playing to just a few keys since most of the open tunings are versatile enough to play in any key. One of the most common uses of open tunings is to play the open strings as drones. Open tunings are ideal for playing bottleneck or slide guitar, since you can place the slide at any fret and play a full six string chord. Similarly, harmonics sound wonderful in open tunings. Several of the open tunings presented here are closely related: they differ by only one step on one string. Examples are the Modal D, Open D, D Minor and the Modal G, Open G, G Minor tunings. Consequently, the chord charts can often be crossed.'
    },
    {
      id: 'instrumental',
      name: 'Instrumental Tunings',
      intro: 'The instrumental tunings are based on the tuning of instruments such as the balalaika, the charango, the dobro, and others. They are adapted for use in a six string setting by completing the tunings from instruments with fewer than six strings in a sensible, though nonunique, manner. The Cittern (2) tuning, for example, extends the CGCGC tuning of the cittern to the six string tuning CGCGCG. The balalaika tuning concatenates the tunings of the bass (EAD) and prima balalaikas (EEA) to form the six string tuning EADEEA. Players of these (and other) stringed instruments can easily use the chord charts presented here by ignoring the extra strings.'
    },
    {
      id: 'regular',
      name: 'Regular Tunings',
      intro: 'In regular tunings, all six strings are equally spaced in pitch. This means that any finger pattern can be moved up and down the neck like a normal bar chord, and also it can be moved sideways across the neck. Regular tunings greatly simplify the learning of chords, since each finger pattern is useful for many chords. There are twelve possible regular tunings, but only seven are given here. The missing five (Unison, Minor Second, Whole Tone, Minor Seventh, Major Seventh) have not been included because there are almost no interesting chords that are easily played in them. In the Unison tuning, for instance, it is impossible to play any major or minor chord at all.'
    },
    {
      id: 'special',
      name: 'Special Tunings',
      intro: 'The special tuning section is a collection of miscellaneous tunings, most of which were created and/or popularized in recent years by various singers and/or songwriters. The bulk of the tunings are named after a song in which they are used. The cited songs are the first use of which Sethares was aware, but undoubtedly many of these tunings have been used previously by others.'
    }
  ];

  const TUNINGS = [
    {
      id: 'standard', name: 'Standard', category: 'standard', page: 4,
      midi: [40, 45, 50, 55, 59, 64],
      text: 'The familiar EADGBE tuning is called the Standard tuning. Why is the standard guitar tuning standard? Where did this strange combination of a major 3rd and four perfect 4ths come from? There is a bit of history (view the guitar as a descendant of the lute), a bit of technology (strings which are too high and thin tend to break, those which are too low tend to be too soft), and a bit of chance. Nevertheless, a standard is a standard, and nearly everyone who plays knows EBGDAE.'
    },

    // Open
    {
      id: 'open-c', name: 'Open C', category: 'open', page: 18,
      midi: [36, 43, 48, 55, 60, 64],
      text: 'Open C is a deep, rich tuning which can be played in most styles and keys. William Ackerman\'s Townsend Shuffle and John Fahey\'s Requiem for Mississippi John Hurt give an idea of the versatility and spaciousness of the C tuning. The three C and two G strings can be exploited to provide numerous variations on the chords given in the accompanying chart. For instance, the open C minor chord can be played several ways, since any of the three C strings can be played open or at the third fret. Similarly, the G strings can often be used to find alternate fingerings.',
      songs: ['William Ackerman, Townsend Shuffle', 'John Fahey, Requiem for Mississippi John Hurt']
    },
    {
      id: 'open-d', name: 'Open D', category: 'open', page: 20,
      midi: [38, 45, 50, 54, 57, 62],
      text: 'The three bass strings can be used for powerful root-fifth-octave chords, or they can be used as steady drones beneath a shifting harmony. Almost every chord type has an easy bar-fingering: major, minor, 7th, sus4, major and minor 6, and 7sus4. This adds to the versatility of the Open D tuning and makes it possible to play in a variety of styles and keys. Common variations of the Open D tuning are to tune it down two frets to the key of C (CGCEGD), or to tune it up two frets to the key of E (EBEG#BE). Note that the Open D tuning is sandwiched between the Open D minor and the Modal D tunings. Both of these chord charts can be used for additional Open D chords with only minor modifications.',
      songs: ['Joni Mitchell, Big Yellow Taxi', 'Allman Brothers, Little Martha']
    },
    {
      id: 'modal-d', name: 'Modal D', category: 'open', page: 22,
      midi: [38, 45, 50, 55, 57, 62],
      text: 'The open strings of the Modal D tuning form a suspended fourth chord, a striking tonality that is neither major nor minor (due to the lack of a third), though it is certainly possible to play in either major or minor keys. The tuning is very close to the Open D major tuning since they differ only in the third string. Consequently, chords from the Open D tuning chart can be played on a guitar tuned to Modal D whenever it\'s possible to play the third string down one fret. Similarly, chords from the Modal D chart can be played on a guitar tuned to Open D by fingering the third string up one fret.'
    },
    {
      id: 'open-d-minor', name: 'Open D Minor', category: 'open', page: 24,
      midi: [38, 45, 50, 53, 57, 62],
      text: 'The Open D minor tuning has five strings in common with the Open D (major), Modal D, and Pelican tunings, differing only in the third string. Like its sister tunings, Open D minor has three D strings and two A strings, leading to a wide variety of fingering variations for simple chords. Chords from the Open D (major) chart can be used in the D minor tuning, with the understanding that notes on the third string need to be played up one fret. Similarly, chords from the Modal D chart can be used by playing up two frets, while chords from the Pelican tuning chart can be used by playing down one fret on the third string.'
    },
    {
      id: 'open-g', name: 'Open G', category: 'open', page: 26,
      midi: [38, 43, 50, 55, 59, 62],
      text: 'In the Open G tuning, the strings are tuned to a G major chord, making it easy to play in the key of G and in related keys. Though often used in folk music, Jimmy Page\'s Bron-Y-Aur Stomp shows that this is more a matter of tradition than of necessity. The top four strings are the same as the common G tuning for banjo, so banjo players will find it easy. The second, third, and fourth strings are tuned exactly the same as in the standard EBGDAE tuning. All chord and scale forms on these three strings remain the same, making Open G one of the easiest alternate tunings to play in. Note that the Open G tuning is sandwiched between the Open G Minor and the Modal G tunings.',
      songs: ['Jimmy Page, Bron-Y-Aur Stomp']
    },
    {
      id: 'modal-g', name: 'Modal G', category: 'open', page: 28,
      midi: [38, 43, 50, 55, 60, 62],
      text: 'The open strings of a guitar in Modal G sound a suspended texture that is neither major nor minor, neither dark nor light. The two pairs of fifths in strings 3-6 make the low end powerful, while the small separation of the two highest strings make a variety of suspended chords viable and interesting. Like other open tunings, it is easy to make up alternate fingerings for chords using the three D and two G strings. In addition, Modal G is closely related to Open G; only the second strings differ, and only by one fret.'
    },
    {
      id: 'open-g-minor', name: 'Open G Minor', category: 'open', page: 30,
      midi: [38, 43, 50, 55, 58, 62],
      text: 'Used in John Renbourn\'s Orphan and Mist-Covered Mountains of Home, the Open G Minor guitar tuning is probably a descendant of the G minor banjo tuning DGA#D, with the lowest two strings doubled an octave down. The tuning differs from Open G (major) only in the second string, so facility with one is easily transported to the other. Clearly, any chords not using the second string can be played immediately in either tuning. To use Open G (major) chords in the minor tuning, play the second string up one fret.',
      songs: ['John Renbourn, Orphan', 'John Renbourn, Mist-Covered Mountains of Home']
    },
    {
      id: 'open-a', name: 'Open A', category: 'open', page: 32,
      midi: [40, 45, 49, 52, 57, 64],
      text: 'Larry Sandberg says that the Open A tuning is especially useful for the "delta blues sound," and it is a great bottleneck tuning, since it\'s easy to slide from minor to major on the fourth string. Like most open tunings, it is easy to find alternate chord voicings by taking advantage of the strings that are tuned in octaves. Consider open position A minor 7 chords. The fourth string must be played on the third fret, but any other string can be played either open or on the third fret. This leads to a wide variety of fingerings. This is the sort of freedom that makes a tuning great.'
    },

    // Instrumental
    {
      id: 'balalaika', name: 'Balalaika', category: 'instrumental', page: 36,
      midi: [40, 45, 50, 52, 52, 57],
      text: 'The balalaika is a three stringed Russian folk instrument with a characteristic triangle shaped body. The balalaika family extends from the large bass (tuned EAD) through the tenor, alto, and the prima balalaika (which is tuned EEA). The balalaika tuning concatenates the bass and prima tunings onto one fretboard for an interesting, if not authentic, tuning. The strength of the tuning lies in its natural keys, E and A, and in the trance like effect of the two E strings tuned to the same note. Unless you restring the guitar, the second string is very loose, which gives the tuning a "sitar" like quality.'
    },
    {
      id: 'charango', name: 'Charango', category: 'instrumental', page: 38,
      midi: [null, 55, 60, 52, 57, 64],
      text: 'The charango is a ten stringed instrument from the Andes region of Peru and Bolivia that often uses an armadillo shell as a resonator. The strings are tuned in pairs like a mandolin or a 12 string guitar. Perhaps the most striking aspect of the tuning is that the strings do not ascend uniformly from low to high. Rather, they jump up, down, up and up, forming an Am7 chord (with an E bass) all within one octave. This makes for some very interesting finger picking patterns since the bass (on string 3) tends to be syncopated against the beat. In the Andean musical tradition, the charango serves three roles: melody lines with a mandolin-like sound, a fast finger picking style analogous to the banjo, and a rapid strum in which the first finger of the right hand flails rapidly back and forth over the strings.'
    },
    {
      id: 'cittern-1', name: 'Cittern (1)', category: 'instrumental', page: 40,
      midi: [36, 41, 48, 55, 60, 62],
      text: 'The cittern is an overgrown mandolin with an extra pair of strings. They can be tuned in a variety of open tunings, such as CFCGC, DGDAD, or GCGDG, all of which can be played using the fingerings shown here for strings 2 through 6. To play in DGDAD, transpose all chord names down two steps. To play in GCGDG, transpose down 5 steps (or capo up two and five steps, respectively). There are several other popular cittern tunings which can be played using the Cittern (2) tuning.'
    },
    {
      id: 'cittern-2', name: 'Cittern (2)', category: 'instrumental', page: 42,
      midi: [36, 43, 48, 55, 60, 67],
      text: 'The three pairs of fifths span three octaves and form a wider tuning than usual. The bass is deeper and the treble is higher. Chords tend to sound very "open," with large spacing between adjacent tones, and scales invariably require sliding up and down the fretboard. The stretches are just too long to comfortably play in a single position. Barring a finger across all six strings sounds a chord that is neither major nor minor, and the three fifths tuning lends itself nicely to pieces that are tonally ambiguous. Transposing a riff or finger pattern by an octave is simply a matter of moving over two strings. With this trick, you can form hundreds of chords from a few sample chords.'
    },
    {
      id: 'dobro', name: 'Dobro', category: 'instrumental', page: 44,
      midi: [43, 47, 50, 55, 59, 62],
      text: 'The dobro is a type of guitar with a metal resonator. It is usually held horizontally on the lap and played with a metal bar that acts like a moveable fret. It is typically tuned to a G major chord that is different from the G major chord of the Open G tuning (DGDGBD), though the three highest strings are identical. Consequently, the high three strings of both tunings can be played the same. The dobro tuning offers two triplets of strings tuned an octave apart, which makes it easy to visualize chord forms and to transpose them up and down octaves.'
    },
    {
      id: 'lefty', name: 'Lefty', category: 'instrumental', page: 46,
      midi: [64, 59, 55, 50, 45, 40],
      text: 'Watch a left handed guitarist play a right handed guitar: they play chords backwards, and finger them strangely, too. You can simulate this left/right confusion by restringing your guitar from high to low (or by programming a MIDI guitar controller). Interestingly, it doesn\'t take long to become quite proficient at left hand guitar, because the left/right symmetry makes many chords easier to remember. In general, scales are more confusing than chords: the sound often rises when you expect it to fall, and falls when you think it should rise. Many standard strums take on an interesting character because the "alternating bass" turns into an "alternating treble." Some chords are easier to finger, like the barred E major. Some are more difficult: try to play an E ninth at the 7th fret. There are some surprises, too, some chords that "don\'t exist" in the standard tuning.'
    },
    {
      id: 'overtone', name: 'Overtone', category: 'instrumental', page: 48,
      midi: [48, 52, 55, 58, 60, 62],
      text: 'Built from the 4th through 9th partials of the harmonic series, the overtone tuning is highly compressed: all six strings fall within little more than a single octave. This causes some very tight chords and densely packed clusters of notes. Accordingly, the chord chart emphasizes intervallic chords such as the pandiatonic forms. Many of the major, minor, and seventh chords have repeating tones, which adds an interesting kind of chorus or depth to the sound. The tuning sounds like a "soprano twelve string."',
      note: 'The book does not give absolute octaves for this tuning. The octave shown here keeps retuning from standard as small as possible; on a real guitar you will want lighter strings or a MIDI controller.'
    },
    {
      id: 'pentatonic', name: 'Pentatonic', category: 'instrumental', page: 50,
      midi: [45, 48, 50, 52, 55, 57],
      text: 'The six strings of the pentatonic tuning are formed from a single octave of the pentatonic scale. The tuning is highly compressed since all six strings span only a single octave. Chords tend to contain multiple copies of tones which gives an overall impression of chorusing and depth. For those using a MIDI guitar controller, this is an excellent opportunity to assign each string to a different sound, since then multiple tones will not be exact copies. Then, changing the inversion or position of the chord changes the timbre.',
      note: 'The book does not give absolute octaves for this tuning. The octave shown here keeps retuning from standard as small as possible.'
    },

    // Regular
    {
      id: 'minor-third', name: 'Minor Third', category: 'regular', page: 54,
      midi: [36, 39, 42, 45, 48, 51],
      text: 'The strings of the minor third tuning form a C diminished chord. It is a highly compressed tuning since all six strings are tuned within a tenth. This is about the distance most adults can stretch their fingers on a keyboard, and chords tend to be closely voiced, almost keyboard-like. Unlike the piano, however, chords in the minor third tuning often contain multiple copies of a single note. This is not necessarily bad. The sound of the two notes invariably differs somewhat due to differences in string widths, tensions and tunings, and the doubled notes reinforce each other, like the doubled strings of a twelve string guitar add chorusing and depth. It is easy to play extremely fast mandolin-style picking on adjacent doubled notes.'
    },
    {
      id: 'major-third', name: 'Major Third', category: 'regular', page: 56,
      midi: [36, 40, 44, 48, 52, 56],
      text: 'The major third tuning could be called the "Open C Augmented" tuning since it contains two octaves of a C augmented chord: two C\'s, two E\'s and two G#\'s. Such multiple notes give a freedom to chord formation usually found only in open tunings. Whenever a chord is played at a particular fret on (say) the low C string, it can also be fretted at the same fret on the other C string. Like all regular tunings, chords in the major third tuning can be moved across the fretboard (ascending or descending a major third for each string) as well as up and down the fretboard like a normal bar chord.'
    },
    {
      id: 'all-fourths', name: 'All Fourths', category: 'regular', page: 58,
      midi: [40, 45, 50, 55, 60, 65],
      text: 'The All Fourths tuning is the closest regular tuning to the standard EBGDAE. Given the ease of remembering chord formations in regular tunings, why does tradition tune the highest two strings down a half step? One reason may be the distinct lack of full six string major and minor chords in the All Fourths tuning, even in open position. There are, however, numerous easy-to-finger four and five string chords which can be moved readily around the fretboard. All chords and scales from the low four strings of standard tuning can be used verbatim, and they can be transposed directly onto the upper two strings. Electric bass players often find this one of the easiest guitar tunings to use.'
    },
    {
      id: 'aug-fourths', name: 'Augmented Fourths', category: 'regular', page: 60,
      midi: [36, 42, 48, 54, 60, 66],
      text: 'The augmented fourth interval is the only interval whose inverse is the same as itself. The augmented fourths tuning is the only tuning (other than the "trivial" tuning CCCCCC) for which all chord forms remain unchanged when the strings are reversed. Thus the augmented fourths tuning is its own "lefty" tuning. If we lived in a world with an equal number of left and right handed guitar players, perhaps this tuning would be the standard! Any fret played on any C (or F#) string can also be played on any other C (or F#) string. Since there are three C strings and three F# strings, this gives a wealth of possibilities.'
    },
    {
      id: 'mandoguitar', name: 'Mandoguitar', category: 'regular', page: 62,
      midi: [36, 43, 50, 57, 64, 71],
      text: 'The four strings of a mandolin (like a violin) are tuned in a sequence of perfect fifths. The mandoguitar tuning expands this to a six string perfect fifth tuning, with one string a fifth below the violin and another string a fifth above. This provides a deeper bass than the guitar and simultaneously a higher treble. Because the mandoguitar tuning is regular, you can move any chord both up and down the neck (like a normal bar chord) and you can also move any chord across the strings. Thus the finger pattern for the G chord, the D chord and the A chord are identical, but they are centered on different strings.'
    },
    {
      id: 'minor-sixth', name: 'Minor Sixth', category: 'regular', page: 64,
      midi: [36, 44, 52, 60, 68, 76],
      text: 'Like the major third tuning, this could also be called the "Open C Augmented" tuning, although the strings are ordered differently (CG#E instead of CEG#). Despite this formal similarity, the feel of the two tunings is vastly different. The minor sixth tuning is very wide, spanning over three octaves, while the major third tuning spans only an octave and a half. In practical terms, chords in the minor sixth tuning tend to be wide open, with large intervals between successive notes. They tend to have low basses and high trebles simultaneously.'
    },
    {
      id: 'major-sixth', name: 'Major Sixth', category: 'regular', page: 66,
      midi: [36, 45, 54, 63, 72, 81],
      text: 'Like the minor third tuning, the strings of the major sixth tuning are tuned to a C diminished seventh chord. Both tunings contain the notes CAF#D#, though the strings are in a different order and different tones are doubled. The six strings of the minor third tuning are compressed into little more than an octave, while the major sixth tuning spans over three and a half octaves. As a result, chords in the major sixth tuning tend to sound sparse, with large intervals between successive chord notes. Scales are awkward because they cannot be played in a single position. On the other hand, the range of the tuning is immense: this is as large a span as most midsized keyboards!'
    },

    // Special
    {
      id: 'admiral', name: 'Admiral', category: 'special', page: 70,
      midi: [36, 43, 50, 55, 59, 60],
      text: 'Michael Hedges\' song Admiral Rickover\'s Dream is played in this variant of the Open G tuning, in which strings 1 and 6 are tuned down two steps.',
      songs: ['Michael Hedges, Admiral Rickover\'s Dream']
    },
    {
      id: 'buzzard', name: 'Buzzard', category: 'special', page: 72,
      midi: [36, 41, 48, 55, 58, 65],
      text: 'The Buzzard tuning is from Will Ackerman\'s song of the same name. The open strings sound a C7sus4 chord, and the multiple C and F strings allow many useful fingering variations.',
      songs: ['Will Ackerman, The Buzzard']
    },
    {
      id: 'drop-d', name: 'Drop D', category: 'special', page: 74,
      midi: [38, 45, 50, 55, 59, 64],
      text: 'Artists as diverse as the Beatles, Pete Seeger, John Denver, James Taylor, Happy Traum, and Jorma Kaukonen have all written and/or recorded tunes in the Drop D tuning. It is undeniably the most used alternate tuning, probably because it is so easy to get to (only the low E string needs to be retuned) and because most chords and scales remain unchanged from the familiar standard tuning. Since the only difference lies in the sixth string, the chord chart consists mainly of full six string chords, which should be liberally interspersed with familiar chords from the standard tuning: simply don\'t strum or pluck the lowest string.'
    },
    {
      id: 'face', name: 'Face', category: 'special', page: 76,
      midi: [36, 43, 50, 55, 57, 62],
      text: 'Michael Hedges tunes to an A minor 7 chord with a suspended 4th (ACGD) in Face Yourself, though it sounds more grounded in C (an incomplete C6add9?) or in G (G with a 4th and 2nd). Whatever the key, it feels nice.',
      songs: ['Michael Hedges, Face Yourself']
    },
    {
      id: 'four-and-twenty', name: 'Four and Twenty', category: 'special', page: 78,
      midi: [38, 45, 50, 50, 57, 62],
      text: 'This tuning was popularized by Crosby, Stills, Nash and Young in their songs Four and Twenty and Suite: Judy Blue Eyes (which was transposed up one whole step). Strumming the open strings sounds a chord that is harmonically ambiguous, neither major nor minor, and perhaps this accounts for some of the charm of these songs. The doubled string adds an interesting flavor to finger picked passages, since the same tones repeat, though with slight timbral differences due to string thickness and weight. The general rule is that whenever a given fret is played on (say) a D string, that same fret can be played on any other D string.',
      songs: ['Crosby, Stills, Nash and Young, Four and Twenty', 'Crosby, Stills, Nash and Young, Suite: Judy Blue Eyes (up a whole step)']
    },
    {
      id: 'hot-type', name: 'Hot Type', category: 'special', page: 80,
      midi: [33, 47, 52, 54, 57, 62],
      text: 'This unique tuning is from Michael Hedges\' song of the same name. String 6 is lowered a full fifth, while string 5 is raised two steps, creating a leap of more than an octave between the two bass strings. In compensation, there are small intervals between the second, third, and fourth strings. Thus the Hot Type tuning has elements of a compressed tuning and elements of a wide tuning. Make sure that you use a heavy gauge 6th string or the low A will sound flabby.',
      songs: ['Michael Hedges, Hot Type']
    },
    {
      id: 'layover', name: 'Layover', category: 'special', page: 82,
      midi: [38, 45, 48, 55, 60, 64],
      text: 'In his song Layover, Michael Hedges tunes strings 1-5 to an Amin7 chord. The sixth string, a D, officially makes it a suspended fourth chord, but it doesn\'t sound that way. The notes of the tuning are the same as the notes of the Pentatonic tuning, but they\'re all scrambled up.',
      songs: ['Michael Hedges, Layover']
    },
    {
      id: 'magic-farmer', name: 'Magic Farmer', category: 'special', page: 84,
      midi: [36, 41, 48, 55, 57, 64],
      text: 'Michael Hedges\' Magic Farmer tuning is closely related to his Buzzard tuning; strings 3-6 are identical, while the first two strings are lowered one step. The tunings play similarly, and many of the fingerings on the two chord charts can be interchanged.',
      songs: ['Michael Hedges, The Magic Farmer']
    },
    {
      id: 'pelican', name: 'Pelican', category: 'special', page: 86,
      midi: [38, 45, 50, 52, 57, 62],
      text: 'This tuning is taken from John Renbourn\'s song of the same name, in which the strings are tuned to a D suspended second chord that sounds a nice neutral tonality, neither major nor minor, neither soft nor harsh. The Pelican tuning is intimately related to the Open D minor tuning (DADFAD) since five of the strings are tuned identically while the last string is only one half step away. Consequently, chords from the D minor chord chart can often be used when playing in the Pelican tuning, though fingers on the third string need to be moved up the fretboard one position.',
      songs: ['John Renbourn, The Pelican']
    },
    {
      id: 'processional', name: 'Processional', category: 'special', page: 88,
      midi: [38, 43, 50, 53, 57, 58],
      text: 'Will Ackerman\'s tuning from the song Processional is interesting because the highest strings are only one step apart, allowing some very tightly voiced chords. The tuning is closest to Ackerman\'s own Triqueen tuning, with strings 1 and 3 differing by only one step.',
      songs: ['Will Ackerman, Processional']
    },
    {
      id: 'slow-motion', name: 'Slow Motion', category: 'special', page: 90,
      midi: [38, 43, 50, 53, 60, 62],
      text: 'Any tuning with multiple octaves of a single note allows chord variations by moving fingers among the octaves. Will Ackerman\'s Slow Motion tuning is no exception. One quirk of the Slow Motion tuning is the seventh chord form which fingers exactly like a 7th chord in Standard tuning. The Fmin7 is also fingered exactly like a Bb major in Standard tuning. Though the fingers remain the same, the sounds are quite different.',
      songs: ['Will Ackerman, Slow Motion Roast Beef Restaurant Seduction']
    },
    {
      id: 'spirit', name: 'Spirit', category: 'special', page: 92,
      midi: [37, 45, 49, 56, 57, 64],
      text: 'In the Spirit tuning, the strings are tuned to an Amaj7 chord. The tuning can be quite uplifting despite Will Ackerman\'s song Impending Death of the Virgin Spirit for which it is named.',
      songs: ['Will Ackerman, The Impending Death of the Virgin Spirit']
    },
    {
      id: 'tarboulton', name: 'Tarboulton', category: 'special', page: 94,
      midi: [36, 46, 48, 53, 58, 65],
      text: 'Taken from John Renbourn\'s song of the same name, the Tarboulton tuning is one of the more interesting of the modern tunings because of its combination of intervals: a seventh, a major second, two perfect fourths, and a fifth. The tuning plays easily in both F and A# though the wealth of bar chords ensures that any key is feasible. There are three pairs of strings, two C\'s, two F\'s and two A#\'s. Whenever a given string is played at any fret, its mate can also be played at the same fret. Accordingly, alternate chord forms substitute strings 4 and 6, 1 and 3, and/or 2 and 5.',
      songs: ['John Renbourn, Lord Franklin / Tarboulton']
    },
    {
      id: 'toulouse', name: 'Toulouse', category: 'special', page: 96,
      midi: [40, 48, 50, 53, 57, 62],
      text: 'The Doobie Brothers used this tuning in their song Toulouse Street. Although the chord forms are quite different from Standard, it\'s easy to learn the bar chords (and to remember them at the right frets) because the low E string is unchanged.',
      songs: ['The Doobie Brothers, Toulouse Street']
    },
    {
      id: 'triqueen', name: 'Triqueen', category: 'special', page: 98,
      midi: [38, 43, 50, 54, 57, 59],
      text: 'Triqueen is a shortening of Pink Chiffon Tricycle Queen, another of Will Ackerman\'s songs in an alternate tuning. Triqueen plays smoothly, and there are many fun chord forms lurking in the chord chart that are not shown explicitly. For instance, the open position A7th chord can be moved up two frets to a B7th chord in several ways. Which B7 do you think sounds best? Why not play a different one each time it rolls around?',
      songs: ['Will Ackerman, Pink Chiffon Tricycle Queen']
    }
  ];

  const CHORD_TYPES = [
    { abbr: 'maj', name: 'Major', intervals: [0, 4, 7] },
    { abbr: 'min', name: 'Minor', intervals: [0, 3, 7] },
    { abbr: 'maj7', name: 'Major Seventh', intervals: [0, 4, 7, 11] },
    { abbr: '7', name: 'Dominant Seventh', intervals: [0, 4, 7, 10] },
    { abbr: 'min7', name: 'Minor Seventh', intervals: [0, 3, 7, 10] },
    { abbr: '6', name: 'Major Sixth', intervals: [0, 4, 7, 9] },
    { abbr: 'maj9', name: 'Major Ninth', intervals: [0, 4, 7, 11, 14] },
    { abbr: '9', name: 'Dominant Ninth', intervals: [0, 4, 7, 10, 14] },
    { abbr: '6/9', name: 'Sixth add Ninth', intervals: [0, 4, 7, 9, 14] },
    { abbr: 'min6', name: 'Minor Sixth', intervals: [0, 3, 7, 9] },
    { abbr: 'min9', name: 'Minor Ninth', intervals: [0, 3, 7, 10, 14] },
    { abbr: 'm7b5', name: 'Minor 7 Flat Five', intervals: [0, 3, 6, 10] },
    { abbr: '7b9', name: 'Seven Flat Nine', intervals: [0, 4, 7, 10, 13] },
    { abbr: '7#9', name: 'Seven Sharp Nine', intervals: [0, 4, 7, 10, 15] },
    { abbr: 'dim', name: 'Diminished', intervals: [0, 3, 6] },
    { abbr: 'dim7', name: 'Diminished Seventh', intervals: [0, 3, 6, 9] },
    { abbr: 'aug', name: 'Augmented', intervals: [0, 4, 8] },
    { abbr: 'aug7', name: 'Augmented Seventh', intervals: [0, 4, 8, 10] },
    { abbr: 'sus4', name: 'Suspended Fourth', intervals: [0, 5, 7] },
    { abbr: '7sus4', name: '7 Suspended Fourth', intervals: [0, 5, 7, 10] },
    { abbr: 'sus2', name: 'Suspended Second', intervals: [0, 2, 7] },
    // Additional types beyond the book's table, for chord progressions
    { abbr: 'add9', name: 'Add Nine', intervals: [0, 4, 7, 14], extra: true },
    { abbr: 'madd9', name: 'Minor Add Nine', intervals: [0, 3, 7, 14], extra: true },
    { abbr: 'mmaj7', name: 'Minor Major Seventh', intervals: [0, 3, 7, 11], extra: true },
    { abbr: '11', name: 'Eleventh', intervals: [0, 4, 7, 10, 14, 17], optional: [7, 14], extra: true },
    { abbr: 'min11', name: 'Minor Eleventh', intervals: [0, 3, 7, 10, 14, 17], optional: [7, 14], extra: true },
    { abbr: '13', name: 'Thirteenth', intervals: [0, 4, 7, 10, 14, 21], optional: [7, 14], extra: true },
    { abbr: 'maj13', name: 'Major Thirteenth', intervals: [0, 4, 7, 11, 14, 21], optional: [7, 14], extra: true },
    { abbr: '5', name: 'Power Chord', intervals: [0, 7], extra: true }
  ];

  const SCALE_TYPES = [
    { id: 'major', name: 'Major', intervals: [0, 2, 4, 5, 7, 9, 11] },
    { id: 'minor', name: 'Minor', intervals: [0, 2, 3, 5, 7, 8, 10] },
    { id: 'harmonic-minor', name: 'Harmonic Minor', intervals: [0, 2, 3, 5, 7, 8, 11] },
    { id: 'pent-major', name: 'Pentatonic Major', intervals: [0, 2, 4, 7, 9] },
    { id: 'pent-minor', name: 'Pentatonic Minor', intervals: [0, 3, 5, 7, 10] }
  ];

  // Cross index of tunings from the book: named tunings that are transpositions or
  // one-string variants of tunings in the guide.
  const CROSS_INDEX = [
    { name: 'A Tuning', notes: 'E A E A C# E', relation: 'Open G transposed up 2' },
    { name: 'B Tuning', notes: 'B F# B D# F# B', relation: 'Open D transposed down 3' },
    { name: "Barbara's", notes: 'C# G# C# G# C# E', relation: 'Open C transposed up 1' },
    { name: 'Bluebird', notes: 'D A D G B D', relation: 'Open G with string 5 raised 2' },
    { name: 'C Tuning', notes: 'C G C E G D', relation: 'Open D transposed down 2' },
    { name: 'E Tuning', notes: 'E B E G# B E', relation: 'Open D transposed up 2' },
    { name: 'Gazos', notes: 'D A D F# A C#', relation: 'Open D with string 1 lowered 1' },
    { name: 'Guinevere', notes: 'E A D G B D', relation: 'Standard with string 1 lowered 2' },
    { name: 'Judy Blue Eyes', notes: 'E B E E B E', relation: 'Four and Twenty transposed up 2' },
    { name: 'It Takes', notes: 'D G D G A D', relation: 'Open G minor with string 2 lowered 1, or Modal D with string 5 lowered 2' },
    { name: 'Louise', notes: 'B F# B E G# C#', relation: 'Drop D transposed down 3' },
    { name: 'Never', notes: 'C G D G B E', relation: 'Strings 1-4 same as Standard; strings 2-5 same as Open G; strings 3-6 same as Admiral' },
    { name: 'Silent Night', notes: 'D A D F# B E', relation: 'Drop D with string 3 lowered 1' },
    { name: 'Tortion', notes: 'E A E G B E', relation: 'Open D minor transposed up 2 with string 5 lowered 2' },
    { name: 'Unexpected', notes: 'D A D G C E', relation: 'Drop D with string 2 raised 1' },
    { name: 'Windham Mary', notes: 'F G# C D# G# D#', relation: 'Open A transposed down 1 with string 6 raised 2' }
  ];

  const OTHER_INSTRUMENTS = [
    { instrument: 'Banjo, G tuning', notes: 'X G D G B D', relation: 'Open G' },
    { instrument: 'Banjo, G minor', notes: 'X G D G Bb D', relation: 'Open G Minor' },
    { instrument: 'Banjo, G modal', notes: 'X G D G C D', relation: 'Modal G' },
    { instrument: 'Banjo, Open C', notes: 'X G C G C E', relation: 'Open C' },
    { instrument: 'Banjo, Open C minor', notes: 'X G C G C Eb', relation: 'Open C with string 1 lowered 1' },
    { instrument: 'Banjo, Old-Time C', notes: 'X G C G C D', relation: 'Open C with string 1 lowered 2' },
    { instrument: 'Banjo, D tuning', notes: 'X A D F# A D', relation: 'Open D' },
    { instrument: 'Banjo, D tuning (alt)', notes: 'X F# D F# A D', relation: 'Open D with string 5 lowered 3' },
    { instrument: 'Bouzouki', notes: 'X X G D A D', relation: 'Strings 2-5 of Cittern (1) transposed up 2' },
    { instrument: 'Bouzouki (alt)', notes: 'X X G D A E', relation: 'Lefty strings 1-4' },
    { instrument: 'Cittern', notes: 'X D G D A D', relation: 'Strings 2-6 of Cittern (1) transposed up 2' },
    { instrument: 'Cittern', notes: 'X D G D G D', relation: 'Strings 1-5 of Cittern (2) transposed down 5' },
    { instrument: 'Cittern', notes: 'X D G D A E', relation: 'Strings 2-6 of Mandoguitar with string 6 raised 2' },
    { instrument: 'Cittern', notes: 'X D A D A D', relation: 'Strings 2-6 of Cittern (2) transposed up 2' },
    { instrument: 'Cittern', notes: 'X G D G D G', relation: 'Strings 2-6 of Cittern (2) transposed down 5' },
    { instrument: 'Cittern', notes: 'X G C G C G', relation: 'Strings 1-5 of Cittern (2)' },
    { instrument: 'Cittern', notes: 'X C G D A E', relation: 'Strings 2-6 of Mandoguitar' },
    { instrument: 'Cittern', notes: 'X G C G D G', relation: 'Strings 2-6 of Cittern (1) transposed down 5' },
    { instrument: 'Mandolin', notes: 'X G D A E X', relation: 'Mandoguitar strings 2-5' },
    { instrument: 'Oud', notes: 'D E A D G C', relation: 'All Fourths transposed down 5 with string 6 raised 3' },
    { instrument: 'Pipa', notes: 'X X A D E A', relation: 'Strings 1-4 of Pelican transposed up 2' },
    { instrument: 'Ukulele', notes: 'X X D G B E', relation: 'Strings 1-4 of Standard' },
    { instrument: 'Ukulele', notes: 'X X A D F# B', relation: 'Strings 1-4 of Standard transposed down 5' },
    { instrument: 'Ukulele', notes: 'X X G C E A', relation: 'Strings 1-4 of Standard transposed up 5' }
  ];

  const GUIDE = {
    whyRetune: 'New tunings inspire new musical thoughts. Alternate tunings let you play voicings and slide between chord forms that would normally be impossible. They give access to nonstandard open strings. Playing familiar fingerings on an unfamiliar fretboard is exciting: you never know exactly what to expect. Once you have retuned and explored a single alternate tuning, you\'ll be hooked by the unexpected fingerings, the easy drone strings, the "new" open chords. New tunings are a way to recapture the wonder you experienced when first finding your way around the fretboard, but now you can become proficient in a matter of days rather than years.',
    circleOfNotes: 'A surprising number of useful insights about the musical universe are displayed in the circle of notes, which is like a clock face in which the hours of the day are replaced by the note names C C# D D# E F F# G G# A A# B. The A string begins with an A note. Playing up one fret moves the A to an A# (move clockwise around the circle). Up another fret is a B. Up one more is a C. Tradition gives some notes two names: C# is also called Db, D# is Eb, F# is Gb, G# is Ab, A# is Bb.',
    fourTricks: [
      { title: 'Transpose chords using the circle of notes', body: 'Moving every note of a chord up one fret (barring the open strings with the first finger) moves the chord one step clockwise around the circle. After the twelfth fret, the chords start repeating.' },
      { title: 'Find and exploit subchords', body: 'Often you can remove notes from a chord form to make it play easier, sound different, or even sound better. The simplified version is called a subchord. Each chord in a chart represents a whole family of related chords.' },
      { title: 'Combine chords to create new chord forms', body: 'Any note in either of two fingerings of the same chord is fair game. Mixing notes from each gives new fingerings of the same chord.' },
      { title: 'Exploit octaves and multiple strings', body: 'If a chord is fingered on some fret of one string, it can also be fingered on that same fret of any other string tuned to the same note. In many alternate tunings several strings are tuned alike, leading to numerous useful and exciting chords.' }
    ],
    retuning: 'The Retune row shows how far each string must be changed from the standard tuning. A zero means that the string is the same as in Standard. Plus numbers indicate that the string must be tuned up while negative numbers mean the string must be tuned down. The Fret row tells where to fret in order to match the tone of the next string up. Fix the lowest string first, then press the shown fret on each string to get the note for the next string. It\'s actually easier to tune to many of the alternate tunings (especially the open tunings) than to tune to the Standard.',
    buildChords: 'Each chord type is defined to contain a certain collection of intervals. A major chord contains the intervals 0, 4, and 7. Starting at the root, count around the circle of notes to find the chord tones, then highlight them on the fretboard of the tuning. By choosing various subsets of the highlighted notes, numerous fingerings can be found. Scales are built exactly the same way.'
  };

  return { STANDARD, CATEGORIES, TUNINGS, CHORD_TYPES, SCALE_TYPES, CROSS_INDEX, OTHER_INSTRUMENTS, GUIDE,
    SOURCE: { title: 'Alternate Tuning Guide', author: 'Bill Sethares', url: 'https://sethares.engr.wisc.edu/alternatetunings/alltunings.pdf', home: 'https://sethares.engr.wisc.edu/alternatetunings/alternatetunings.html' } };
})();
