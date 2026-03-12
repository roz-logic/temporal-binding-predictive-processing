#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
=============================================================================
EXPERIMENT 2 — IDENTITY PREDICTION (IP) CONDITION
Temporal Binding & Predictive Processing
=============================================================================
Author: Oz

DESCRIPTION
-----------
Identity Prediction (IP) condition: A tone plays automatically after a fixed
or variable IEI — no keypress required. Tone identity (500 Hz / 1000 Hz) maps
to circle colour (red / green). Participants observe passively during
acquisition; test phase measures interval reproduction.

  1. PRACTICE     (10 trials) — Familiarise with interval reproduction.
  2. ACQUISITION  (30 trials, 20% catch) — Passive listening; 100% congruent
     tone-circle mapping. No voluntary action.
  3. TEST         (50 trials) — 50% congruent / 50% incongruent.
     Reproduce perceived IEI by holding space bar.

DV: reproduced interval duration (space-bar hold, seconds); reaction time (space_RT).

BLOCK CONFIGURATIONS
--------------------
This script covers Blocks IP-FF and IP-RF.

  ┌───────────────────────────────────────────────────────────────────────┐
  │ IP-FF  |  Acquisition IEI : FIXED  (650 ms)      |  Test IEI : FIXED│
  │ IP-RF  |  Acquisition IEI : RANDOM (150–1150 ms)  |  Test IEI: FIXED│
  └───────────────────────────────────────────────────────────────────────┘

FULL 8-BLOCK STRUCTURE (Experiment 2)
--------------------------------------
  1. IC-FF  | Identity Control    | Acq: Fixed  | Test: Fixed
  2. IC-RF  | Identity Control    | Acq: Random | Test: Fixed
  3. IP-FF  | Identity Prediction | Acq: Fixed  | Test: Fixed  ← THIS
  4. IP-RF  | Identity Prediction | Acq: Random | Test: Fixed  ← THIS
  5. TC-RR  | Temporal Control    | Acq: Random | Test: Random
  6. TC-FR  | Temporal Control    | Acq: Fixed  | Test: Random
  7. TC-RF  | Temporal Control    | Acq: Random | Test: Fixed
  8. TC-FF  | Temporal Control    | Acq: Fixed  | Test: Fixed

THESIS PARAMETERS (Experiment 2)
---------------------------------
  Fixed inter-event interval  : 650 ms
  Random inter-event range    : 150–1150 ms (uniform, from CSV)
  Outcome stimulus duration   : 200 ms
  Acquisition trials          : 30 (20% catch = 6 trials)
  Test trials                 : 50 (50% congruent / 50% incongruent)
  Practice trials             : 10
  Tone mapping                : 500 Hz → red circle | 1000 Hz → green circle
  Reaction time collected     : YES (space_RT)
  Audio backend               : PTB (psychtoolbox)
  Tone duration               : 200 ms

CONDITION CHARACTERISTICS
--------------------------
  Action                : NO (tone plays automatically; no keypress)
  Identity prediction   : YES (learned tone-outcome mapping)
  Temporal control      : NO (participant does not initiate the trial)
  Validity in acq       : 100%
  Validity in test      : ~50% congruent

PsychoPy v2021.1.4 (Peirce et al., 2019)
=============================================================================
"""

from __future__ import absolute_import, division

from psychopy import locale_setup
from psychopy import prefs
from psychopy import sound, gui, visual, core, data, event, logging, clock, colors
from psychopy.constants import (NOT_STARTED, STARTED, PLAYING, PAUSED,
                                STOPPED, FINISHED, PRESSED, RELEASED, FOREVER)

import numpy as np
from numpy import (sin, cos, tan, log, log10, pi, average,
                   sqrt, std, deg2rad, rad2deg, linspace, asarray)
from numpy.random import random, randint, normal, shuffle, choice as randchoice
import os
import sys

from psychopy.hardware import keyboard


# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------

def get_practice_stimulus_appearing_time(trialDict):
    return trialDict['wait_duration_before_circle']

def get_acquisition_stimulus_appearing_time(trialDict):
    # Reads IEI from CSV — covers both fixed (650 ms) and random (150–1150 ms) blocks
    return trialDict['wait_duration_before_circle']

def get_test_stimulus_appearing_time(trialDict):
    # Fixed at 650 ms for test phase
    return 0.650

def my_random(trialLoop):
    """Deterministic pseudo-random for ~50/50 validity split across test trials."""
    curr_num = trialLoop.thisTrial['trials']
    tot_num  = trialLoop.nTotal
    return (curr_num - 0.5) / tot_num

def get_color(tone_name, consistent=True):
    """Return (color_name, hex) for a tone.
    consistent=True  → canonical mapping (high=green, low=red)
    consistent=False → reversed mapping
    Toggle the commented lines below to counterbalance across participants.
    Tone frequencies: 500 Hz = low_tone, 1000 Hz = high_tone.
    """
    isHigh = tone_name == 'high_tone'
    if not consistent:
        isHigh = not isHigh
    if isHigh:
        return 'green', '#55bf40'
        # return 'red', '#bf4040'
    else:
        return 'red', '#bf4040'
        # return 'green', '#55bf40'

def get_catch_trial_perm(totalCount, catchCount):
    """Build a permuted list of catch-trial markers.
    Last 10 positions are always '0' (no catch) to avoid end-of-block issues.
    """
    my_list = []
    catchPerColor = int(catchCount / 2)
    assert catchPerColor * 2 == catchCount
    for _ in range(catchPerColor):
        my_list.append('R')
        my_list.append('G')
    for _ in range(totalCount - catchCount - 10):
        my_list.append('0')
    my_list = list(np.random.permutation(my_list))
    for _ in range(10):
        my_list.append('0')
    return my_list


# ---------------------------------------------------------------------------
# Experiment-level flags
# ---------------------------------------------------------------------------

# Acquisition: 100% congruent (tone predicts colour)
acquisition_circle_color_random = False
# Test: ~50% congruent (controlled via my_random)
test_circle_color_random = True

inter_stimulus_interval = 0.2


# ---------------------------------------------------------------------------
# Audio stimuli
# Tone frequencies: 500 Hz (low) = red | 1000 Hz (high) = green
# Duration: 200 ms — shortened from Exp 1 (1 s) for timing precision
# ---------------------------------------------------------------------------

low_tone  = sound.Sound(500,  sampleRate=44100, secs=0.2, stereo=True)
low_tone.setVolume(1)
high_tone = sound.Sound(1000, sampleRate=44100, secs=0.2, stereo=True)
high_tone.setVolume(1)

custom_keyboard = keyboard.Keyboard()


# ---------------------------------------------------------------------------
# Experiment setup
# ---------------------------------------------------------------------------

_thisDir = os.path.dirname(os.path.abspath(__file__))
os.chdir(_thisDir)

psychopyVersion = '2021.1.4'
expName = 'prediction_block'
expInfo = {'participant': '', 'session': '001'}
dlg = gui.DlgFromDict(dictionary=expInfo, sortKeys=False, title=expName)
if not dlg.OK:
    core.quit()
expInfo['date'] = data.getDateStr()
expInfo['expName'] = expName
expInfo['psychopyVersion'] = psychopyVersion

filename = _thisDir + os.sep + u'data/%s_%s_%s' % (
    expInfo['participant'], expName, expInfo['date'])

thisExp = data.ExperimentHandler(name=expName, version='',
    extraInfo=expInfo, runtimeInfo=None,
    originPath=os.path.abspath(__file__),
    savePickle=True, saveWideText=True,
    dataFileName=filename)
logFile = logging.LogFile(filename + '.log', level=logging.EXP)
logging.console.setLevel(logging.WARNING)

endExpNow = False
frameTolerance = 0.001

win = visual.Window(
    size=(1024, 768), fullscr=True, screen=0,
    winType='pyglet', allowGUI=False, allowStencil=False,
    monitor='testMonitor', color=[0, 0, 0], colorSpace='rgb',
    blendMode='avg', useFBO=True,
    units='height')
expInfo['frameRate'] = win.getActualFrameRate()
frameDur = 1.0 / round(expInfo['frameRate']) if expInfo['frameRate'] else 1.0 / 60.0
quarterToFrame = (frameDur * 3) / 4

# Use PTB audio backend for precise tone scheduling
prefs.general['audiolib'] = ['PTB']
import psychtoolbox as ptb

defaultKeyboard = keyboard.Keyboard()


# ---------------------------------------------------------------------------
# Component initialisation
# ---------------------------------------------------------------------------

# Practice
practiceClock = core.Clock()
circle_color_name    = ''
circle_color_current = ''

fix2 = visual.ShapeStim(win=win, name='fix2', vertices='cross',
    size=(0.02, 0.02), ori=0.0, pos=(0, 0),
    lineWidth=1.0, colorSpace='rgb', lineColor='white', fillColor='white',
    opacity=1.0, depth=-1.0, interpolate=True)
circles3 = visual.Polygon(win=win, name='circles3',
    edges=100, size=(0.3, 0.3), ori=0.0, pos=(0, 0),
    lineWidth=1.0, colorSpace='rgb', lineColor='white', fillColor='white',
    opacity=1.0, depth=-2.0, interpolate=True)
fake_text2 = visual.TextStim(win=win, name='fake_text2',
    text=None, font='Open Sans', pos=(0, 0), height=0.1, wrapWidth=None, ori=0.0,
    color='white', colorSpace='rgb', opacity=None, languageStyle='LTR', depth=-3.0)

# Post-practice instruction screen
instr_2Clock = core.Clock()
key_resp2 = keyboard.Keyboard()
go2 = visual.TextStim(win=win, name='go2',
    text="Practice phase complete. Press 'up' to continue.",
    font='Open Sans', pos=(0, 0), height=0.1, wrapWidth=None, ori=0.0,
    color='white', colorSpace='rgb', opacity=None, languageStyle='LTR', depth=-1.0)

# Acquisition
AcquisitionClock = core.Clock()
cross = visual.ShapeStim(win=win, name='cross', vertices='cross',
    size=(0.02, 0.02), ori=0.0, pos=(0, 0),
    lineWidth=1.0, colorSpace='rgb', lineColor='white', fillColor='white',
    opacity=None, depth=0.0, interpolate=True)
circle = visual.Polygon(win=win, name='circle',
    edges=100, size=(0.3, 0.3), ori=0.0, pos=(0, 0),
    lineWidth=1.0, colorSpace='rgb', lineColor='white', fillColor='white',
    opacity=None, depth=-1.0, interpolate=True)
circle_color = ''
custom_clock = core.Clock()
win.mouseVisible = False

# Catch-trial permutation for acquisition (30 trials, 6 catch = 20%)
acq_catch_permutation = get_catch_trial_perm(30, 6)
print("Catch trial permutation:", acq_catch_permutation)
acq_red_catch_count   = 0
acq_green_catch_count = 0

# Post-acquisition instruction screen
instrClock = core.Clock()
text = visual.TextStim(win=win, name='text',
    text="Acquisition phase complete. Press 'up' to continue.",
    font='Open Sans', pos=(0, 0), height=0.1, wrapWidth=None, ori=0.0,
    color='white', colorSpace='rgb', opacity=None, languageStyle='LTR', depth=0.0)
key_resp_2 = keyboard.Keyboard()

# Test
testClock = core.Clock()
fix = visual.ShapeStim(win=win, name='fix', vertices='cross',
    size=(0.02, 0.02), ori=0.0, pos=(0, 0),
    lineWidth=1.0, colorSpace='rgb', lineColor='white', fillColor='white',
    opacity=None, depth=0.0, interpolate=True)
circles = visual.Polygon(win=win, name='circles',
    edges=100, size=(0.3, 0.3), ori=0.0, pos=(0, 0),
    lineWidth=1.0, colorSpace='rgb', lineColor='white', fillColor='white',
    opacity=None, depth=-1.0, interpolate=True)
fake_text = visual.TextStim(win=win, name='fake_text',
    text=None, font='Open Sans', pos=(0, 0), height=0.1, wrapWidth=None, ori=0.0,
    color='white', colorSpace='rgb', opacity=None, languageStyle='LTR', depth=-3.0)

globalClock  = core.Clock()
routineTimer = core.CountdownTimer()


# ---------------------------------------------------------------------------
# PRACTICE phase
# ---------------------------------------------------------------------------

trialsLoop2 = data.TrialHandler(nReps=1.0, method='random',
    extraInfo=expInfo, originPath=-1,
    trialList=data.importConditions('csv--practiceRun2.csv'),
    seed=None, name='trialsLoop2')
thisExp.addLoop(trialsLoop2)
thisTrialsLoop2 = trialsLoop2.trialList[0]
if thisTrialsLoop2 is not None:
    for paramName in thisTrialsLoop2:
        exec('{} = thisTrialsLoop2[paramName]'.format(paramName))

for thisTrialsLoop2 in trialsLoop2:
    currentLoop = trialsLoop2
    if thisTrialsLoop2 is not None:
        for paramName in thisTrialsLoop2:
            exec('{} = thisTrialsLoop2[paramName]'.format(paramName))

    continueRoutine = True
    tone_name = 'high_tone' if random() > 0.5 else 'low_tone'
    if test_circle_color_random:
        circle_color = '#bf4040' if random() > 0.5 else '#55bf40'
    else:
        circle_color = '#bf4040' if tone_name == 'low_tone' else '#55bf40'

    clock = core.Clock()
    circle_color_name = 'red' if circle_color == '#bf4040' else 'green'
    chosen = high_tone if tone_name == 'high_tone' else low_tone

    trialsLoop2.addData('tone_name', tone_name)
    trialsLoop2.addData('circle_color_name', circle_color_name)

    circles3.fillColor = ''
    sound_start_time  = 2.0
    sound_finish_time = 2.2
    sound_playing     = False
    stimulus_appearing_time = get_practice_stimulus_appearing_time(thisTrialsLoop2)
    keyboard_wait_start_time = sound_finish_time + stimulus_appearing_time + inter_stimulus_interval

    practiceComponents = [fix2, circles3, fake_text2]
    for thisComponent in practiceComponents:
        thisComponent.tStart = thisComponent.tStop = None
        thisComponent.tStartRefresh = thisComponent.tStopRefresh = None
        if hasattr(thisComponent, 'status'):
            thisComponent.status = NOT_STARTED
    t = 0
    _timeToFirstFrame = win.getFutureFlipTime(clock='now')
    practiceClock.reset(-_timeToFirstFrame)
    frameN = -1

    while continueRoutine:
        t = practiceClock.getTime()
        tThisFlip = win.getFutureFlipTime(clock=practiceClock)
        tThisFlipGlobal = win.getFutureFlipTime(clock=None)
        frameN += 1

        tt = clock.getTime()
        continueRoutine = False

        if tt + 0.5 >= sound_start_time and tt < sound_finish_time and not sound_playing:
            ptbNow = ptb.GetSecs()
            chosen.play(when=ptbNow + sound_start_time - tt)
            core.wait(sound_finish_time - tt)
            chosen.stop()
            sound_playing = False
            tt = clock.getTime()
            prevTime = tt
            trialsLoop2.addData('stimulus_appearing_time_onset', tt)
            circles3.fillColor = circle_color
            core.wait(stimulus_appearing_time - quarterToFrame)
            win.flip()
            tt = clock.getTime()
            trialsLoop2.addData('stimulus_appearing_time', tt - prevTime)
            prevTime = tt
            circles3.fillColor = ''
            core.wait(inter_stimulus_interval - quarterToFrame)
            win.flip()
            tt = clock.getTime()
            trialsLoop2.addData('inter_stimulus_interval', tt - prevTime)

        my_keys = custom_keyboard.getKeys(['space'], waitRelease=True)
        if tt > keyboard_wait_start_time and 'space' in my_keys:
            my_key = my_keys[-1]
            trialsLoop2.addData('space_pressed_duration', my_key.duration)
            continueRoutine = False

        if fix2.status == NOT_STARTED and tThisFlip >= 0.0 - frameTolerance:
            fix2.frameNStart = frameN
            fix2.tStart = t
            fix2.tStartRefresh = tThisFlipGlobal
            win.timeOnFlip(fix2, 'tStartRefresh')
            fix2.setAutoDraw(True)

        if circles3.status == NOT_STARTED and tThisFlip >= 0.0 - frameTolerance:
            circles3.frameNStart = frameN
            circles3.tStart = t
            circles3.tStartRefresh = tThisFlipGlobal
            win.timeOnFlip(circles3, 'tStartRefresh')
            circles3.setAutoDraw(True)
        if circles3.status == STARTED:
            circles3.setFillColor(circle_color_current)
            circles3.setLineColor(circle_color_current)

        if fake_text2.status == NOT_STARTED and tThisFlip >= 0.0 - frameTolerance:
            fake_text2.frameNStart = frameN
            fake_text2.tStart = t
            fake_text2.tStartRefresh = tThisFlipGlobal
            win.timeOnFlip(fake_text2, 'tStartRefresh')
            fake_text2.setAutoDraw(True)

        if endExpNow or defaultKeyboard.getKeys(keyList=['escape']):
            core.quit()

        if not continueRoutine:
            break
        continueRoutine = False
        for thisComponent in practiceComponents:
            if hasattr(thisComponent, 'status') and thisComponent.status != FINISHED:
                continueRoutine = True
                break

        if continueRoutine:
            win.flip()

    for thisComponent in practiceComponents:
        if hasattr(thisComponent, 'setAutoDraw'):
            thisComponent.setAutoDraw(False)
    routineTimer.reset()
    thisExp.nextEntry()


# ---------------------------------------------------------------------------
# Post-practice instruction screen
# ---------------------------------------------------------------------------

continueRoutine = True
key_resp2.keys = []
key_resp2.rt   = []
_key_resp2_allKeys = []

instr_2Components = [key_resp2, go2]
for thisComponent in instr_2Components:
    thisComponent.tStart = thisComponent.tStop = None
    thisComponent.tStartRefresh = thisComponent.tStopRefresh = None
    if hasattr(thisComponent, 'status'):
        thisComponent.status = NOT_STARTED
t = 0
_timeToFirstFrame = win.getFutureFlipTime(clock='now')
instr_2Clock.reset(-_timeToFirstFrame)
frameN = -1

while continueRoutine:
    t = instr_2Clock.getTime()
    tThisFlip = win.getFutureFlipTime(clock=instr_2Clock)
    tThisFlipGlobal = win.getFutureFlipTime(clock=None)
    frameN += 1

    waitOnFlip = False
    if key_resp2.status == NOT_STARTED and tThisFlip >= 0.0 - frameTolerance:
        key_resp2.frameNStart = frameN
        key_resp2.tStart = t
        key_resp2.tStartRefresh = tThisFlipGlobal
        win.timeOnFlip(key_resp2, 'tStartRefresh')
        key_resp2.status = STARTED
        waitOnFlip = True
        win.callOnFlip(key_resp2.clock.reset)
        win.callOnFlip(key_resp2.clearEvents, eventType='keyboard')
    if key_resp2.status == STARTED and not waitOnFlip:
        theseKeys = key_resp2.getKeys(keyList=['up'], waitRelease=False)
        _key_resp2_allKeys.extend(theseKeys)
        if _key_resp2_allKeys:
            key_resp2.keys = _key_resp2_allKeys[-1].name
            key_resp2.rt   = _key_resp2_allKeys[-1].rt
            continueRoutine = False

    if go2.status == NOT_STARTED and tThisFlip >= 0.0 - frameTolerance:
        go2.frameNStart = frameN
        go2.tStart = t
        go2.tStartRefresh = tThisFlipGlobal
        win.timeOnFlip(go2, 'tStartRefresh')
        go2.setAutoDraw(True)

    if endExpNow or defaultKeyboard.getKeys(keyList=['escape']):
        core.quit()

    if not continueRoutine:
        break
    continueRoutine = False
    for thisComponent in instr_2Components:
        if hasattr(thisComponent, 'status') and thisComponent.status != FINISHED:
            continueRoutine = True
            break

    if continueRoutine:
        win.flip()

for thisComponent in instr_2Components:
    if hasattr(thisComponent, 'setAutoDraw'):
        thisComponent.setAutoDraw(False)
if key_resp2.keys in ['', [], None]:
    key_resp2.keys = None
thisExp.addData('key_resp2.keys', key_resp2.keys)
if key_resp2.keys is not None:
    thisExp.addData('key_resp2.rt', key_resp2.rt)
thisExp.nextEntry()
routineTimer.reset()


# ---------------------------------------------------------------------------
# ACQUISITION phase
# ---------------------------------------------------------------------------

trialsLoop1 = data.TrialHandler(nReps=1.0, method='random',
    extraInfo=expInfo, originPath=-1,
    trialList=data.importConditions('acq. 30.csv'),
    seed=None, name='trialsLoop1')
thisExp.addLoop(trialsLoop1)
thisTrialsLoop1 = trialsLoop1.trialList[0]
if thisTrialsLoop1 is not None:
    for paramName in thisTrialsLoop1:
        exec('{} = thisTrialsLoop1[paramName]'.format(paramName))

for thisTrialsLoop1 in trialsLoop1:
    currentLoop = trialsLoop1
    if thisTrialsLoop1 is not None:
        for paramName in thisTrialsLoop1:
            exec('{} = thisTrialsLoop1[paramName]'.format(paramName))

    continueRoutine = True
    timer = core.Clock()
    stimulus_appearing_time = get_acquisition_stimulus_appearing_time(thisTrialsLoop1)

    tone_name = 'high_tone' if my_random(trialsLoop1) > 0.5 else 'low_tone'

    if acquisition_circle_color_random:
        circle_color      = '#bf4040' if random() > 0.5 else '#55bf40'
        circle_color_name = 'red' if circle_color == '#bf4040' else 'green'
        is_valid = (tone_name == 'high_tone' and circle_color_name == 'green') or \
                   (tone_name == 'low_tone'  and circle_color_name == 'red')
    else:
        # 100% congruent in acquisition
        is_valid = True
        circle_color_name, circle_color = get_color(tone_name, is_valid)

    clock  = core.Clock()
    chosen = high_tone if tone_name == 'high_tone' else low_tone

    trialsLoop1.addData('tone_name', tone_name)
    trialsLoop1.addData('circle_color_name', circle_color_name)
    trialsLoop1.addData('is_valid', is_valid)

    sound_start_time    = 2.0
    sound_finish_time   = 2.2
    sound_playing       = False
    catch_trial_response = False

    next_catch_trial_item = acq_catch_permutation[trialsLoop1.thisN]
    if next_catch_trial_item == 'R':
        acq_red_catch_count += 1
    elif next_catch_trial_item == 'G':
        acq_green_catch_count += 1
    should_catch_trial = False

    keys = event.getKeys()  # clear buffer before trial

    AcquisitionComponents = [cross, circle]
    for thisComponent in AcquisitionComponents:
        thisComponent.tStart = thisComponent.tStop = None
        thisComponent.tStartRefresh = thisComponent.tStopRefresh = None
        if hasattr(thisComponent, 'status'):
            thisComponent.status = NOT_STARTED
    t = 0
    _timeToFirstFrame = win.getFutureFlipTime(clock='now')
    AcquisitionClock.reset(-_timeToFirstFrame)
    frameN = -1

    while continueRoutine:
        t = AcquisitionClock.getTime()
        tThisFlip = win.getFutureFlipTime(clock=AcquisitionClock)
        tThisFlipGlobal = win.getFutureFlipTime(clock=None)
        frameN += 1

        if cross.status == NOT_STARTED and tThisFlip >= 0.0 - frameTolerance:
            cross.frameNStart = frameN
            cross.tStart = t
            cross.tStartRefresh = tThisFlipGlobal
            win.timeOnFlip(cross, 'tStartRefresh')
            cross.setAutoDraw(True)

        if circle.status == NOT_STARTED and tThisFlip >= 0.0 - frameTolerance:
            circle.frameNStart = frameN
            circle.tStart = t
            circle.tStartRefresh = tThisFlipGlobal
            win.timeOnFlip(circle, 'tStartRefresh')
            circle.setAutoDraw(True)
        if circle.status == STARTED:
            circle.setFillColor(circle_color_current)
            circle.setLineColor(circle_color_current)

        tt   = clock.getTime()
        keys = event.getKeys(['up', 'down'])
        continueRoutine = False

        if (tt + 0.5 >= sound_start_time and tt < sound_finish_time
                and not sound_playing and not catch_trial_response):
            ptbNow = ptb.GetSecs()
            chosen.play(when=ptbNow + sound_start_time - tt)
            core.wait(sound_finish_time - tt)
            chosen.stop()
            sound_playing = False
            tt = clock.getTime()
            prevTime = tt
            trialsLoop1.addData('stimulus_appearing_time_onset', tt)
            circle.fillColor = circle_color
            core.wait(stimulus_appearing_time - quarterToFrame)
            win.flip()

            should_catch_trial = False
            if circle_color_name == 'red' and acq_red_catch_count > 0:
                acq_red_catch_count -= 1
                should_catch_trial = True
            elif circle_color_name == 'green' and acq_green_catch_count > 0:
                acq_green_catch_count -= 1
                should_catch_trial = True

            tt = clock.getTime()
            trialsLoop1.addData('stimulus_appearing_time', tt - prevTime)
            prevTime = tt
            circle.fillColor = ''
            core.wait(inter_stimulus_interval - quarterToFrame)
            win.flip()
            tt = clock.getTime()
            trialsLoop1.addData('inter_stimulus_interval', tt - prevTime)

            if should_catch_trial:
                question = visual.TextStim(win,
                    'What colour was the circle? '
                    'Press "up" for red, "down" for green.',
                    font='Open Sans', pos=(0, 0), height=0.1, wrapWidth=None, ori=0.0,
                    color='white', colorSpace='rgb', opacity=None, languageStyle='LTR', depth=-1.0)
                question.draw()
                win.flip()
                core.wait(3.0)
            else:
                continueRoutine = False

        if should_catch_trial and ('up' in keys or 'down' in keys):
            catch_trial_response = True
            if circle_color_name == 'red':
                catch_resp = 'up' in keys
            else:
                catch_resp = 'down' in keys
            trialsLoop1.addData('catch_trials', catch_resp)
            continueRoutine = False

        if endExpNow or defaultKeyboard.getKeys(keyList=['escape']):
            core.quit()

        if not continueRoutine:
            break
        continueRoutine = False
        for thisComponent in AcquisitionComponents:
            if hasattr(thisComponent, 'status') and thisComponent.status != FINISHED:
                continueRoutine = True
                break

        if continueRoutine:
            win.flip()

    for thisComponent in AcquisitionComponents:
        if hasattr(thisComponent, 'setAutoDraw'):
            thisComponent.setAutoDraw(False)
    routineTimer.reset()
    thisExp.nextEntry()


# ---------------------------------------------------------------------------
# Post-acquisition instruction screen
# ---------------------------------------------------------------------------

continueRoutine = True
key_resp_2.keys = []
key_resp_2.rt   = []
_key_resp_2_allKeys = []

instrComponents = [text, key_resp_2]
for thisComponent in instrComponents:
    thisComponent.tStart = thisComponent.tStop = None
    thisComponent.tStartRefresh = thisComponent.tStopRefresh = None
    if hasattr(thisComponent, 'status'):
        thisComponent.status = NOT_STARTED
t = 0
_timeToFirstFrame = win.getFutureFlipTime(clock='now')
instrClock.reset(-_timeToFirstFrame)
frameN = -1

while continueRoutine:
    t = instrClock.getTime()
    tThisFlip = win.getFutureFlipTime(clock=instrClock)
    tThisFlipGlobal = win.getFutureFlipTime(clock=None)
    frameN += 1

    if text.status == NOT_STARTED and tThisFlip >= 0.0 - frameTolerance:
        text.frameNStart = frameN
        text.tStart = t
        text.tStartRefresh = tThisFlipGlobal
        win.timeOnFlip(text, 'tStartRefresh')
        text.setAutoDraw(True)

    waitOnFlip = False
    if key_resp_2.status == NOT_STARTED and tThisFlip >= 0.0 - frameTolerance:
        key_resp_2.frameNStart = frameN
        key_resp_2.tStart = t
        key_resp_2.tStartRefresh = tThisFlipGlobal
        win.timeOnFlip(key_resp_2, 'tStartRefresh')
        key_resp_2.status = STARTED
        waitOnFlip = True
        win.callOnFlip(key_resp_2.clock.reset)
        win.callOnFlip(key_resp_2.clearEvents, eventType='keyboard')
    if key_resp_2.status == STARTED and not waitOnFlip:
        theseKeys = key_resp_2.getKeys(keyList=['up'], waitRelease=False)
        _key_resp_2_allKeys.extend(theseKeys)
        if _key_resp_2_allKeys:
            key_resp_2.keys = _key_resp_2_allKeys[-1].name
            key_resp_2.rt   = _key_resp_2_allKeys[-1].rt
            continueRoutine = False

    if endExpNow or defaultKeyboard.getKeys(keyList=['escape']):
        core.quit()

    if not continueRoutine:
        break
    continueRoutine = False
    for thisComponent in instrComponents:
        if hasattr(thisComponent, 'status') and thisComponent.status != FINISHED:
            continueRoutine = True
            break

    if continueRoutine:
        win.flip()

for thisComponent in instrComponents:
    if hasattr(thisComponent, 'setAutoDraw'):
        thisComponent.setAutoDraw(False)
thisExp.addData('text.started', text.tStartRefresh)
thisExp.addData('text.stopped', text.tStopRefresh)
if key_resp_2.keys in ['', [], None]:
    key_resp_2.keys = None
thisExp.addData('key_resp_2.keys', key_resp_2.keys)
if key_resp_2.keys is not None:
    thisExp.addData('key_resp_2.rt', key_resp_2.rt)
thisExp.addData('key_resp_2.started', key_resp_2.tStartRefresh)
thisExp.addData('key_resp_2.stopped', key_resp_2.tStopRefresh)
thisExp.nextEntry()
routineTimer.reset()


# ---------------------------------------------------------------------------
# TEST phase
# ---------------------------------------------------------------------------

trialsLoop = data.TrialHandler(nReps=1.0, method='random',
    extraInfo=expInfo, originPath=-1,
    trialList=data.importConditions('test 50.csv'),
    seed=None, name='trialsLoop')
thisExp.addLoop(trialsLoop)
thisTrialsLoop = trialsLoop.trialList[0]
if thisTrialsLoop is not None:
    for paramName in thisTrialsLoop:
        exec('{} = thisTrialsLoop[paramName]'.format(paramName))

for thisTrialsLoop in trialsLoop:
    currentLoop = trialsLoop
    if thisTrialsLoop is not None:
        for paramName in thisTrialsLoop:
            exec('{} = thisTrialsLoop[paramName]'.format(paramName))

    continueRoutine = True
    stimulus_appearing_time = get_test_stimulus_appearing_time(thisTrialsLoop)
    tone_name = 'high_tone' if random() > 0.5 else 'low_tone'

    # ~50% congruent in test
    is_valid = my_random(trialsLoop) < 0.5
    circle_color_name, circle_color = get_color(tone_name, is_valid)

    clock  = core.Clock()
    chosen = high_tone if tone_name == 'high_tone' else low_tone

    trialsLoop.addData('tone_name', tone_name)
    trialsLoop.addData('circle_color_name', circle_color_name)
    trialsLoop.addData('is_valid', is_valid)
    trialsLoop.addData('stimulus_appearing_time', stimulus_appearing_time)

    keys = event.getKeys()  # clear buffer before trial

    sound_start_time  = 2.0
    sound_finish_time = 2.2
    sound_playing     = False
    keyboard_wait_start_time = sound_finish_time + stimulus_appearing_time + inter_stimulus_interval

    testComponents = [fix, circles, fake_text]
    for thisComponent in testComponents:
        thisComponent.tStart = thisComponent.tStop = None
        thisComponent.tStartRefresh = thisComponent.tStopRefresh = None
        if hasattr(thisComponent, 'status'):
            thisComponent.status = NOT_STARTED
    t = 0
    _timeToFirstFrame = win.getFutureFlipTime(clock='now')
    testClock.reset(-_timeToFirstFrame)
    frameN = -1

    while continueRoutine:
        t = testClock.getTime()
        tThisFlip = win.getFutureFlipTime(clock=testClock)
        tThisFlipGlobal = win.getFutureFlipTime(clock=None)
        frameN += 1

        if fix.status == NOT_STARTED and tThisFlip >= 0.0 - frameTolerance:
            fix.frameNStart = frameN
            fix.tStart = t
            fix.tStartRefresh = tThisFlipGlobal
            win.timeOnFlip(fix, 'tStartRefresh')
            fix.setAutoDraw(True)

        if circles.status == NOT_STARTED and tThisFlip >= 0.0 - frameTolerance:
            circles.frameNStart = frameN
            circles.tStart = t
            circles.tStartRefresh = tThisFlipGlobal
            win.timeOnFlip(circles, 'tStartRefresh')
            circles.setAutoDraw(True)
        if circles.status == STARTED:
            circles.setFillColor(circle_color_current)
            circles.setLineColor(circle_color_current)

        tt = clock.getTime()

        if tt + 0.5 >= sound_start_time and tt < sound_finish_time and not sound_playing:
            ptbNow = ptb.GetSecs()
            chosen.play(when=ptbNow + sound_start_time - tt)
            core.wait(sound_finish_time - tt)
            chosen.stop()
            sound_playing = False
            tt = clock.getTime()
            prevTime = tt
            trialsLoop.addData('stimulus_appearing_time_onset', tt)
            circles.fillColor = circle_color
            core.wait(stimulus_appearing_time - quarterToFrame)
            win.flip()
            tt = clock.getTime()
            trialsLoop.addData('stimulus_appearing_time', tt - prevTime)
            prevTime = tt
            circles.fillColor = ''
            core.wait(inter_stimulus_interval - quarterToFrame)
            win.flip()
            tt = clock.getTime()
            trialsLoop.addData('inter_stimulus_interval', tt - prevTime)
            custom_keyboard.clock.reset()

        my_keys = custom_keyboard.getKeys(['space'], waitRelease=True)
        if tt > keyboard_wait_start_time and 'space' in my_keys:
            my_key = my_keys[-1]
            if my_key.rt > 0:  # reject presses buffered before clock reset
                trialsLoop.addData('space_pressed_duration', my_key.duration)
                trialsLoop.addData('space_RT', my_key.rt)   # standardised to space_RT
                continueRoutine = False

        if fake_text.status == NOT_STARTED and tThisFlip >= 0.0 - frameTolerance:
            fake_text.frameNStart = frameN
            fake_text.tStart = t
            fake_text.tStartRefresh = tThisFlipGlobal
            win.timeOnFlip(fake_text, 'tStartRefresh')
            fake_text.setAutoDraw(True)

        if endExpNow or defaultKeyboard.getKeys(keyList=['escape']):
            core.quit()

        if not continueRoutine:
            break
        continueRoutine = False
        for thisComponent in testComponents:
            if hasattr(thisComponent, 'status') and thisComponent.status != FINISHED:
                continueRoutine = True
                break

        if continueRoutine:
            win.flip()

    for thisComponent in testComponents:
        if hasattr(thisComponent, 'setAutoDraw'):
            thisComponent.setAutoDraw(False)
    routineTimer.reset()
    thisExp.nextEntry()


# ---------------------------------------------------------------------------
# Shutdown
# ---------------------------------------------------------------------------

win.flip()
thisExp.saveAsWideText(filename + '.csv', delim='auto')
thisExp.saveAsPickle(filename)
logging.flush()
thisExp.abort()
win.close()
core.quit()
