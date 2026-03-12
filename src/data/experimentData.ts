// ─────────────────────────────────────────────────────────────────────────────
// Experiment 1 — PsychoPy Design Reference Data
// Three condition scripts: IC (Identity Control), TC (Temporal Control),
//                          IP (Identity Prediction)
// ─────────────────────────────────────────────────────────────────────────────

export interface BlockVariant {
  code: string;          // e.g. "IC-FF"
  acqTiming: "fixed" | "random";
  testTiming: "fixed" | "random";
  isCurrent: boolean;
  switchInstruction: string;
}

export interface TrialPhase {
  name: string;
  trials: number;
  timing: string;
  colourRule: string;
  hasReproduction: boolean;
  notes: string;
}

export interface ConditionScript {
  id: "IC" | "TC" | "IP";
  fullName: string;
  tagline: string;
  color: string;          // tailwind accent colour key
  hasAction: boolean;     // voluntary keypress?
  hasMapping: boolean;    // learned identity mapping?
  hasTemporalControl: boolean;
  firstEvent: string;
  mappingRule: string | null;
  currentBlock: string;
  constants: { name: string; value: string; note: string }[];
  timingFunctions: { name: string; forVariant: string; body: string }[];
  blockVariants: BlockVariant[];
  phases: TrialPhase[];
  keyDifferences: string[];
  dataColumns: { col: string; phase: string; description: string }[];
  snippets: { label: string; code: string; note?: string }[];
}

// ─── Shared parameters ───────────────────────────────────────────────────────
export const SHARED_PARAMS = {
  fixedIEI: "550 ms",
  randomRange: "0–1100 ms (uniform, from CSV)",
  outcomeDuration: "200 ms",
  acquisitionTrials: 50,
  testTrials: 50,
  practiceTrials: 10,
  reactionTime: false,
  catchTrials: false,
  psychopyVersion: "2021.1.4",
};

// ─── Full 8-block structure ───────────────────────────────────────────────────
export const BLOCK_STRUCTURE = [
  { code: "IC-FF", condition: "Identity Control",    acq: "Fixed",  test: "Fixed",  script: "IC" },
  { code: "IC-RF", condition: "Identity Control",    acq: "Random", test: "Fixed",  script: "IC" },
  { code: "IP-FF", condition: "Identity Prediction", acq: "Fixed",  test: "Fixed",  script: "IP" },
  { code: "IP-RF", condition: "Identity Prediction", acq: "Random", test: "Fixed",  script: "IP" },
  { code: "TC-RR", condition: "Temporal Control",    acq: "Random", test: "Random", script: "TC" },
  { code: "TC-FF", condition: "Temporal Control",    acq: "Fixed",  test: "Fixed",  script: "TC" },
  { code: "TC-RF", condition: "Temporal Control",    acq: "Random", test: "Fixed",  script: "TC" },
  { code: "TC-FR", condition: "Temporal Control",    acq: "Fixed",  test: "Random", script: "TC" },
];

// ─── IC — Identity Control ────────────────────────────────────────────────────
const IC: ConditionScript = {
  id: "IC",
  fullName: "Identity Control",
  tagline: "Voluntary keypress → learned colour outcome · temporal control present",
  color: "violet",
  hasAction: true,
  hasMapping: true,
  hasTemporalControl: true,
  firstEvent: "Voluntary keypress (left / right)",
  mappingRule: "Left → Red · Right → Green (100% valid in acquisition)",
  currentBlock: "IC-FF",
  constants: [
    { name: "FIXED_IEI_S",                value: "0.550",  note: "Fixed inter-event interval (seconds)" },
    { name: "OUTCOME_DISPLAY_DURATION_S", value: "0.200",  note: "Circle visible duration (200 ms)" },
  ],
  timingFunctions: [
    {
      name: "get_practice_interval()",
      forVariant: "All IC blocks",
      body: `def get_practice_interval(trial_dict):
    \"\"\"Practice: variable interval from CSV.\"\"\"
    return trial_dict['wait_duration_before_circle']`,
    },
    {
      name: "get_acquisition_interval()",
      forVariant: "IC-FF (fixed) / IC-RF (random)",
      body: `def get_acquisition_interval(trial_dict):
    # return trial_dict['wait_duration_before_circle']  # ← IC-RF
    return FIXED_IEI_S                                   # ← IC-FF`,
    },
    {
      name: "get_test_interval()",
      forVariant: "All IC blocks (always fixed)",
      body: `def get_test_interval(trial_dict):
    \"\"\"Test phase: always fixed 550 ms for IC blocks.\"\"\"
    return FIXED_IEI_S`,
    },
  ],
  blockVariants: [
    {
      code: "IC-FF",
      acqTiming: "fixed",
      testTiming: "fixed",
      isCurrent: true,
      switchInstruction: "Current script — no changes needed.",
    },
    {
      code: "IC-RF",
      acqTiming: "random",
      testTiming: "fixed",
      isCurrent: false,
      switchInstruction:
        "In get_acquisition_interval(): UNCOMMENT the trial_dict line, COMMENT OUT return FIXED_IEI_S.",
    },
  ],
  phases: [
    {
      name: "Practice",
      trials: 10,
      timing: "Random (from CSV)",
      colourRule: "Random — no mapping",
      hasReproduction: true,
      notes: "Familiarise participants with the space-bar reproduction task.",
    },
    {
      name: "Acquisition",
      trials: 50,
      timing: "Fixed 550 ms (IC-FF) or Random (IC-RF)",
      colourRule: "100% congruent: Left→Red, Right→Green",
      hasReproduction: false,
      notes: "Participants observe action-outcome mapping. Space bar press triggers a warning.",
    },
    {
      name: "Test",
      trials: 50,
      timing: "Fixed 550 ms",
      colourRule: "Randomised (congruency uncontrolled in Exp 1)",
      hasReproduction: true,
      notes: "DV collected: space-bar hold duration = reproduced IEI.",
    },
  ],
  keyDifferences: [
    "Voluntary keypress initiates every trial.",
    "Action-outcome identity mapping is learned in acquisition (100% valid).",
    "Congruency is randomised at test — is_valid recorded per trial.",
    "Space-bar warning shown if pressed during acquisition.",
    "time.sleep() used in practice/test phases; core.wait() in acquisition.",
  ],
  dataColumns: [
    { col: "key_pressed",         phase: "Acq / Test",  description: "'left' or 'right' — which key triggered the trial" },
    { col: "outcome_color",       phase: "All",          description: "'red' or 'green' — circle colour shown" },
    { col: "is_congruent",        phase: "Acq / Test",  description: "True if key-colour pair matches learned mapping" },
    { col: "actual_iei_s",        phase: "All",          description: "Measured keypress → circle onset interval (seconds)" },
    { col: "actual_display_s",    phase: "All",          description: "Measured circle visible duration (seconds)" },
    { col: "reproduced_interval_s", phase: "Practice / Test", description: "Space-bar hold duration = DV (seconds)" },
  ],
  snippets: [
    {
      label: "Acquisition phase — congruent mapping",
      code: `# Congruent mapping: left → red, right → green (100% valid)
if 'left' in keys or 'right' in keys:
    key_pressed = 'left' if 'left' in keys else 'right'
    acquisition_trials.addData('key_pressed', key_pressed)

    outcome_hex  = '#bf4040' if key_pressed == 'left' else '#55bf40'
    outcome_name = 'red'     if key_pressed == 'left' else 'green'
    circle_acq.fillColor = outcome_hex
    acquisition_trials.addData('outcome_color', outcome_name)
    acquisition_trials.addData('is_congruent', True)  # Always True in acquisition

    # Inter-event interval: keypress → circle onset
    prevTime = timer.getTime()
    core.wait(inter_event_interval_s - quarter_to_frame)
    win.flip()
    nextTime = timer.getTime()
    acquisition_trials.addData('actual_iei_s', nextTime - prevTime)

    # Outcome display: circle visible for 200 ms
    circle_acq.fillColor = ''
    prevTime = timer.getTime()
    core.wait(OUTCOME_DISPLAY_DURATION_S - quarter_to_frame)
    win.flip()
    acquisition_trials.addData('actual_display_s', timer.getTime() - prevTime)

    continueRoutine = False`,
      note: "quarter_to_frame compensates for the next-flip's upcoming frame, keeping timing precise.",
    },
    {
      label: "Test phase — randomised congruency",
      code: `# Random outcome colour (congruency uncontrolled in Exp 1)
if random() > 0.5:
    circle_test.fillColor = '#bf4040'
    outcome_name = 'red'
else:
    circle_test.fillColor = '#55bf40'
    outcome_name = 'green'
test_trials.addData('outcome_color', outcome_name)

# Check congruency against learned mapping
is_congruent = ((key_pressed == 'left'  and outcome_name == 'red') or
                (key_pressed == 'right' and outcome_name == 'green'))
test_trials.addData('is_congruent', is_congruent)

# Interval reproduction: participant holds space bar (DV)
my_keys = custom_keyboard_test.getKeys(['space'], waitRelease=True)
if wait_for_space and 'space' in my_keys:
    reproduced_interval_s = my_keys[-1].duration
    test_trials.addData('reproduced_interval_s', reproduced_interval_s)
    continueRoutine = False`,
      note: "is_congruent is logged but not controlled — this is what makes it Exp 1 (vs. Exp 2/3 where validity is controlled).",
    },
    {
      label: "Block switching — IC-FF → IC-RF",
      code: `# ── get_acquisition_interval() ──────────────────────────────────────────────
#
# IC-FF (default — this script):
def get_acquisition_interval(trial_dict):
    # return trial_dict['wait_duration_before_circle']   # ← UNCOMMENT for IC-RF
    return FIXED_IEI_S                                    # ← COMMENT OUT for IC-RF

# IC-RF (random acquisition):
def get_acquisition_interval(trial_dict):
    return trial_dict['wait_duration_before_circle']      # ← random from CSV
    # return FIXED_IEI_S                                  # ← commented out`,
    },
  ],
};

// ─── TC — Temporal Control ────────────────────────────────────────────────────
const TC: ConditionScript = {
  id: "TC",
  fullName: "Temporal Control",
  tagline: "Voluntary keypress → random colour · no identity mapping · 4 IEI combinations",
  color: "amber",
  hasAction: true,
  hasMapping: false,
  hasTemporalControl: true,
  firstEvent: "Voluntary keypress (left / right)",
  mappingRule: null,
  currentBlock: "TC-FF",
  constants: [
    { name: "FIXED_IEI_S",                value: "0.550",  note: "Fixed inter-event interval (seconds)" },
    { name: "OUTCOME_DISPLAY_DURATION_S", value: "0.200",  note: "Circle visible duration (200 ms)" },
  ],
  timingFunctions: [
    {
      name: "get_practice_interval()",
      forVariant: "All TC blocks",
      body: `def get_practice_interval(trial_dict):
    \"\"\"Practice: variable interval from CSV.\"\"\"
    return trial_dict['wait_duration_before_circle']`,
    },
    {
      name: "get_acquisition_interval()",
      forVariant: "TC-FF / TC-FR (fixed) · TC-RF / TC-RR (random)",
      body: `def get_acquisition_interval(trial_dict):
    # return trial_dict['wait_duration_before_circle']  # ← TC-RF or TC-RR
    return FIXED_IEI_S                                   # ← TC-FF or TC-FR`,
    },
    {
      name: "get_test_interval()",
      forVariant: "TC-FF / TC-RF (fixed) · TC-FR / TC-RR (random)",
      body: `def get_test_interval(trial_dict):
    # return trial_dict['wait_duration_before_circle']  # ← TC-FR or TC-RR
    return FIXED_IEI_S                                   # ← TC-FF or TC-RF`,
    },
  ],
  blockVariants: [
    {
      code: "TC-FF",
      acqTiming: "fixed",
      testTiming: "fixed",
      isCurrent: true,
      switchInstruction: "Current script — no changes needed.",
    },
    {
      code: "TC-RF",
      acqTiming: "random",
      testTiming: "fixed",
      isCurrent: false,
      switchInstruction:
        "In get_acquisition_interval(): UNCOMMENT trial_dict line, COMMENT OUT FIXED_IEI_S.",
    },
    {
      code: "TC-FR",
      acqTiming: "fixed",
      testTiming: "random",
      isCurrent: false,
      switchInstruction:
        "In get_test_interval(): UNCOMMENT trial_dict line, COMMENT OUT FIXED_IEI_S.",
    },
    {
      code: "TC-RR",
      acqTiming: "random",
      testTiming: "random",
      isCurrent: false,
      switchInstruction:
        "In BOTH get_acquisition_interval() AND get_test_interval(): UNCOMMENT trial_dict lines, COMMENT OUT FIXED_IEI_S.",
    },
  ],
  phases: [
    {
      name: "Practice",
      trials: 10,
      timing: "Random (from CSV)",
      colourRule: "Random — no mapping",
      hasReproduction: true,
      notes: "Same structure as IC practice but no mapping established.",
    },
    {
      name: "Acquisition",
      trials: 50,
      timing: "Depends on block variant (fixed or random)",
      colourRule: "Always random — no congruency mapping",
      hasReproduction: false,
      notes: "Key difference from IC: colour is always random. No learned mapping.",
    },
    {
      name: "Test",
      trials: 50,
      timing: "Depends on block variant (fixed or random)",
      colourRule: "Always random — no congruency mapping",
      hasReproduction: true,
      notes: "DV: space-bar hold duration. event.getKeys() called before loop to clear residual presses.",
    },
  ],
  keyDifferences: [
    "Colour is ALWAYS random — no identity mapping in any phase.",
    "Both acquisition AND test timing can be fixed or random (4 block variants).",
    "is_valid / is_congruent is N/A — outcomes are never predicted.",
    "event.getKeys() flush at start of each test trial (TC-specific).",
    "core.wait() used consistently in both acquisition and test (vs. time.sleep() in IC test).",
  ],
  dataColumns: [
    { col: "key_pressed",            phase: "Acq / Test",       description: "'left' or 'right'" },
    { col: "outcome_color",          phase: "All",               description: "'red' or 'green' (random)" },
    { col: "actual_iei_s",           phase: "All",               description: "Measured IEI (seconds)" },
    { col: "actual_display_s",       phase: "All",               description: "Measured circle duration (seconds)" },
    { col: "reproduced_interval_s",  phase: "Practice / Test",  description: "Space-bar hold duration = DV (seconds)" },
  ],
  snippets: [
    {
      label: "Acquisition phase — random colour (no mapping)",
      code: `# Keypress → random colour outcome (no mapping in TC)
if 'left' in keys or 'right' in keys:
    key_pressed = 'left' if 'left' in keys else 'right'
    acquisition_trials.addData('key_pressed', key_pressed)

    # Random colour — NO congruency mapping in temporal control
    if random() > 0.5:
        circle_acq.fillColor = '#bf4040'
        acquisition_trials.addData('outcome_color', 'red')
    else:
        circle_acq.fillColor = '#55bf40'
        acquisition_trials.addData('outcome_color', 'green')

    prevTime = timer.getTime()
    core.wait(inter_event_interval_s - quarter_to_frame)
    win.flip()
    acquisition_trials.addData('actual_iei_s', timer.getTime() - prevTime)

    circle_acq.fillColor = ''
    prevTime = timer.getTime()
    core.wait(OUTCOME_DISPLAY_DURATION_S - quarter_to_frame)
    win.flip()
    acquisition_trials.addData('actual_display_s', timer.getTime() - prevTime)

    continueRoutine = False`,
      note: "Notice: no is_congruent column — TC never records congruency because there is no mapping to be congruent with.",
    },
    {
      label: "Test phase — residual keypress flush",
      code: `for test_trial in test_trials:
    continueRoutine = True
    circle_color   = ''
    custom_keyboard_test = keyboard.Keyboard()
    inter_event_interval_s = get_test_interval(test_trial)
    timer = core.Clock()
    wait_for_space = False

    # Clear any residual keypresses from previous trial
    keys = event.getKeys()       # ← TC-specific flush not present in IC

    # ... component reset & frame loop ...`,
      note: "The event.getKeys() flush at trial start is unique to TC. It prevents left/right presses from the end of one trial leaking into the next.",
    },
    {
      label: "Block switching — all 4 variants",
      code: `# ── TC block variants — change ONLY the timing functions ────────────────────

# TC-FF (default — this script):   Acq=Fixed,  Test=Fixed
# TC-RF:                            Acq=Random, Test=Fixed
# TC-FR:                            Acq=Fixed,  Test=Random
# TC-RR:                            Acq=Random, Test=Random

def get_acquisition_interval(trial_dict):
    # return trial_dict['wait_duration_before_circle']  # ← TC-RF or TC-RR
    return FIXED_IEI_S                                   # ← TC-FF or TC-FR

def get_test_interval(trial_dict):
    # return trial_dict['wait_duration_before_circle']  # ← TC-FR or TC-RR
    return FIXED_IEI_S                                   # ← TC-FF or TC-RF

# TC-RR requires BOTH functions to return trial_dict['wait_duration_before_circle']`,
    },
  ],
};

// ─── IP — Identity Prediction ─────────────────────────────────────────────────
const IP: ConditionScript = {
  id: "IP",
  fullName: "Identity Prediction",
  tagline: "Auditory tone → learned colour outcome · no voluntary action · no temporal control",
  color: "emerald",
  hasAction: false,
  hasMapping: true,
  hasTemporalControl: false,
  firstEvent: "Auditory tone (500 Hz low / 1000 Hz high) — passive",
  mappingRule: "Low tone (500 Hz) → Red · High tone (1000 Hz) → Green",
  currentBlock: "IP-FF",
  constants: [
    { name: "FIXED_IEI_S",                value: "0.550",  note: "Fixed IEI: tone offset → circle onset" },
    { name: "OUTCOME_DISPLAY_DURATION_S", value: "0.200",  note: "Circle visible duration (200 ms)" },
    { name: "TONE_ONSET_DELAY_S",         value: "1.300",  note: "Delay from trial start to tone onset (Exp 1 script; thesis procedure description references 2000 ms — 2.0 s is used in Exp 2 scripts)" },
    { name: "TONE_DURATION_S",            value: "0.200",  note: "Tone plays for 200 ms" },
  ],
  timingFunctions: [
    {
      name: "get_practice_interval()",
      forVariant: "All IP blocks",
      body: `def get_practice_interval(trial_dict):
    \"\"\"Practice: variable interval from CSV.\"\"\"
    return trial_dict['wait_duration_before_circle']`,
    },
    {
      name: "get_acquisition_interval()",
      forVariant: "IP-FF (fixed) / IP-RF (random)",
      body: `def get_acquisition_interval(trial_dict):
    # return trial_dict['wait_duration_before_circle']  # ← IP-RF
    return FIXED_IEI_S                                   # ← IP-FF`,
    },
    {
      name: "get_test_interval()",
      forVariant: "All IP blocks (always fixed)",
      body: `def get_test_interval(trial_dict):
    \"\"\"Test phase: always fixed 550 ms for IP blocks.\"\"\"
    return FIXED_IEI_S`,
    },
    {
      name: "get_tone_and_color() [IP-only helper]",
      forVariant: "IP only",
      body: `def get_tone_and_color(is_random, tone_name):
    \"\"\"Return (hex, name, is_congruent) for a given tone.\"\"\"
    if is_random:
        outcome_hex = '#bf4040' if random() > 0.5 else '#55bf40'
    else:
        # Congruent: low_tone→red, high_tone→green
        outcome_hex = '#bf4040' if tone_name == 'low_tone' else '#55bf40'

    outcome_name = 'red' if outcome_hex == '#bf4040' else 'green'
    is_congruent = ((tone_name == 'high_tone' and outcome_name == 'green') or
                    (tone_name == 'low_tone'  and outcome_name == 'red'))
    return outcome_hex, outcome_name, is_congruent`,
    },
  ],
  blockVariants: [
    {
      code: "IP-FF",
      acqTiming: "fixed",
      testTiming: "fixed",
      isCurrent: true,
      switchInstruction: "Current script — no changes needed.",
    },
    {
      code: "IP-RF",
      acqTiming: "random",
      testTiming: "fixed",
      isCurrent: false,
      switchInstruction:
        "In get_acquisition_interval(): UNCOMMENT trial_dict line, COMMENT OUT FIXED_IEI_S.",
    },
  ],
  phases: [
    {
      name: "Practice",
      trials: 10,
      timing: "Random (from CSV)",
      colourRule: "Random tone + random colour (no mapping)",
      hasReproduction: true,
      notes: "Tone plays after 1.3s fixation delay. Reproduction window opens after circle disappears.",
    },
    {
      name: "Acquisition",
      trials: 50,
      timing: "Fixed 550 ms (IP-FF) or Random (IP-RF)",
      colourRule: "100% congruent: Low→Red, High→Green",
      hasReproduction: false,
      notes: "No keypress. Trial runs automatically. event.getKeys() flush prevents residual presses.",
    },
    {
      name: "Test",
      trials: 50,
      timing: "Fixed 550 ms",
      colourRule: "Randomised (congruency uncontrolled in Exp 1)",
      hasReproduction: true,
      notes: "DV: space-bar hold duration. keyboard_wait_start_time gates when reproduction is accepted.",
    },
  ],
  keyDifferences: [
    "NO voluntary action — tone is presented automatically after 1.3s fixation.",
    "Two tones: low (500 Hz) → Red, high (1000 Hz) → Green.",
    "PTB audio backend used: prefs.general['audiolib'] = ['PTB'].",
    "get_tone_and_color() helper abstracts the mapping/randomisation logic.",
    "keyboard_wait_start_time gates reproduction: space accepted only after tone+IEI+display.",
    "trial_clock tracks tone timing; separate from PsychoPy frame clock.",
    "IP results: binding NOT observed → action (temporal control) is necessary for binding.",
  ],
  dataColumns: [
    { col: "tone_name",              phase: "All",               description: "'high_tone' or 'low_tone'" },
    { col: "outcome_color",          phase: "All",               description: "'red' or 'green'" },
    { col: "is_congruent",           phase: "Acq / Test",       description: "True if tone-colour matches learned mapping" },
    { col: "actual_sound_start_time", phase: "Practice",        description: "trial_clock time at tone onset" },
    { col: "actual_sound_finish_time", phase: "Practice",       description: "trial_clock time at tone offset" },
    { col: "actual_sound_play_dur",  phase: "Practice",         description: "Measured tone duration (seconds)" },
    { col: "tone_offset_time_s",     phase: "Acq / Test",       description: "trial_clock time at tone offset (IEI start)" },
    { col: "actual_iei_s",           phase: "All",               description: "Tone offset → circle onset (seconds)" },
    { col: "actual_display_s",       phase: "All",               description: "Measured circle duration (seconds)" },
    { col: "reproduced_interval_s",  phase: "Practice / Test",  description: "Space-bar hold duration = DV (seconds)" },
  ],
  snippets: [
    {
      label: "Sound setup & PTB backend",
      code: `# PTB audio backend — must be set BEFORE importing sound
from psychopy import locale_setup, prefs
prefs.general['audiolib'] = ['PTB']
from psychopy import sound, gui, visual, core, data, event, logging, clock, colors

# Low tone (500 Hz) → Red circle mapping
low_tone  = sound.Sound(500,  sampleRate=44100, secs=TONE_DURATION_S, stereo=True)
low_tone.setVolume(1)

# High tone (1000 Hz) → Green circle mapping
high_tone = sound.Sound(1000, sampleRate=44100, secs=TONE_DURATION_S, stereo=True)
high_tone.setVolume(1)`,
      note: "PTB (PsychToolbox) backend provides lower-latency audio than the default sounddevice. Must be set before any import of psychopy.sound.",
    },
    {
      label: "Acquisition phase — tone-triggered trial",
      code: `# Random tone, congruent colour (100% valid in acquisition)
tone_name    = 'high_tone' if random() > 0.5 else 'low_tone'
chosen_tone  = high_tone   if tone_name == 'high_tone' else low_tone
outcome_hex, outcome_name, is_congruent = get_tone_and_color(False, tone_name)

acquisition_trials.addData('tone_name',     tone_name)
acquisition_trials.addData('outcome_color', outcome_name)
acquisition_trials.addData('is_congruent',  is_congruent)  # Always True in acq

sound_start_time  = TONE_ONSET_DELAY_S                        # 1.3s after trial start
sound_finish_time = TONE_ONSET_DELAY_S + TONE_DURATION_S      # 1.5s

# Inside frame loop — fires once when tt reaches tone window
if (tt + 0.5 >= sound_start_time and tt < sound_finish_time and not sound_playing):
    core.wait(sound_start_time - tt)
    tt = trial_clock.getTime()
    prevTime = tt

    chosen_tone.play()
    sound_playing = True
    core.wait(TONE_DURATION_S)
    chosen_tone.stop()
    sound_playing = False

    # IEI: tone offset → circle onset
    circle_acq.fillColor = outcome_hex
    core.wait(inter_event_interval_s - quarter_to_frame)
    win.flip()
    acquisition_trials.addData('actual_iei_s', trial_clock.getTime() - prevTime)

    # Outcome: circle visible 200 ms
    prevTime = trial_clock.getTime()
    circle_acq.fillColor = ''
    core.wait(OUTCOME_DISPLAY_DURATION_S - quarter_to_frame)
    win.flip()
    acquisition_trials.addData('actual_display_s', trial_clock.getTime() - prevTime)

    continueRoutine = False`,
      note: "is_random=False in get_tone_and_color() → congruent mapping enforced. is_random=True (in test) → random colour.",
    },
    {
      label: "Test phase — gated space-bar reproduction",
      code: `# keyboard_wait_start_time gates reproduction window
keyboard_wait_start_time = (sound_finish_time
                            + inter_event_interval_s
                            + OUTCOME_DISPLAY_DURATION_S)

# Inside frame loop:
my_keys = custom_keyboard.getKeys(['space'], waitRelease=True)
if tt > keyboard_wait_start_time:
    if 'space' in my_keys:
        reproduced_interval_s = my_keys[-1].duration
        test_trials.addData('reproduced_interval_s', reproduced_interval_s)
        continueRoutine = False`,
      note: "Unlike IC/TC, IP can't use a wait_for_space flag tied to keypress because there is no keypress. Instead the time gate ensures space is only recorded after the full tone→IEI→circle sequence.",
    },
    {
      label: "Block switching — IP-FF → IP-RF",
      code: `# ── get_acquisition_interval() ──────────────────────────────────────────────

# IP-FF (default — this script):
def get_acquisition_interval(trial_dict):
    # return trial_dict['wait_duration_before_circle']   # ← UNCOMMENT for IP-RF
    return FIXED_IEI_S                                    # ← COMMENT OUT for IP-RF

# IP-RF (random acquisition):
def get_acquisition_interval(trial_dict):
    return trial_dict['wait_duration_before_circle']
    # return FIXED_IEI_S`,
    },
  ],
};

export const conditions: ConditionScript[] = [IC, TC, IP];

// ─── Cross-condition comparison ───────────────────────────────────────────────
export const comparisonTable = [
  {
    feature: "First event",
    IC: "Voluntary keypress",
    TC: "Voluntary keypress",
    IP: "Auditory tone (auto)",
  },
  {
    feature: "Identity mapping",
    IC: "✅ Yes (key→colour)",
    TC: "❌ No",
    IP: "✅ Yes (tone→colour)",
  },
  {
    feature: "Temporal control",
    IC: "✅ Yes (action-triggered)",
    TC: "✅ Yes (action-triggered)",
    IP: "❌ No (passive)",
  },
  {
    feature: "Acq validity",
    IC: "100% congruent",
    TC: "N/A (always random)",
    IP: "100% congruent",
  },
  {
    feature: "Test validity",
    IC: "Randomised (Exp 1)",
    TC: "N/A",
    IP: "Randomised (Exp 1)",
  },
  {
    feature: "Block variants",
    IC: "2 (FF, RF)",
    TC: "4 (FF, RF, FR, RR)",
    IP: "2 (FF, RF)",
  },
  {
    feature: "Audio required",
    IC: "❌ No",
    TC: "❌ No",
    IP: "✅ Yes (PTB backend)",
  },
  {
    feature: "Exp 1 binding result",
    IC: "✅ Binding observed (underestimation)",
    TC: "⚠️ Partial — underestimation in fixed-acq & fixed-test blocks; interaction with test_time significant",
    IP: "❌ No binding (overestimation relative to IC)",
  },
];
