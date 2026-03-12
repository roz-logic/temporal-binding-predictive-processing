#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
=============================================================================
EXPERIMENT 1 — IDENTITY PREDICTION (IP) CONDITION
Temporal Binding & Predictive Processing
=============================================================================
Author: Oz

DESCRIPTION
-----------
Identity Prediction (IP) condition: NO ACTION. Instead of a keypress,
an auditory tone (500 Hz or 1000 Hz) is presented via headphones as the
first event. Participants learn tone-outcome mappings in acquisition
(100% valid), then congruency is randomised in test.

This is the critical NO-ACTION control condition. If temporal binding
still occurs here, it would suggest action is not necessary. Per thesis
results: binding was NOT observed in IP blocks, confirming the role of
temporal control (action) in the binding effect.

  1. PRACTICE     (10 trials) — Familiarise with interval reproduction.
     Random tone, random colour. Tone plays after ~1.3s fixation.
  2. ACQUISITION  (50 trials) — Learn tone-outcome mapping (100% valid).
     Low tone (500 Hz) → Red, High tone (1000 Hz) → Green.
     Observe only; no reproduction.
  3. TEST         (50 trials) — Congruency randomised. Reproduce perceived
     IEI (tone offset → circle onset) by holding space bar.

DV: reproduced interval duration (space-bar hold, seconds).

KEY DIFFERENCE FROM IC/TC
--------------------------
  - No keypress required (passive observation)
  - Tones (500/1000 Hz) replace keypresses as first event
  - Trial starts automatically after fixation (~1.3s delay to tone)
  - Tone-colour mapping: Low (500 Hz) → Red, High (1000 Hz) → Green

BLOCK CONFIGURATIONS
--------------------
This script is configured for Block IP-FF.

  ┌──────────────────────────────────────────────────────────────────────┐
  │ IP-FF (THIS SCRIPT)                                                 │
  │   Acquisition IEI : FIXED  (550 ms)  → get_acquisition_interval()   │
  │   Test IEI        : FIXED  (550 ms)  → get_test_interval()          │
  │                                                                      │
  │ IP-RF — change get_acquisition_interval():                           │
  │   → UNCOMMENT  return trial_dict['wait_duration_before_circle']      │
  │   → COMMENT OUT  return FIXED_IEI_S                                  │
  │   Acquisition IEI : RANDOM (0–1100 ms, from CSV)                     │
  │   Test IEI        : FIXED  (550 ms)                                  │
  └──────────────────────────────────────────────────────────────────────┘

FULL 8-BLOCK STRUCTURE (Experiment 1)
--------------------------------------
  1. IC-FF  | Identity Control    | Acq: Fixed  | Test: Fixed
  2. IC-RF  | Identity Control    | Acq: Random | Test: Fixed
  3. IP-FF  | Identity Prediction | Acq: Fixed  | Test: Fixed  ← THIS SCRIPT
  4. IP-RF  | Identity Prediction | Acq: Random | Test: Fixed
  5. TC-RR  | Temporal Control    | Acq: Random | Test: Random
  6. TC-FR  | Temporal Control    | Acq: Fixed  | Test: Random
  7. TC-RF  | Temporal Control    | Acq: Random | Test: Fixed
  8. TC-FF  | Temporal Control    | Acq: Fixed  | Test: Fixed

THESIS PARAMETERS (Experiment 1)
---------------------------------
  Fixed inter-event interval  : 550 ms
  Random inter-event range    : 0–1100 ms (uniform, from CSV)
  Outcome stimulus duration   : 200 ms
  Tone frequencies            : 500 Hz (low), 1000 Hz (high)
  Tone duration               : 200 ms
  Tone onset delay            : 1300 ms after trial start
  Acquisition trials          : 50  (100% congruent tone-colour mapping)
  Test trials                 : 50  (congruency randomised)
  Practice trials             : 10
  Reaction time collected     : NO  (added in Experiments 2 & 3)
  Catch trials                : NO  (added in Experiments 2 & 3)

CONDITION CHARACTERISTICS
--------------------------
  Action                : NO  (tone replaces keypress as first event)
  Identity prediction   : YES (learned tone-outcome mapping)
  Temporal control      : NO  (participant does not control timing)
  Validity in acq       : 100% (low→red, high→green)
  Validity in test      : Random

PsychoPy v2021.1.4 (Peirce et al., 2019)
=============================================================================
"""

from __future__ import absolute_import, division

import os
import sys
import time
import numpy as np
from numpy.random import random, randint, normal, shuffle, choice as randchoice
from psychopy import locale_setup, prefs
prefs.general['audiolib'] = ['PTB']
from psychopy import sound, gui, visual, core, data, event, logging, clock, colors
from psychopy.constants import (NOT_STARTED, STARTED, PLAYING, PAUSED, STOPPED, FINISHED, PRESSED, RELEASED, FOREVER)
from psychopy.hardware import keyboard

# ==================== TIMING CONSTANTS ====================

FIXED_IEI_S = 0.550                 # Fixed inter-event interval (tone offset → circle onset)
OUTCOME_DISPLAY_DURATION_S = 0.200   # Circle visible duration (200 ms)
TONE_ONSET_DELAY_S = 1.3            # Delay from trial start to tone onset
TONE_DURATION_S = 0.2               # Tone plays for 200 ms

# ==================== SOUND SETUP ====================

# Low tone (500 Hz) → Red circle mapping (in acquisition)
low_tone = sound.Sound(500, sampleRate=44100, secs=TONE_DURATION_S, stereo=True)
low_tone.setVolume(1)

# High tone (1000 Hz) → Green circle mapping (in acquisition)
high_tone = sound.Sound(1000, sampleRate=44100, secs=TONE_DURATION_S, stereo=True)
high_tone.setVolume(1)

custom_keyboard = keyboard.Keyboard()

# ==================== TIMING FUNCTIONS ====================

def get_practice_interval(trial_dict):
    """Practice: variable interval from CSV (task familiarisation)."""
    return trial_dict['wait_duration_before_circle']

def get_acquisition_interval(trial_dict):
    """
    Acquisition-phase inter-event interval.

    IP-FF (current): fixed 550 ms → return FIXED_IEI_S
    IP-RF:           uncomment first line, comment second.
    """
    # return trial_dict['wait_duration_before_circle']   # ← UNCOMMENT for IP-RF
    return FIXED_IEI_S                                    # ← COMMENT OUT for IP-RF

def get_test_interval(trial_dict):
    """Test-phase inter-event interval (always fixed for IP blocks)."""
    return FIXED_IEI_S

# ==================== HELPER FUNCTION ====================

def get_tone_and_color(is_random, tone_name):
    """Determine circle colour based on tone and randomisation setting.

    Args:
        is_random: If True, colour is random. If False, congruent mapping.
        tone_name: 'high_tone' or 'low_tone'

    Returns:
        tuple: (outcome_hex, outcome_name, is_congruent)
    """
    if is_random:
        outcome_hex = '#bf4040' if random() > 0.5 else '#55bf40'
    else:
        # Congruent mapping: low_tone → red, high_tone → green
        outcome_hex = '#bf4040' if tone_name == 'low_tone' else '#55bf40'

    outcome_name = 'red' if outcome_hex == '#bf4040' else 'green'

    # Check congruency against learned mapping
    is_congruent = ((tone_name == 'high_tone' and outcome_name == 'green') or
                    (tone_name == 'low_tone' and outcome_name == 'red'))

    return outcome_hex, outcome_name, is_congruent

# ==================== EXPERIMENT SETUP ====================

_thisDir = os.path.dirname(os.path.abspath(__file__))
os.chdir(_thisDir)

psychopy_version = '2021.1.4'
exp_name = 'identity_prediction'
exp_info = {'participant': '', 'session': '001'}
dlg = gui.DlgFromDict(dictionary=exp_info, sortKeys=False, title=exp_name)
if not dlg.OK:
    core.quit()
exp_info['date'] = data.getDateStr()
exp_info['exp_name'] = exp_name
exp_info['psychopy_version'] = psychopy_version

filename = _thisDir + os.sep + u'data/%s_%s_%s' % (exp_info['participant'], exp_name, exp_info['date'])

this_exp = data.ExperimentHandler(name=exp_name, version='',
    extraInfo=exp_info, runtimeInfo=None,
    originPath=None,
    savePickle=True, saveWideText=True,
    dataFileName=filename)
log_file = logging.LogFile(filename+'.log', level=logging.EXP)
logging.console.setLevel(logging.WARNING)

end_exp_now = False
frame_tolerance = 0.001

# ==================== WINDOW SETUP ====================

win = visual.Window(
    size=(1024, 768), fullscr=True, screen=0,
    winType='pyglet', allowGUI=False, allowStencil=False,
    monitor='testMonitor', color=[0,0,0], colorSpace='rgb',
    blendMode='avg', useFBO=True,
    units='height')
win.mouseVisible = False

exp_info['frameRate'] = win.getActualFrameRate()
if exp_info['frameRate'] != None:
    frame_dur = 1.0 / round(exp_info['frameRate'])
else:
    frame_dur = 1.0 / 60.0

quarter_to_frame = (frame_dur * 3) / 4

default_keyboard = keyboard.Keyboard()

# ==================== STIMULUS COMPONENTS ====================

# --- Practice phase ---
practice_clock = core.Clock()
circle_color_current = ''
fixation_practice = visual.ShapeStim(
    win=win, name='fixation_practice', vertices='cross',
    size=(0.02, 0.02), ori=0.0, pos=(0, 0),
    lineWidth=1.0, colorSpace='rgb', lineColor='white', fillColor='white',
    opacity=1.0, depth=-1.0, interpolate=True)
circle_practice = visual.Polygon(
    win=win, name='circle_practice',
    edges=100, size=(0.3, 0.3), ori=0.0, pos=(0, 0),
    lineWidth=1.0, colorSpace='rgb', lineColor='white', fillColor='white',
    opacity=1.0, depth=-2.0, interpolate=True)

# --- Post-practice instruction ---
instr_practice_end_clock = core.Clock()
key_resp_practice = keyboard.Keyboard()
instr_practice_end_text = visual.TextStim(win=win, name='instr_practice_end_text',
    text="Practice run is over. Press 'up' to start the experiment.\nWait for the instructor before starting.",
    font='Open Sans', pos=(0, 0), height=0.1, wrapWidth=None, ori=0.0,
    color='white', colorSpace='rgb', opacity=None,
    languageStyle='LTR', depth=-1.0)

# --- Acquisition phase ---
acquisition_clock = core.Clock()
fixation_acq = visual.ShapeStim(
    win=win, name='fixation_acq', vertices='cross',
    size=(0.02, 0.02), ori=0.0, pos=(0, 0),
    lineWidth=1.0, colorSpace='rgb', lineColor='white', fillColor='white',
    opacity=None, depth=0.0, interpolate=True)
circle_acq = visual.Polygon(
    win=win, name='circle_acq',
    edges=100, size=(0.3, 0.3), ori=0.0, pos=(0, 0),
    lineWidth=1.0, colorSpace='rgb', lineColor='white', fillColor='white',
    opacity=None, depth=-1.0, interpolate=True)

# --- Post-acquisition instruction ---
instr_mid_clock = core.Clock()
key_resp_mid = keyboard.Keyboard()
instr_mid_text = visual.TextStim(win=win, name='instr_mid_text',
    text="The first part is over. Press 'up' to continue.",
    font='Open Sans', pos=(0, 0), height=0.1, wrapWidth=None, ori=0.0,
    color='white', colorSpace='rgb', opacity=None,
    languageStyle='LTR', depth=0.0)

# --- Test phase ---
test_clock = core.Clock()
fixation_test = visual.ShapeStim(
    win=win, name='fixation_test', vertices='cross',
    size=(0.02, 0.02), ori=0.0, pos=(0, 0),
    lineWidth=1.0, colorSpace='rgb', lineColor='white', fillColor='white',
    opacity=None, depth=0.0, interpolate=True)
circle_test = visual.Polygon(
    win=win, name='circle_test',
    edges=100, size=(0.3, 0.3), ori=0.0, pos=(0, 0),
    lineWidth=1.0, colorSpace='rgb', lineColor='white', fillColor='white',
    opacity=None, depth=-1.0, interpolate=True)

# --- Timers ---
global_clock = core.Clock()
routine_timer = core.CountdownTimer()

# ==================== PRACTICE PHASE ====================
# 10 trials. Random tone, random colour. Tone-triggered (no action).
# Familiarisation with interval reproduction in no-action context.

practice_trials = data.TrialHandler(nReps=1.0, method='random',
    extraInfo=exp_info, originPath=-1,
    trialList=data.importConditions('csv--practiceRun2.csv'),
    seed=None, name='practice_trials')
this_exp.addLoop(practice_trials)

for practice_trial in practice_trials:
    continueRoutine = True

    trial_clock = core.Clock()
    inter_event_interval_s = get_practice_interval(practice_trial)

    # Random tone and random colour (no mapping in practice)
    tone_name = 'high_tone' if random() > 0.5 else 'low_tone'
    chosen_tone = high_tone if tone_name == 'high_tone' else low_tone
    outcome_hex, outcome_name, is_congruent = get_tone_and_color(True, tone_name)

    practice_trials.addData('tone_name', tone_name)
    practice_trials.addData('outcome_color', outcome_name)

    circle_practice.fillColor = ''
    circle_color_current = ''

    sound_start_time = TONE_ONSET_DELAY_S
    sound_finish_time = TONE_ONSET_DELAY_S + TONE_DURATION_S
    sound_playing = False
    keyboard_wait_start_time = sound_finish_time + inter_event_interval_s + OUTCOME_DISPLAY_DURATION_S

    practice_components = [fixation_practice, circle_practice]
    for thisComponent in practice_components:
        thisComponent.tStart = None
        thisComponent.tStop = None
        thisComponent.tStartRefresh = None
        thisComponent.tStopRefresh = None
        if hasattr(thisComponent, 'status'):
            thisComponent.status = NOT_STARTED

    t = 0
    _timeToFirstFrame = win.getFutureFlipTime(clock="now")
    practice_clock.reset(-_timeToFirstFrame)
    frameN = -1

    while continueRoutine:
        t = practice_clock.getTime()
        tThisFlip = win.getFutureFlipTime(clock=practice_clock)
        tThisFlipGlobal = win.getFutureFlipTime(clock=None)
        frameN = frameN + 1

        tt = trial_clock.getTime()

        # --- Tone → IEI → Circle sequence (no action required) ---
        if (tt + 0.5 >= sound_start_time and tt < sound_finish_time and not sound_playing):
            core.wait(sound_start_time - tt)
            tt = trial_clock.getTime()
            prevTime = tt
            practice_trials.addData('actual_sound_start_time', tt)

            chosen_tone.play()
            sound_playing = True
            core.wait(TONE_DURATION_S)
            chosen_tone.stop()
            sound_playing = False

            tt = trial_clock.getTime()
            practice_trials.addData('actual_sound_finish_time', tt)
            nextTime = tt
            practice_trials.addData('actual_sound_play_dur', nextTime - prevTime)
            prevTime = nextTime

            # Inter-event interval: tone offset → circle onset
            circle_practice.fillColor = outcome_hex
            core.wait(inter_event_interval_s - quarter_to_frame)
            win.flip()
            tt = trial_clock.getTime()
            nextTime = tt
            practice_trials.addData('actual_iei_s', nextTime - prevTime)
            prevTime = nextTime

            # Outcome display: circle visible for 200 ms
            circle_practice.fillColor = ''
            core.wait(OUTCOME_DISPLAY_DURATION_S - quarter_to_frame)
            win.flip()
            tt = trial_clock.getTime()
            practice_trials.addData('actual_display_s', tt - prevTime)

        # Interval reproduction: participant holds space bar
        my_keys = custom_keyboard.getKeys(['space'], waitRelease=True)
        if tt > keyboard_wait_start_time:
            if 'space' in my_keys:
                reproduced_interval_s = my_keys[-1].duration
                practice_trials.addData('reproduced_interval_s', reproduced_interval_s)
                continueRoutine = False

        # --- Component updates ---
        if fixation_practice.status == NOT_STARTED and tThisFlip >= 0.0-frame_tolerance:
            fixation_practice.frameNStart = frameN
            fixation_practice.tStart = t
            fixation_practice.tStartRefresh = tThisFlipGlobal
            win.timeOnFlip(fixation_practice, 'tStartRefresh')
            fixation_practice.setAutoDraw(True)

        if circle_practice.status == NOT_STARTED and tThisFlip >= 0.0-frame_tolerance:
            circle_practice.frameNStart = frameN
            circle_practice.tStart = t
            circle_practice.tStartRefresh = tThisFlipGlobal
            win.timeOnFlip(circle_practice, 'tStartRefresh')
            circle_practice.setAutoDraw(True)
        if circle_practice.status == STARTED:
            circle_practice.setFillColor(circle_color_current)
            circle_practice.setLineColor(circle_color_current)

        if end_exp_now or default_keyboard.getKeys(keyList=["escape"]):
            core.quit()

        if not continueRoutine:
            break
        continueRoutine = False
        for thisComponent in practice_components:
            if hasattr(thisComponent, "status") and thisComponent.status != FINISHED:
                continueRoutine = True
                break

        if continueRoutine:
            win.flip()

    for thisComponent in practice_components:
        if hasattr(thisComponent, "setAutoDraw"):
            thisComponent.setAutoDraw(False)

    routine_timer.reset()
    this_exp.nextEntry()

# ==================== INSTRUCTION: PRACTICE → ACQUISITION ====================

continueRoutine = True
key_resp_practice.keys = []
key_resp_practice.rt = []
_key_resp_practice_allKeys = []

instr_practice_end_components = [key_resp_practice, instr_practice_end_text]
for thisComponent in instr_practice_end_components:
    thisComponent.tStart = None
    thisComponent.tStop = None
    thisComponent.tStartRefresh = None
    thisComponent.tStopRefresh = None
    if hasattr(thisComponent, 'status'):
        thisComponent.status = NOT_STARTED

t = 0
_timeToFirstFrame = win.getFutureFlipTime(clock="now")
instr_practice_end_clock.reset(-_timeToFirstFrame)
frameN = -1

while continueRoutine:
    t = instr_practice_end_clock.getTime()
    tThisFlip = win.getFutureFlipTime(clock=instr_practice_end_clock)
    tThisFlipGlobal = win.getFutureFlipTime(clock=None)
    frameN = frameN + 1

    waitOnFlip = False
    if key_resp_practice.status == NOT_STARTED and tThisFlip >= 0.0-frame_tolerance:
        key_resp_practice.frameNStart = frameN
        key_resp_practice.tStart = t
        key_resp_practice.tStartRefresh = tThisFlipGlobal
        win.timeOnFlip(key_resp_practice, 'tStartRefresh')
        key_resp_practice.status = STARTED
        waitOnFlip = True
        win.callOnFlip(key_resp_practice.clock.reset)
        win.callOnFlip(key_resp_practice.clearEvents, eventType='keyboard')
    if key_resp_practice.status == STARTED and not waitOnFlip:
        theseKeys = key_resp_practice.getKeys(keyList=['up'], waitRelease=False)
        _key_resp_practice_allKeys.extend(theseKeys)
        if len(_key_resp_practice_allKeys):
            key_resp_practice.keys = _key_resp_practice_allKeys[-1].name
            key_resp_practice.rt = _key_resp_practice_allKeys[-1].rt
            continueRoutine = False

    if instr_practice_end_text.status == NOT_STARTED and tThisFlip >= 0.0-frame_tolerance:
        instr_practice_end_text.frameNStart = frameN
        instr_practice_end_text.tStart = t
        instr_practice_end_text.tStartRefresh = tThisFlipGlobal
        win.timeOnFlip(instr_practice_end_text, 'tStartRefresh')
        instr_practice_end_text.setAutoDraw(True)

    if end_exp_now or default_keyboard.getKeys(keyList=["escape"]):
        core.quit()

    if not continueRoutine:
        break
    continueRoutine = False
    for thisComponent in instr_practice_end_components:
        if hasattr(thisComponent, "status") and thisComponent.status != FINISHED:
            continueRoutine = True
            break

    if continueRoutine:
        win.flip()

for thisComponent in instr_practice_end_components:
    if hasattr(thisComponent, "setAutoDraw"):
        thisComponent.setAutoDraw(False)
if key_resp_practice.keys in ['', [], None]:
    key_resp_practice.keys = None
this_exp.addData('key_resp_practice.keys', key_resp_practice.keys)
if key_resp_practice.keys != None:
    this_exp.addData('key_resp_practice.rt', key_resp_practice.rt)
this_exp.nextEntry()
routine_timer.reset()

# ==================== ACQUISITION PHASE ====================
# 50 trials. Tone-outcome mapping at 100% validity.
# Low tone (500 Hz) → Red, High tone (1000 Hz) → Green.
# Participants observe only; NO reproduction.

acquisition_trials = data.TrialHandler(nReps=1.0, method='random',
    extraInfo=exp_info, originPath=-1,
    trialList=data.importConditions('csv--Cond (0- 1.1).csv'),
    seed=None, name='acquisition_trials')
this_exp.addLoop(acquisition_trials)

for acquisition_trial in acquisition_trials:
    continueRoutine = True

    trial_clock = core.Clock()
    inter_event_interval_s = get_acquisition_interval(acquisition_trial)

    # Random tone, congruent colour (100% valid in acquisition)
    tone_name = 'high_tone' if random() > 0.5 else 'low_tone'
    chosen_tone = high_tone if tone_name == 'high_tone' else low_tone
    outcome_hex, outcome_name, is_congruent = get_tone_and_color(False, tone_name)

    acquisition_trials.addData('tone_name', tone_name)
    acquisition_trials.addData('outcome_color', outcome_name)
    acquisition_trials.addData('is_congruent', is_congruent)  # Always True in acquisition

    circle_color_current = ''

    sound_start_time = TONE_ONSET_DELAY_S
    sound_finish_time = TONE_ONSET_DELAY_S + TONE_DURATION_S
    sound_playing = False

    # Clear residual keypresses
    event.getKeys()

    acquisition_components = [fixation_acq, circle_acq]
    for thisComponent in acquisition_components:
        thisComponent.tStart = None
        thisComponent.tStop = None
        thisComponent.tStartRefresh = None
        thisComponent.tStopRefresh = None
        if hasattr(thisComponent, 'status'):
            thisComponent.status = NOT_STARTED

    t = 0
    _timeToFirstFrame = win.getFutureFlipTime(clock="now")
    acquisition_clock.reset(-_timeToFirstFrame)
    frameN = -1

    while continueRoutine:
        t = acquisition_clock.getTime()
        tThisFlip = win.getFutureFlipTime(clock=acquisition_clock)
        tThisFlipGlobal = win.getFutureFlipTime(clock=None)
        frameN = frameN + 1

        # --- Component updates ---
        if fixation_acq.status == NOT_STARTED and tThisFlip >= 0.0-frame_tolerance:
            fixation_acq.frameNStart = frameN
            fixation_acq.tStart = t
            fixation_acq.tStartRefresh = tThisFlipGlobal
            win.timeOnFlip(fixation_acq, 'tStartRefresh')
            fixation_acq.setAutoDraw(True)

        if circle_acq.status == NOT_STARTED and tThisFlip >= 0.0-frame_tolerance:
            circle_acq.frameNStart = frameN
            circle_acq.tStart = t
            circle_acq.tStartRefresh = tThisFlipGlobal
            win.timeOnFlip(circle_acq, 'tStartRefresh')
            circle_acq.setAutoDraw(True)
        if circle_acq.status == STARTED:
            circle_acq.setFillColor(circle_color_current)
            circle_acq.setLineColor(circle_color_current)

        tt = trial_clock.getTime()

        # --- Tone → IEI → Circle (observe only, no reproduction) ---
        if (tt + 0.5 >= sound_start_time and tt < sound_finish_time and not sound_playing):
            core.wait(sound_start_time - tt)
            tt = trial_clock.getTime()
            prevTime = tt
            acquisition_trials.addData('tone_offset_time_s', tt)

            chosen_tone.play()
            sound_playing = True
            core.wait(TONE_DURATION_S)
            chosen_tone.stop()
            sound_playing = False

            tt = trial_clock.getTime()
            prevTime = tt

            # Inter-event interval: tone offset → circle onset
            circle_acq.fillColor = outcome_hex
            core.wait(inter_event_interval_s - quarter_to_frame)
            win.flip()
            tt = trial_clock.getTime()
            nextTime = tt
            acquisition_trials.addData('actual_iei_s', nextTime - prevTime)
            prevTime = nextTime

            # Outcome display: circle visible for 200 ms
            circle_acq.fillColor = ''
            core.wait(OUTCOME_DISPLAY_DURATION_S - quarter_to_frame)
            win.flip()
            tt = trial_clock.getTime()
            acquisition_trials.addData('actual_display_s', tt - prevTime)

            continueRoutine = False

        if end_exp_now or default_keyboard.getKeys(keyList=["escape"]):
            core.quit()

        if not continueRoutine:
            break
        continueRoutine = False
        for thisComponent in acquisition_components:
            if hasattr(thisComponent, "status") and thisComponent.status != FINISHED:
                continueRoutine = True
                break

        if continueRoutine:
            win.flip()

    for thisComponent in acquisition_components:
        if hasattr(thisComponent, "setAutoDraw"):
            thisComponent.setAutoDraw(False)

    routine_timer.reset()
    this_exp.nextEntry()

# ==================== INSTRUCTION: ACQUISITION → TEST ====================

continueRoutine = True
key_resp_mid.keys = []
key_resp_mid.rt = []
_key_resp_mid_allKeys = []

instr_mid_components = [instr_mid_text, key_resp_mid]
for thisComponent in instr_mid_components:
    thisComponent.tStart = None
    thisComponent.tStop = None
    thisComponent.tStartRefresh = None
    thisComponent.tStopRefresh = None
    if hasattr(thisComponent, 'status'):
        thisComponent.status = NOT_STARTED

t = 0
_timeToFirstFrame = win.getFutureFlipTime(clock="now")
instr_mid_clock.reset(-_timeToFirstFrame)
frameN = -1

while continueRoutine:
    t = instr_mid_clock.getTime()
    tThisFlip = win.getFutureFlipTime(clock=instr_mid_clock)
    tThisFlipGlobal = win.getFutureFlipTime(clock=None)
    frameN = frameN + 1

    if instr_mid_text.status == NOT_STARTED and tThisFlip >= 0.0-frame_tolerance:
        instr_mid_text.frameNStart = frameN
        instr_mid_text.tStart = t
        instr_mid_text.tStartRefresh = tThisFlipGlobal
        win.timeOnFlip(instr_mid_text, 'tStartRefresh')
        instr_mid_text.setAutoDraw(True)

    waitOnFlip = False
    if key_resp_mid.status == NOT_STARTED and tThisFlip >= 0.0-frame_tolerance:
        key_resp_mid.frameNStart = frameN
        key_resp_mid.tStart = t
        key_resp_mid.tStartRefresh = tThisFlipGlobal
        win.timeOnFlip(key_resp_mid, 'tStartRefresh')
        key_resp_mid.status = STARTED
        waitOnFlip = True
        win.callOnFlip(key_resp_mid.clock.reset)
        win.callOnFlip(key_resp_mid.clearEvents, eventType='keyboard')
    if key_resp_mid.status == STARTED and not waitOnFlip:
        theseKeys = key_resp_mid.getKeys(keyList=['up'], waitRelease=False)
        _key_resp_mid_allKeys.extend(theseKeys)
        if len(_key_resp_mid_allKeys):
            key_resp_mid.keys = _key_resp_mid_allKeys[-1].name
            key_resp_mid.rt = _key_resp_mid_allKeys[-1].rt
            continueRoutine = False

    if end_exp_now or default_keyboard.getKeys(keyList=["escape"]):
        core.quit()

    if not continueRoutine:
        break
    continueRoutine = False
    for thisComponent in instr_mid_components:
        if hasattr(thisComponent, "status") and thisComponent.status != FINISHED:
            continueRoutine = True
            break

    if continueRoutine:
        win.flip()

for thisComponent in instr_mid_components:
    if hasattr(thisComponent, "setAutoDraw"):
        thisComponent.setAutoDraw(False)
if key_resp_mid.keys in ['', [], None]:
    key_resp_mid.keys = None
this_exp.addData('key_resp_mid.keys', key_resp_mid.keys)
if key_resp_mid.keys != None:
    this_exp.addData('key_resp_mid.rt', key_resp_mid.rt)
this_exp.nextEntry()
routine_timer.reset()

# ==================== TEST PHASE ====================
# 50 trials. Congruency RANDOMISED. Tone-triggered (no action).
# Reproduce perceived IEI (tone offset → circle onset) by holding space.

test_trials = data.TrialHandler(nReps=1.0, method='random',
    extraInfo=exp_info, originPath=-1,
    trialList=data.importConditions('csv--Cond (0- 1.1).csv'),
    seed=None, name='test_trials')
this_exp.addLoop(test_trials)

for test_trial in test_trials:
    continueRoutine = True

    trial_clock = core.Clock()
    inter_event_interval_s = get_test_interval(test_trial)

    # Random tone and random colour (congruency randomised in test)
    tone_name = 'high_tone' if random() > 0.5 else 'low_tone'
    chosen_tone = high_tone if tone_name == 'high_tone' else low_tone
    outcome_hex, outcome_name, is_congruent = get_tone_and_color(True, tone_name)

    test_trials.addData('tone_name', tone_name)
    test_trials.addData('outcome_color', outcome_name)
    test_trials.addData('is_congruent', is_congruent)

    circle_color_current = ''

    sound_start_time = TONE_ONSET_DELAY_S
    sound_finish_time = TONE_ONSET_DELAY_S + TONE_DURATION_S
    sound_playing = False
    keyboard_wait_start_time = sound_finish_time + inter_event_interval_s + OUTCOME_DISPLAY_DURATION_S

    # Clear residual keypresses
    event.getKeys()

    test_components = [fixation_test, circle_test]
    for thisComponent in test_components:
        thisComponent.tStart = None
        thisComponent.tStop = None
        thisComponent.tStartRefresh = None
        thisComponent.tStopRefresh = None
        if hasattr(thisComponent, 'status'):
            thisComponent.status = NOT_STARTED

    t = 0
    _timeToFirstFrame = win.getFutureFlipTime(clock="now")
    test_clock.reset(-_timeToFirstFrame)
    frameN = -1

    while continueRoutine:
        t = test_clock.getTime()
        tThisFlip = win.getFutureFlipTime(clock=test_clock)
        tThisFlipGlobal = win.getFutureFlipTime(clock=None)
        frameN = frameN + 1

        # --- Component updates ---
        if fixation_test.status == NOT_STARTED and tThisFlip >= 0.0-frame_tolerance:
            fixation_test.frameNStart = frameN
            fixation_test.tStart = t
            fixation_test.tStartRefresh = tThisFlipGlobal
            win.timeOnFlip(fixation_test, 'tStartRefresh')
            fixation_test.setAutoDraw(True)

        if circle_test.status == NOT_STARTED and tThisFlip >= 0.0-frame_tolerance:
            circle_test.frameNStart = frameN
            circle_test.tStart = t
            circle_test.tStartRefresh = tThisFlipGlobal
            win.timeOnFlip(circle_test, 'tStartRefresh')
            circle_test.setAutoDraw(True)
        if circle_test.status == STARTED:
            circle_test.setFillColor(circle_color_current)
            circle_test.setLineColor(circle_color_current)

        tt = trial_clock.getTime()

        # --- Tone → IEI → Circle sequence ---
        if (tt + 0.5 >= sound_start_time and tt < sound_finish_time and not sound_playing):
            core.wait(sound_start_time - tt)
            tt = trial_clock.getTime()
            prevTime = tt
            test_trials.addData('tone_offset_time_s', tt)

            chosen_tone.play()
            sound_playing = True
            core.wait(TONE_DURATION_S)
            chosen_tone.stop()
            sound_playing = False

            tt = trial_clock.getTime()
            prevTime = tt

            # Inter-event interval: tone offset → circle onset
            circle_test.fillColor = outcome_hex
            core.wait(inter_event_interval_s - quarter_to_frame)
            win.flip()
            tt = trial_clock.getTime()
            nextTime = tt
            test_trials.addData('actual_iei_s', nextTime - prevTime)
            prevTime = nextTime

            # Outcome display: circle visible for 200 ms
            circle_test.fillColor = ''
            core.wait(OUTCOME_DISPLAY_DURATION_S - quarter_to_frame)
            win.flip()
            tt = trial_clock.getTime()
            test_trials.addData('actual_display_s', tt - prevTime)

        # Interval reproduction: participant holds space bar (DV)
        my_keys = custom_keyboard.getKeys(['space'], waitRelease=True)
        if tt > keyboard_wait_start_time:
            if 'space' in my_keys:
                reproduced_interval_s = my_keys[-1].duration
                test_trials.addData('reproduced_interval_s', reproduced_interval_s)
                continueRoutine = False

        if end_exp_now or default_keyboard.getKeys(keyList=["escape"]):
            core.quit()

        if not continueRoutine:
            break
        continueRoutine = False
        for thisComponent in test_components:
            if hasattr(thisComponent, "status") and thisComponent.status != FINISHED:
                continueRoutine = True
                break

        if continueRoutine:
            win.flip()

    for thisComponent in test_components:
        if hasattr(thisComponent, "setAutoDraw"):
            thisComponent.setAutoDraw(False)

    routine_timer.reset()
    this_exp.nextEntry()

# ==================== CLEANUP ====================

win.flip()
this_exp.saveAsWideText(filename+'.csv', delim='auto')
this_exp.saveAsPickle(filename)
logging.flush()
this_exp.abort()
win.close()
core.quit()
