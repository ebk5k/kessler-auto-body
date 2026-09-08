#!/usr/bin/env bash
# Kessler Auto Body — one sequential media batch (Aveon-style warm editorial aesthetic).
# imagegen (ChatGPT lane) stills -> grokgen image-to-video for the hero reel. Never parallel.
set -u
IG=~/.claude/skills/imagegen/bin/imagegen.sh
GG=~/.claude/skills/grokgen/bin/grokgen.sh
OUT=~/kessler-auto-body/assets/src
mkdir -p "$OUT"
LOG="$OUT/batch.log"
step() { echo "[$(date +%H:%M:%S)] $*" | tee -a "$LOG"; }
run_ig() { local name="$1" size="$2" prompt="$3"
  if [[ -s "$OUT/$name.png" ]]; then step "skip $name (exists)"; return; fi
  step "imagegen $name $size"
  if "$IG" "$prompt" "$OUT/$name.png" --size "$size" >>"$LOG" 2>&1; then step "ok $name"; else step "FAIL $name"; fi
}
STYLE="Warm editorial interior-magazine photography style, soft diffused natural daylight mixed with warm white LED light, muted warm palette of sand beige, cream, warm greige, espresso brown and copper accents, light polished concrete floor, cream painted walls, calm minimal composition with generous negative space, subtle film grain, Kinfolk aesthetic applied to a premium auto body shop, photorealistic, no text, no words, no lettering, no logos, no badges, no license plate characters"

run_ig hero 1536x1024 "A freshly refinished champagne-gold metallic luxury sedan inside a bright cream-colored downdraft paint booth, the car angled three-quarter front and filling the right two-thirds of the frame, flawless wet-look clear coat reflecting long soft white light panels, pale warm booth walls, light glossy floor with a soft reflection, faint warm haze in the air, low camera at headlight height, 35mm lens, no people. $STYLE"

run_ig svc-collision 1024x1536 "Vertical portrait composition: a technician in a sand-colored work apron and dark gloves, seen from behind and the side with no face visible, carefully aligning a new front fender panel onto a warm-silver sedan, checking the panel gap with fingertips, in a cream-walled auto body shop bay with warm light, tools on a light oak workbench in the background, shallow depth of field, 50mm lens. $STYLE"

run_ig svc-paint 1024x1536 "Vertical portrait composition: a painter in a white paint suit and respirator, face hidden by the mask and hood, spraying a car door panel mounted on a stand inside a bright cream paint booth, fine warm-lit paint mist catching the light, soft white light panels on the walls, warm copper-toned reflections in the fresh clear coat, cinematic yet calm, 85mm lens. $STYLE"

run_ig svc-frame 1024x1536 "Vertical portrait composition: a warm-silver sedan body clamped on a frame straightening rack with small laser measuring targets hanging from the underbody, a technician seen from behind reading a softly glowing tablet, cream-walled collision repair shop with tall windows letting in soft daylight, light concrete floor, calm industrial precision, 35mm lens. $STYLE"

run_ig svc-dent 1024x1536 "Vertical portrait composition: extreme close-up of a gloved hand using a slim steel paintless-dent-repair rod behind a deep espresso-brown metallic fender while a warm LED line board reflects across the panel, the panel surface flawless and mirror-like, warm cream shop blurred in the background, macro detail, 100mm lens. $STYLE"

run_ig story 1536x1024 "Two auto body technicians in sand-colored work shirts standing beside a cream-white sedan with its hood open, both seen from the side and slightly behind so faces are not visible, reviewing a repair estimate on a tablet together, a light oak consultation desk with paint color chips and a coffee cup, cream walls, tall warm windows, editorial candid moment, 35mm lens. $STYLE"

run_ig work-bmw 1536x1024 "A deep espresso-brown metallic German sports sedan photographed from the rear three-quarter, freshly repaired and refinished, perfect panel gaps and mirror-like clear coat reflecting soft white light panels, parked on a light glossy floor inside a cream-walled body shop delivery bay, warm afternoon light raking across the body, 50mm lens, no people. $STYLE"

run_ig work-macan 1536x1024 "A chalk-white compact luxury SUV photographed from the front three-quarter inside a bright cream auto body shop, immaculate fresh paint with soft reflections, light polished concrete floor, warm daylight through a large roll-up door behind it, a single tan leather stool and light oak cabinet in the background, 50mm lens, no people. $STYLE"

run_ig paint-mixing 1536x1024 "Still life on a light oak counter in an auto body paint mixing room: a handheld spectrophotometer, a row of sprayed color test cards in warm neutrals from champagne to espresso, small paint mixing cups, a clipboard, all under soft warm daylight from a nearby window, cream tiled wall behind, shallow depth of field, 50mm lens, overhead-angled composition, no people. $STYLE"

run_ig shop-wide 1536x1024 "Wide establishing shot of a premium auto body shop floor at golden hour: three cars in champagne, cream white and espresso brown parked in clean cream-walled bays, tall roll-up doors open letting in low warm sunlight that streaks across a light polished concrete floor, exposed light-wood ceiling beams, soft white light bars, calm and immaculate, 24mm lens, no people. $STYLE"

# --- hero reel: animate the exact hero still ---
if [[ -s "$OUT/hero.png" && ! -s "$OUT/hero.mp4" ]]; then
  step "grokgen video hero"
  VP="Slow, almost still cinematic push-in on the freshly painted champagne sedan inside the bright cream paint booth, soft warm haze drifting gently through the light, reflections of the white light panels shimmering subtly across the wet clear coat, steady camera, no cuts, no people, photorealistic"
  if "$GG" "$VP" "$OUT/hero.mp4" --video --image "$OUT/hero.png" --ar 3:2 --res 720p --duration 8 >>"$LOG" 2>&1; then step "ok hero.mp4"; else
    step "retry hero.mp4 at 16:9"
    if "$GG" "$VP" "$OUT/hero.mp4" --video --image "$OUT/hero.png" --ar 16:9 --res 720p --duration 8 >>"$LOG" 2>&1; then step "ok hero.mp4"; else step "FAIL hero.mp4"; fi
  fi
fi
step "BATCH DONE"
