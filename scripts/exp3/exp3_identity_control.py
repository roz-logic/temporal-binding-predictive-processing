#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
=============================================================================
EXPERIMENT 3 — IDENTITY CONTROL (IC) CONDITION
Temporal Binding & Predictive Processing
=============================================================================
Author: Oz

DESCRIPTION
-----------
Identity Control (IC) condition: Participants perform a voluntary keypress
(left/right) that triggers a colour outcome (red/green circle) after a
fixed or variable inter-event interval (IEI).

  1. PRACTICE     (10 trials) — Familiarise with interval reproduction.
  2. ACQUISITION  (30 trials, 20% catch) — Learn action-outcome mapping (100% valid).
     Left → Red, Right → Green. Observe only; catch trials require colour report.
  3. TEST         (50 trials) — 80% congruent / 20% incongruent.
     Reproduce perceived IEI by holding space bar.

DV: reproduced interval duration (space-bar hold, seconds); reaction time (space_RT).

BLOCK CONFIGURATIONS
--------------------
This script covers Blocks IC-FF and IC-RF.

  ┌───────────────────────────────────────────────────────────────────────┐
  │ IC-FF  |  Acquisition IEI : FIXED  (650 ms)   |  Test IEI : FIXED   │
  │ IC-RF  |  Acquisition IEI : RANDOM (150–1150 ms)  |  Test IEI: FIXED│
  └───────────────────────────────────────────────────────────────────────┘

FULL 8-BLOCK STRUCTURE (Experiment 3)
--------------------------------------
  1. IC-FF  | Identity Control    | Acq: Fixed  | Test: Fixed  ← THIS
  2. IC-RF  | Identity Control    | Acq: Random | Test: Fixed  ← THIS
  3. IP-FF  | Identity Prediction | Acq: Fixed  | Test: Fixed
  4. IP-RF  | Identity Prediction | Acq: Random | Test: Fixed
  5. TC-RR  | Temporal Control    | Acq: Random | Test: Random
  6. TC-FR  | Temporal Control    | Acq: Fixed  | Test: Random
  7. TC-RF  | Temporal Control    | Acq: Random | Test: Fixed
  8. TC-FF  | Temporal Control    | Acq: Fixed  | Test: Fixed

THESIS PARAMETERS (Experiment 3)
---------------------------------
  Fixed inter-event interval  : 650 ms
  Random inter-event range    : 150–1150 ms (uniform, from CSV)
  Outcome stimulus duration   : 200 ms
  Acquisition trials          : 30 (20% catch = 6 trials)
  Test trials                 : 50 (80% congruent / 20% incongruent)
  Practice trials             : 10
  Reaction time collected     : YES (space_RT)

CONDITION CHARACTERISTICS
--------------------------
  Action                : YES (keypress initiates trial)
  Identity prediction   : YES (learned action-outcome mapping)
  Temporal control      : YES (participant controls timing)
  Validity in acq       : 100%
  Validity in test      : ~80% congruent

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
    # Fixed at 650 ms for Exp 2 (ignores CSV column — SOA set here)
    return 0.650

def get_test_stimulus_appearing_time(trialDict):
    # Fixed at 650 ms for Exp 2
    return 0.650

def my_random(trialLoop):
    """Deterministic pseudo-random for ~80/20 validity split across test trials (Exp 3)."""
    curr_num = trialLoop.thisTrial['trials']
    tot_num  = trialLoop.nTotal
    return (curr_num - 0.5) / tot_num

def get_color(pressed_key, consistent=True):
    """Return (color_name, hex) for a key press.
    consistent=True  → canonical mapping (left=red, right=green)
    consistent=False → reversed mapping
    Toggle the commented lines below to counterbalance across participants.
    """
    isLeft = pressed_key == 'left'
    if not consistent:
        isLeft = not isLeft
    if isLeft:
        return 'red', '#bf4040'
        # return 'green', '#55bf40'
    else:
        return 'green', '#55bf40'
        # return 'red', '#bf4040'

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
# Experiment setup
# ---------------------------------------------------------------------------

_thisDir = os.path.dirname(os.path.abspath(__file__))
os.chdir(_thisDir)

psychopyVersion = '2021.1.4'
expName = 'motor'
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

defaultKeyboard = keyboard.Keyboard()


# ---------------------------------------------------------------------------
# Component initialisation
# ---------------------------------------------------------------------------

# Practice
practiceClock = core.Clock()
fixation3 = visual.ShapeStim(win=win, name='fixation3', vertices='cross',
    size=(0.02, 0.02), ori=0.0, pos=(0, 0),
    lineWidth=1.0, colorSpace='rgb', lineColor='white', fillColor='white',
    opacity=1.0, depth=-1.0, interpolate=True)
circles3 = visual.Polygon(win=win, name='circles3',
    edges=100, size=(0.3, 0.3), ori=0.0, pos=(0, 0),
    lineWidth=1.0, colorSpace='rgb', lineColor='white', fillColor='white',
    opacity=1.0, depth=-2.0, interpolate=True)

# Post-practice instruction screen
instr_2Clock = core.Clock()
go1 = visual.TextStim(win=win, name='go1',
    text="Practice phase complete. Press 'up' to continue.",
    font='Open Sans', pos=(0, 0), height=0.1, wrapWidth=None, ori=0.0,
    color='white', colorSpace='rgb', opacity=None, languageStyle='LTR', depth=0.0)
key_resp = keyboard.Keyboard()

# Acquisition
acquisitionClock = core.Clock()
fixation = visual.ShapeStim(win=win, name='fixation', vertices='cross',
    size=(0.02, 0.02), ori=0.0, pos=(0, 0),
    lineWidth=1.0, colorSpace='rgb', lineColor='white', fillColor='white',
    opacity=1.0, depth=0.0, interpolate=True)
circle = visual.Polygon(win=win, name='circle',
    edges=100, size=(0.3, 0.3), ori=0.0, pos=(0, 0),
    lineWidth=1.0, colorSpace='hsv', lineColor='white', fillColor='white',
    opacity=1.0, depth=-1.0, interpolate=True)
custom_keyboard = keyboard.Keyboard()
custom_clock = core.Clock()
win.mouseVisible = False

# Catch-trial permutation for acquisition (30 trials, 6 catch = 20%)
acq_catch_permutation = get_catch_trial_perm(30, 6)
print("Catch trial permutation:", acq_catch_permutation)
acq_red_catch_count   = 0
acq_green_catch_count = 0

# Post-acquisition instruction screen
instrClock = core.Clock()
instr1 = visual.TextStim(win=win, name='instr1',
    text="Acquisition phase complete. Press 'up' to continue.",
    font='Open Sans', pos=(0, 0), height=0.1, wrapWidth=None, ori=0.0,
    color='white', colorSpace='rgb', opacity=None, languageStyle='LTR', depth=0.0)
go = keyboard.Keyboard()

# Test
testClock = core.Clock()
fixation2 = visual.ShapeStim(win=win, name='fixation2', vertices='cross',
    size=(0.02, 0.02), ori=0.0, pos=(0, 0),
    lineWidth=1.0, colorSpace='rgb', lineColor='white', fillColor='white',
    opacity=1.0, depth=-1.0, interpolate=True)
circles = visual.Polygon(win=win, name='circles',
    edges=100, size=(0.3, 0.3), ori=0.0, pos=(0, 0),
    lineWidth=1.0, colorSpace='rgb', lineColor='white', fillColor='white',
    opacity=1.0, depth=-2.0, interpolate=True)

globalClock   = core.Clock()
routineTimer  = core.CountdownTimer()


# ---------------------------------------------------------------------------
# PRACTICE phase
# ---------------------------------------------------------------------------

trialsLoop3 = data.TrialHandler(nReps=1.0, method='random',
    extraInfo=expInfo, originPath=-1,
    trialList=data.importConditions('csv--practiceRun2.csv'),
    seed=None, name='trialsLoop3')
thisExp.addLoop(trialsLoop3)
thisTrialsLoop3 = trialsLoop3.trialList[0]
if thisTrialsLoop3 is not None:
    for paramName in thisTrialsLoop3:
        exec('{} = thisTrialsLoop3[paramName]'.format(paramName))

for thisTrialsLoop3 in trialsLoop3:
    currentLoop = trialsLoop3
    if thisTrialsLoop3 is not None:
        for paramName in thisTrialsLoop3:
            exec('{} = thisTrialsLoop3[paramName]'.format(paramName))

    continueRoutine = True
    import time
    circle_color  = ''
    fixation_color = ''
    custom_keyboard  = keyboard.Keyboard()
    stimulus_appearing_time = get_practice_stimulus_appearing_time(thisTrialsLoop3)
    inter_stimulus_interval = 0.2
    produced_duration = 0
    timer = core.Clock()
    custom_clock  = core.Clock()
    wait_for_space = False

    practiceComponents = [fixation3, circles3]
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

        keys = event.getKeys(['left', 'right'])
        continueRoutine = False  # end unless a component is still running

        if not wait_for_space and ('left' in keys or 'right' in keys):
            key_pressed = 'left' if 'left' in keys else 'right'
            trialsLoop3.addData('key_pressed', key_pressed)
            if random() > 0.5:
                circles3.fillColor = '#bf4040'
                trialsLoop3.addData('circle_color', 'red')
            else:
                circles3.fillColor = '#55bf40'
                trialsLoop3.addData('circle_color', 'green')

            prevTime = timer.getTime()
            time.sleep(stimulus_appearing_time - quarterToFrame)
            win.flip()
            nextTime = timer.getTime()
            trialsLoop3.addData('stimulus_appearing_time', nextTime - prevTime)
            prevTime = nextTime

            circles3.fillColor = ''
            time.sleep(inter_stimulus_interval - quarterToFrame)
            win.flip()
            nextTime = timer.getTime()
            trialsLoop3.addData('inter_stimulus_interval', nextTime - prevTime)

            wait_for_space = True

        my_keys = custom_keyboard.getKeys(['space'], waitRelease=True)
        if wait_for_space and 'space' in my_keys:
            my_key = my_keys[-1]
            trialsLoop3.addData('space_pressed_duration', my_key.duration)
            continueRoutine = False

        if fixation3.status == NOT_STARTED and tThisFlip >= 0.0 - frameTolerance:
            fixation3.frameNStart = frameN
            fixation3.tStart = t
            fixation3.tStartRefresh = tThisFlipGlobal
            win.timeOnFlip(fixation3, 'tStartRefresh')
            fixation3.setAutoDraw(True)

        if circles3.status == NOT_STARTED and tThisFlip >= 0.0 - frameTolerance:
            circles3.frameNStart = frameN
            circles3.tStart = t
            circles3.tStartRefresh = tThisFlipGlobal
            win.timeOnFlip(circles3, 'tStartRefresh')
            circles3.setAutoDraw(True)
        if circles3.status == STARTED:
            circles3.setFillColor(circle_color)
            circles3.setLineColor(circle_color)

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
key_resp.keys = []
key_resp.rt   = []
_key_resp_allKeys = []

instr_2Components = [go1, key_resp]
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

    if go1.status == NOT_STARTED and tThisFlip >= 0.0 - frameTolerance:
        go1.frameNStart = frameN
        go1.tStart = t
        go1.tStartRefresh = tThisFlipGlobal
        win.timeOnFlip(go1, 'tStartRefresh')
        go1.setAutoDraw(True)

    waitOnFlip = False
    if key_resp.status == NOT_STARTED and tThisFlip >= 0.0 - frameTolerance:
        key_resp.frameNStart = frameN
        key_resp.tStart = t
        key_resp.tStartRefresh = tThisFlipGlobal
        win.timeOnFlip(key_resp, 'tStartRefresh')
        key_resp.status = STARTED
        waitOnFlip = True
        win.callOnFlip(key_resp.clock.reset)
        win.callOnFlip(key_resp.clearEvents, eventType='keyboard')
    if key_resp.status == STARTED and not waitOnFlip:
        theseKeys = key_resp.getKeys(keyList=['up'], waitRelease=False)
        _key_resp_allKeys.extend(theseKeys)
        if _key_resp_allKeys:
            key_resp.keys = _key_resp_allKeys[-1].name
            key_resp.rt   = _key_resp_allKeys[-1].rt
            continueRoutine = False

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
if key_resp.keys in ['', [], None]:
    key_resp.keys = None
thisExp.addData('key_resp.keys', key_resp.keys)
if key_resp.keys is not None:
    thisExp.addData('key_resp.rt', key_resp.rt)
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
    import time
    circle_color   = ''
    fixation_color = ''
    stimulus_appearing_time = get_acquisition_stimulus_appearing_time(thisTrialsLoop1)
    inter_stimulus_interval = 0.2
    timer = core.Clock()
    feedback_given = False
    keys = event.getKeys()  # clear buffer before trial

    # Determine whether this trial is a catch trial
    next_catch_trial_item = acq_catch_permutation[trialsLoop1.thisN]
    if next_catch_trial_item == 'R':
        acq_red_catch_count += 1
    elif next_catch_trial_item == 'G':
        acq_green_catch_count += 1
    should_catch_trial = False

    acquisitionComponents = [fixation, circle]
    for thisComponent in acquisitionComponents:
        thisComponent.tStart = thisComponent.tStop = None
        thisComponent.tStartRefresh = thisComponent.tStopRefresh = None
        if hasattr(thisComponent, 'status'):
            thisComponent.status = NOT_STARTED
    t = 0
    _timeToFirstFrame = win.getFutureFlipTime(clock='now')
    acquisitionClock.reset(-_timeToFirstFrame)
    frameN = -1

    while continueRoutine:
        t = acquisitionClock.getTime()
        tThisFlip = win.getFutureFlipTime(clock=acquisitionClock)
        tThisFlipGlobal = win.getFutureFlipTime(clock=None)
        frameN += 1

        if fixation.status == NOT_STARTED and tThisFlip >= 0.0 - frameTolerance:
            fixation.frameNStart = frameN
            fixation.tStart = t
            fixation.tStartRefresh = tThisFlipGlobal
            win.timeOnFlip(fixation, 'tStartRefresh')
            fixation.setAutoDraw(True)

        if circle.status == NOT_STARTED and tThisFlip >= 0.0 - frameTolerance:
            circle.frameNStart = frameN
            circle.tStart = t
            circle.tStartRefresh = tThisFlipGlobal
            win.timeOnFlip(circle, 'tStartRefresh')
            circle.setAutoDraw(True)
        if circle.status == STARTED:
            circle.setFillColor(circle_color)
            circle.setLineColor(circle_color)

        keys = event.getKeys()

        # Warn participant if they press space during acquisition
        if not feedback_given and 'space' in keys:
            feedback_given = True
            warning = visual.TextStim(win,
                'Attention! In this phase, only press the left or right key.',
                font='Open Sans', pos=(0, 0.2), height=0.1, wrapWidth=None, ori=0.0,
                color='white', colorSpace='rgb', opacity=None, languageStyle='LTR', depth=-1.0)
            warning.draw()
            win.flip()
            core.wait(2.0)

        if not should_catch_trial and ('left' in keys or 'right' in keys):
            key_pressed = 'left' if 'left' in keys else 'right'
            trialsLoop1.addData('key_pressed', key_pressed)

            # 100% congruent in acquisition
            is_valid = True
            next_circle_color, fillColor = get_color(key_pressed, is_valid)
            circle.fillColor = fillColor
            trialsLoop1.addData('circle_color', next_circle_color)
            trialsLoop1.addData('is_valid', is_valid)

            # Check if this should be a catch trial
            should_catch_trial = False
            if next_circle_color == 'red' and acq_red_catch_count > 0:
                acq_red_catch_count -= 1
                should_catch_trial = True
            elif next_circle_color == 'green' and acq_green_catch_count > 0:
                acq_green_catch_count -= 1
                should_catch_trial = True

            prevTime = timer.getTime()
            core.wait(stimulus_appearing_time - quarterToFrame)
            win.flip()
            nextTime = timer.getTime()
            trialsLoop1.addData('stimulus_appearing_time', nextTime - prevTime)
            prevTime = nextTime

            circle.fillColor = ''
            core.wait(inter_stimulus_interval - quarterToFrame)
            win.flip()
            nextTime = timer.getTime()
            trialsLoop1.addData('inter_stimulus_interval', nextTime - prevTime)

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
            if next_circle_color == 'red':
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
        for thisComponent in acquisitionComponents:
            if hasattr(thisComponent, 'status') and thisComponent.status != FINISHED:
                continueRoutine = True
                break

        if continueRoutine:
            win.flip()

    for thisComponent in acquisitionComponents:
        if hasattr(thisComponent, 'setAutoDraw'):
            thisComponent.setAutoDraw(False)
    feedback_given = False
    routineTimer.reset()
    thisExp.nextEntry()


# ---------------------------------------------------------------------------
# Post-acquisition instruction screen
# ---------------------------------------------------------------------------

continueRoutine = True
go.keys = []
go.rt   = []
_go_allKeys = []

instrComponents = [instr1, go]
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

    if instr1.status == NOT_STARTED and tThisFlip >= 0.0 - frameTolerance:
        instr1.frameNStart = frameN
        instr1.tStart = t
        instr1.tStartRefresh = tThisFlipGlobal
        win.timeOnFlip(instr1, 'tStartRefresh')
        instr1.setAutoDraw(True)

    waitOnFlip = False
    if go.status == NOT_STARTED and tThisFlip >= 0.0 - frameTolerance:
        go.frameNStart = frameN
        go.tStart = t
        go.tStartRefresh = tThisFlipGlobal
        win.timeOnFlip(go, 'tStartRefresh')
        go.status = STARTED
        waitOnFlip = True
        win.callOnFlip(go.clock.reset)
        win.callOnFlip(go.clearEvents, eventType='keyboard')
    if go.status == STARTED and not waitOnFlip:
        theseKeys = go.getKeys(keyList=['up'], waitRelease=False)
        _go_allKeys.extend(theseKeys)
        if _go_allKeys:
            go.keys = _go_allKeys[-1].name
            go.rt   = _go_allKeys[-1].rt
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
if go.keys in ['', [], None]:
    go.keys = None
thisExp.addData('go.keys', go.keys)
if go.keys is not None:
    thisExp.addData('go.rt', go.rt)
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
    import time
    import numpy as np

    circle_color      = ''
    fixation_color    = ''
    circle_color_name = ''
    stimulus_appearing_time = get_test_stimulus_appearing_time(thisTrialsLoop)
    inter_stimulus_interval = 0.2
    timer        = core.Clock()
    custom_clock = core.Clock()
    wait_for_space = False
    keys = event.getKeys()  # clear buffer before trial

    testComponents = [fixation2, circles]
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

        keys = event.getKeys(['left', 'right'])

        if not wait_for_space and ('left' in keys or 'right' in keys):
            key_pressed = 'left' if 'left' in keys else 'right'
            trialsLoop.addData('key_pressed', key_pressed)

            # ~80% congruent in test (Exp 3: 80/20 split)
            is_valid = my_random(trialsLoop) > 0.2
            circle_color_name, fillColor = get_color(key_pressed, is_valid)
            circles.fillColor = fillColor
            trialsLoop.addData('circle_color', circle_color_name)
            trialsLoop.addData('is_valid', is_valid)

            prevTime = timer.getTime()
            time.sleep(stimulus_appearing_time - quarterToFrame)
            win.flip()
            nextTime = timer.getTime()
            trialsLoop.addData('stimulus_appearing_time', nextTime - prevTime)
            prevTime = nextTime

            circles.fillColor = ''
            time.sleep(inter_stimulus_interval - quarterToFrame)
            win.flip()
            nextTime = timer.getTime()
            trialsLoop.addData('inter_stimulus_interval', nextTime - prevTime)

            wait_for_space = True
            custom_keyboard.clock.reset()

        my_keys = custom_keyboard.getKeys(['space'], waitRelease=True)
        if wait_for_space and 'space' in my_keys:
            my_key = my_keys[-1]
            if my_key.rt > 0:  # reject presses buffered before clock reset
                trialsLoop.addData('space_pressed_duration', my_key.duration)
                trialsLoop.addData('space_RT', my_key.rt)
                continueRoutine = False

        if fixation2.status == NOT_STARTED and tThisFlip >= 0.0 - frameTolerance:
            fixation2.frameNStart = frameN
            fixation2.tStart = t
            fixation2.tStartRefresh = tThisFlipGlobal
            win.timeOnFlip(fixation2, 'tStartRefresh')
            fixation2.setAutoDraw(True)

        if circles.status == NOT_STARTED and tThisFlip >= 0.0 - frameTolerance:
            circles.frameNStart = frameN
            circles.tStart = t
            circles.tStartRefresh = tThisFlipGlobal
            win.timeOnFlip(circles, 'tStartRefresh')
            circles.setAutoDraw(True)
        if circles.status == STARTED:
            circles.setFillColor(circle_color)
            circles.setLineColor(circle_color)

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
