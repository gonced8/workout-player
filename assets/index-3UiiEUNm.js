var ce=Object.defineProperty;var ue=(n,e,t)=>e in n?ce(n,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[e]=t;var f=(n,e,t)=>ue(n,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function t(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function s(i){if(i.ep)return;i.ep=!0;const r=t(i);fetch(i.href,r)}})();function le(n){try{const e=JSON.parse(n);return de(e),e}catch(e){throw e instanceof SyntaxError?new Error(`Invalid JSON: ${e.message}`):e}}function de(n){if(!n||typeof n!="object")throw new Error("Workout must be an object");const e=n;if(typeof e.version!="number"||e.version!==1)throw new Error("Workout version must be 1");if(typeof e.title!="string"||!e.title)throw new Error("Workout must have a title");if(!Array.isArray(e.steps)||e.steps.length===0)throw new Error("Workout must have at least one step");for(let t=0;t<e.steps.length;t++)J(e.steps[t],`steps[${t}]`)}function J(n,e){if(!n||typeof n!="object")throw new Error(`${e}: Step must be an object`);const t=n;if(typeof t.id!="string"||!t.id)throw new Error(`${e}: Step must have an id`);if(typeof t.type!="string")throw new Error(`${e}: Step must have a type`);if(typeof t.name!="string"||!t.name)throw new Error(`${e}: Step must have a name`);switch(t.type){case"timer":if(typeof t.durationSeconds!="number"||t.durationSeconds<=0)throw new Error(`${e}: Timer step must have positive durationSeconds`);break;case"reps":if(typeof t.reps!="number"||t.reps<=0)throw new Error(`${e}: Reps step must have positive reps`);if(t.estimatedDurationSeconds!==void 0&&(typeof t.estimatedDurationSeconds!="number"||t.estimatedDurationSeconds<=0))throw new Error(`${e}: Reps step estimatedDurationSeconds must be a positive number`);break;case"group":if(typeof t.rounds!="number"||t.rounds<1)throw new Error(`${e}: Group step must have rounds >= 1`);if(!Array.isArray(t.steps)||t.steps.length===0)throw new Error(`${e}: Group step must have at least one nested step`);for(let s=0;s<t.steps.length;s++)J(t.steps[s],`${e}.steps[${s}]`);break;default:throw new Error(`${e}: Unknown step type "${t.type}"`)}}function O(n){const e=[];for(const t of n.steps)K(t,e,void 0);if(n.skipLastRest&&e.length>0){const t=e[e.length-1];t&&_(t)&&e.pop()}return e}function K(n,e,t){if(n.type==="group")pe(n,e);else{const s={...n,roundContext:t};e.push(s)}}function pe(n,e){const t={groupName:n.name,currentRound:1,totalRounds:n.rounds};for(let s=1;s<=n.rounds;s++){t.currentRound=s;const i=e.length;for(const r of n.steps)K(r,e,{...t});if(n.skipLastRest&&s===n.rounds&&e.length>i){const r=e[e.length-1];r&&_(r)&&e.pop()}}}function _(n){return n.type!=="timer"?!1:n.rest===!0||n.name.toLowerCase()==="rest"}function M(n){let e=0;for(const t of n)t.type==="timer"?e+=t.durationSeconds:e+=t.estimatedDurationSeconds??t.reps*5;return e}function $(n){const e=Math.floor(n/60),t=n%60;return e===0?`${t}s`:t===0?`${e}m`:`${e}m ${t}s`}function H(n){const e=Math.ceil(n),t=Math.floor(e/60),s=e%60;return`${t}:${s.toString().padStart(2,"0")}`}let w=null,U=!1,W=null,L=[];function T(n){return n==="suspended"||n==="interrupted"}function me(){return window.AudioContext??window.webkitAudioContext}function y(){const n=P();if(!n||n.state!=="running"||L.length===0)return;const e=L;L=[],e.forEach(t=>t())}function he(){const n=me();if(!n)return null;try{const e=new n;return e.addEventListener("statechange",()=>{if(e.state==="running"){y();return}document.visibilityState==="visible"&&T(e.state)&&e.resume().then(y).catch(()=>I(e))}),e}catch{return null}}function P(){return(w==null?void 0:w.state)==="closed"&&(w=null),w||(w=he()),w}function I(n){W===null&&(W=window.setTimeout(()=>{W=null,document.visibilityState==="visible"&&T(n.state)&&n.resume().then(y).catch(()=>{})},250))}function fe(n){L=[...L.slice(-2),n]}function ve(n){const e=P();if(e){if(e.state==="running"){n();return}fe(n),T(e.state)&&e.resume().then(()=>{e.state==="running"?y():I(e)}).catch(()=>{I(e)})}}function F(){const n=P();if(n&&(T(n.state)&&n.resume().then(y).catch(()=>I(n)),n.state==="running"))try{const e=n.createBuffer(1,1,n.sampleRate),t=n.createBufferSource(),s=n.createGain();s.gain.value=0,t.buffer=e,t.connect(s),s.connect(n.destination),t.start(0),y()}catch{}}function ye(){if(U)return;U=!0;const n=()=>F(),e={passive:!0,capture:!0};window.addEventListener("pointerdown",n,e),window.addEventListener("touchend",n,e),window.addEventListener("click",n,e),window.addEventListener("keydown",n,e)}function C(){ye(),F()}function ge(){const n=P();n&&(T(n.state)?n.resume().then(y).catch(()=>I(n)):n.state==="running"&&y())}function X({frequency:n,duration:e,volume:t}){ve(()=>{const s=P();if(!(!s||s.state!=="running"))try{const i=s.createOscillator(),r=s.createGain();i.connect(r),r.connect(s.destination),i.frequency.value=n,i.type="sine",r.gain.setValueAtTime(t,s.currentTime),r.gain.exponentialRampToValueAtTime(.01,s.currentTime+e),i.start(s.currentTime),i.stop(s.currentTime+e)}catch{}})}function Y(n){if("vibrate"in navigator)try{navigator.vibrate(n)}catch{}}function N(){X({frequency:800,duration:.15,volume:.5}),Y([200,100,200])}function z(){X({frequency:1e3,duration:.1,volume:.3}),Y(100)}let b=null,B=!1,V=!1;async function Q(){if(!("wakeLock"in navigator))return!1;try{const n=await navigator.wakeLock.request("screen");return b=n,n.addEventListener("release",()=>{b===n&&(b=null)}),!0}catch{return!1}}async function we(){if(b){try{await b.release()}catch{}b=null}B=!1}function G(n){B=n}async function Se(){document.visibilityState==="visible"&&B&&!b&&await Q()}function be(){if(V)return;V=!0;const n=()=>{Se()};document.addEventListener("visibilitychange",n),window.addEventListener("pageshow",n),window.addEventListener("focus",n)}class ke{constructor(){f(this,"state");f(this,"timerIntervalId",null);f(this,"onStateChange",null);this.state=this.createInitialState(),be(),this.setupVisibilityListener()}createInitialState(){return{workout:null,flatSteps:[],currentStepIndex:0,isPlaying:!1,isPaused:!1,stepStartedAt:null,timerDuration:null,remainingSeconds:null}}resetTimerState(){this.state.stepStartedAt=null,this.state.timerDuration=null,this.state.remainingSeconds=null}clearTimer(){this.timerIntervalId!==null&&(clearInterval(this.timerIntervalId),this.timerIntervalId=null)}loadWorkout(e){this.stop(),this.state={...this.createInitialState(),workout:e,flatSteps:O(e)},this.notifyStateChange()}async start(){if(!this.state.workout||this.state.flatSteps.length===0)throw new Error("No workout loaded");C(),this.state.isPlaying=!0,this.state.isPaused=!1,G(!0),await Q(),this.startCurrentStep(),this.notifyStateChange()}pause(){if(!this.state.isPlaying||this.state.isPaused)return;this.state.isPaused=!0,this.clearTimer();const e=this.getCurrentStep();if((e==null?void 0:e.type)==="timer"&&this.state.stepStartedAt!==null&&this.state.timerDuration!==null){const t=(Date.now()-this.state.stepStartedAt)/1e3;this.state.remainingSeconds=Math.max(0,this.state.timerDuration-t),this.state.timerDuration=this.state.remainingSeconds}this.notifyStateChange()}resume(){!this.state.isPlaying||!this.state.isPaused||(C(),this.state.isPaused=!1,this.startCurrentStep(),this.notifyStateChange())}next(){var e;this.state.isPlaying&&(C(),this.clearTimer(),((e=this.getCurrentStep())==null?void 0:e.type)==="timer"&&N(),this.advanceToNextStep())}stop(){this.clearTimer(),this.state.isPlaying=!1,this.state.isPaused=!1,this.resetTimerState(),G(!1),we(),this.notifyStateChange()}completeRepsStep(){const e=this.getCurrentStep();(e==null?void 0:e.type)==="reps"&&this.state.isPlaying&&(C(),N(),this.advanceToNextStep())}getState(){return{...this.state}}getCurrentStep(){return this.state.flatSteps[this.state.currentStepIndex]??null}onUpdate(e){this.onStateChange=e}startCurrentStep(){const e=this.getCurrentStep();if(!e){this.completeWorkout();return}e.type==="timer"?this.startTimer(e):(this.resetTimerState(),this.notifyStateChange())}startTimer(e){const t=this.state.timerDuration??e.durationSeconds;this.state.stepStartedAt=Date.now(),this.state.timerDuration=t,this.state.remainingSeconds=t,this.timerIntervalId=window.setInterval(()=>this.updateTimer(),100),this.notifyStateChange()}updateTimer(){const e=this.state.remainingSeconds,t=this.computeRemaining();this.state.remainingSeconds=t;const s=e?Math.ceil(e):0,i=Math.ceil(t);s!==i&&i>=1&&i<=3&&z(),t<=0?this.onTimerComplete():this.notifyStateChange()}computeRemaining(){if(this.state.stepStartedAt===null||this.state.timerDuration===null)return 0;const e=(Date.now()-this.state.stepStartedAt)/1e3;return Math.max(0,this.state.timerDuration-e)}onTimerComplete(){this.clearTimer(),this.state.remainingSeconds=0,N(),this.advanceToNextStep()}advanceToNextStep(){this.state.currentStepIndex++,this.state.isPaused=!1,this.state.currentStepIndex>=this.state.flatSteps.length?this.completeWorkout():(this.resetTimerState(),this.startCurrentStep())}completeWorkout(){this.stop(),this.notifyStateChange()}setupVisibilityListener(){const e=()=>{if(document.visibilityState==="visible"&&this.state.isPlaying&&!this.state.isPaused){ge();const t=this.getCurrentStep();(t==null?void 0:t.type)==="timer"&&(this.computeRemaining()<=0?this.onTimerComplete():this.notifyStateChange())}};document.addEventListener("visibilitychange",e),window.addEventListener("pageshow",e),window.addEventListener("focus",e)}notifyStateChange(){var e;(e=this.onStateChange)==null||e.call(this,this.getState())}}class Ee{constructor(e){f(this,"appElement");f(this,"currentView","landing");f(this,"callbacks",null);f(this,"lastStepIndex",-1);f(this,"lastPauseState",!1);this.appElement=e}showLanding(e,t,s,i=[],r,o){var E,x,R,D;this.currentView="landing";const a=o!==void 0?'<button type="button" id="view-schema-btn" class="secondary">View JSON Schema</button>':"",l=this.renderRecentWorkouts(i),c=o!==void 0?`
        <dialog id="schema-dialog" class="schema-dialog">
          <div class="schema-dialog-panel">
            <div class="schema-dialog-header">
              <h2 class="schema-dialog-title">Workout JSON Schema</h2>
              <div class="schema-dialog-actions">
                <button type="button" id="schema-dialog-copy" class="primary">Copy</button>
                <button type="button" id="schema-dialog-close" class="secondary">Close</button>
              </div>
            </div>
            <div class="schema-dialog-body">
              <pre class="schema-dialog-pre"><code id="schema-dialog-code"></code></pre>
            </div>
          </div>
        </dialog>`:"";if(this.appElement.innerHTML=`
      <div class="landing">
        <h1>Workout Player</h1>
        <p>Paste your workout JSON or load a sample to get started.</p>
        
        <div class="input-section">
          <label for="workout-json">Workout JSON:</label>
          <textarea 
            id="workout-json" 
            placeholder="Paste workout JSON here..."
            rows="10"
          ></textarea>
          <div id="duration-estimate"></div>
          <div id="error-message" class="error"></div>
        </div>

        ${l}

        <div class="button-group">
          <button type="button" id="load-sample-btn" class="secondary">Load Sample</button>
          ${a}
          <button id="start-btn" class="primary">Validate & Preview</button>
        </div>
        ${c}

        <div class="version">v1.1.0</div>
      </div>
    `,o!==void 0){const m=document.getElementById("schema-dialog-code");m&&(m.textContent=o);const u=document.getElementById("schema-dialog"),p=document.getElementById("schema-dialog-copy"),oe="Copy",ae=async()=>{var j;try{if((j=navigator.clipboard)!=null&&j.writeText)return await navigator.clipboard.writeText(o),!0}catch{}const h=document.createElement("textarea");h.value=o,h.setAttribute("readonly",""),h.style.position="fixed",h.style.left="-9999px",document.body.appendChild(h),h.select();try{return document.execCommand("copy")}catch{return!1}finally{document.body.removeChild(h)}};(E=document.getElementById("view-schema-btn"))==null||E.addEventListener("click",()=>{u==null||u.showModal()}),(x=document.getElementById("schema-dialog-close"))==null||x.addEventListener("click",()=>{u==null||u.close()}),p==null||p.addEventListener("click",()=>{ae().then(h=>{p&&h&&(p.textContent="Copied!",window.setTimeout(()=>{p.textContent=oe},2e3))})})}const d=document.getElementById("workout-json"),k=document.getElementById("error-message"),g=document.getElementById("duration-estimate");r&&(d.value=r,d.dispatchEvent(new Event("input"))),d.addEventListener("input",()=>{try{const m=d.value.trim();if(m){const u=JSON.parse(m),p=O(u);g.textContent=`Estimated duration: ${$(M(p))}`,g.className="duration-estimate",k.textContent=""}else g.textContent=""}catch{g.textContent=""}}),(R=document.getElementById("start-btn"))==null||R.addEventListener("click",()=>{const m=d.value.trim();if(!m){k.textContent="Please enter workout JSON";return}try{e(m)}catch(u){k.textContent=u instanceof Error?u.message:"Invalid workout"}}),(D=document.getElementById("load-sample-btn"))==null||D.addEventListener("click",t),i.forEach((m,u)=>{var p;(p=document.getElementById(`recent-workout-${u}`))==null||p.addEventListener("click",()=>s(m.workout))})}renderRecentWorkouts(e){return e.length===0?"":`
      <section class="recent-workouts" aria-labelledby="recent-workouts-title">
        <h2 id="recent-workouts-title">Recent workouts</h2>
        <p>Resume or repeat one of your last ${e.length} workouts.</p>
        <div class="recent-workout-list">
          ${e.map((t,s)=>`
              <button type="button" id="recent-workout-${s}" class="recent-workout-card">
                <span class="recent-workout-title">${this.escapeHtml(t.title)}</span>
                <span class="recent-workout-date">${this.formatSavedAt(t.savedAt)}</span>
              </button>`).join("")}
        </div>
      </section>`}formatSavedAt(e){const t=new Date(e);return Number.isNaN(t.getTime())?"Saved locally":`Saved ${t.toLocaleDateString([],{month:"short",day:"numeric"})} ${t.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}`}escapeHtml(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}showPreview(e,t,s,i){var a,l,c;this.currentView="preview";const r=M(t),o=this.stepsTreeHasNotes(e.steps);this.appElement.innerHTML=`
      <div class="preview">
        <h1 class="preview-title">${e.title}</h1>
        ${e.description?`<p class="preview-description">${e.description}</p>`:""}
        ${(a=e.equipment)!=null&&a.length?`<p class="preview-equipment">Equipment: ${e.equipment.join(", ")}</p>`:""}
        <p class="preview-duration">Estimated duration: ${$(r)} · ${t.length} steps</p>
        <ul class="preview-steps">
          ${this.renderPreviewStepsTree(e.steps)}
        </ul>
        ${o?'<p class="preview-notes-hint">Tap a step with notes to see coaching cues.</p>':""}
        <div class="preview-actions">
          <button id="preview-back-btn" class="secondary large">Back to edit</button>
          <button id="preview-start-btn" class="primary large">Start workout</button>
        </div>
      </div>
    `,(l=document.getElementById("preview-back-btn"))==null||l.addEventListener("click",s),(c=document.getElementById("preview-start-btn"))==null||c.addEventListener("click",i)}stepsTreeHasNotes(e){for(const t of e)if(t.notes||t.type==="group"&&this.stepsTreeHasNotes(t.steps))return!0;return!1}renderPreviewStepsTree(e){return e.map(t=>{if(t.type==="timer")return t.notes?`
          <li class="preview-step preview-step-timer preview-step-expandable">
            <details class="preview-step-details">
              <summary class="preview-step-summary">
                <span class="preview-step-name">${t.name}</span>
                <span class="preview-step-meta">${$(t.durationSeconds)}</span>
              </summary>
              <p class="preview-step-notes">${t.notes}</p>
            </details>
          </li>`:`
          <li class="preview-step preview-step-timer">
            <span class="preview-step-name">${t.name}</span>
            <span class="preview-step-meta">${$(t.durationSeconds)}</span>
          </li>`;if(t.type==="reps")return t.notes?`
          <li class="preview-step preview-step-reps preview-step-expandable">
            <details class="preview-step-details">
              <summary class="preview-step-summary">
                <span class="preview-step-name">${t.name}</span>
                <span class="preview-step-meta">× ${t.reps} reps</span>
              </summary>
              <p class="preview-step-notes">${t.notes}</p>
            </details>
          </li>`:`
          <li class="preview-step preview-step-reps">
            <span class="preview-step-name">${t.name}</span>
            <span class="preview-step-meta">× ${t.reps} reps</span>
          </li>`;const s=t.rounds===1?"1 round":`${t.rounds} rounds`;return t.notes?`
        <li class="preview-step preview-step-group">
          <details class="preview-group-details">
            <summary class="preview-group-header preview-group-summary">
              <span class="preview-group-name">${t.name}</span>
              <span class="preview-group-rounds">× ${s}</span>
            </summary>
            <p class="preview-step-notes preview-group-notes">${t.notes}</p>
          </details>
          <ul class="preview-group-steps">
            ${this.renderPreviewStepsTree(t.steps)}
          </ul>
        </li>`:`
        <li class="preview-step preview-step-group">
          <div class="preview-group-header">
            <span class="preview-group-name">${t.name}</span>
            <span class="preview-group-rounds">× ${s}</span>
          </div>
          <ul class="preview-group-steps">
            ${this.renderPreviewStepsTree(t.steps)}
          </ul>
        </li>`}).join("")}showCountdown(e,t){this.currentView="countdown",C();const s=t?`<div class="next-preview countdown-next-preview">${this.renderNextPreview(t)}</div>`:"",r=/iPad|iPhone|iPod/.test(navigator.userAgent)?'<p class="silent-mode-hint">Turn off silent mode for audio cues</p>':"";this.appElement.innerHTML=`
      <div class="countdown">
        <div class="countdown-number" id="countdown-number">3</div>
        <p class="countdown-label">Get ready</p>
        ${r}
        ${s}
      </div>
    `;let o=3;const a=document.getElementById("countdown-number"),l=this.appElement.querySelector(".countdown-label"),c=()=>{o>0?(a&&(a.textContent=String(o)),z(),o--,setTimeout(c,1e3)):(a&&(a.textContent="Go!"),l&&(l.textContent=""),N(),setTimeout(e,400))};c()}showPlayer(e,t,s,i,r,o){this.callbacks={onPause:t,onResume:s,onNext:i,onComplete:r,onEnd:o},this.currentView!=="player"?(this.currentView="player",this.lastStepIndex=-1,this.lastPauseState=!1,this.renderPlayer(e)):this.updatePlayer(e)}renderPlayer(e){var t;this.appElement.innerHTML=`
      <div class="player">
        <div class="player-header">
          <h2 id="workout-title"></h2>
          <button id="end-btn" class="secondary">End Workout</button>
        </div>

        <div class="progress-bar">
          <div id="progress-fill" class="progress-fill"></div>
        </div>
        <div id="progress-text" class="progress-text"></div>

        <div id="step-content" class="step-content"></div>

        <div id="next-preview" class="next-preview"></div>

        <div id="controls" class="controls"></div>
      </div>
    `,(t=document.getElementById("end-btn"))==null||t.addEventListener("click",()=>{var s;return(s=this.callbacks)==null?void 0:s.onEnd()}),this.updatePlayer(e)}updatePlayer(e){const{workout:t,flatSteps:s,currentStepIndex:i,isPaused:r,remainingSeconds:o}=e;if(!t)return;const a=i!==this.lastStepIndex,l=r!==this.lastPauseState;if(this.lastStepIndex=i,this.lastPauseState=r,a||l)this.fullUpdate(e);else{const c=s[i];if((c==null?void 0:c.type)==="timer"&&o!==null){const d=document.querySelector(".timer");d&&(d.textContent=H(o))}}}fullUpdate(e){const{workout:t,flatSteps:s,currentStepIndex:i,isPaused:r,remainingSeconds:o}=e;if(!t)return;const a=s[i],l=s[i+1],c=document.getElementById("workout-title");c&&(c.textContent=t.title);const d=document.getElementById("progress-fill"),k=document.getElementById("progress-text");if(d&&k){const R=s.length>0?i/s.length*100:0;d.style.width=`${R}%`,k.textContent=`Step ${Math.min(i+1,s.length)} of ${s.length}`}const g=document.getElementById("step-content");g&&(g.innerHTML=a?this.renderStep(a,o):'<div class="complete"><h2>Workout Complete!</h2><p>Great job!</p></div>');const E=document.getElementById("next-preview");E&&(l?E.innerHTML=this.renderNextPreview(l):E.innerHTML='<p class="next-preview-last">Last step!</p>');const x=document.getElementById("controls");x&&a&&(x.innerHTML=this.renderControls(a,r),this.attachControlListeners(a,r))}renderNextPreview(e){const t=e.type==="timer"?$(e.durationSeconds):`× ${e.reps} reps`;let s=`
      <p class="next-preview-label">Up next</p>
      <p class="next-preview-name">${e.name}</p>
      <p class="next-preview-meta">${t}</p>`;return e.notes&&(s+=`<p class="next-preview-notes">${e.notes}</p>`),s}renderStep(e,t){const s=['<div class="step">'];if(e.roundContext){const{groupName:i,currentRound:r,totalRounds:o}=e.roundContext;s.push(`<div class="round-context">${i} — Round ${r} of ${o}</div>`)}if(s.push(`<h2 class="step-name">${e.name}</h2>`),e.type==="timer"){const i=t??e.durationSeconds;s.push(`<div class="timer">${H(i)}</div>`)}else s.push(`<div class="reps">× ${e.reps} reps</div>`);return e.notes&&s.push(`<p class="notes">${e.notes}</p>`),s.push("</div>"),s.join("")}renderControls(e,t){return e.type==="timer"?`${t?'<button id="resume-btn" class="primary large">Resume</button>':'<button id="pause-btn" class="primary large">Pause</button>'}<button id="next-btn" class="secondary">Skip</button>`:'<button id="complete-btn" class="primary large">Done</button>'}attachControlListeners(e,t){var s,i,r,o;this.callbacks&&(e.type==="timer"?(t?(s=document.getElementById("resume-btn"))==null||s.addEventListener("click",this.callbacks.onResume):(i=document.getElementById("pause-btn"))==null||i.addEventListener("click",this.callbacks.onPause),(r=document.getElementById("next-btn"))==null||r.addEventListener("click",this.callbacks.onNext)):(o=document.getElementById("complete-btn"))==null||o.addEventListener("click",this.callbacks.onComplete))}showError(e){const t=document.getElementById("error-message");t&&(t.textContent=e,t.className="error visible")}loadSampleIntoTextarea(e){const t=document.getElementById("workout-json");t&&(t.value=e,t.dispatchEvent(new Event("input")))}}const Z="workout-player:recent-workouts",ee=3;function xe(n){if(!n||typeof n!="object")return!1;const e=n;return typeof e.id=="string"&&typeof e.title=="string"&&typeof e.savedAt=="string"&&!!e.workout&&typeof e.workout=="object"}function te(){try{return window.localStorage}catch{return null}}function A(){const n=te();if(!n)return[];try{const e=n.getItem(Z);if(!e)return[];const t=JSON.parse(e);return Array.isArray(t)?t.filter(xe).slice(0,ee):[]}catch{return[]}}function $e(n){const e=te();if(!e)return[];const t=new Date().toISOString(),s=`${n.title}:${JSON.stringify(n.steps)}`,r=[{id:s,title:n.title,savedAt:t,workout:n},...A().filter(o=>o.id!==s)].slice(0,ee);try{e.setItem(Z,JSON.stringify(r))}catch{return A()}return r}const Ce="https://json-schema.org/draft/2020-12/schema",Le="https://workout-player.pages.dev/schemas/workout-playback.json",Ie="Workout Playback Format",Te="Format for workouts that the player app consumes",Pe="object",Re=["version","title","steps"],Ne={version:{type:"number",const:1,description:"Schema version (must be 1)"},title:{type:"string",minLength:1,description:"Workout title"},description:{type:"string",description:"Optional workout description"},equipment:{type:"array",items:{type:"string"},description:"Equipment needed for the workout"},skipLastRest:{type:"boolean",description:"Skip the last rest step at the end of the workout"},steps:{type:"array",minItems:1,items:{$ref:"#/$defs/step"},description:"Array of workout steps"}},Ae={step:{oneOf:[{$ref:"#/$defs/timerStep"},{$ref:"#/$defs/repsStep"},{$ref:"#/$defs/groupStep"}]},timerStep:{type:"object",required:["id","type","name","durationSeconds"],properties:{id:{type:"string",description:"Unique step identifier"},type:{const:"timer"},name:{type:"string",minLength:1,description:"Step name (e.g., Warm up, Rest)"},durationSeconds:{type:"number",minimum:1,description:"Duration in seconds"},rest:{type:"boolean",description:"Mark as rest for skipLastRest logic"},notes:{type:"string",description:"Optional coaching cues or notes"}}},repsStep:{type:"object",required:["id","type","name","reps"],properties:{id:{type:"string",description:"Unique step identifier"},type:{const:"reps"},name:{type:"string",minLength:1,description:"Exercise name (e.g., Push-ups, Squats)"},reps:{type:"number",minimum:1,description:"Number of repetitions"},estimatedDurationSeconds:{type:"number",minimum:1,description:"Optional estimated duration in seconds for total workout time estimation"},notes:{type:"string",description:"Optional coaching cues or notes"}}},groupStep:{type:"object",required:["id","type","name","rounds","steps"],properties:{id:{type:"string",description:"Unique step identifier"},type:{const:"group"},name:{type:"string",minLength:1,description:"Group name (e.g., Circuit 1)"},rounds:{type:"number",minimum:1,description:"Number of rounds to repeat"},skipLastRest:{type:"boolean",description:"Skip the last rest step in each round"},steps:{type:"array",minItems:1,items:{$ref:"#/$defs/step"},description:"Steps to repeat for each round"},notes:{type:"string",description:"Optional notes about the group"}}}},We={$schema:Ce,$id:Le,title:Ie,description:Te,type:Pe,required:Re,properties:Ne,$defs:Ae},ne=JSON.stringify(We,null,2),Oe=document.querySelector("#app"),v=new ke,S=new Ee(Oe),Be={version:1,title:"Circuit workout",description:"Warm up, 3 rounds of push-ups and squats with rest between, then cool down.",equipment:["bodyweight"],skipLastRest:!0,steps:[{id:"warmup",type:"timer",name:"Warm up",durationSeconds:90},{id:"circuit-1",type:"group",name:"Circuit 1",rounds:3,skipLastRest:!0,steps:[{id:"c1-pushups",type:"reps",name:"Push-ups",reps:10,estimatedDurationSeconds:30,notes:"Keep your core tight"},{id:"c1-rest1",type:"timer",name:"Rest",durationSeconds:30},{id:"c1-squats",type:"reps",name:"Squats",reps:12,estimatedDurationSeconds:40,notes:"Go deep!"},{id:"c1-rest2",type:"timer",name:"Rest",durationSeconds:30}]},{id:"cooldown",type:"timer",name:"Cool down",durationSeconds:60}]};function se(){S.showLanding(q,ie,re,A(),void 0,ne)}function q(n){try{const e=le(n),t=O(e);S.showPreview(e,t,()=>S.showLanding(q,ie,re,A(),n,ne),()=>S.showCountdown(()=>qe(e),t[0]??null))}catch(e){S.showError(e instanceof Error?e.message:"Invalid workout")}}function qe(n){$e(n),v.loadWorkout(n),v.start();const e=()=>{S.showPlayer(v.getState(),()=>v.pause(),()=>v.resume(),()=>v.next(),()=>v.completeRepsStep(),De)};v.onUpdate(e),e()}function ie(){S.loadSampleIntoTextarea(JSON.stringify(Be,null,2))}function re(n){q(JSON.stringify(n,null,2))}function De(){v.stop(),se()}se();
