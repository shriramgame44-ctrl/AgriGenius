/**
 * Proper GYM — Core Client Application & Offline-First Engine
 * Full-stack implementation featuring in-gym ergonomics, audio ducking,
 * ghosting, progressive overload guidance, and mutation queue synchronization.
 */

// Global State Store
const Store = {
  currentTab: 'train',
  networkMode: 'online', // 'online', 'poor', 'offline'
  unit: localStorage.getItem('propergym_unit') || 'metric_kg', // 'metric_kg' or 'imperial_lbs'
  audioDucking: true,
  defaultRestSeconds: 90,
  
  // Data models
  exercises: [],
  routines: [],
  history: [],
  personalRecords: [],
  userMetrics: [],
  
  // Active in-gym workout state
  activeWorkout: null,
  activeWorkoutTimer: null,
  activeTimerSeconds: 0,
  
  // Rest Timer state
  restInterval: null,
  restSecondsRemaining: 0,
  restTotalSeconds: 90,

  // Offline Mutation Queue
  mutationQueue: JSON.parse(localStorage.getItem('propergym_mutations') || '[]'),
  
  // Keypad target state
  activeInputEl: null
};

// Web Audio API Sound Engine (Audio Ducking & Rest Timer Chime)
const SoundEngine = {
  audioCtx: null,

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  },

  playRestChime() {
    this.init();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      // Tone 1 (880Hz - A5)
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0.25, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Tone 2 (1320Hz - E6) slightly delayed
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1320, now + 0.15);
      gain2.gain.setValueAtTime(0.3, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.6);

      // Emulate Vibration
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 200]);
      }
    } catch (e) {
      console.warn("Audio playback not allowed yet:", e);
    }
  }
};

// Sync Engine (Offline-First Mutation Queue)
const SyncEngine = {
  enqueue(entityName, entityId, operation, payload) {
    const mutation = {
      mutation_id: 'mut_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      entity_name: entityName,
      entity_id: entityId,
      operation: operation,
      payload: payload,
      client_timestamp: Date.now()
    };

    Store.mutationQueue.push(mutation);
    this.saveQueue();
    UI.updateSyncBadge();

    // If online, immediately try to reconcile
    if (Store.networkMode === 'online') {
      this.reconcile();
    }
  },

  saveQueue() {
    localStorage.setItem('propergym_mutations', JSON.stringify(Store.mutationQueue));
  },

  async reconcile() {
    if (Store.mutationQueue.length === 0) return;
    if (Store.networkMode === 'offline') {
      console.log("[SyncEngine] Offline mode active. Sync postponed.");
      return;
    }

    const payload = { mutations: Store.mutationQueue };
    const delay = Store.networkMode === 'poor' ? 2000 : 0;

    try {
      if (delay > 0) await new Promise(r => setTimeout(r, delay));

      const res = await fetch('/api/sync/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        const acked = new Set(data.ack_mutation_ids || []);
        Store.mutationQueue = Store.mutationQueue.filter(m => !acked.has(m.mutation_id));
        this.saveQueue();
        UI.updateSyncBadge();
        console.log(`[SyncEngine] Successfully synced ${acked.size} mutations.`);
      }
    } catch (err) {
      console.warn("[SyncEngine] Network request failed. Retaining queue locally.", err);
    }
  }
};

// Application Controller
const App = {
  async init() {
    UI.bindEvents();
    UI.initKeypad();
    await this.loadInitialData();
    this.restoreActiveWorkout();
    UI.renderAll();
  },

  async loadInitialData() {
    try {
      const [resEx, resRot, resWorkouts, resPRs] = await Promise.all([
        fetch('/api/exercises'),
        fetch('/api/routines'),
        fetch('/api/workouts'),
        fetch('/api/personal-records')
      ]);

      if (resEx.ok) Store.exercises = await resEx.json();
      if (resRot.ok) Store.routines = await resRot.json();
      if (resWorkouts.ok) Store.history = await resWorkouts.json();
      if (resPRs.ok) Store.personalRecords = await resPRs.json();
    } catch (e) {
      console.warn("Using offline cached data:", e);
      // Fallback local memory if server unreachable
    }
  },

  navigate(tabId) {
    Store.currentTab = tabId;
    document.querySelectorAll('.tab-view').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    const view = document.getElementById(`view-${tabId}`);
    const navBtn = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
    if (view) view.classList.add('active');
    if (navBtn) navBtn.classList.add('active');

    if (tabId === 'analytics') {
      UI.renderAnalytics();
    }
  },

  // Start Workout
  startWorkout(routineId = null) {
    SoundEngine.init();
    let routine = null;
    let title = "Quick Workout";
    let exercises = [];

    if (routineId) {
      routine = Store.routines.find(r => r.id === routineId);
      if (routine) {
        title = routine.title;
        exercises = (routine.exercises || []).map(re => {
          // Look up previous performance for ghosting
          const prevSets = this.getPreviousSetsForExercise(re.exercise_id);
          const sets = [];
          for (let i = 1; i <= (re.target_sets || 3); i++) {
            const prevSet = prevSets[i - 1] || null;
            sets.push({
              set_index: i,
              set_type: i === 1 && re.is_compound ? 'warmup' : 'normal',
              weight_kg: prevSet ? prevSet.weight_kg : '',
              reps: prevSet ? prevSet.reps : '',
              ghost_weight: prevSet ? prevSet.weight_kg : '',
              ghost_reps: prevSet ? prevSet.reps : '',
              rpe: re.target_rpe || 8.0,
              is_completed: false
            });
          }
          return {
            exercise_id: re.exercise_id,
            name: re.exercise_name,
            equipment: re.equipment,
            primary_muscle: re.primary_muscle,
            is_compound: re.is_compound,
            rest_timer_seconds: re.rest_timer_seconds || 90,
            sets: sets
          };
        });
      }
    }

    // Default template fallback if starting empty
    if (exercises.length === 0) {
      const bench = Store.exercises.find(e => e.id === 'ex_bench_press') || Store.exercises[0];
      if (bench) {
        exercises.push({
          exercise_id: bench.id,
          name: bench.name,
          equipment: bench.equipment,
          primary_muscle: bench.primary_muscle,
          is_compound: bench.is_compound,
          rest_timer_seconds: 120,
          sets: [
            { set_index: 1, set_type: 'warmup', weight_kg: '', reps: '', ghost_weight: 60, ghost_reps: 10, rpe: 6.0, is_completed: false },
            { set_index: 2, set_type: 'normal', weight_kg: '', reps: '', ghost_weight: 100, ghost_reps: 8, rpe: 8.0, is_completed: false },
            { set_index: 3, set_type: 'normal', weight_kg: '', reps: '', ghost_weight: 100, ghost_reps: 8, rpe: 8.5, is_completed: false }
          ]
        });
      }
    }

    Store.activeWorkout = {
      id: 'w_' + Date.now(),
      routine_id: routineId,
      title: title,
      started_at: Date.now(),
      exercises: exercises
    };

    Store.activeTimerSeconds = 0;
    this.startWorkoutClock();
    this.saveActiveWorkout();
    UI.renderActiveWorkout();
    this.navigate('train');
  },

  getPreviousSetsForExercise(exerciseId) {
    for (const w of Store.history) {
      const matchingSets = (w.sets || []).filter(s => s.exercise_id === exerciseId && s.is_completed);
      if (matchingSets.length > 0) {
        return matchingSets;
      }
    }
    return [];
  },

  startWorkoutClock() {
    clearInterval(Store.activeWorkoutTimer);
    Store.activeWorkoutTimer = setInterval(() => {
      Store.activeTimerSeconds++;
      UI.updateWorkoutClock();
    }, 1000);
  },

  saveActiveWorkout() {
    localStorage.setItem('propergym_active_workout', JSON.stringify({
      workout: Store.activeWorkout,
      elapsed: Store.activeTimerSeconds
    }));
  },

  restoreActiveWorkout() {
    const saved = localStorage.getItem('propergym_active_workout');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.workout) {
          Store.activeWorkout = parsed.workout;
          Store.activeTimerSeconds = parsed.elapsed || 0;
          this.startWorkoutClock();
        }
      } catch (e) {}
    }
  },

  cancelActiveWorkout() {
    if (confirm("Are you sure you want to discard this workout?")) {
      clearInterval(Store.activeWorkoutTimer);
      this.stopRestTimer();
      Store.activeWorkout = null;
      Store.activeTimerSeconds = 0;
      localStorage.removeItem('propergym_active_workout');
      UI.renderActiveWorkout();
    }
  },

  finishActiveWorkout() {
    if (!Store.activeWorkout) return;
    clearInterval(Store.activeWorkoutTimer);
    this.stopRestTimer();

    const w = Store.activeWorkout;
    const now = Date.now();
    let totalVolume = 0;
    let completedSetsCount = 0;
    let prsAchieved = 0;
    let latestPrText = "";

    const flattenedSets = [];
    w.exercises.forEach(ex => {
      ex.sets.forEach(s => {
        if (s.is_completed) {
          completedSetsCount++;
          const weight = parseFloat(s.weight_kg) || 0;
          const reps = parseInt(s.reps) || 0;
          totalVolume += weight * reps;

          // Check for PR
          if (reps > 0 && weight > 0) {
            const e1rm = Math.round(reps > 1 ? weight * (1 + reps / 30) : weight);
            const existingPR = Store.personalRecords.find(p => p.exercise_id === ex.exercise_id && p.record_type === 'e1rm');
            if (!existingPR || e1rm > existingPR.value) {
              prsAchieved++;
              latestPrText = `${ex.name}: ${weight}kg × ${reps} reps (e1RM: ${e1rm}kg)`;
              // Update local PR
              if (existingPR) {
                existingPR.value = e1rm;
              } else {
                Store.personalRecords.push({
                  id: 'pr_' + Date.now(),
                  exercise_id: ex.exercise_id,
                  exercise_name: ex.name,
                  record_type: 'e1rm',
                  value: e1rm
                });
              }
            }
          }

          flattenedSets.push({
            id: 'ws_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            workout_id: w.id,
            exercise_id: ex.exercise_id,
            set_index: s.set_index,
            set_type: s.set_type,
            weight_kg: weight,
            reps: reps,
            rpe: s.rpe,
            is_completed: 1,
            completed_at: now
          });
        }
      });
    });

    const finishedWorkout = {
      id: w.id,
      user_id: 'user_default',
      routine_id: w.routine_id,
      title: w.title,
      status: 'completed',
      started_at: w.started_at,
      completed_at: now,
      duration_seconds: Store.activeTimerSeconds,
      total_volume_kg: totalVolume,
      sets: flattenedSets
    };

    // Save locally
    Store.history.unshift(finishedWorkout);
    localStorage.removeItem('propergym_active_workout');
    Store.activeWorkout = null;

    // Enqueue offline-first mutation
    SyncEngine.enqueue('workouts', finishedWorkout.id, 'INSERT', finishedWorkout);

    // Show celebration summary
    UI.showWorkoutSummary(finishedWorkout, completedSetsCount, prsAchieved, latestPrText);
  },

  // Toggle Set Complete (1-Tap Completion)
  toggleSetComplete(exerciseIndex, setIndex) {
    const ex = Store.activeWorkout.exercises[exerciseIndex];
    const set = ex.sets[setIndex];

    if (!set.is_completed) {
      // If empty, auto-populate from ghost values
      if (!set.weight_kg && set.ghost_weight) set.weight_kg = set.ghost_weight;
      if (!set.reps && set.ghost_reps) set.reps = set.ghost_reps;
      if (!set.weight_kg) set.weight_kg = 20; // bar default
      if (!set.reps) set.reps = 10;

      set.is_completed = true;

      // Start rest timer
      this.startRestTimer(ex.rest_timer_seconds || Store.defaultRestSeconds);

      // Auto scroll / focus next incomplete set
      this.focusNextSet(exerciseIndex, setIndex);
    } else {
      set.is_completed = false;
    }

    this.saveActiveWorkout();
    UI.renderActiveWorkout();
  },

  focusNextSet(exIdx, setIdx) {
    const ex = Store.activeWorkout.exercises[exIdx];
    if (setIdx + 1 < ex.sets.length) {
      // Next set in same exercise
      const nextInput = document.querySelector(`input[data-ex-idx="${exIdx}"][data-set-idx="${setIdx+1}"][data-field="reps"]`);
      if (nextInput) nextInput.focus();
    }
  },

  // Rest Timer Control
  startRestTimer(durationSeconds) {
    this.stopRestTimer();
    Store.restTotalSeconds = durationSeconds;
    Store.restSecondsRemaining = durationSeconds;

    const stickyBar = document.getElementById('sticky-rest-bar');
    stickyBar.classList.remove('hidden');

    UI.updateRestBar();

    Store.restInterval = setInterval(() => {
      Store.restSecondsRemaining--;
      UI.updateRestBar();

      if (Store.restSecondsRemaining <= 0) {
        this.stopRestTimer();
        SoundEngine.playRestChime();
      }
    }, 1000);
  },

  add30sToRest() {
    Store.restSecondsRemaining += 30;
    Store.restTotalSeconds += 30;
    UI.updateRestBar();
  },

  stopRestTimer() {
    clearInterval(Store.restInterval);
    Store.restInterval = null;
    const stickyBar = document.getElementById('sticky-rest-bar');
    if (stickyBar) stickyBar.classList.add('hidden');
  }
};

// UI Presentation & Event Handling
const UI = {
  bindEvents() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        App.navigate(btn.dataset.tab);
      });
    });

    // Start recommended routine
    document.getElementById('btn-start-recommended')?.addEventListener('click', () => {
      App.startWorkout('rot_ppl_push');
    });

    // Start empty workout
    document.getElementById('btn-empty-workout')?.addEventListener('click', () => {
      App.startWorkout(null);
    });

    // Rest timer buttons
    document.getElementById('btn-rest-add30')?.addEventListener('click', () => {
      App.add30sToRest();
    });
    document.getElementById('btn-rest-skip')?.addEventListener('click', () => {
      App.stopRestTimer();
    });

    // Sync status button
    document.getElementById('sync-status-btn')?.addEventListener('click', () => {
      App.navigate('settings');
    });

    // Network condition toggles
    document.querySelectorAll('.network-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.network-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        Store.networkMode = btn.dataset.mode;
        this.updateSyncBadge();
        if (Store.networkMode === 'online') {
          SyncEngine.reconcile();
        }
      });
    });

    // Force Reconcile
    document.getElementById('btn-force-sync')?.addEventListener('click', () => {
      SyncEngine.reconcile();
    });

    // Unit toggle (KG vs LBS)
    document.getElementById('btn-unit-kg')?.addEventListener('click', () => {
      Store.unit = 'metric_kg';
      localStorage.setItem('propergym_unit', 'metric_kg');
      document.getElementById('btn-unit-kg').classList.add('active');
      document.getElementById('btn-unit-lbs').classList.remove('active');
      this.renderAll();
    });
    document.getElementById('btn-unit-lbs')?.addEventListener('click', () => {
      Store.unit = 'imperial_lbs';
      localStorage.setItem('propergym_unit', 'imperial_lbs');
      document.getElementById('btn-unit-lbs').classList.add('active');
      document.getElementById('btn-unit-kg').classList.remove('active');
      this.renderAll();
    });

    // 1RM Calculator live inputs
    const calcWeight = document.getElementById('calc-weight');
    const calcReps = document.getElementById('calc-reps');
    const update1RM = () => {
      const w = parseFloat(calcWeight.value) || 0;
      const r = parseInt(calcReps.value) || 0;
      if (w > 0 && r > 0) {
        const epley = Math.round(r > 1 ? w * (1 + r / 30) : w);
        const brzycki = Math.round(r < 37 ? w * (36 / (37 - r)) : w);
        document.getElementById('calc-result-epley').textContent = `${epley} kg`;
        document.getElementById('calc-result-brzycki').textContent = `${brzycki} kg`;
      }
    };
    calcWeight?.addEventListener('input', update1RM);
    calcReps?.addEventListener('input', update1RM);

    // Exercise catalog search
    document.getElementById('exercise-search-input')?.addEventListener('input', (e) => {
      this.renderExercisesList(e.target.value);
    });

    // Muscle filters
    document.querySelectorAll('#exercise-muscle-filters .filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('#exercise-muscle-filters .filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.renderExercisesList(document.getElementById('exercise-search-input').value, pill.dataset.muscle);
      });
    });

    // Add exercise modal
    document.getElementById('btn-close-exercise-modal')?.addEventListener('click', () => {
      document.getElementById('modal-add-exercise').classList.add('hidden');
    });

    // Summary modal dismissal
    document.getElementById('btn-dismiss-summary')?.addEventListener('click', () => {
      document.getElementById('modal-workout-summary').classList.add('hidden');
      App.navigate('train');
      this.renderAll();
    });

    // Create routine modal
    document.getElementById('btn-create-routine')?.addEventListener('click', () => {
      this.openCreateRoutineModal();
    });
    document.getElementById('btn-close-routine-modal')?.addEventListener('click', () => {
      document.getElementById('modal-create-routine').classList.add('hidden');
    });
  },

  initKeypad() {
    const keypad = document.getElementById('in-gym-keypad');
    
    // Quick plate increments
    keypad.querySelectorAll('.plate-pill[data-delta]').forEach(pill => {
      pill.addEventListener('click', () => {
        if (!Store.activeInputEl) return;
        const delta = parseFloat(pill.dataset.delta);
        const current = parseFloat(Store.activeInputEl.value) || 0;
        Store.activeInputEl.value = Math.max(0, current + delta);
        Store.activeInputEl.dispatchEvent(new Event('input'));
      });
    });

    // Match prev
    document.getElementById('keypad-match-prev')?.addEventListener('click', () => {
      if (!Store.activeInputEl) return;
      const ghost = Store.activeInputEl.dataset.ghost;
      if (ghost) {
        Store.activeInputEl.value = ghost;
        Store.activeInputEl.dispatchEvent(new Event('input'));
      }
    });

    // Done
    document.getElementById('keypad-close-btn')?.addEventListener('click', () => {
      keypad.classList.add('hidden');
      Store.activeInputEl = null;
    });

    // Number keys
    keypad.querySelectorAll('.key-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!Store.activeInputEl) return;
        const key = btn.dataset.key;
        if (key === 'backspace') {
          Store.activeInputEl.value = Store.activeInputEl.value.slice(0, -1);
        } else {
          Store.activeInputEl.value += key;
        }
        Store.activeInputEl.dispatchEvent(new Event('input'));
      });
    });
  },

  openKeypad(inputEl) {
    Store.activeInputEl = inputEl;
    const keypad = document.getElementById('in-gym-keypad');
    keypad.classList.remove('hidden');
  },

  updateSyncBadge() {
    const badge = document.getElementById('sync-status-btn');
    const text = document.getElementById('sync-status-text');
    const queueBadge = document.getElementById('sync-queue-badge');
    const queueInspector = document.getElementById('mutation-queue-display');

    badge.className = `status-pill ${Store.networkMode}`;
    const pendingCount = Store.mutationQueue.length;

    if (Store.networkMode === 'offline') {
      text.textContent = `Offline (${pendingCount})`;
    } else if (Store.networkMode === 'poor') {
      text.textContent = `2G Poor (${pendingCount})`;
    } else {
      text.textContent = pendingCount > 0 ? `Syncing (${pendingCount})` : 'Online';
    }

    if (pendingCount > 0) {
      queueBadge.textContent = pendingCount;
      queueBadge.classList.remove('hidden');
    } else {
      queueBadge.classList.add('hidden');
    }

    if (queueInspector) {
      if (pendingCount === 0) {
        queueInspector.innerHTML = '<p class="text-xs text-muted">No pending offline mutations. All data synced with server.</p>';
      } else {
        queueInspector.innerHTML = `<pre>${JSON.stringify(Store.mutationQueue, null, 2)}</pre>`;
      }
    }
  },

  updateWorkoutClock() {
    const clock = document.getElementById('active-workout-clock');
    if (!clock) return;
    const mins = Math.floor(Store.activeTimerSeconds / 60);
    const secs = Store.activeTimerSeconds % 60;
    clock.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  },

  updateRestBar() {
    const countdown = document.getElementById('rest-timer-countdown');
    const progressFill = document.getElementById('rest-progress-fill');
    if (!countdown || !progressFill) return;

    const mins = Math.floor(Store.restSecondsRemaining / 60);
    const secs = Store.restSecondsRemaining % 60;
    countdown.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const percentage = Math.max(0, (Store.restSecondsRemaining / Store.restTotalSeconds) * 100);
    progressFill.style.width = `${percentage}%`;
  },

  renderAll() {
    this.renderRoutines();
    this.renderExercisesList();
    this.renderRecentHistory();
    this.renderActiveWorkout();
    this.updateSyncBadge();
  },

  renderActiveWorkout() {
    const container = document.getElementById('active-workout-container');
    const launcher = document.getElementById('workout-launcher');

    if (!Store.activeWorkout) {
      container.classList.add('hidden');
      launcher.classList.remove('hidden');
      return;
    }

    launcher.classList.add('hidden');
    container.classList.remove('hidden');

    const w = Store.activeWorkout;
    const mins = Math.floor(Store.activeTimerSeconds / 60);
    const secs = Store.activeTimerSeconds % 60;

    let html = `
      <div class="workout-active-header">
        <div>
          <div class="workout-header-title">${w.title}</div>
          <div class="workout-live-clock" id="active-workout-clock">${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}</div>
        </div>
        <div class="flex-actions" style="display:flex; gap: 8px;">
          <button class="btn btn-danger btn-xs" onclick="App.cancelActiveWorkout()">Discard</button>
          <button class="btn btn-primary btn-sm" onclick="App.finishActiveWorkout()">✓ Finish</button>
        </div>
      </div>

      <!-- Smart Progressive Overload Engine Live Insight -->
      <div class="overload-banner">
        <span class="overload-icon">⚡</span>
        <div>
          <strong>Progressive Overload Insight:</strong>
          <div>Target +2.5kg on your compound lifts if last set achieved RPE ≤ 8.0. Ghost values indicate your prior benchmarks.</div>
        </div>
      </div>
    `;

    w.exercises.forEach((ex, exIdx) => {
      html += `
        <div class="exercise-workout-card">
          <div class="exercise-card-header">
            <div>
              <div class="ex-title">${ex.name}</div>
              <div class="ex-sub">${ex.primary_muscle} · ${ex.equipment.toUpperCase()} · Rest: ${ex.rest_timer_seconds}s</div>
            </div>
            <button class="text-link text-xs" onclick="UI.removeExerciseFromWorkout(${exIdx})">Remove</button>
          </div>
          <table class="sets-table">
            <thead>
              <tr class="sets-header-row">
                <th>SET</th>
                <th>PREV</th>
                <th>${Store.unit === 'metric_kg' ? 'KG' : 'LBS'}</th>
                <th>REPS</th>
                <th>RPE</th>
                <th>LOG</th>
              </tr>
            </thead>
            <tbody>
      `;

      ex.sets.forEach((s, sIdx) => {
        const badgeClass = s.set_type !== 'normal' ? s.set_type : '';
        const prevText = s.ghost_weight ? `${s.ghost_weight} × ${s.ghost_reps}` : '—';
        const checkedClass = s.is_completed ? 'checked' : '';
        const rowClass = s.is_completed ? 'set-row completed' : 'set-row';

        html += `
          <tr class="${rowClass}">
            <td class="set-index-col">
              <span class="set-badge ${badgeClass}" onclick="UI.cycleSetType(${exIdx}, ${sIdx})">
                ${s.set_type === 'warmup' ? 'W' : s.set_type === 'drop' ? 'D' : s.set_type === 'failure' ? 'F' : s.set_index}
              </span>
            </td>
            <td class="set-prev-col">${prevText}</td>
            <td class="set-input-cell">
              <input type="text" inputmode="decimal" class="set-input" 
                data-ex-idx="${exIdx}" data-set-idx="${sIdx}" data-field="weight_kg"
                data-ghost="${s.ghost_weight || ''}"
                placeholder="${s.ghost_weight || '0'}" 
                value="${s.weight_kg || ''}"
                onclick="UI.openKeypad(this)">
            </td>
            <td class="set-input-cell">
              <input type="text" inputmode="numeric" class="set-input" 
                data-ex-idx="${exIdx}" data-set-idx="${sIdx}" data-field="reps"
                data-ghost="${s.ghost_reps || ''}"
                placeholder="${s.ghost_reps || '0'}" 
                value="${s.reps || ''}"
                onclick="UI.openKeypad(this)">
            </td>
            <td class="set-input-cell">
              <input type="text" inputmode="decimal" class="set-input" style="width: 48px;"
                data-ex-idx="${exIdx}" data-set-idx="${sIdx}" data-field="rpe"
                placeholder="8" 
                value="${s.rpe || ''}"
                onclick="UI.openKeypad(this)">
            </td>
            <td class="set-check-col">
              <button class="btn-set-complete ${checkedClass}" onclick="App.toggleSetComplete(${exIdx}, ${sIdx})">
                ✓
              </button>
            </td>
          </tr>
        `;
      });

      html += `
            </tbody>
          </table>
          <div class="exercise-footer-actions">
            <button class="btn btn-secondary btn-xs" onclick="UI.addSetToExercise(${exIdx})">+ Add Set</button>
          </div>
        </div>
      `;
    });

    html += `
      <div style="padding: 16px;">
        <button class="btn btn-secondary btn-block" onclick="UI.openAddExerciseModal()">+ Add Another Exercise</button>
      </div>
    `;

    container.innerHTML = html;

    // Attach input listeners
    container.querySelectorAll('.set-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const exIdx = parseInt(e.target.dataset.exIdx);
        const setIdx = parseInt(e.target.dataset.setIdx);
        const field = e.target.dataset.field;
        Store.activeWorkout.exercises[exIdx].sets[setIdx][field] = e.target.value;
        App.saveActiveWorkout();
      });
    });
  },

  cycleSetType(exIdx, setIdx) {
    const types = ['normal', 'warmup', 'drop', 'failure'];
    const current = Store.activeWorkout.exercises[exIdx].sets[setIdx].set_type;
    const nextIdx = (types.indexOf(current) + 1) % types.length;
    Store.activeWorkout.exercises[exIdx].sets[setIdx].set_type = types[nextIdx];
    App.saveActiveWorkout();
    this.renderActiveWorkout();
  },

  addSetToExercise(exIdx) {
    const ex = Store.activeWorkout.exercises[exIdx];
    const prevSet = ex.sets[ex.sets.length - 1];
    ex.sets.push({
      set_index: ex.sets.length + 1,
      set_type: 'normal',
      weight_kg: prevSet ? prevSet.weight_kg : '',
      reps: prevSet ? prevSet.reps : '',
      ghost_weight: prevSet ? prevSet.weight_kg : '',
      ghost_reps: prevSet ? prevSet.reps : '',
      rpe: 8.0,
      is_completed: false
    });
    App.saveActiveWorkout();
    this.renderActiveWorkout();
  },

  removeExerciseFromWorkout(exIdx) {
    Store.activeWorkout.exercises.splice(exIdx, 1);
    App.saveActiveWorkout();
    this.renderActiveWorkout();
  },

  openAddExerciseModal() {
    const modal = document.getElementById('modal-add-exercise');
    const list = document.getElementById('modal-exercise-list');
    modal.classList.remove('hidden');

    let html = '';
    Store.exercises.forEach(ex => {
      html += `
        <div class="card mb-sm" style="cursor: pointer; padding: 12px;" onclick="UI.selectExerciseForWorkout('${ex.id}')">
          <div class="font-semibold">${ex.name}</div>
          <div class="text-xs text-muted">${ex.primary_muscle} · ${ex.equipment.toUpperCase()}</div>
        </div>
      `;
    });
    list.innerHTML = html;
  },

  selectExerciseForWorkout(exerciseId) {
    const ex = Store.exercises.find(e => e.id === exerciseId);
    if (!ex) return;

    const prevSets = App.getPreviousSetsForExercise(ex.id);
    Store.activeWorkout.exercises.push({
      exercise_id: ex.id,
      name: ex.name,
      equipment: ex.equipment,
      primary_muscle: ex.primary_muscle,
      is_compound: ex.is_compound,
      rest_timer_seconds: ex.is_compound ? 180 : 90,
      sets: [
        {
          set_index: 1,
          set_type: 'normal',
          weight_kg: '',
          reps: '',
          ghost_weight: prevSets[0] ? prevSets[0].weight_kg : '',
          ghost_reps: prevSets[0] ? prevSets[0].reps : '',
          rpe: 8.0,
          is_completed: false
        }
      ]
    });

    document.getElementById('modal-add-exercise').classList.add('hidden');
    App.saveActiveWorkout();
    this.renderActiveWorkout();
  },

  renderRoutines() {
    const quickList = document.getElementById('routines-quick-list');
    const fullList = document.getElementById('routines-full-list');

    let html = '';
    Store.routines.forEach(rot => {
      const exCount = (rot.exercises || []).length;
      html += `
        <div class="card mb-sm">
          <div class="flex-between">
            <h4 class="font-semibold">${rot.title}</h4>
            <span class="badge" style="font-size: 11px; background:#222; padding: 2px 6px; border-radius: 4px;">${exCount} Exercises</span>
          </div>
          <p class="text-xs text-muted mt-sm">${rot.notes || 'Custom training split'}</p>
          <button class="btn btn-secondary btn-sm btn-block mt-md" onclick="App.startWorkout('${rot.id}')">
            ⚡ Start Routine
          </button>
        </div>
      `;
    });

    if (quickList) quickList.innerHTML = html;
    if (fullList) fullList.innerHTML = html;
  },

  renderRecentHistory() {
    const container = document.getElementById('recent-workouts-list');
    if (!container) return;

    if (Store.history.length === 0) {
      container.innerHTML = '<p class="text-xs text-muted">No completed sessions yet. Start your first workout today!</p>';
      return;
    }

    let html = '';
    Store.history.slice(0, 5).forEach(w => {
      const dateStr = new Date(w.started_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const durationMins = Math.round((w.duration_seconds || 0) / 60);
      const volume = Math.round(w.total_volume_kg || 0);

      html += `
        <div class="card mb-sm" style="padding: 12px;">
          <div class="flex-between">
            <span class="font-semibold">${w.title}</span>
            <span class="text-xs text-muted">${dateStr}</span>
          </div>
          <div class="flex-between mt-sm text-xs text-dim">
            <span>Duration: ${durationMins}m</span>
            <span>Volume: ${volume} kg</span>
            <span>Sets: ${(w.sets || []).length}</span>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
  },

  renderExercisesList(filterText = '', filterMuscle = 'all') {
    const list = document.getElementById('exercises-list');
    if (!list) return;

    const filtered = Store.exercises.filter(ex => {
      const matchesText = !filterText || ex.name.toLowerCase().includes(filterText.toLowerCase()) || ex.primary_muscle.toLowerCase().includes(filterText.toLowerCase());
      const matchesMuscle = filterMuscle === 'all' || ex.primary_muscle.toLowerCase() === filterMuscle.toLowerCase();
      return matchesText && matchesMuscle;
    });

    let html = '';
    filtered.forEach(ex => {
      const pr = Store.personalRecords.find(p => p.exercise_id === ex.id && p.record_type === 'e1rm');
      const prText = pr ? `PR: ${pr.value} kg (e1RM)` : 'No PR Logged';

      html += `
        <div class="card mb-sm" style="padding: 12px;">
          <div class="flex-between">
            <span class="font-semibold">${ex.name}</span>
            <span class="text-xs" style="color: var(--accent-volt); font-weight:700;">${prText}</span>
          </div>
          <div class="text-xs text-muted mt-sm">
            ${ex.primary_muscle} · ${ex.equipment.toUpperCase()} ${ex.is_compound ? '· COMPOUND' : ''}
          </div>
        </div>
      `;
    });
    list.innerHTML = html;
  },

  renderAnalytics() {
    // Muscle Volume vs RP Landmarks
    const volumeContainer = document.getElementById('volume-bars-container');
    const prVaultList = document.getElementById('pr-vault-list');

    const muscleSets = {
      'Chest': 0, 'Back': 0, 'Quads': 0, 'Hamstrings': 0, 'Shoulders': 0, 'Arms': 0
    };

    // Calculate last 7 days volume
    const oneWeekAgo = Date.now() - 7 * 86400 * 1000;
    Store.history.forEach(w => {
      if (w.started_at >= oneWeekAgo) {
        (w.sets || []).forEach(s => {
          const ex = Store.exercises.find(e => e.id === s.exercise_id);
          if (ex) {
            let m = ex.primary_muscle;
            if (m === 'Biceps' || m === 'Triceps') m = 'Arms';
            if (muscleSets[m] !== undefined) muscleSets[m]++;
          }
        });
      }
    });

    let volHtml = '';
    for (const [muscle, sets] of Object.entries(muscleSets)) {
      // Landmark evaluation (MEV: 10, MAV: 16, MRV: 22)
      let tag = 'vol-tag-mev';
      let tagLabel = 'MEV (Maintenance)';
      if (sets >= 12 && sets <= 18) {
        tag = 'vol-tag-mav';
        tagLabel = 'MAV (Optimal Hypertrophy)';
      } else if (sets > 18) {
        tag = 'vol-tag-mrv';
        tagLabel = 'MRV (High Fatigue)';
      }

      const fillPct = Math.min(100, (sets / 24) * 100);

      volHtml += `
        <div class="volume-bar-row">
          <div class="vol-row-header">
            <span>${muscle}</span>
            <div>
              <span class="vol-landmark-tag ${tag}">${tagLabel}</span>
              <span style="font-family: var(--font-mono); font-weight:700; margin-left: 6px;">${sets} sets</span>
            </div>
          </div>
          <div class="vol-track">
            <div class="vol-fill" style="width: ${fillPct}%"></div>
          </div>
        </div>
      `;
    }
    if (volumeContainer) volumeContainer.innerHTML = volHtml;

    // PR Vault
    if (prVaultList) {
      if (Store.personalRecords.length === 0) {
        prVaultList.innerHTML = '<p class="text-xs text-muted">Complete workouts to set personal records!</p>';
      } else {
        let prHtml = '';
        Store.personalRecords.forEach(pr => {
          prHtml += `
            <div class="stat-box mb-sm">
              <div class="flex-between">
                <span class="font-semibold text-sm">${pr.exercise_name || 'Exercise'}</span>
                <span class="stat-number highlight">${pr.value} kg</span>
              </div>
              <span class="text-xs text-dim">Estimated 1RM (Epley Formula)</span>
            </div>
          `;
        });
        prVaultList.innerHTML = prHtml;
      }
    }
  },

  showWorkoutSummary(workout, setsCount, prsCount, prText) {
    const modal = document.getElementById('modal-workout-summary');
    document.getElementById('summary-workout-title').textContent = workout.title;
    document.getElementById('summary-time').textContent = `${Math.round(workout.duration_seconds / 60)}m`;
    document.getElementById('summary-volume').textContent = `${Math.round(workout.total_volume_kg)} kg`;
    document.getElementById('summary-sets').textContent = setsCount;
    document.getElementById('summary-prs').textContent = prsCount;

    const prBanner = document.getElementById('summary-pr-banner');
    if (prsCount > 0) {
      prBanner.classList.remove('hidden');
      document.getElementById('summary-pr-text').textContent = prText;
      // Confetti explosion
      if (window.confetti) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } else {
      prBanner.classList.add('hidden');
    }

    modal.classList.remove('hidden');
  },

  openCreateRoutineModal() {
    document.getElementById('modal-create-routine').classList.remove('hidden');
    const container = document.getElementById('routine-builder-exercises');
    container.innerHTML = `
      <div class="card mb-sm" style="padding: 10px;">
        <div class="text-xs text-muted">Select exercises to add to your custom split.</div>
      </div>
    `;
  }
};

// Window load bootstrap
window.addEventListener('DOMContentLoaded', () => {
  App.init();
});
