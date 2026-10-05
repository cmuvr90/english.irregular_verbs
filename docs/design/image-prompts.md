# Промты для иллюстраций приложения

Готовые файлы кладём в `public/images/app/` под указанными именами (формат `.webp`,
прозрачный фон). Компонент `Illustration` подхватит их без правок кода — до этого
в Storybook видна заглушка с именем файла.

## Общий стиль (добавлять в начало каждого промта)

> Soft matte 3D clay illustration, rounded chunky friendly shapes, smooth surfaces
> with very subtle film grain. Limited palette: ultramarine ink blue #4B5CF0,
> dawn sky cyan #45C1E6, sunset coral #F2774B, twilight orchid #A46CE3, warm gold
> #F2C14E, plus soft white. Soft studio light from top-left, gentle ambient
> occlusion, faint bluish contact shadow under the object. Isolated on a fully
> transparent background, centered, generous padding around the subject.
> No text, no letters, no numbers, no logos. Modern mobile-app illustration, high detail.

Негатив (если генератор поддерживает): `text, letters, watermark, harsh shadows,
photorealistic, gritty, cluttered background, gradient background, frame, border`.

## Маскот (1:1, 1024×1024)

Маскот — один и тот же персонаж во всех сценах: подросток-студент в ультрамариновом
худи, тёмно-каштановые волосы, круглое доброе лицо, румянец.

| Файл | Промт (после общего стиля) |
| --- | --- |
| `mascot-wave.webp` | A cheerful teenage student character in an ultramarine hoodie waving hello with one hand and holding an open book in the other, slight three-quarter view, a tiny cyan sparkle near the head. Upper body, cropped at the waist. |
| `mascot-celebrate.webp` | The same student character jumping with joy, both arms up, surrounded by floating confetti in cyan, coral and orchid, a small golden trophy beside them. Full body. |
| `empty-search.webp` | The same student character holding a big magnifying glass, looking curious and slightly puzzled, a small question-mark-shaped cloud made of soft clay floating nearby (no actual text). Full body, sitting on a stack of books. |
| `empty-progress.webp` | A small clay flower pot with a young sprout that has three leaves — cyan, coral and orchid — tiny golden sparkles around it. Object only, no character. |

## Тренажёры (4:3, 1200×900)

| Файл | Промт (после общего стиля) |
| --- | --- |
| `trainer-flashcards.webp` | A fanned stack of three rounded flashcards floating in the air, front card orchid, middle coral, back cyan, the front card slightly flipping to show its back side, abstract soft line glyphs on the cards instead of text. |
| `trainer-multiple-choice.webp` | Three rounded pill-shaped buttons stacked vertically, the middle one glowing cyan with a white checkmark, the other two soft white, a small hand cursor about to tap. |
| `trainer-fill-blanks.webp` | An open notebook with ruled blue lines and a coral margin line, one glowing coral gap in a line, an ultramarine fountain pen resting diagonally across the page. |
| `trainer-word-order.webp` | Four chunky rounded clay blocks in ultramarine, cyan, coral and orchid arranged in a row, one block mid-air snapping into its place, faint motion arcs. |
| `trainer-picture-match.webp` | A tilted instant-photo frame showing a simple clay figure running, connected by a dotted curved line to a rounded card with an abstract glyph, green check bubble at the connection. |
| `trainer-listening.webp` | Rounded ultramarine over-ear headphones with three concentric sound-wave arcs coming out in cyan, coral and orchid, a small golden music note. |
