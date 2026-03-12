#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
=============================================================================
EXPERIMENT 1 — TEMPORAL CONTROL (TC) CONDITION
Temporal Binding & Predictive Processing
=============================================================================
Author: Oz

DESCRIPTION
-----------
Temporal Control (TC) condition: Participants perform a voluntary keypress
(left/right) that triggers a RANDOM colour outcome (red/green circle) after
a fixed or variable inter-event interval (IEI).

Unlike Identity Control, there is NO learned action-outcome mapping.
Colour is always random in both phases. The only manipulation is the
timing of the inter-event interval across acquisition and test phases.

  1. PRACTICE     (10 trials) — Familiarise with interval reproduction.
  2. ACQUISITION  (50 trials) — Observe random action-outcome pairings.
     No reproduction. Interval is fixed or random depending on block.
  3. TEST         (50 trials) — Random outcomes. Reproduce perceived IEI
     by holding space bar. Interval is fixed or random depending on block.

DV: reproduced interval duration (space-bar hold, seconds).

BLOCK CONFIGURATIONS
--------------------
This script is configured for Block TC-FF.

  ┌──────────────────────────────────────────────────────────────────────┐
  │ TC-FF (THIS SCRIPT)                                                 │
  │   Acquisition IEI : FIXED  (550 ms)  → get_acquisition_interval()   │
  │   Test IEI        : FIXED  (550 ms)  → get_test_interval()          │
  │                                                                      │
  │ TC-FR — change get_test_interval():                                  │
  │   → UNCOMMENT  return trial_dict['wait_duration_before_circle']      │
  │   → COMMENT OUT  return FIXED_IEI_S                                  │
  │                                                                      │
  │ TC-RF — change get_acquisition_interval():                           │
  │   → UNCOMMENT  return trial_dict['wait_duration_before_circle']      │
  │   → COMMENT OUT  return FIXED_IEI_S                                  │
  │                                                                      │
  │ TC-RR — change BOTH functions:                                       │
  │   → get_acquisition_interval(): return trial_dict[...]               │
  │   → get_test_interval(): return trial_dict[...]                      │
  └──────────────────────────────────────────────────────────────────────┘

FULL 8-BLOCK STRUCTURE (Experiment 1)
--------------------------------------
  1. IC-FF  | Identity Control    | Acq: Fixed  | Test: Fixed
  2. IC-RF  | Identity Control    | Acq: Random | Test: Fixed
  3. IP-FF  | Identity Prediction | Acq: Fixed  | Test: Fixed
  4. IP-RF  | Identity Prediction | Acq: Random | Test: Fixed
  5. TC-RR  | Temporal Control    | Acq: Random | Test: Random
  6. TC-FR  | Temporal Control    | Acq: Fixed  | Test: Random
  7. TC-RF  | Temporal Control    | Acq: Random | Test: Fixed
  8. TC-FF  | Temporal Control    | Acq: Fixed  | Test: Fixed  ← THIS SCRIPT

THESIS PARAMETERS (Experiment 1)
---------------------------------
  Fixed inter-event interval  : 550 ms
  Random inter-event range    : 0–1100 ms (uniform, from CSV)
  Outcome stimulus duration   : 200 ms
  Acquisition trials          : 50  (random colour, no mapping)
  Test trials                 : 50  (random colour, no mapping)
  Practice trials             : 10
  Reaction time collected     : NO  (added in Experiments 2 & 3)
  Catch trials                : NO  (added in Experiments 2 & 3)

CONDITION CHARACTERISTICS
--------------------------
  Action                : YES (keypress initiates trial)
  Identity prediction   : NO  (no learned action-outcome mapping)
  Temporal control      : YES (participant controls timing)
  Validity              : N/A (outcomes always random)
  This tests whether temporal control alone is sufficient for binding.

PsychoPy v2021.1.4 (Peirce et al., 2019)
=============================================================================
"""

from __future__ import absolute_import, division

import os
import sys
import time
import numpy as np
from numpy.random import random, randint, normal, shuffle, choice as randchoice
from psychopy import locale_setup, prefs, sound, gui, visual, core, data, event, logging, clock, colors
from psychopy.constants import (NOT_STARTED, STARTED, PLAYING, PAUSED, STOPPED, FINISHED, PRESSED, RELEASED, FOREVER)
from psychopy.hardware import keyboard

# ==================== TIMING CONSTANTS ====================

FIXED_IEI_S = 0.550                 # Fixed inter-event interval (seconds)
OUTCOME_DISPLAY_DURATION_S = 0.200   # Circle visible duration (200 ms)

# ==================== TIMING FUNCTIONS ====================

def get_practice_interval(trial_dict):
    """Practice: variable interval from CSV (task familiarisation)."""
    return trial_dict['wait_duration_before_circle']

def get_acquisition_interval(trial_dict):
    """
    Acquisition-phase inter-event interval.

    TC-FF (current): fixed 550 ms → return FIXED_IEI_S
    TC-RF / TC-RR:   uncomment first line, comment second.
    """
    # return trial_dict['wait_duration_before_circle']   # ← UNCOMMENT for TC-RF or TC-RR
    return FIXED_IEI_S                                    # ← COMMENT OUT for TC-RF or TC-RR

def get_test_interval(trial_dict):
    """
    Test-phase inter-event interval.

    TC-FF (current): fixed 550 ms → return FIXED_IEI_S
    TC-FR / TC-RR:   uncomment first line, comment second.
    """
    # return trial_dict['wait_duration_before_circle']   # ← UNCOMMENT for TC-FR or TC-RR
    return FIXED_IEI_S                                    # ← COMMENT OUT for TC-FR or TC-RR

# ==================== EXPERIMENT SETUP ====================

_thisDir = os.path.dirname(os.path.abspath(__file__))
os.chdir(_thisDir)

psychopy_version = '2021.1.4'
exp_name = 'temporal_control'
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
custom_keyboard_acq = keyboard.Keyboard()
custom_clock_acq = core.Clock()
win.mouseVisible = False
fixation_acq = visual.ShapeStim(
    win=win, name='fixation_acq', vertices='cross',
    size=(0.02, 0.02), ori=0.0, pos=(0, 0),
    lineWidth=1.0, colorSpace='rgb', lineColor='white', fillColor='white',
    opacity=None, depth=-1.0, interpolate=True)
circle_acq = visual.Polygon(
    win=win, name='circle_acq',
    edges=100, size=(0.3, 0.3), ori=0.0, pos=(0, 0),
    lineWidth=1.0, colorSpace='rgb', lineColor='white', fillColor='white',
    opacity=None, depth=-2.0, interpolate=True)

# --- Post-acquisition instruction ---
instr_mid_clock = core.Clock()
key_resp_mid = keyboard.Keyboard()
instr_mid_text = visual.TextStim(win=win, name='instr_mid_text',
    text="The first part is over. Press 'up' to continue.",
    font='Open Sans', pos=(0, 0), height=0.1, wrapWidth=None, ori=0.0, 
    color='white', colorSpace='rgb', opacity=None, 
    languageStyle='LTR', depth=-1.0)

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
# 10 trials. Random colour, random interval from CSV.
# No congruency mapping. Familiarisation only.

practice_trials = data.TrialHandler(nReps=1.0, method='random', 
    extraInfo=exp_info, originPath=-1,
    trialList=data.importConditions('csv--practiceRun2.csv'),
    seed=None, name='practice_trials')
this_exp.addLoop(practice_trials)

for practice_trial in practice_trials:
    continueRoutine = True
    circle_color = ''
    custom_keyboard_practice = keyboard.Keyboard()
    inter_event_interval_s = get_practice_interval(practice_trial)
    timer = core.Clock()
    wait_for_space = False
    
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
        
        keys = event.getKeys(['left', 'right'])
        
        if wait_for_space == False and ('left' in keys or 'right' in keys):
            key_pressed = 'left' if 'left' in keys else 'right'
            practice_trials.addData('key_pressed', key_pressed)
            
            # Random colour assignment (no mapping in TC condition)
            if random() > 0.5:
                circle_practice.fillColor = '#bf4040'
                practice_trials.addData('outcome_color', 'red')
            else:
                circle_practice.fillColor = '#55bf40'
                practice_trials.addData('outcome_color', 'green')
            
            # Inter-event interval: keypress → circle onset
            prevTime = timer.getTime()
            time.sleep(inter_event_interval_s - quarter_to_frame)
            win.flip()
            nextTime = timer.getTime()
            actual_iei = nextTime - prevTime
            practice_trials.addData('actual_iei_s', actual_iei)
            
            # Outcome display: circle visible for 200 ms
            circle_practice.fillColor = ''
            prevTime = timer.getTime()
            time.sleep(OUTCOME_DISPLAY_DURATION_S - quarter_to_frame)
            win.flip()
            nextTime = timer.getTime()
            practice_trials.addData('actual_display_s', nextTime - prevTime)
            
            wait_for_space = True
        
        # Interval reproduction: participant holds space bar
        my_keys = custom_keyboard_practice.getKeys(['space'], waitRelease=True)
        if wait_for_space:
            if 'space' in my_keys:
                my_key = my_keys[-1]
                reproduced_interval_s = my_key.duration
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
            circle_practice.setFillColor(circle_color)
            circle_practice.setLineColor(circle_color)
        
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
            key_resp_practice.keys = [key.name for key in _key_resp_practice_allKeys]
            key_resp_practice.rt = [key.rt for key in _key_resp_practice_allKeys]
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
# 50 trials. NO action-outcome mapping — colour is always random.
# Participants observe the interval only; NO reproduction.
# This is the key difference from Identity Control: no learned mapping.

acquisition_trials = data.TrialHandler(nReps=1.0, method='random', 
    extraInfo=exp_info, originPath=-1,
    trialList=data.importConditions('csv--Cond (0- 1.1).csv'),
    seed=None, name='acquisition_trials')
this_exp.addLoop(acquisition_trials)

for acquisition_trial in acquisition_trials:
    continueRoutine = True
    circle_color = ''
    inter_event_interval_s = get_acquisition_interval(acquisition_trial)
    timer = core.Clock()
    feedback_given = False
    
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
        
        keys = event.getKeys()
        
        # Warning if participant presses space during acquisition
        if not feedback_given and 'space' in keys:
            feedback_given = True
            warning = visual.TextStim(win,
                'Attention! In this part you should only press left and right keys.',
                font='Open Sans', pos=(0, 0.2), height=0.1, wrapWidth=None, ori=0.0, 
                color='white', colorSpace='rgb', opacity=None, 
                languageStyle='LTR', depth=-1.0)
            warning.draw()
            win.flip()
            core.wait(2.0)
        
        # Keypress → random colour outcome (no mapping in TC)
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
            
            # Inter-event interval: keypress → circle onset
            prevTime = timer.getTime()
            core.wait(inter_event_interval_s - quarter_to_frame)
            win.flip()
            nextTime = timer.getTime()
            actual_iei = nextTime - prevTime
            acquisition_trials.addData('actual_iei_s', actual_iei)
            
            # Outcome display: circle visible for 200 ms
            circle_acq.fillColor = ''
            prevTime = timer.getTime()
            core.wait(OUTCOME_DISPLAY_DURATION_S - quarter_to_frame)
            win.flip()
            nextTime = timer.getTime()
            acquisition_trials.addData('actual_display_s', nextTime - prevTime)
            
            continueRoutine = False
        
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
            circle_acq.setFillColor(circle_color)
            circle_acq.setLineColor(circle_color)
        
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

instr_mid_components = [key_resp_mid, instr_mid_text]
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
            key_resp_mid.keys = [key.name for key in _key_resp_mid_allKeys]
            key_resp_mid.rt = [key.rt for key in _key_resp_mid_allKeys]
            continueRoutine = False
    
    if instr_mid_text.status == NOT_STARTED and tThisFlip >= 0.0-frame_tolerance:
        instr_mid_text.frameNStart = frameN
        instr_mid_text.tStart = t
        instr_mid_text.tStartRefresh = tThisFlipGlobal
        win.timeOnFlip(instr_mid_text, 'tStartRefresh')
        instr_mid_text.setAutoDraw(True)
    
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
# 50 trials. Colour is RANDOM (no mapping in TC condition).
# After each trial, participants reproduce the perceived inter-event
# interval by holding the space bar. This is the DV.

test_trials = data.TrialHandler(nReps=1.0, method='random', 
    extraInfo=exp_info, originPath=-1,
    trialList=data.importConditions('csv--Cond (0- 1.1).csv'),
    seed=None, name='test_trials')
this_exp.addLoop(test_trials)

for test_trial in test_trials:
    continueRoutine = True
    circle_color = ''
    custom_keyboard_test = keyboard.Keyboard()
    inter_event_interval_s = get_test_interval(test_trial)
    timer = core.Clock()
    wait_for_space = False
    # Clear any residual keypresses from previous trial
    keys = event.getKeys()
    
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
        
        keys = event.getKeys(['left', 'right'])
        
        if wait_for_space == False and ('left' in keys or 'right' in keys):
            key_pressed = 'left' if 'left' in keys else 'right'
            test_trials.addData('key_pressed', key_pressed)
            
            # Random colour — NO congruency mapping in temporal control
            if random() > 0.5:
                circle_test.fillColor = '#bf4040'
                test_trials.addData('outcome_color', 'red')
            else:
                circle_test.fillColor = '#55bf40'
                test_trials.addData('outcome_color', 'green')
            
            # Inter-event interval: keypress → circle onset
            prevTime = timer.getTime()
            time.sleep(inter_event_interval_s - quarter_to_frame)
            win.flip()
            nextTime = timer.getTime()
            actual_iei = nextTime - prevTime
            test_trials.addData('actual_iei_s', actual_iei)
            
            # Outcome display: circle visible for 200 ms
            circle_test.fillColor = ''
            prevTime = timer.getTime()
            time.sleep(OUTCOME_DISPLAY_DURATION_S - quarter_to_frame)
            win.flip()
            nextTime = timer.getTime()
            test_trials.addData('actual_display_s', nextTime - prevTime)
            
            wait_for_space = True
        
        # Interval reproduction: participant holds space bar (DV)
        my_keys = custom_keyboard_test.getKeys(['space'], waitRelease=True)
        if wait_for_space:
            if 'space' in my_keys:
                my_key = my_keys[-1]
                reproduced_interval_s = my_key.duration
                test_trials.addData('reproduced_interval_s', reproduced_interval_s)
                continueRoutine = False
        
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
            circle_test.setFillColor(circle_color)
            circle_test.setLineColor(circle_color)
        
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
