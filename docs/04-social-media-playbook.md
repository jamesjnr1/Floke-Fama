# Social Media & Flyer Playbook

Goal: keep Flokefama's channels **active, consistent and clearly premium**, and do it in about 3 hours a week using the templates in `/flyers`.

## Channels & priorities
| Channel | Why | Frequency | Best formats |
|---|---|---|---|
| **LinkedIn** | Where procurement heads, doctors and partners are | 3× / week | 1080×1350 portrait, carousels, news |
| **Facebook** | Broad reach in Ghana | 3× / week | Same assets as LinkedIn |
| **Instagram** | Brand image, events, team | 3× / week + stories | 1080×1350 feed, 1080×1920 story |
| **WhatsApp Business** (Status + catalogue) | Where buyers actually reply | Daily status | 1080×1920 story |

## The five content pillars (rotate through them)
1. **Product Spotlight:** one device, three key benefits, "Request a quote". *(template: `product-spotlight`)*
2. **Proof & Milestones:** awards, Forbes Africa, installations, partner hospitals. *(template: `milestone`)*
3. **Expert Tip / Education:** calibration, quality verification, lab best practice. Positions Flokefama as the expert. *(template: `tip`)*
4. **People & Culture:** engineers on site, team, training days, Floke Praise. Real photos only.
5. **Events & Announcements:** trade shows, new branches, holidays. *(template: `event`)*

## Weekly rhythm (example)
| Mon | Wed | Fri |
|---|---|---|
| Product Spotlight | Expert Tip or People | Proof / Milestone or Event |

## Flyer rules (what makes it look premium)
1. **One message per flyer.** If it needs two headlines, make two flyers.
2. **At most 25 words** on a feed flyer, excluding contact details.
3. **Plenty of empty space.** At least 30% of the canvas should be empty.
4. **Two fonts only** (Manrope + Inter) and **brand colours only**.
5. **Logo in the same corner every time.** A fixed footer bar carries the phone number and website.
6. **Real product cut-outs on clean backgrounds.** Never a busy photo behind text.
7. **Red appears once**, as a small highlight.
8. Export at **2× resolution** (the export script already does this) so text stays sharp after Instagram and WhatsApp compress the image.

## Caption formula
```
[Hook — one line that stops the scroll]
[2–3 lines of value: what it is, why it matters to a hospital or lab]
[CTA: 📞 +233 53 339 2863 · 🌐 flokefama.com]
[3–5 hashtags]
```
Core hashtags: `#Flokefama #SavingLives #HealthcareGhana #MedicalEquipment #LaboratoryGhana` + topic tags (`#Mindray #IVD #Diagnostics`).

## Ready-to-use post ideas from existing news
- "Best in IVD. Recognised by Mindray, Central Africa Region, Nairobi 2026" → milestone
- "As featured in Forbes Africa" → milestone
- "Building Ghana's next biomedical engineers with the University of Ghana" → people / milestone
- "Why quality verification matters before an analyser reaches your lab" → tip (from the Aug 2026 blog post)
- Product spotlights: Mindray BS-240, BC-5150 haematology analyser, Olympus CX23 microscope, CPAP machine, autoclaves
- "6 branches across Ghana: Santa Maria · Korle-Bu · Okaishie · Kumasi · Aflao · Techiman" → announcement

## Workflow
1. Copy a template from `flyers/templates/` and edit the text in the `<!-- EDIT -->` blocks.
2. Run `npm run flyers` to export PNGs to `flyers/export/`.
3. Write the caption in `flyers/captions.md` next to the file name.
4. **Get approval from your contact before posting** (a quick WhatsApp message with the PNG is enough).
5. Schedule posts with Meta Business Suite (Facebook + Instagram) and LinkedIn's native scheduler.
6. At month end, record reach, engagement and enquiries, and repeat what worked.
